import { KernelAPI } from '../core/kernel-api.js';

export class TaskManagerApp {
    constructor() {
        this.tbodyElement = document.getElementById('process-tbody');
        this.nameInput = document.getElementById('process-name');
        this.createBtn = document.getElementById('create-btn');

        this.init();
    }

    init() {
        if (this.createBtn) {
            this.createBtn.addEventListener('click', () => this.createProcess());
        }

        if (this.nameInput) {
            this.nameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.createProcess();
            });
        }

        // Delegar cliques para botões de kill
        if (this.tbodyElement) {
            this.tbodyElement.addEventListener('click', (e) => {
                if (e.target.classList.contains('kill-btn')) {
                    const pid = e.target.dataset.pid;
                    if (pid) this.killProcess(pid);
                }
            });
        }

        // Atualização automática
        this.refresh();
        setInterval(() => this.refresh(), 5000);
    }

    async refresh() {
        try {
            const processes = await KernelAPI.listProcesses();

            if (!processes || processes.length === 0) {
                if (this.tbodyElement) {
                    this.tbodyElement.innerHTML = `
                        <tr>
                            <td colspan="6" class="no-data">Nenhum processo em execução no Ubuntu</td>
                        </tr>
                    `;
                }
                return;
            }

            if (this.tbodyElement) {
                this.tbodyElement.innerHTML = processes.map(p => `
                    <tr>
                        <td title="${p.name}">${this.truncate(p.name, 15)}</td>
                        <td>${p.id}</td>
                        <td><span class="status-running">${p.status}</span></td>
                        <td>${(Math.random() * 2).toFixed(1)}%</td>
                        <td>${this.formatKB(p.memory_usage)}</td>
                        <td>
                            <button class="win-button kill-btn" data-pid="${p.id}" style="padding: 2px 8px; font-size: 11px; background: #ef2929; color: white; border: none;">Kill</button>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (error) {
            console.error('Erro ao atualizar TaskManager:', error);
        }
    }

    async killProcess(pid) {
        if (confirm(`Ubuntu: Deseja realmente encerrar o processo ${pid}?`)) {
            try {
                const result = await KernelAPI.killProcess(parseInt(pid));
                console.log('Kill result:', result);
                this.refresh();
            } catch (error) {
                alert('Erro ao matar processo: ' + error);
            }
        }
    }

    async createProcess() {
        if (!this.nameInput) return;
        const name = this.nameInput.value.trim();

        if (!name) return;

        try {
            await KernelAPI.createProcess(name);
            this.nameInput.value = '';
            await this.refresh();
        } catch (error) {
            console.error('Erro ao criar processo:', error);
        }
    }

    truncate(str, n) {
        return (str.length > n) ? str.substr(0, n - 1) + '...' : str;
    }

    formatKB(kb) {
        if (kb < 1024) return kb + ' KB';
        return (kb / 1024).toFixed(1) + ' MB';
    }
}
