// ============================================
// SISTEMA OPERACIONAL - PONTO DE ENTRADA
// ============================================

import { windowManager } from './core/window-manager.js';
import { Taskbar } from './core/taskbar.js';
import { Desktop } from './core/desktop.js';

import { TerminalApp } from './apps/terminal.js';
import { TaskManagerApp } from './apps/task-manager.js';
import { FileExplorerApp } from './apps/file-explorer.js';
import { SystemInfoApp } from './apps/system-info.js';
import { SettingsApp } from './apps/settings.js';
import { GamesApp } from './apps/games-app.js';
import { BrowserApp } from './apps/browser-app.js';
import { UbuntuVMApp } from './apps/ubuntu-vm.js';
import { ControlCenter } from './core/control-center.js';
import { BatteryManager } from './core/battery-manager.js';
import { WifiManager } from './core/wifi-manager.js';

class OperatingSystem {
    constructor() {
        this.taskbar = new Taskbar(windowManager);
        this.desktop = new Desktop(windowManager);
        this.controlCenter = new ControlCenter();
        this.batteryManager = new BatteryManager();
        this.wifiManager = new WifiManager();

        // Aplicativos
        this.apps = {
            terminal: null,
            taskManager: null,
            fileExplorer: null,
            systemInfo: null,
            settings: null,
            games: null,
            google: null,
            steam: null,
            ubuntuVM: null
        };
        this.allApps = [
            { id: 'settings', name: 'Configurações', icon: '⚙️' },
            { id: 'task-manager', name: 'Gerenciador', icon: '📊' },
            { id: 'terminal', name: 'Terminal', icon: '💻' },
            { id: 'file-explorer', name: 'Arquivos', icon: '📁' },
            { id: 'system-info', name: 'Sistema', icon: 'ℹ️' },
            { id: 'games', name: 'Games', icon: '🎮' },
            { id: 'youtube', name: 'YouTube', icon: '<img src="assets/youtube_icon.png" style="width: 48px; height: 48px; object-fit: contain;">' },
            { id: 'whatsapp', name: 'WhatsApp', icon: '<img src="assets/whatsapp_icon.png" style="width: 48px; height: 48px; object-fit: contain;">' },
            { id: 'discord', name: 'Discord', icon: '<img src="assets/discord_icon.png" style="width: 48px; height: 48px; object-fit: contain;">' },
            { id: 'telegram', name: 'Telegram', icon: '<img src="assets/telegram_icon.png" style="width: 48px; height: 48px; object-fit: contain;">' },
            { id: 'google', name: 'Google', icon: '<img src="https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png" style="width: 48px; height: 48px; object-fit: contain;">' },
            { id: 'ubuntu-vm', name: 'Ubuntu VM', icon: '🐧' }
        ];
    }

    init() {
        console.log('Inicializando Pitter OS...');

        // Inicializa componentes do core
        this.taskbar.init();
        this.desktop.init(); // Carrega wallpaper salvo
        this.controlCenter.init();
        this.batteryManager.init(); // Sincroniza bateria com notebook
        this.wifiManager.init(); // Sincroniza WiFi com computador
        this.initDesktopClock();
        this.updateProfileUI();
        this.initLauncher();
        this.initDesktopInteractions();
        this.initHudMove();
        this.initLockScreenHandlers();

        // Startup Animation
        const desktop = document.getElementById('desktop');
        const taskbar = document.querySelector('.taskbar'); // Assuming class based
        if (desktop) desktop.classList.add('animate-startup');
        if (taskbar) taskbar.classList.add('animate-startup');

        // Registra janelas no gerenciador
        this.registerWindows();

        // Inicializa aplicativos
        this.initApps();

        console.log('Sistema iniciado com sucesso!');

        // Abre o Task Manager inicialmente
        // windowManager.open('task-manager');
    }

    registerWindows() {
        const windows = [
            'task-manager',
            'terminal',
            'system-info',
            'file-explorer',
            'settings',
            'games',
            'youtube',
            'whatsapp',
            'discord',
            'telegram',
            'google',
            'ubuntu-vm'
        ];

        windows.forEach(id => {
            const el = document.getElementById(`window-${id}`);
            if (el) {
                windowManager.register(id, el);
            }
        });
    }

    initApps() {
        this.apps.terminal = new TerminalApp();
        this.apps.taskManager = new TaskManagerApp();
        this.apps.fileExplorer = new FileExplorerApp();
        this.apps.systemInfo = new SystemInfoApp();
        this.apps.settings = new SettingsApp(this.desktop);
        this.apps.games = new GamesApp(windowManager);
        this.apps.games.init();
        this.apps.ubuntuVM = new UbuntuVMApp();

        // Chrome removed as requested by user


        // YouTube
        this.apps.youtube = new BrowserApp(windowManager, {
            windowId: 'window-youtube',
            iframeId: 'youtube-iframe',
            addressBarId: 'youtube-address-bar',
            btnBackId: 'youtube-btn-back',
            btnReloadId: 'youtube-btn-reload',
            btnHomeId: 'youtube-btn-home',
            homeUrl: 'https://www.youtube.com/embed/videoseries?list=PLFgquLnL59alCl_jYYB7ypEKzG_7v60TM'
        });
        this.apps.youtube.init();
        document.getElementById('youtube-btn-external')?.addEventListener('click', () => {
            window.open('https://www.youtube.com', '_blank');
        });

        // WhatsApp
        this.apps.whatsapp = new BrowserApp(windowManager, {
            windowId: 'window-whatsapp',
            iframeId: 'whatsapp-iframe',
            addressBarId: 'whatsapp-address-bar',
            btnBackId: 'whatsapp-btn-back',
            btnReloadId: 'whatsapp-btn-reload',
            homeUrl: 'https://web.whatsapp.com'
        });
        this.apps.whatsapp.init(true);
        document.getElementById('whatsapp-btn-external')?.addEventListener('click', () => {
            window.open('https://web.whatsapp.com', '_blank');
        });

        // Discord
        this.apps.discord = new BrowserApp(windowManager, {
            windowId: 'window-discord',
            iframeId: 'discord-iframe',
            addressBarId: 'discord-address-bar',
            btnBackId: 'discord-btn-back',
            btnReloadId: 'discord-btn-reload',
            homeUrl: 'https://discord.com/app'
        });
        this.apps.discord.init(true);
        document.getElementById('discord-btn-external')?.addEventListener('click', () => {
            window.open('https://discord.com/app', '_blank');
        });

        // Telegram
        this.apps.telegram = new BrowserApp(windowManager, {
            windowId: 'window-telegram',
            iframeId: 'telegram-iframe',
            addressBarId: 'telegram-address-bar',
            btnBackId: 'telegram-btn-back',
            btnReloadId: 'telegram-btn-reload',
            homeUrl: 'https://web.telegram.org'
        });
        this.apps.telegram.init(true);
        document.getElementById('telegram-btn-external')?.addEventListener('click', () => {
            window.open('https://web.telegram.org', '_blank');
        });

        // Google Search
        this.apps.google = new BrowserApp(windowManager, {
            windowId: 'window-google',
            iframeId: 'google-iframe',
            addressBarId: 'google-address-bar',
            btnGoId: 'google-btn-go',
            btnDownloadId: 'google-btn-download',
            homeUrl: 'https://www.google.com/search?igu=1'
        });
        this.apps.google.init();
    }
    initDesktopClock() {
        const clockEl = document.getElementById('top-bar-clock');
        const desktopTimeEl = document.querySelector('#desktop-clock .time');
        const desktopDateEl = document.querySelector('#desktop-clock .date');

        const updateClock = () => {
            const now = new Date();

            // Top Bar
            const time = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            if (clockEl) clockEl.textContent = time;

            // Central Desktop Clock
            if (desktopTimeEl) desktopTimeEl.textContent = time;
            if (desktopDateEl) {
                desktopDateEl.textContent = now.toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                });
            }
        };
        setInterval(updateClock, 1000);
        updateClock();
    }


    initHudMove() {
        const btn = document.getElementById('btn-move-hud');
        const clock = document.getElementById('desktop-clock');

        let isMoving = false;
        let isDragging = false;
        let offset = { x: 0, y: 0 };

        if (!clock) return;

        // Restore saved position
        const savedPos = localStorage.getItem('hud_clock_pos');
        if (savedPos) {
            const pos = JSON.parse(savedPos);
            clock.style.top = pos.top;
            clock.style.left = pos.left;
            clock.style.transform = pos.transform;
            clock.style.margin = '0'; // Ensure margin is 0 if it was moved
        }

        // Toggle Move Mode
        if (btn) {
            btn.onclick = () => {
                isMoving = !isMoving;
                if (isMoving) {
                    btn.textContent = 'Feito';
                    btn.classList.add('primary');
                    clock.style.border = '2px dashed rgba(255,255,255,0.5)';
                    clock.style.borderRadius = '8px';
                    clock.style.cursor = 'move';
                    clock.style.backgroundColor = 'rgba(0,0,0,0.2)';
                    clock.style.pointerEvents = 'auto'; // Enable interactions
                } else {
                    btn.textContent = 'Ver HUD';
                    btn.classList.remove('primary');
                    clock.style.border = 'none';
                    clock.style.cursor = 'default';
                    clock.style.backgroundColor = 'transparent';
                    clock.style.pointerEvents = 'none'; // Disable interactions

                    // Save to localStorage
                    localStorage.setItem('hud_clock_pos', JSON.stringify({
                        top: clock.style.top,
                        left: clock.style.left,
                        transform: clock.style.transform
                    }));
                }
            };
        }

        // Drag Logic
        clock.onmousedown = (e) => {
            if (!isMoving) return;
            isDragging = true;

            const rect = clock.getBoundingClientRect();
            offset = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };

            clock.style.transform = 'none';
            clock.style.margin = '0';
            clock.style.left = rect.left + 'px';
            clock.style.top = rect.top + 'px';
        };

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();

            const x = e.clientX - offset.x;
            const y = e.clientY - offset.y;

            clock.style.left = x + 'px';
            clock.style.top = y + 'px';
        });

        document.addEventListener('mouseup', () => {
            if (!isDragging) return;
            isDragging = false;
        });
    }

    // ===========================================
    // DESKTOP INTERACTIVITY (Context Menu & Selection)
    // ===========================================
    initDesktopInteractions() {
        const desktop = document.getElementById('desktop');
        const contextMenu = document.getElementById('context-menu');
        const selectionBox = document.getElementById('selection-box');

        let startX, startY;
        let isSelecting = false;

        // Load Icon Size
        const savedSize = localStorage.getItem('desktop_icon_size') || 'icons-medium';
        if (desktop) {
            desktop.classList.remove('icons-small', 'icons-medium', 'icons-large');
            desktop.classList.add(savedSize);

            // --- CONTEXT MENU ---
            desktop.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                // Hide if clicking on existing window or non-desktop elements
                if (e.target.closest('.window') || e.target.closest('.taskbar')) return;

                const x = e.clientX;
                const y = e.clientY;

                if (contextMenu) {
                    contextMenu.style.left = `${x}px`;
                    contextMenu.style.top = `${y}px`;
                    contextMenu.classList.remove('hidden');
                }
            });

            // Hide menu on click or drag
            document.addEventListener('click', () => {
                if (contextMenu) contextMenu.classList.add('hidden');
            });

            // Menu Actions
            if (contextMenu) {
                contextMenu.querySelectorAll('.context-item').forEach(item => {
                    item.addEventListener('click', (e) => {
                        const action = item.dataset.action;
                        if (!action) return;

                        if (action.startsWith('size-')) {
                            const sizeClass = 'icons-' + action.split('-')[1]; // small, medium, large
                            desktop.classList.remove('icons-small', 'icons-medium', 'icons-large');
                            desktop.classList.add(sizeClass);
                            localStorage.setItem('desktop_icon_size', sizeClass);
                        } else if (action === 'refresh') {
                            location.reload();
                        } else if (action === 'personalize') {
                            windowManager.open('settings');
                        }
                    });
                });
            }

            // --- SELECTION BOX ---
            desktop.addEventListener('mousedown', (e) => {
                // Allow selection if clicking on desktop or its direct empty space
                if (e.button !== 0) return;

                // Allow start if target is desktop OR body (background) 
                // AND NOT a window/taskbar/icon
                if (e.target.closest('.window') || e.target.closest('.taskbar') || e.target.closest('.desktop-icon') || e.target.id === 'desktop-clock') return;

                isSelecting = true;
                startX = e.clientX;
                startY = e.clientY;

                if (selectionBox) {
                    selectionBox.style.left = `${startX}px`;
                    selectionBox.style.top = `${startY}px`;
                    selectionBox.style.width = '0px';
                    selectionBox.style.height = '0px';
                    selectionBox.classList.remove('hidden');
                }
            });

            document.addEventListener('mousemove', (e) => {
                if (!isSelecting || !selectionBox) return;

                const currentX = e.clientX;
                const currentY = e.clientY;

                const width = Math.abs(currentX - startX);
                const height = Math.abs(currentY - startY);
                const left = Math.min(currentX, startX);
                const top = Math.min(currentY, startY);

                selectionBox.style.width = `${width}px`;
                selectionBox.style.height = `${height}px`;
                selectionBox.style.left = `${left}px`;
                selectionBox.style.top = `${top}px`;
            });

            document.addEventListener('mouseup', () => {
                if (isSelecting) {
                    isSelecting = false;
                    if (selectionBox) selectionBox.classList.add('hidden');
                }
            });
        }
    }

    // ===========================================
    // DESKTOP INTERACTIVITY (Context Menu & Selection)
    // ===========================================
    initDesktopInteractions() {
        const desktop = document.getElementById('desktop');
        const contextMenu = document.getElementById('context-menu');
        const selectionBox = document.getElementById('selection-box');

        let startX, startY;
        let isSelecting = false;

        // Load Icon Size
        const savedSize = localStorage.getItem('desktop_icon_size') || 'icons-medium';
        if (desktop) {
            desktop.classList.remove('icons-small', 'icons-medium', 'icons-large');
            desktop.classList.add(savedSize);

            // Mark active option in menu
            const updateMenuActiveOption = (size) => {
                contextMenu?.querySelectorAll('[data-action^="size-"]').forEach(item => {
                    if (item.dataset.action === `size-${size}`) {
                        item.classList.add('active-option');
                    } else {
                        item.classList.remove('active-option');
                    }
                });
            };
            updateMenuActiveOption(savedSize.split('-')[1]);

            // --- CONTEXT MENU ---
            let targetIcon = null;
            const protectedApps = ['terminal', 'settings', 'task-manager', 'file-explorer', 'system-info', 'google', 'ubuntu-vm'];

            // Initial hide of deleted apps
            const deletedApps = JSON.parse(localStorage.getItem('deleted_apps') || '[]');
            document.querySelectorAll('.desktop-icon').forEach(icon => {
                if (deletedApps.includes(icon.dataset.app)) {
                    icon.classList.add('hidden');
                }
            });

            desktop.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                if (e.target.closest('.window') || e.target.closest('.taskbar')) return;

                const clickedIcon = e.target.closest('.desktop-icon');
                const deleteItem = document.getElementById('ctx-delete');
                const deleteSep = document.getElementById('ctx-sep-delete');

                targetIcon = null;

                if (clickedIcon) {
                    const appId = clickedIcon.dataset.app;
                    // Se clicar num ícone, seleciona ele
                    document.querySelectorAll('.desktop-icon.selected').forEach(i => i.classList.remove('selected'));
                    clickedIcon.classList.add('selected');

                    if (!protectedApps.includes(appId)) {
                        targetIcon = clickedIcon;
                        deleteItem?.classList.remove('hidden');
                        deleteSep?.classList.remove('hidden');
                    } else {
                        deleteItem?.classList.add('hidden');
                        deleteSep?.classList.add('hidden');
                    }
                } else {
                    deleteItem?.classList.add('hidden');
                    deleteSep?.classList.add('hidden');
                }

                const x = e.clientX;
                const y = e.clientY;

                if (contextMenu) {
                    contextMenu.style.left = `${x}px`;
                    contextMenu.style.top = `${y}px`;
                    contextMenu.classList.remove('hidden');

                    // Ajustar posição se sair da tela
                    const rect = contextMenu.getBoundingClientRect();
                    if (rect.right > window.innerWidth) {
                        contextMenu.style.left = `${window.innerWidth - rect.width - 5}px`;
                    }
                    if (rect.bottom > window.innerHeight) {
                        contextMenu.style.top = `${window.innerHeight - rect.height - 5}px`;
                    }
                }
            });

            // Hide menu on click or drag
            document.addEventListener('mousedown', (e) => {
                if (contextMenu && !contextMenu.contains(e.target)) {
                    contextMenu.classList.add('hidden');
                }
            });

            // Menu Actions
            if (contextMenu) {
                contextMenu.querySelectorAll('.context-item').forEach(item => {
                    item.addEventListener('click', (e) => {
                        e.stopPropagation(); // Prevenir ocultar imediato para debug
                        const action = item.dataset.action;
                        if (!action) return;

                        if (action.startsWith('size-')) {
                            const size = action.split('-')[1];
                            const sizeClass = 'icons-' + size;
                            desktop.classList.remove('icons-small', 'icons-medium', 'icons-large');
                            desktop.classList.add(sizeClass);
                            localStorage.setItem('desktop_icon_size', sizeClass);
                            updateMenuActiveOption(size);
                        } else if (action === 'refresh') {
                            location.reload();
                        } else if (action === 'personalize') {
                            windowManager.open('settings');
                        } else if (action === 'delete-app' && targetIcon) {
                            const appId = targetIcon.dataset.app;
                            if (appId && !protectedApps.includes(appId)) {
                                targetIcon.classList.add('hidden');
                                const currentDeleted = JSON.parse(localStorage.getItem('deleted_apps') || '[]');
                                if (!currentDeleted.includes(appId)) {
                                    currentDeleted.push(appId);
                                    localStorage.setItem('deleted_apps', JSON.stringify(currentDeleted));
                                }
                            }
                        }
                        contextMenu.classList.add('hidden');
                    });
                });
            }

            // --- SELECTION BOX ---
            desktop.addEventListener('mousedown', (e) => {
                if (e.button !== 0) return;
                if (e.target.closest('.window') || e.target.closest('.taskbar') || e.target.closest('.desktop-icon') || e.target.id === 'desktop-clock' || e.target.closest('.context-menu')) return;

                // Limpa seleção anterior se clicar no desktop vazio
                document.querySelectorAll('.desktop-icon.selected').forEach(icon => {
                    icon.classList.remove('selected');
                });

                isSelecting = true;
                startX = e.clientX;
                startY = e.clientY;

                if (selectionBox) {
                    selectionBox.style.left = `${startX}px`;
                    selectionBox.style.top = `${startY}px`;
                    selectionBox.style.width = '0px';
                    selectionBox.style.height = '0px';
                    selectionBox.classList.remove('hidden');
                }
            });

            document.addEventListener('mousemove', (e) => {
                if (!isSelecting || !selectionBox) return;

                const currentX = e.clientX;
                const currentY = e.clientY;

                // Restringir à área do desktop
                const rect = desktop.getBoundingClientRect();
                const mouseX = Math.max(rect.left, Math.min(rect.right, currentX));
                const mouseY = Math.max(rect.top, Math.min(rect.bottom, currentY));

                const width = Math.abs(mouseX - startX);
                const height = Math.abs(mouseY - startY);
                const left = Math.min(mouseX, startX);
                const top = Math.min(mouseY, startY);

                selectionBox.style.width = `${width}px`;
                selectionBox.style.height = `${height}px`;
                selectionBox.style.left = `${left}px`;
                selectionBox.style.top = `${top}px`;

                // Detectar ícones dentro do quadrado de seleção
                const selectionRect = {
                    left: left,
                    top: top,
                    right: left + width,
                    bottom: top + height
                };

                document.querySelectorAll('.desktop-icon:not(.hidden)').forEach(icon => {
                    const iconRect = icon.getBoundingClientRect();

                    const isIntersecting = !(
                        iconRect.right < selectionRect.left ||
                        iconRect.left > selectionRect.right ||
                        iconRect.bottom < selectionRect.top ||
                        iconRect.top > selectionRect.bottom
                    );

                    if (isIntersecting) {
                        icon.classList.add('selected');
                    } else {
                        icon.classList.remove('selected');
                    }
                });
            });

            document.addEventListener('mouseup', () => {
                if (isSelecting) {
                    isSelecting = false;
                    if (selectionBox) selectionBox.classList.add('hidden');
                }
            });

            // Limpar seleção ao clicar em área vazia (já coberto pelo mousedown, mas garantindo)
            desktop.addEventListener('click', (e) => {
                if (e.target === desktop || e.target.id === 'wallpaper-container') {
                    // Se não foi um arraste (width/height pequenos), limpa
                    const rect = selectionBox.getBoundingClientRect();
                    if (rect.width < 5 && rect.height < 5) {
                        document.querySelectorAll('.desktop-icon.selected').forEach(icon => {
                            icon.classList.remove('selected');
                        });
                    }
                }
            });
        }
    }

    updateProfileUI() {
        const name = localStorage.getItem('pitter_user_name') || 'Jean';
        const photo = localStorage.getItem('pitter_user_photo') || 'assets/lockscreen/christmas_spider.png';

        const nameElements = [
            'top-bar-user-name',
            'start-menu-user-name',
            'lock-user-name',
            'settings-user-name'
        ];

        nameElements.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = name;
        });

        const photoElements = document.querySelectorAll('.user-profile-photo, #settings-user-photo');
        photoElements.forEach(img => {
            img.src = photo;
        });
    }

    initLauncher() {
        const launcherBtn = document.getElementById('app-launcher-btn');
        const overlay = document.getElementById('launcher-overlay');
        const grid = document.getElementById('launcher-apps-grid');
        const searchInput = document.getElementById('launcher-search-input');

        if (!launcherBtn || !overlay) return;

        launcherBtn.addEventListener('click', () => {
            overlay.classList.toggle('hidden');
            if (!overlay.classList.contains('hidden')) {
                searchInput.focus();
                this.renderLauncherApps(this.allApps);
            }
        });

        const closeBtn = document.getElementById('launcher-close-btn');
        if (closeBtn) {
            closeBtn.onclick = () => overlay.classList.add('hidden');
        }

        // Close on click outside content
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.add('hidden');
            }
        });

        // Search logic
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = this.allApps.filter(app =>
                app.name.toLowerCase().includes(query)
            );
            this.renderLauncherApps(filtered);
        });

        // Lock button logic
        const lockBtn = document.getElementById('btn-lock-manual');
        if (lockBtn) {
            lockBtn.onclick = () => {
                overlay.classList.add('hidden');
                this.lockScreen();
            };
        }
    }

    renderLauncherApps(apps) {
        const grid = document.getElementById('launcher-apps-grid');
        if (!grid) return;

        grid.innerHTML = '';
        apps.forEach(app => {
            const item = document.createElement('div');
            item.className = 'launcher-app-item';
            item.innerHTML = `
                <div class="launcher-app-icon">${app.icon}</div>
                <div class="launcher-app-name">${app.name}</div>
            `;
            item.addEventListener('click', () => {
                windowManager.open(app.id);
                document.getElementById('launcher-overlay').classList.add('hidden');
            });
            grid.appendChild(item);
        });
    }

    // --- LOCK SCREEN LOGIC ---
    lockScreen() {
        const lockScreen = document.getElementById('lock-screen');
        if (!lockScreen) return;

        lockScreen.classList.remove('hidden');
        this.updateLockTime();

        // Timer for lock screen clock
        if (this.lockClockInterval) clearInterval(this.lockClockInterval);
        this.lockClockInterval = setInterval(() => this.updateLockTime(), 1000);

        const passwordInput = document.getElementById('lock-password-input');
        if (passwordInput) {
            passwordInput.value = '';
            passwordInput.focus();
        }
    }

    updateLockTime() {
        const timeEl = document.getElementById('lock-screen-time');
        if (!timeEl) return;
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        timeEl.textContent = `${hours}:${minutes}`;
    }

    unlockScreen() {
        const passwordInput = document.getElementById('lock-password-input');
        const errorMsg = document.getElementById('lock-error-msg');
        const savedPassword = localStorage.getItem('pitter_os_password') || '';

        if (passwordInput.value === savedPassword) {
            const lockScreen = document.getElementById('lock-screen');
            lockScreen.classList.add('animate-unlock');

            setTimeout(() => {
                lockScreen.classList.add('hidden');
                lockScreen.classList.remove('animate-unlock');
                if (this.lockClockInterval) clearInterval(this.lockClockInterval);
            }, 600); // Matches animation duration

            passwordInput.value = '';
            errorMsg.classList.add('hidden');
        } else {
            errorMsg.classList.remove('hidden');
            passwordInput.value = '';
            passwordInput.focus();
        }
    }

    initLockScreenHandlers() {
        const btnUnlock = document.getElementById('btn-unlock');
        const passwordInput = document.getElementById('lock-password-input');

        if (btnUnlock) {
            btnUnlock.onclick = () => this.unlockScreen();
        }

        if (passwordInput) {
            passwordInput.onkeypress = (e) => {
                if (e.key === 'Enter') this.unlockScreen();
            };
        }

        // Initial check on boot - Removed to avoid locking on refresh as per user request
        /*
        const hasPassword = localStorage.getItem('pitter_os_password');
        if (hasPassword && hasPassword.length > 0) {
            this.lockScreen();
        }
        */

        // --- Custom Shortcut: L + S to Lock ---
        const pressedKeys = new Set();
        document.addEventListener('keydown', (e) => {
            pressedKeys.add(e.key.toLowerCase());
            if (pressedKeys.has('l') && pressedKeys.has('s')) {
                // Prevent typing "ls" if happening in an input, strictly speaking user asked for this
                // but usually we might want to be careful. User did not specify exceptions.
                this.lockScreen();
                pressedKeys.clear(); // Reset to prevent multiple triggers
            }
        });

        document.addEventListener('keyup', (e) => {
            pressedKeys.delete(e.key.toLowerCase());
        });
    }
}

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    const os = new OperatingSystem();
    os.init();

    // Torna global para debug se necessário
    window.os = os;
});
