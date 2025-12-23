const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    send: (channel, data) => {
        // Canais permitidos para envio (Renderer -> Main)
        const validChannels = [
            'window-minimize',
            'window-maximize',
            'window-close'
        ];
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    },
    on: (channel, func) => {
        // Canais permitidos para recepção (Main -> Renderer)
        const validChannels = [
            'download-started',
            'download-completed'
        ];
        if (validChannels.includes(channel)) {
            // Remove listener anterior para evitar duplicação se necessário, 
            // mas aqui só estamos expondo a função de registro.
            // O ideal em apps reais é permitir remover listeners também.

            // Strip event as it includes `sender`
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
    },
    invoke: (channel, data) => {
        // Canais permitidos para invocação (Renderer -> Main -> Renderer)
        const validChannels = [
            'run-bash-command',
            'get-system-info',
            'create-process',
            'list-processes',
            'kill-process',
            'virtual-download', // Mantido por compatibilidade
            'get-system-paths',
            'list-virtual-downloads',
            'greet'
        ];
        if (validChannels.includes(channel)) {
            return ipcRenderer.invoke(channel, data);
        }
    }
});
