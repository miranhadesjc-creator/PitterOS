export class Database {
    constructor() {
        this.dbName = 'TauriOS_DB';
        this.version = 1;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = (e) => reject('Erro ao abrir DB: ' + e.target.error);

            request.onsuccess = (e) => {
                this.db = e.target.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('wallpapers')) {
                    db.createObjectStore('wallpapers', { keyPath: 'id', autoIncrement: true });
                }
            };
        });
    }

    async saveWallpaper(file) {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['wallpapers'], 'readwrite');
            const store = transaction.objectStore('wallpapers');
            const request = store.add({
                name: file.name,
                type: file.type.startsWith('video/') ? 'video' : 'image',
                blob: file,
                date: new Date()
            });

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject('Erro ao salvar wallpaper');
        });
    }

    async getWallpapers() {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['wallpapers'], 'readonly');
            const store = transaction.objectStore('wallpapers');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject('Erro ao listar wallpapers');
        });
    }

    async deleteWallpaper(id) {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['wallpapers'], 'readwrite');
            const store = transaction.objectStore('wallpapers');
            const request = store.delete(Number(id));

            request.onsuccess = () => resolve();
            request.onerror = () => reject('Erro ao deletar wallpaper');
        });
    }
}

export const db = new Database();
