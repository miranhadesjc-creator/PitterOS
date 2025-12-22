const { contextBridge, ipcRenderer } = require('electron');

// ============================================
// CONTEXT BRIDGE - API Segura para o Frontend
// ============================================
// Expõe funcionalidades do IPC para o processo de renderização (frontend)
// de forma segura, sem expor todo o módulo ipcRenderer.

contextBridge.exposeInMainWorld('api', {
    // Comunicação unidirecional (Renderer -> Main) e bidirecional (Renderer -> Main -> Renderer)
    invoke: (channel, ...args) => {
        return ipcRenderer.invoke(channel, ...args);
    },

    // Comunicação unidirecional (Renderer -> Main)
    send: (channel, ...args) => {
        ipcRenderer.send(channel, ...args);
    },

    // Receber eventos do Main no Renderer
    on: (channel, callback) => {
        // Cria um listener seguro que remove o wrapper ao cancelar
        const subscription = (event, ...args) => callback(...args);
        ipcRenderer.on(channel, subscription);

        // Retorna uma função para remover o listener, evitando memory leaks
        return () => {
            ipcRenderer.removeListener(channel, subscription);
        };
    }
});

console.log('Pitter OS - Preload script carregado com sucesso.');
