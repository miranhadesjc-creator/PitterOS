import { downloadManager } from '../core/download-manager.js';
import { KernelAPI } from '../core/kernel-api.js';

export class FileExplorerApp {
    constructor() {
        this.currentPathElement = document.querySelector('.explorer-path span');
        this.explorerGrid = document.querySelector('.explorer-grid');
        this.currentPath = '/home/jean';

        this.init();
    }

    async init() {
        this.setupNavigation();
        this.setupItems();

        // Obter caminhos reais do sistema
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            this.systemPaths = await ipcRenderer.invoke('get-system-paths');
        }

        this.navigate(this.currentPath);

        // Ouvir novos downloads
        window.addEventListener('pitter-download-added', () => {
            if (this.currentPath && this.currentPath.includes('Downloads')) {
                this.navigate(this.currentPath);
            }
        });
    }

    setupNavigation() {
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');

                const name = item.innerText.substring(2).trim();
                let targetPath = '/home/jean';

                const toWsl = (winPath) => {
                    if (!winPath) return '/';
                    return winPath.replace(/^[a-zA-Z]:/, (match) => `/mnt/${match[0].toLowerCase()}`).replace(/\\/g, '/');
                };

                if (name === 'Downloads' || name === 'Transferências') targetPath = toWsl(this.systemPaths?.downloads);
                if (name === 'Este Computador' || name === 'Início') targetPath = toWsl(this.systemPaths?.home);
                if (name === 'Documentos') targetPath = toWsl(this.systemPaths?.documents);
                if (name === 'Imagens') targetPath = toWsl(this.systemPaths?.pictures);
                if (name === 'Sistema') targetPath = '/';
                if (name === 'Disco Local (C:)') targetPath = '/mnt/c';

                this.navigate(targetPath);
            });
        });
    }

    setupItems() {
        if (this.explorerGrid) {
            this.explorerGrid.addEventListener('dblclick', (e) => {
                const item = e.target.closest('.explorer-item');
                if (!item) return;

                const name = item.querySelector('span').innerText;
                const type = item.dataset.type;

                if (type === 'folder') {
                    const separator = this.currentPath.endsWith('/') ? '' : '/';
                    const newPath = `${this.currentPath}${separator}${name}`;
                    this.navigate(newPath);
                } else {
                    alert(`Ubuntu: Abrindo arquivo "${name}"`);
                }
            });
        }

        // Botão "Subir" se existir no index.html (vamos adicionar depois)
        const backBtn = document.getElementById('explorer-back-btn');
        if (backBtn) {
            backBtn.onclick = () => {
                const parts = this.currentPath.split('/').filter(p => p.length > 0);
                if (parts.length > 0) {
                    parts.pop();
                    const newPath = '/' + parts.join('/');
                    this.navigate(newPath);
                }
            };
        }
    }

    async navigate(path) {
        this.currentPath = path || '/';
        if (this.currentPathElement) {
            this.currentPathElement.textContent = this.currentPath;
        }

        this.renderLoading();

        try {
            // ls -p adds / to directories
            const output = await KernelAPI.runBashCommand(`ls -p "${this.currentPath}"`);

            if (typeof output === 'string' && !output.startsWith('Erro')) {
                this.renderDirectoryContent(output);
            } else {
                console.warn("Navegação falhou:", output);
                this.renderError(output || "Caminho inacessível");
            }
        } catch (error) {
            this.renderError(error.message);
        }
    }

    renderDirectoryContent(output) {
        if (!this.explorerGrid) return;

        const items = output.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        if (items.length === 0) {
            this.renderEmpty();
            return;
        }

        this.explorerGrid.innerHTML = items.map(item => {
            const isFolder = item.endsWith('/');
            const name = isFolder ? item.slice(0, -1) : item;
            const type = isFolder ? 'folder' : 'file';
            const icon = isFolder ? '📁' : this.getFileIcon(name);

            return `
                <div class="explorer-item" data-type="${type}" style="cursor: pointer;">
                    <div class="item-icon" style="${isFolder ? 'color: #e95420;' : ''}">${icon}</div>
                    <span style="font-size: 12px; text-align: center; word-break: break-all;">${name}</span>
                </div>
            `;
        }).join('');
    }

    renderLoading() {
        if (!this.explorerGrid) return;
        this.explorerGrid.innerHTML = '<div style="padding: 20px; color: var(--win-text-secondary);">Acessando Kernel Ubuntu...</div>';
    }

    renderError(msg) {
        if (!this.explorerGrid) return;
        this.explorerGrid.innerHTML = `
            <div style="padding: 20px; color: #ef2929; display: flex; flex-direction: column; gap: 8px;">
                <span>⚠️ Erro ao acessar: ${this.currentPath}</span>
                <button class="win-button" style="width: fit-content;" onclick="os.apps.fileExplorer.navigate('/')">Voltar para /</button>
            </div>
        `;
    }

    renderEmpty() {
        if (!this.explorerGrid) return;
        this.explorerGrid.innerHTML = '<div style="padding: 20px; color: var(--win-text-secondary);">Esta pasta está vazia.</div>';
    }

    getFileIcon(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        if (['jpg', 'png', 'svg', 'webp'].includes(ext)) return '🖼️';
        if (['mp4', 'webm'].includes(ext)) return '🎬';
        if (['mp3', 'wav'].includes(ext)) return '🎵';
        if (['txt', 'md', 'pdf'].includes(ext)) return '📄';
        return '📄';
    }
}
