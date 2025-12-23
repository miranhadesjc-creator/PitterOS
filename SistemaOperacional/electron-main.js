const { app, BrowserWindow } = require('electron');
const path = require('path');
const Kernel = require('./src/backend/kernel.js');
const { setupIpcHandlers } = require('./src/backend/ipc-handlers.js');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        frame: false,
        title: 'Pitter OS',
        icon: path.join(__dirname, 'pitter-os.ico'),
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, 'src', 'core', 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            webviewTag: true
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));
    mainWindow.maximize();

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// ============================================
// PONTO DE ENTRADA DO APLICATIVO
// ============================================

const kernel = new Kernel();

app.whenReady().then(() => {
    createWindow();

    // Pass a function to get the mainWindow, avoiding issues with it being null initially.
    setupIpcHandlers(kernel, () => mainWindow);

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

console.log('Pitter OS (Electron) - Kernel modularizado iniciado!');
