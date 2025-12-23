export class BrowserApp {
    constructor(windowManager, config = {}) {
        this.windowManager = windowManager;
        this.windowId = config.windowId || 'window-browser';

        // Configurable IDs
        this.addressBarId = config.addressBarId || 'browser-address-bar';
        this.btnBackId = config.btnBackId || 'browser-btn-back';
        this.btnForwardId = config.btnForwardId || 'browser-btn-forward';
        this.btnReloadId = config.btnReloadId || 'browser-btn-reload';
        this.btnHomeId = config.btnHomeId || 'browser-btn-home';
        this.btnGoId = config.btnGoId || 'browser-btn-go';
        this.btnDownloadId = config.btnDownloadId;

        // Containers
        this.tabsContainerId = 'browser-tabs-bar';
        this.viewsContainerId = 'browser-views-container';
        this.newTabBtnId = 'browser-new-tab-btn';

        this.homeUrl = config.homeUrl || 'https://www.google.com';

        // Tabs State
        this.tabs = [];
        this.activeTabId = null;
        this.tabCounter = 0;
    }

    init(isNative = false) {
        const win = document.getElementById(this.windowId);
        if (!win) return;

        this.addressBar = document.getElementById(this.addressBarId);
        this.tabsContainer = document.getElementById(this.tabsContainerId);
        this.viewsContainer = document.getElementById(this.viewsContainerId);
        this.newTabBtn = document.getElementById(this.newTabBtnId);

        this.isNative = isNative;

        this.setupEventListeners();

        // Create initial tab
        this.createTab(this.homeUrl);
    }

    createTab(url) {
        this.tabCounter++;
        const tabId = `tab-${this.tabCounter}`;

        // 1. Create Tab UI
        const tabEl = document.createElement('div');
        tabEl.className = 'browser-tab';
        tabEl.dataset.id = tabId;
        tabEl.innerHTML = `
            <span class="browser-tab-title">Nova Guia</span>
            <span class="browser-tab-close">x</span>
        `;

        // Insert before the new tab button
        if (this.newTabBtn) {
            this.tabsContainer.insertBefore(tabEl, this.newTabBtn);
        } else {
            this.tabsContainer.appendChild(tabEl);
        }

        // 2. Create Webview/Iframe Container
        const viewWrapper = document.createElement('div');
        viewWrapper.className = 'browser-webview-wrapper';
        viewWrapper.id = `view-${tabId}`;

        // Create the actual view element
        // Attempt to create a webview first. In Electron keys it should have methods.
        let viewEl = document.createElement('webview');
        let isWebview = false;

        // Check if it's a real webview (has 'reload' method, etc, usually after attachment or simple prop check)
        // Trust existence of 'window.api' as sign of Electron context.
        if (!window.api) {
            viewEl = document.createElement('iframe');
        } else {
            isWebview = true;
        }

        viewEl.className = 'browser-webview';
        viewEl.style.width = '100%';
        viewEl.style.height = '100%';
        viewEl.style.border = 'none';
        viewEl.src = url;

        // Allow transparency/plugins if it is a webview
        if (isWebview) {
            viewEl.setAttribute('allowpopups', '');
            viewEl.setAttribute('webpreferences', 'contextIsolation=true');
        }

        viewWrapper.appendChild(viewEl);
        this.viewsContainer.appendChild(viewWrapper);

        // 3. Register State
        const tabData = {
            id: tabId,
            url: url,
            title: 'Nova Guia',
            tabElement: tabEl,
            viewElement: viewEl,
            wrapperElement: viewWrapper,
            isWebview: isWebview,
            // Fallback history for iframes
            history: [url],
            historyIndex: 0
        };
        this.tabs.push(tabData);

        // 4. Setup Listeners for this tab
        this.setupTabListeners(tabData);

        // 5. Switch to it
        this.switchTab(tabId);
        return tabData;
    }

    setupTabListeners(tab) {
        // Click on tab to switch
        tab.tabElement.addEventListener('click', (e) => {
            if (e.target.classList.contains('browser-tab-close')) {
                e.stopPropagation();
                this.closeTab(tab.id);
            } else {
                this.switchTab(tab.id);
            }
        });

        // Update UI helper
        const updateUI = (newUrl, newTitle) => {
            tab.url = newUrl || tab.url;
            tab.title = newTitle || tab.title;

            const titleEl = tab.tabElement.querySelector('.browser-tab-title');
            if (titleEl) titleEl.textContent = tab.title;

            if (this.activeTabId === tab.id && newUrl) {
                this.addressBar.value = newUrl;
            }
        };

        if (tab.isWebview) {
            // WEBVIEW EVENTS
            tab.viewElement.addEventListener('did-navigate', (e) => updateUI(e.url));
            tab.viewElement.addEventListener('did-navigate-in-page', (e) => updateUI(e.url));
            tab.viewElement.addEventListener('page-title-updated', (e) => updateUI(null, e.title));

            tab.viewElement.addEventListener('dom-ready', () => {
                if (window.os?.controlCenter) {
                    this.applyVolumeToTab(tab, window.os.controlCenter.state.volume);
                }
            });
        } else {
            // IFRAME EVENTS (Limited)
            tab.viewElement.addEventListener('load', () => {
                try {
                    // Try to get accessible info (same origin only)
                    const iframeUrl = tab.viewElement.contentWindow.location.href;
                    updateUI(iframeUrl, "Página Externa");
                } catch (e) {
                    // Cross origin - can't read URL. We keep what we navigated to.
                }
            });
        }
    }

    switchTab(tabId) {
        this.activeTabId = tabId;

        this.tabs.forEach(t => {
            if (t.id === tabId) {
                t.tabElement.classList.add('active');
                t.wrapperElement.classList.add('active');
                this.addressBar.value = t.url;
            } else {
                t.tabElement.classList.remove('active');
                t.wrapperElement.classList.remove('active');
            }
        });
    }

    closeTab(tabId) {
        const index = this.tabs.findIndex(t => t.id === tabId);
        if (index === -1) return;

        const tab = this.tabs[index];
        tab.tabElement.remove();
        tab.wrapperElement.remove();
        this.tabs.splice(index, 1);

        if (this.activeTabId === tabId) {
            if (this.tabs.length > 0) {
                const nextTab = this.tabs[index] || this.tabs[index - 1];
                this.switchTab(nextTab.id);
            } else {
                this.createTab(this.homeUrl);
            }
        }
    }

    getActiveTab() {
        return this.tabs.find(t => t.id === this.activeTabId);
    }

    setupEventListeners() {
        document.getElementById(this.btnBackId)?.addEventListener('click', () => this.goBack());
        document.getElementById(this.btnForwardId)?.addEventListener('click', () => this.goForward());
        document.getElementById(this.btnReloadId)?.addEventListener('click', () => this.reload());
        document.getElementById(this.btnHomeId)?.addEventListener('click', () => this.goHome());
        document.getElementById(this.btnGoId)?.addEventListener('click', () => this.handleAddressBar());

        if (this.newTabBtn) {
            this.newTabBtn.addEventListener('click', () => this.createTab(this.homeUrl));
        }

        if (this.btnDownloadId) {
            document.getElementById(this.btnDownloadId)?.addEventListener('click', () => this.simulateDownload());
        }

        window.addEventListener('volumeChange', (e) => {
            this.tabs.forEach(tab => this.applyVolumeToTab(tab, e.detail.volume));
        });

        this.addressBar.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleAddressBar();
            }
        });
    }

    handleAddressBar() {
        let url = this.addressBar.value.trim();
        if (!url) return;

        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            if (url.includes('.') && !url.includes(' ')) {
                url = 'https://' + url;
            } else {
                url = `https://www.google.com/search?q=${encodeURIComponent(url)}&igu=1`;
            }
        }

        this.navigate(url);
    }

    navigate(url) {
        const tab = this.getActiveTab();
        if (!tab) return;

        // Manual History Update
        if (!tab.isWebview) {
            // Remove forward history if we diverge
            const current = tab.history[tab.historyIndex];
            if (current !== url) {
                tab.history = tab.history.slice(0, tab.historyIndex + 1);
                tab.history.push(url);
                tab.historyIndex++;
            }
        }

        tab.url = url;
        this.addressBar.value = url;
        tab.viewElement.src = url;
    }

    reload() {
        const tab = this.getActiveTab();
        if (!tab) return;

        if (tab.isWebview && typeof tab.viewElement.reload === 'function') {
            tab.viewElement.reload();
        } else {
            // Force refresh iframe
            tab.viewElement.src = tab.viewElement.src;
        }
    }

    goBack() {
        const tab = this.getActiveTab();
        if (!tab) return;

        if (tab.isWebview && typeof tab.viewElement.goBack === 'function') {
            if (tab.viewElement.canGoBack()) tab.viewElement.goBack();
        } else {
            // Manual History Back
            if (tab.historyIndex > 0) {
                tab.historyIndex--;
                const prevUrl = tab.history[tab.historyIndex];
                tab.url = prevUrl;
                this.addressBar.value = prevUrl;
                tab.viewElement.src = prevUrl;
            }
        }
    }

    goForward() {
        const tab = this.getActiveTab();
        if (!tab) return;

        if (tab.isWebview && typeof tab.viewElement.goForward === 'function') {
            if (tab.viewElement.canGoForward()) tab.viewElement.goForward();
        } else {
            // Manual History Forward
            if (tab.historyIndex < tab.history.length - 1) {
                tab.historyIndex++;
                const nextUrl = tab.history[tab.historyIndex];
                tab.url = nextUrl;
                this.addressBar.value = nextUrl;
                tab.viewElement.src = nextUrl;
            }
        }
    }

    goHome() {
        this.navigate(this.homeUrl);
    }

    applyVolumeToTab(tab, volume) {
        if (!tab.viewElement || !tab.isWebview) return;
        const vol = volume / 100;

        if (tab.viewElement.executeJavaScript) {
            const code = `
                (function() {
                    const elements = document.querySelectorAll('video, audio');
                    elements.forEach(el => {
                        el.volume = ${vol};
                        el.muted = ${vol === 0};
                    });
                })();
            `;
            tab.viewElement.executeJavaScript(code);
            if (tab.viewElement.setAudioMuted) {
                tab.viewElement.setAudioMuted(vol === 0);
            }
        }
    }

    async simulateDownload() {
        const { downloadManager } = await import('../core/download-manager.js');
        const url = this.addressBar?.value?.trim();
        if (!url) {
            alert('Digite uma URL na barra de endereços para baixar.');
            return;
        }
        await downloadManager.downloadFromAddressBar(url);
    }
}
