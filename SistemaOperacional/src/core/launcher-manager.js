import { windowManager } from './window-manager.js';

export class LauncherManager {
    constructor(lockscreenManager) {
        this.overlay = document.getElementById('launcher-overlay');
        this.grid = document.getElementById('launcher-apps-grid');
        this.searchInput = document.getElementById('launcher-search-input');
        this.lockscreenManager = lockscreenManager;

        this.allApps = [
            { id: 'settings', name: 'Configurações', icon: '⚙️' },
            { id: 'task-manager', name: 'Gerenciador', icon: '📊' },
            { id: 'terminal', name: 'Terminal', icon: '💻' },
            { id: 'file-explorer', name: 'Arquivos', icon: '📁' },
            { id: 'system-info', name: 'Sistema', icon: 'ℹ️' },
            { id: 'games', name: 'Games', icon: '🎮' },
            { id: 'chrome', name: 'Google', icon: '<img src="https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png" style="width: 48px; height: 48px; object-fit: contain;">' },
            { id: 'game-hub', name: 'Game Hub', icon: '<img src="assets/game_hub_icon.png" style="width: 48px; height: 48px; object-fit: contain;">' }
        ];
    }

    init() {
        const launcherBtn = document.getElementById('app-launcher-btn');
        if (!launcherBtn || !this.overlay) return;

        launcherBtn.addEventListener('click', () => this.toggle());

        const closeBtn = document.getElementById('launcher-close-btn');
        if (closeBtn) {
            closeBtn.onclick = () => this.close();
        }

        // Close on click outside content
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.close();
            }
        });

        // Search logic
        this.searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = this.allApps.filter(app =>
                app.name.toLowerCase().includes(query)
            );
            this.renderApps(filtered);
        });

        // Lock button logic
        const lockBtn = document.getElementById('btn-lock-manual');
        if (lockBtn) {
            lockBtn.onclick = () => {
                this.close();
                this.lockscreenManager.lock();
            };
        }
    }

    toggle() {
        this.overlay.classList.toggle('hidden');
        if (!this.overlay.classList.contains('hidden')) {
            this.searchInput.focus();
            this.renderApps(this.allApps);
        }
    }

    close() {
        this.overlay.classList.add('hidden');
    }

    renderApps(apps) {
        if (!this.grid) return;

        this.grid.innerHTML = '';
        apps.forEach(app => {
            const item = document.createElement('div');
            item.className = 'launcher-app-item';
            item.innerHTML = `
                <div class="launcher-app-icon">${app.icon}</div>
                <div class="launcher-app-name">${app.name}</div>
            `;
            item.addEventListener('click', () => {
                windowManager.open(app.id);
                this.close();
            });
            this.grid.appendChild(item);
        });
    }
}
