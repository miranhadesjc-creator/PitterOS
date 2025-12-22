export class BrowserApp {
    constructor(windowManager, config = {}) {
        this.windowManager = windowManager;
        this.windowId = config.windowId || 'window-browser';
        this.iframeId = config.iframeId || 'browser-iframe';
        this.addressBarId = config.addressBarId || 'browser-address-bar';
        this.btnBackId = config.btnBackId || 'browser-btn-back';
        this.btnForwardId = config.btnForwardId || 'browser-btn-forward';
        this.btnReloadId = config.btnReloadId || 'browser-btn-reload';
        this.btnHomeId = config.btnHomeId || 'browser-btn-home';
        this.btnGoId = config.btnGoId || 'browser-btn-go';
        this.btnDownloadId = config.btnDownloadId; // Novo

        this.homeUrl = config.homeUrl || 'https://www.google.com';
        this.history = [];
    }

    init(isNative = false) {
        const win = document.getElementById(this.windowId);
        if (!win) return;

        this.iframe = document.getElementById(this.iframeId);
        this.addressBar = document.getElementById(this.addressBarId);
        this.isNative = isNative;
        this.nativeWindow = null;

        this.setupEventListeners();

        if (this.isNative && window.__TAURI__) {
            this.setupPortal();
        } else {
            this.navigate(this.iframe.src || this.homeUrl);
        }
    }

    async setupPortal() {
        if (!window.__TAURI__) return;

        // Esconde o iframe interno 
        if (this.iframe) {
            this.iframe.style.display = 'none';
        }

        // Registra listener no WindowManager para sincronização
        if (this.windowManager) {
            const originalOnUpdate = this.windowManager.onUpdate;
            this.windowManager.onUpdate = (wid) => {
                if (originalOnUpdate) originalOnUpdate(wid);
                // Sincroniza todos os apps nativos quando QUALQUER janela muda
                // (Isso garante que fiquem atrás de outras janelas se necessário)
                this.syncPortal();
            };
        }

        await this.openNativePortal();
    }

    async openNativePortal() {
        try {
            const { WebviewWindow } = window.__TAURI__.window;
            const label = `portal-${this.windowId.replace('window-', '')}`;

            this.nativeWindow = new WebviewWindow(label, {
                url: this.homeUrl,
                decorations: false,
                transparent: false,
                alwaysOnTop: true,
                resizable: false,
                title: 'Pitter Portal'
            });

            this.nativeWindow.once('tauri://created', () => {
                setTimeout(() => this.syncPortal(), 100);
            });

            this.nativeWindow.once('tauri://error', async () => {
                this.nativeWindow = WebviewWindow.getByLabel(label);
                this.syncPortal();
            });
        } catch (e) {
            console.error('Portal failed:', e);
        }
    }

    async syncPortal() {
        if (!this.nativeWindow || !window.__TAURI__) return;

        const winEl = document.getElementById(this.windowId);
        const contentEl = winEl?.querySelector('.window-content');

        if (!winEl || !contentEl || winEl.classList.contains('hidden')) {
            await this.nativeWindow.hide();
            return;
        }

        const rect = contentEl.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
            await this.nativeWindow.hide();
            return;
        }

        await this.nativeWindow.show();

        // Sincroniza posição e tamanho com o Tauri
        const { LogicalPosition, LogicalSize } = window.__TAURI__.window;

        try {
            await this.nativeWindow.setPosition(new LogicalPosition(rect.left, rect.top));
            await this.nativeWindow.setSize(new LogicalSize(rect.width, rect.height));
        } catch (e) {
            // Sincronização falhou (janela fechada?)
        }
    }

    setupEventListeners() {
        // Navigation Buttons
        document.getElementById(this.btnBackId)?.addEventListener('click', () => this.goBack());
        document.getElementById(this.btnForwardId)?.addEventListener('click', () => this.goForward());
        document.getElementById(this.btnReloadId)?.addEventListener('click', () => this.reload());
        document.getElementById(this.btnHomeId)?.addEventListener('click', () => this.goHome());
        document.getElementById(this.btnGoId)?.addEventListener('click', () => this.handleAddressBar());

        // Download Simulation
        if (this.btnDownloadId) {
            document.getElementById(this.btnDownloadId)?.addEventListener('click', () => this.simulateDownload());
        }

        // Address Bar Input
        this.addressBar.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleAddressBar();
            }
        });
    }

    handleAddressBar() {
        let url = this.addressBar.value.trim();
        if (!url) return;

        // Smart fix for URL
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            // Check if it looks like a domain
            if (url.includes('.') && !url.includes(' ')) {
                url = 'https://' + url;
            } else {
                // It's a search
                url = `https://www.google.com/search?q=${encodeURIComponent(url)}&igu=1`;
            }
        }

        this.navigate(url);
    }

    navigate(url) {
        if (!this.iframe) return;

        // Smart fix for URL
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            if (url.includes('.') && !url.includes(' ')) {
                url = 'https://' + url;
            } else {
                url = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
            }
        }

        this.addressBar.value = url;

        // No Electron, webview pode precisar de um reset no src se estiver travado
        if (this.iframe.src === url) {
            this.reload();
        } else {
            this.iframe.src = url;
        }

        // Forçar visibilidade
        this.iframe.style.display = 'flex';
    }

    reload() {
        if (this.iframe) {
            if (typeof this.iframe.reload === 'function') {
                this.iframe.reload();
            } else {
                this.iframe.src = this.iframe.src;
            }
        }
    }

    goBack() {
        if (this.iframe && typeof this.iframe.goBack === 'function') {
            this.iframe.goBack();
        }
    }

    goForward() {
        if (this.iframe && typeof this.iframe.goForward === 'function') {
            this.iframe.goForward();
        }
    }

    goHome() {
        this.navigate(this.homeUrl);
    }

    async simulateDownload() {
        const { downloadManager } = await import('../core/download-manager.js');
        const url = this.addressBar?.value?.trim();

        if (!url) {
            alert('Digite uma URL na barra de endereços para baixar.');
            return;
        }

        // Usa o novo método de download real via Tauri
        await downloadManager.downloadFromAddressBar(url);
    }
}
