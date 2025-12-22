// ============================================
// SISTEMA OPERACIONAL - BARRA DE TAREFAS
// ============================================

export class Taskbar {
    constructor(windowManager) {
        this.windowManager = windowManager;
        this.clockElement = null;
        this.startMenuElement = null;
        this.startButtonElement = null;
        this.taskbarElement = null;
        this.powerMenuElement = null;
        this.clockInterval = null;
    }

    /**
     * Inicializa a barra de tarefas
     */
    init() {
        this.taskbarElement = document.querySelector('.taskbar');
        this.clockElement = document.getElementById('clock');
        this.startMenuElement = document.getElementById('start-menu');
        this.startButtonElement = document.querySelector('.start-button');
        this.powerMenuElement = document.getElementById('power-menu');

        // Dados dos Apps (Fonte da verdade para busca)
        this.appList = [
            { id: 'chrome', name: 'Google Chrome', icon: '🌐' },
            { id: 'settings', name: 'Configurações', icon: '⚙️' },
            { id: 'task-manager', name: 'Gerenciador de Tarefas', icon: '📊' },
            { id: 'terminal', name: 'Terminal', icon: '💻' },
            { id: 'file-explorer', name: 'Este Computador', icon: '📁' },
            { id: 'system-info', name: 'Informações', icon: 'ℹ️' },
            { id: 'game-hub', name: 'Game Hub', icon: '🚀' }
        ];

        this.initClock();
        this.initStartMenu();
        this.initTaskbarApps();
        this.initPowerMenu();

        // Expor função global para atualização
        window.updateTaskbar = () => this.updateActiveApps();
    }

    /**
     * Inicializa o relógio
     */
    initClock() {
        const updateClock = () => {
            const now = new Date();
            const time = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const date = now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
            if (this.clockElement) {
                this.clockElement.innerHTML = `<div class="time">${time}</div><div class="date">${date}</div>`;
            }
        };

        this.clockInterval = setInterval(updateClock, 1000);
        updateClock();
    }

    /**
     * Inicializa o menu iniciar e busca
     */
    initStartMenu() {
        this.startButtonElement?.addEventListener('click', () => {
            this.toggleStartMenu();
        });

        document.addEventListener('click', (e) => {
            if (this.startMenuElement &&
                !this.startMenuElement.contains(e.target) &&
                !this.startButtonElement?.contains(e.target)) {
                this.closeStartMenu();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeStartMenu();
            }
        });

        // Search Input
        const searchInput = this.startMenuElement?.querySelector('.start-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // Renderiza inicial (pinned)
        this.renderApps(this.appList);
    }

    handleSearch(query) {
        if (!query) {
            this.renderApps(this.appList);
            return;
        }

        const filtered = this.appList.filter(app => this.fuzzyMatch(query, app.name));

        if (filtered.length > 0) {
            this.renderApps(filtered, "Resultados da Busca");
        } else {
            // Recomendações se não encontrar nada
            const random = this.appList[Math.floor(Math.random() * this.appList.length)];
            this.renderApps([random], "Nenhum resultado. Recomendado:");
        }
    }

    fuzzyMatch(pattern, str) {
        pattern = pattern.toLowerCase();
        str = str.toLowerCase();
        let patternIdx = 0;
        let strIdx = 0;

        while (patternIdx < pattern.length && strIdx < str.length) {
            if (pattern[patternIdx] === str[strIdx]) {
                patternIdx++;
            }
            strIdx++;
        }

        return patternIdx === pattern.length;
    }

    renderApps(apps, title = "Aplicativos Fixados") {
        const container = this.startMenuElement.querySelector('.pinned-apps');
        const titleEl = this.startMenuElement.querySelector('.start-menu-apps h4');

        if (titleEl) titleEl.textContent = title;
        if (!container) return;

        container.innerHTML = '';
        apps.forEach(app => {
            const div = document.createElement('div');
            div.className = 'start-app';
            div.dataset.app = app.id;
            div.innerHTML = `
                <div class="app-icon">${app.icon}</div>
                <span>${app.name}</span>
            `;

            div.addEventListener('click', () => {
                this.windowManager.open(app.id);
                this.closeStartMenu();
            });

            container.appendChild(div);
        });
    }

    /**
     * Inicializa apps na barra de tarefas
     */
    initTaskbarApps() {
        document.querySelectorAll('.taskbar-app').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const appId = btn.dataset.app;
                if (appId) {
                    this.windowManager.open(appId);
                }
            });
        });
    }

    /**
     * Atualiza indicadores de apps ativos
     */
    updateActiveApps() {
        document.querySelectorAll('.taskbar-app').forEach(btn => {
            const appId = btn.dataset.app;
            if (this.windowManager.isVisible(appId) && this.windowManager.isActive(appId)) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    /**
     * Alterna menu iniciar
     */
    toggleStartMenu() {
        this.startMenuElement?.classList.toggle('hidden');
        // Reset search on open
        if (!this.startMenuElement?.classList.contains('hidden')) {
            const input = this.startMenuElement.querySelector('.start-search');
            if (input) {
                input.value = '';
                input.focus();
                this.handleSearch('');
            }
        }
    }

    /**
     * Fecha menu iniciar
     */
    closeStartMenu() {
        this.startMenuElement?.classList.add('hidden');
    }

    /**
     * Limpa recursos
     */
    destroy() {
        if (this.clockInterval) {
            clearInterval(this.clockInterval);
        }
    }

    /**
     * Inicializa o menu de energia dinâmico
     */
    initPowerMenu() {
        if (!this.startButtonElement || !this.powerMenuElement) return;

        this.startButtonElement.addEventListener('click', (e) => {
            e.stopPropagation();
            this.togglePowerMenu();
        });

        const shutdownBtn = document.getElementById('btn-shutdown');
        if (shutdownBtn) {
            shutdownBtn.addEventListener('click', () => {
                // Tenta fechar usando a API do Tauri primeiro
                if (window.__TAURI__) {
                    window.__TAURI__.window.getCurrent().close();
                } else {
                    // Fallback para ambientes web normais
                    alert('O Pitter OS está sendo desligado...');
                    window.close();
                    // Se window.close falhar, recarrega para simular
                    setTimeout(() => window.location.reload(), 500);
                }
            });
        }

        // Fechar ao clicar fora
        document.addEventListener('click', (e) => {
            if (this.powerMenuElement && !this.powerMenuElement.contains(e.target) && !this.startButtonElement.contains(e.target)) {
                this.powerMenuElement.classList.add('hidden');
            }
        });
    }

    /**
     * Alterna o menu de energia com detecção de posição
     */
    togglePowerMenu() {
        if (!this.powerMenuElement || !this.taskbarElement) return;

        const isHidden = this.powerMenuElement.classList.contains('hidden');

        if (isHidden) {
            const rect = this.taskbarElement.getBoundingClientRect();
            const screenHeight = window.innerHeight;

            // Determina se a taskbar está na metade de cima ou de baixo
            if (rect.top > screenHeight / 2) {
                // Taskbar está na parte inferior, abre para CIMA
                this.powerMenuElement.classList.remove('open-down');
                this.powerMenuElement.classList.add('open-up');
            } else {
                // Taskbar está na parte superior, abre para BAIXO
                this.powerMenuElement.classList.remove('open-up');
                this.powerMenuElement.classList.add('open-down');
            }

            this.powerMenuElement.classList.remove('hidden');
            // Fechar o menu iniciar se estiver aberto (opcional, usuário pode querer ambos)
            this.closeStartMenu();
        } else {
            this.powerMenuElement.classList.add('hidden');
        }
    }
}

