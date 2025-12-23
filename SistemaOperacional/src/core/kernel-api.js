// ============================================
// SISTEMA OPERACIONAL - API DO KERNEL (Electron Edition)
// ============================================

/**
 * Verifica se a API segura do Electron está disponível no contexto da janela.
 */
const isElectron = window.api && typeof window.api.invoke === 'function';

/**
 * API do Kernel do Pitter OS, abstraindo a comunicação com o processo principal.
 */
export const KernelAPI = {
    /**
     * Obtém informações do sistema.
     */
    async getSystemInfo() {
        if (!isElectron) {
            console.warn('API do Electron não disponível. Usando dados de fallback.');
            return {
                os_name: 'Pitter OS (Browser Mode)',
                version: '0.1.0',
                kernel_type: 'N/A'
            };
        }
        try {
            return await window.api.invoke('get-system-info');
        } catch (error) {
            console.error('Erro ao chamar get-system-info:', error);
            return { os_name: 'Erro', version: 'N/A', kernel_type: 'N/A' };
        }
    },

    /**
     * Cria um novo processo (simulado, pois o backend lida com processos reais).
     */
    async createProcess(name) {
        if (!isElectron) {
            return { id: Math.floor(Math.random() * 10000), name, status: 'running', memory_usage: 0 };
        }
        return await window.api.invoke('create-process', name);
    },

    /**
     * Lista todos os processos reais do WSL.
     */
    async listProcesses() {
        if (!isElectron) {
            return [];
        }
        return await window.api.invoke('list-processes');
    },

    /**
     * Mata um processo real no WSL.
     */
    async killProcess(pid) {
        if (!isElectron) {
            return { success: false, message: `Não é possível matar o processo ${pid} no modo browser.` };
        }
        return await window.api.invoke('kill-process', pid);
    },

    /**
     * Envia uma saudação (exemplo).
     */
    async greet(name) {
        if (!isElectron) {
            return `Olá, ${name}! Bem-vindo ao Pitter OS!`;
        }
        return await window.api.invoke('greet', name);
    },

    /**
     * Executa um comando no Bash do WSL.
     */
    async runBashCommand(command) {
        if (!isElectron) {
            return `Erro: Kernel real não disponível no modo browser. Comando simulado: ${command}`;
        }
        try {
            const result = await window.api.invoke('run-bash-command', command);
            if (result.success) {
                return result.data;
            } else {
                return `Erro no Kernel: ${result.error}`;
            }
        } catch (error) {
            return `Erro fatal de IPC: ${error.message}`;
        }
    }
};
