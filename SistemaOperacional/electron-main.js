const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const https = require('https');
const http = require('http');

// ============================================
// KERNEL - Estado Central do Sistema (Ubuntu Edition)
// ============================================

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

const kernel = new Kernel();
let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        frame: true, // Mostra a barra de título do Windows com X, minimizar, maximizar
        title: 'Pitter OS',
        icon: path.join(__dirname, 'pitter-os.ico'),
        autoHideMenuBar: true, // Esconde o menu mas mantém os controles
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            webviewTag: true
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

    // Maximizar a janela
    mainWindow.maximize();

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// ============================================
// IPC HANDLERS - Interface com o Frontend
// ============================================

// Comando: Executar comando no Bash do WSL
ipcMain.handle('run-bash-command', async (event, command) => {
    try {
        const result = await kernel.executeBash(command);
        return { success: true, data: result };
    } catch (e) {
        return { success: false, error: e };
    }
});

// Comando: Obter informações do sistema
ipcMain.handle('get-system-info', () => {
    return kernel.getSystemInfo();
});

// Comando: Criar um novo processo
ipcMain.handle('create-process', (event, name) => {
    return kernel.createProcess(name);
});

// Comando: Listar todos os processos
ipcMain.handle('list-processes', async () => {
    return await kernel.listProcesses();
});

// Comando: Matar um processo
ipcMain.handle('kill-process', async (event, pid) => {
    return await kernel.killProcess(pid);
});

// Comando: Download Virtual (baixa apenas dentro do Pitter OS)
ipcMain.handle('virtual-download', async (event, { url, fileName }) => {
    return new Promise((resolve) => {
        const dest = path.join(kernel.downloadPath, fileName);
        const protocol = url.startsWith('https') ? https : http;

        protocol.get(url, (response) => {
            if (response.statusCode === 200) {
                const file = fs.createWriteStream(dest);
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve({ success: true, path: dest, name: fileName });
                });
            } else if (response.statusCode === 301 || response.statusCode === 302) {
                // Redirecionamento simples
                resolve(kernel.virtualDownload(response.headers.location, fileName));
            } else {
                resolve({ success: false, error: `Status: ${response.statusCode}` });
            }
        }).on('error', (err) => {
            resolve({ success: false, error: err.message });
        });
    });
});

// Comando: Obter caminhos reais do sistema
ipcMain.handle('get-system-paths', () => {
    return {
        downloads: app.getPath('downloads'),
        documents: app.getPath('documents'),
        pictures: app.getPath('pictures'),
        desktop: app.getPath('desktop'),
        home: app.getPath('home')
    };
});

// Comando: Listar downloads virtuais (mantido para compatibilidade, mas agora focado no real)
ipcMain.handle('list-virtual-downloads', async () => {
    try {
        const files = fs.readdirSync(kernel.downloadPath);
        return files.map(file => {
            const stats = fs.statSync(path.join(kernel.downloadPath, file));
            return {
                name: file,
                size: (stats.size / 1024).toFixed(1) + ' KB',
                date: stats.mtime.toLocaleDateString('pt-BR')
            };
        });
    } catch (e) {
        return [];
    }
});

// Comando: Saudação simples
ipcMain.handle('greet', (event, name) => {
    return `Pitter OS (Ubuntu) - Bem-vindo, ${name}!`;
});

// Controles de janela
ipcMain.on('window-minimize', () => {
    if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
    if (mainWindow) {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            mainWindow.maximize();
        }
    }
});

ipcMain.on('window-close', () => {
    if (mainWindow) mainWindow.close();
});

// ============================================
// PONTO DE ENTRADA DO APLICATIVO
// ============================================

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

console.log('Pitter OS (Electron) - Kernel iniciado!');
