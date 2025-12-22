// ============================================
// SISTEMA OPERACIONAL - API DO KERNEL
// ============================================

// Detecta se está rodando no Tauri
const isTauri = window.__TAURI__ !== undefined;

/**
 * Invoca um comando do kernel Rust
 */
async function invokeKernel(command, args = {}) {
    if (isTauri) {
        return await window.__TAURI__.tauri.invoke(command, args);
    }
    // Fallback para modo browser (sem Tauri)
    return null;
}

/**
 * API do Kernel do Pitter OS
 */
export const KernelAPI = {
    /**
     * Obtém informações do sistema
     */
    async getSystemInfo() {
        try {
            const info = await invokeKernel('get_system_info');
            return info || {
                os_name: 'SistemaOperacional',
                version: '0.1.0',
                uptime_seconds: 0
            };
        } catch (error) {
            console.warn('Kernel não disponível:', error);
            return {
                os_name: 'SistemaOperacional',
                version: '0.1.0',
                uptime_seconds: 0
            };
        }
    },

    /**
     * Cria um novo processo
     */
    async createProcess(name) {
        if (!isTauri) {
            // Simular para modo browser
            return {
                id: Math.floor(Math.random() * 10000),
                name: name,
                status: 'running',
                memory_usage: Math.floor(Math.random() * 50000)
            };
        }
        return await invokeKernel('create_process', { name });
    },

    /**
     * Lista todos os processos
     */
    async listProcesses() {
        if (!isTauri) {
            return [];
        }
        const processes = await invokeKernel('list_processes');
        return processes || [];
    },

    /**
     * Mata um processo
     */
    async killProcess(pid) {
        if (!isTauri) {
            return `Processo ${pid} terminado (simulado)`;
        }
        return await invokeKernel('kill_process', { pid });
    },

    /**
     * Envia saudação
     */
    async greet(name) {
        if (!isTauri) {
            return `Olá, ${name}! Bem-vindo ao SistemaOperacional!`;
        }
        return await invokeKernel('greet', { name });
    },

    /**
     * Executa comando no Bash do WSL
     */
    async runBashCommand(command) {
        if (!isTauri) {
            return `Erro: Kernel real não disponível no modo browser. Comando simulado: ${command}`;
        }
        try {
            return await invokeKernel('run_bash_command', { command });
        } catch (error) {
            return `Erro no Kernel: ${error}`;
        }
    }
};
