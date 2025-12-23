const { app } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');

class Kernel {
    constructor() {
        this.processes = [];
        this.nextPid = 1;
        this.systemInfo = {
            os_name: 'Ubuntu 24.04 LTS',
            version: 'PitterOS Edition',
            kernel_type: 'Linux (via WSL)'
        };
        // Pasta de downloads virtual dentro do projeto
        this.downloadPath = path.join(app.getPath('userData'), 'pitter_downloads');
        if (!fs.existsSync(this.downloadPath)) {
            fs.mkdirSync(this.downloadPath, { recursive: true });
        }
    }

    // Executa um comando real no WSL
    executeBash(command) {
        return new Promise((resolve, reject) => {
            exec(`wsl -e bash -c "${command}"`, (error, stdout, stderr) => {
                if (error) {
                    reject(stderr || error.message);
                } else {
                    resolve(stdout);
                }
            });
        });
    }

    // Cria um novo processo
    createProcess(name) {
        const process = {
            id: this.nextPid++,
            name: name,
            status: 'running',
            memory_usage: 1024
        };
        this.processes.push(process);
        return process;
    }

    // Lista todos os processos reais do WSL
    async listProcesses() {
        try {
            const output = await this.executeBash('ps -eo pid,comm,stat,rss --no-headers');
            return output.split('\n').filter(line => line.trim()).map(line => {
                const parts = line.trim().split(/\s+/);
                if (parts.length >= 4) {
                    const status = parts[2].startsWith('R') ? 'running' :
                        parts[2].startsWith('S') ? 'sleeping' :
                            parts[2].startsWith('Z') ? 'zombie' : 'idle';
                    return {
                        id: parseInt(parts[0]) || 0,
                        name: parts[1],
                        status: status,
                        memory_usage: parseInt(parts[3]) || 0
                    };
                }
                return null;
            }).filter(p => p !== null);
        } catch (e) {
            return [];
        }
    }

    // Mata um processo real no WSL
    async killProcess(pid) {
        try {
            await this.executeBash(`kill -9 ${pid}`);
            return { success: true, message: `Processo ${pid} terminado com sucesso` };
        } catch (e) {
            return { success: false, message: `Erro ao matar processo ${pid}: ${e}` };
        }
    }

    // Retorna informações do sistema
    getSystemInfo() {
        return this.systemInfo;
    }
}

module.exports = Kernel;
