import { KernelAPI } from '../core/kernel-api.js';

export class SystemInfoApp {
    constructor() {
        this.infoContainer = document.getElementById('system-info');
        this.init();
    }

    async init() {
        if (!this.infoContainer) return;

        try {
            const sysInfo = await KernelAPI.getSystemInfo();
            const osVersion = sysInfo.version || '0.1.0 (Dev)';

            // Atualiza informações na UI se existirem placeholders específicos
            // Neste caso, a UI é estática no HTML, mas poderíamos tornar dinâmica aqui
        } catch (error) {
            console.error('Erro ao carregar SystemInfo:', error);
        }
    }
}
