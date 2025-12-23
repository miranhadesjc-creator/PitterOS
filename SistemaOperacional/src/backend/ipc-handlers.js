const { ipcMain, app } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');

function setupIpcHandlers(kernel, getMainWindow) {
    // Comando: Executar comando no Bash do WSL
    ipcMain.handle('run-bash-command', async (event, command) => {
        try {
            const result = await kernel.executeBash(command);
            return { success: true, data: result };
        } catch (e) {
            return { success: false, error: e };
        }
    });

    // Comando: Obter informações do sistema
    ipcMain.handle('get-system-info', () => {
        return kernel.getSystemInfo();
    });

    // Comando: Criar um novo processo
    ipcMain.handle('create-process', (event, name) => {
        return kernel.createProcess(name);
    });

    // Comando: Listar todos os processos
    ipcMain.handle('list-processes', async () => {
        return await kernel.listProcesses();
    });

    // Comando: Matar um processo
    ipcMain.handle('kill-process', async (event, pid) => {
        return await kernel.killProcess(pid);
    });

    // Comando: Download Virtual (baixa apenas dentro do Pitter OS)
    ipcMain.handle('virtual-download', async (event, { url, fileName }) => {
        return new Promise((resolve) => {
            const dest = path.join(kernel.downloadPath, fileName);
            const protocol = url.startsWith('https') ? https : http;

            protocol.get(url, (response) => {
                if (response.statusCode === 200) {
                    const file = fs.createWriteStream(dest);
                    response.pipe(file);
                    file.on('finish', () => {
                        file.close();
                        resolve({ success: true, path: dest, name: fileName });
                    });
                } else if (response.statusCode === 301 || response.statusCode === 302) {
                    // Redirecionamento simples
                    resolve(kernel.virtualDownload(response.headers.location, fileName));
                } else {
                    resolve({ success: false, error: `Status: ${response.statusCode}` });
                }
            }).on('error', (err) => {
                resolve({ success: false, error: err.message });
            });
        });
    });

    // Comando: Obter caminhos reais do sistema
    ipcMain.handle('get-system-paths', () => {
        return {
            downloads: app.getPath('downloads'),
            documents: app.getPath('documents'),
            pictures: app.getPath('pictures'),
            desktop: app.getPath('desktop'),
            home: app.getPath('home')
        };
    });

    // Comando: Listar downloads virtuais
    ipcMain.handle('list-virtual-downloads', async () => {
        try {
            const files = fs.readdirSync(kernel.downloadPath);
            return files.map(file => {
                const stats = fs.statSync(path.join(kernel.downloadPath, file));
                return {
                    name: file,
                    size: (stats.size / 1024).toFixed(1) + ' KB',
                    date: stats.mtime.toLocaleDateString('pt-BR')
                };
            });
        } catch (e) {
            return [];
        }
    });

    // Comando: Saudação simples
    ipcMain.handle('greet', (event, name) => {
        return `Pitter OS (Ubuntu) - Bem-vindo, ${name}!`;
    });

    // Controles de janela
    ipcMain.on('window-minimize', () => {
        const mainWindow = getMainWindow();
        if (mainWindow) mainWindow.minimize();
    });

    ipcMain.on('window-maximize', () => {
        const mainWindow = getMainWindow();
        if (mainWindow) {
            if (mainWindow.isMaximized()) {
                mainWindow.unmaximize();
            } else {
                mainWindow.maximize();
            }
        }
    });

    ipcMain.on('window-close', () => {
        const mainWindow = getMainWindow();
        if (mainWindow) mainWindow.close();
    });
}

module.exports = { setupIpcHandlers };
