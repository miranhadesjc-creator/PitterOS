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

    /**
     * Baixa um arquivo de uma URL e salva no sistema local (usando Tauri).
     * @param {string} url - URL do arquivo a ser baixado.
     * @param {string} suggestedName - Nome sugerido para o arquivo.
     */
    async downloadFileToLocal(url, suggestedName = 'download') {
        if (!window.__TAURI__) {
            alert('Download nativo só funciona no Tauri!');
            return;
        }

        const { save } = window.__TAURI__.dialog;
        const { writeBinaryFile } = window.__TAURI__.fs;
        const { fetch: tauriFetch } = window.__TAURI__.http;

        try {
            // 1. Abre o diálogo "Salvar Como"
            const filePath = await save({
                defaultPath: suggestedName,
                filters: [{
                    name: 'Todos os Arquivos',
                    extensions: ['*']
                }]
            });

            if (!filePath) {
                console.log('Download cancelado pelo usuário.');
                return;
            }

            // 2. Faz o download do arquivo
            const response = await tauriFetch(url, {
                method: 'GET',
                responseType: 2 // Binary
            });

            if (!response.ok) {
                throw new Error(`Falha ao baixar: ${response.status}`);
            }

            // 3. Escreve o arquivo no disco
            await writeBinaryFile(filePath, response.data);

            alert(`✅ Download concluído!\nSalvo em: ${filePath}`);
            this.addDownload({ name: suggestedName, size: 'N/A', type: 'file' });

        } catch (error) {
            console.error('Erro no download:', error);
            alert(`❌ Erro ao baixar arquivo:\n${error.message}`);
        }
    }

    /**
     * Baixa o conteúdo da barra de endereços como arquivo.
     * @param {string} addressBarUrl - URL da barra de endereços.
     */
    async downloadFromAddressBar(addressBarUrl) {
        if (!addressBarUrl) return;

        // Extrai o nome do arquivo da URL
        const urlParts = addressBarUrl.split('/');
        let suggestedName = urlParts[urlParts.length - 1] || 'download';

        // Remove query strings do nome
        if (suggestedName.includes('?')) {
            suggestedName = suggestedName.split('?')[0];
        }

        // Se não tiver extensão, adiciona uma genérica
        if (!suggestedName.includes('.')) {
            suggestedName += '.bin';
        }

        await this.downloadFileToLocal(addressBarUrl, suggestedName);
    }
}

// Singleton para fácil acesso
export const downloadManager = new DownloadManager();
