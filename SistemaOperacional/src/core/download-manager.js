/**
 * Gerencia o sistema de downloads virtuais do Pitter OS
 */
export class DownloadManager {
    constructor() {
        this.storageKey = 'pitter_os_downloads';
        this.downloads = this.loadDownloads();
    }

    /**
     * Carrega downloads salvos do localStorage
     */
    loadDownloads() {
        const saved = localStorage.getItem(this.storageKey);
        return saved ? JSON.parse(saved) : [
            { id: 1, name: 'Welcome_to_PitterOS.txt', size: '1kb', type: 'text', date: '18/12/2025' }
        ];
    }

    /**
     * Adiciona um novo download
     */
    addDownload(file) {
        const newFile = {
            id: Date.now(),
            name: file.name,
            size: file.size || '0kb',
            type: file.type || 'unknown',
            date: new Date().toLocaleDateString('pt-BR'),
            content: file.content || ''
        };
        this.downloads.push(newFile);
        this.save();

        // Disparar evento para atualizar File Explorer se aberto
        window.dispatchEvent(new CustomEvent('pitter-download-added', { detail: newFile }));
        return newFile;
    }

    /**
     * Retorna todos os downloads
     */
    getDownloads() {
        return this.downloads;
    }

    /**
     * Remove um download
     */
    removeDownload(id) {
        this.downloads = this.downloads.filter(d => d.id !== id);
        this.save();
    }

    /**
     * Salva no localStorage
     */
    save() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.downloads));
    }

    async loadDownloadsFromSystem() {
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            const files = await ipcRenderer.invoke('list-virtual-downloads');
            this.downloads = files.map((f, i) => ({ id: i, ...f, type: 'file' }));
            this.save();
        }
    }

    /**
     * Inicia um download nativo no Windows.
     */
    async downloadFileToLocal(url, suggestedName = 'download') {
        // No Electron, ao mudar o src do iframe (ou webview) para um link de download, 
        // o evento 'will-download' no main process é disparado automaticamente.
        const link = document.createElement('a');
        link.href = url;
        link.download = suggestedName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log(`Iniciando download nativo de: ${url}`);
    }

    async downloadFromAddressBar(addressBarUrl) {
        if (!addressBarUrl) return;
        const urlParts = addressBarUrl.split('/');
        let suggestedName = urlParts[urlParts.length - 1] || 'download';
        if (suggestedName.includes('?')) suggestedName = suggestedName.split('?')[0];
        if (!suggestedName.includes('.')) suggestedName += '.bin';

        await this.downloadFileToLocal(addressBarUrl, suggestedName);
    }
}

// Singleton para fácil acesso
export const downloadManager = new DownloadManager();
