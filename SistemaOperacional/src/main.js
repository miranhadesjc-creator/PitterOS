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
            { id: 'chrome', name: 'Google', icon: '<img src="https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png" style="width: 48px; height: 48px; object-fit: contain;">' },
            { id: 'game-hub', name: 'Game Hub', icon: '<img src="assets/game_hub_icon.png" style="width: 48px; height: 48px; object-fit: contain;">' },
            { id: 'pughall', name: 'Pug Hall', icon: '<img src="assets/pughall_icon.png" style="width: 48px; height: 48px; object-fit: contain; border-radius: 8px;">' }
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
        this.initWindowOptions();

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
            'chrome',
            'game-hub',
            'pughall'
        ];

        windows.forEach(id => {
            const el = document.getElementById(`window-${id}`);
            if (el) {
                // Mover para o body para garantir que fiquem acima de qualquer contexto de empilhamento (como .desktop)
                document.body.appendChild(el);
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

        // Google Chrome
        this.apps.chrome = new BrowserApp(windowManager, {
            windowId: 'window-chrome',
            iframeId: 'chrome-iframe',
            addressBarId: 'chrome-address-bar',
            btnGoId: 'chrome-btn-go',
            btnBackId: 'chrome-btn-back',
            btnForwardId: 'chrome-btn-forward',
            btnReloadId: 'chrome-btn-reload',
            btnHomeId: 'chrome-btn-home',
            btnDownloadId: 'chrome-btn-download',
            homeUrl: 'https://www.google.com/search?igu=1'
        });
        this.apps.chrome.init();

        // Game Hub Shortcut (Dedicated Window)
        const gdsIcon = document.querySelector('.desktop-icon[data-app="game-hub"]');
        if (gdsIcon) {
            gdsIcon.addEventListener('dblclick', () => {
                windowManager.open('game-hub');
            });
        }

        // Pug Hall Shortcut
        const pugIcon = document.querySelector('.desktop-icon[data-app="pughall"]');
        if (pugIcon) {
            pugIcon.addEventListener('dblclick', () => {
                windowManager.open('pughall');
            });
        }
        // Monitor de Downloads do Electron via API segura
        if (window.api && typeof window.api.on === 'function') {
            // Quando o download começa
            window.api.on('download-started', (data) => {
                // 1. Abre a janela do Explorador
                windowManager.open('file-explorer');

                // 2. Converte o caminho do Windows para o formato que o WSL entende
                const toWsl = (winPath) => {
                    if (!winPath) return '/';
                    return winPath.replace(/^[a-zA-Z]:/, (match) => `/mnt/${match[0].toLowerCase()}`).replace(/\\/g, '/');
                };

                const wslPath = toWsl(data.path);

                // 3. Navega o explorador para a pasta de Downloads
                if (this.apps.fileExplorer) {
                    this.apps.fileExplorer.navigate(wslPath);
                }
            });

            window.api.on('download-completed', (fileName) => {
                // Notificação simples no sistema
                alert(`📂 Download Concluído: ${fileName}\n\nO arquivo já está disponível na sua pasta de Downloads.`);
                // Atualiza o explorador se necessário
                window.dispatchEvent(new CustomEvent('pitter-download-added'));
            });
        }
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

    initWindowOptions() {
        document.querySelectorAll('.win-btn.options').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const windowEl = btn.closest('.window');
                let popup = windowEl.querySelector('.zoom-popup');

                if (popup) {
                    popup.remove();
                    return;
                }

                // Close other popups
                document.querySelectorAll('.zoom-popup').forEach(p => p.remove());

                // Create popup
                popup = document.createElement('div');
                popup.className = 'zoom-popup';
                popup.innerHTML = `
                    <button class="zoom-out" title="Diminuir">-</button>
                    <span class="zoom-level">100%</span>
                    <button class="zoom-in" title="Aumentar">+</button>
                `;

                // Append to controls container for relative positioning context
                const controls = windowEl.querySelector('.window-controls');
                if (controls) {
                    controls.style.position = 'relative'; // Ensure relative context
                    controls.appendChild(popup);
                }

                // Logic
                let currentZoom = parseFloat(windowEl.dataset.zoom) || 1;

                const updateZoomUI = (val) => {
                    popup.querySelector('.zoom-level').textContent = Math.round(val * 100) + '%';
                };

                // Initial Text
                updateZoomUI(currentZoom);

                const apply = (val) => {
                    val = Math.max(0.2, Math.min(val, 5.0)); // Limit
                    // Round to 1 decimal to avoid float issues
                    val = Math.round(val * 10) / 10;

                    windowEl.dataset.zoom = val;
                    updateZoomUI(val);
                    this.applyZoom(windowEl, val);
                    currentZoom = val;
                };

                popup.querySelector('.zoom-out').onclick = (ev) => {
                    ev.stopPropagation();
                    apply(currentZoom - 0.1);
                };

                popup.querySelector('.zoom-in').onclick = (ev) => {
                    ev.stopPropagation();
                    apply(currentZoom + 0.1);
                };

                // Close on click outside
                const closeHandler = () => {
                    popup.remove();
                    document.removeEventListener('click', closeHandler);
                };
                setTimeout(() => document.addEventListener('click', closeHandler), 0);
                popup.addEventListener('click', (ev) => ev.stopPropagation());
            });
        });
    }

    applyZoom(windowEl, zoom) {
        // Try to find specific content to zoom
        const webview = windowEl.querySelector('webview');
        const iframe = windowEl.querySelector('iframe');
        const content = windowEl.querySelector('.window-content');

        if (webview && webview.executeJavaScript) {
            // Webview (Electron)
            webview.executeJavaScript(`document.body.style.zoom = '${zoom}'`);
            return;
        }

        if (iframe) {
            // Iframe
            try {
                // Try direct access (Same Origin)
                iframe.contentWindow.document.body.style.zoom = zoom;
            } catch (e) {
                // Cross Origin - Zoom the iframe element specifically
                iframe.style.zoom = zoom;

                // Counter-scale width/height to keep it filling the window?
                if (zoom < 1) {
                    iframe.style.width = (100 / zoom) + '%';
                    iframe.style.height = (100 / zoom) + '%';
                } else {
                    iframe.style.width = '100%';
                    iframe.style.height = '100%';
                }
            }
            return;
        }

        // Standard App Content
        if (content) {
            content.style.zoom = zoom;
        }
    }

    // ===========================================
    // DESKTOP INTERACTIVITY (Context Menu & Selection & Drag)
    // ===========================================
    initDesktopInteractions() {
        const desktop = document.getElementById('desktop');
        const contextMenu = document.getElementById('context-menu');
        const selectionBox = document.getElementById('selection-box');

        // Selection Box State
        let startX, startY;
        let isSelecting = false;

        // Icon Dragging State
        let isDraggingIcon = false;
        let draggedIcon = null;
        let iconOffset = { x: 0, y: 0 };

        // Restore Icon Positions
        const savedPositions = JSON.parse(localStorage.getItem('icon_positions') || '{}');
        Object.keys(savedPositions).forEach(appId => {
            const icon = document.querySelector(`.desktop-icon[data-app="${appId}"]`);
            if (icon) {
                icon.style.position = 'absolute';
                icon.style.left = savedPositions[appId].left;
                icon.style.top = savedPositions[appId].top;
            }
        });

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

            // --- SELECTION BOX & DRAG ---
            desktop.addEventListener('mousedown', (e) => {
                if (e.button !== 0) return;

                // Prevent interfering with other interactions
                if (e.target.closest('.window') || e.target.closest('.taskbar') || e.target.id === 'desktop-clock' || e.target.closest('.context-menu')) return;

                const clickedIcon = e.target.closest('.desktop-icon');

                // ICON DRAGGING LOGIC
                if (clickedIcon) {
                    isDraggingIcon = true;
                    draggedIcon = clickedIcon;

                    // Deselect others unless ctrl is held (simpler behavior: just select this one)
                    document.querySelectorAll('.desktop-icon.selected').forEach(icon => {
                        if (icon !== draggedIcon) icon.classList.remove('selected');
                    });
                    draggedIcon.classList.add('selected');

                    const rect = draggedIcon.getBoundingClientRect();
                    const desktopRect = desktop.getBoundingClientRect();

                    // Calculate offset relative to the icon's top-left corner
                    iconOffset = {
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top
                    };

                    // Switch to absolute positioning if not already
                    // This allows free movement. 
                    // Note: This removes it from the flex flow, so subsequent icons will shift.
                    if (getComputedStyle(draggedIcon).position !== 'absolute') {
                        draggedIcon.style.position = 'absolute';
                        draggedIcon.style.left = (rect.left - desktopRect.left) + 'px';
                        draggedIcon.style.top = (rect.top - desktopRect.top) + 'px';
                    }

                    draggedIcon.style.zIndex = '100'; // Bring to front while dragging
                    return; // Stop here, don't start selection box
                }

                // SELECTION BOX LOGIC (only if not clicking an icon)
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
                // ICON DRAGGING
                if (isDraggingIcon && draggedIcon) {
                    e.preventDefault();
                    const desktopRect = desktop.getBoundingClientRect();

                    let newLeft = e.clientX - desktopRect.left - iconOffset.x;
                    let newTop = e.clientY - desktopRect.top - iconOffset.y;

                    // Basic bounds checking (optional)
                    // newLeft = Math.max(0, Math.min(newLeft, desktopRect.width - draggedIcon.offsetWidth));
                    // newTop = Math.max(0, Math.min(newTop, desktopRect.height - draggedIcon.offsetHeight));

                    draggedIcon.style.left = newLeft + 'px';
                    draggedIcon.style.top = newTop + 'px';
                    return;
                }

                // SELECTION BOX
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
                if (isDraggingIcon) {
                    isDraggingIcon = false;
                    if (draggedIcon) {
                        draggedIcon.style.zIndex = ''; // Reset z-index

                        // SNAP TO GRID LOGIC
                        const getGridSize = () => {
                            if (desktop.classList.contains('icons-small')) return { w: 80, h: 80 };
                            if (desktop.classList.contains('icons-large')) return { w: 110, h: 120 };
                            return { w: 90, h: 100 }; // Medium
                        };

                        const grid = getGridSize();
                        const padding = 10; // Desktop padding

                        // Get raw position
                        let rawLeft = parseFloat(draggedIcon.style.left);
                        let rawTop = parseFloat(draggedIcon.style.top);

                        // Calculate nearest grid slot
                        let col = Math.round((rawLeft - padding) / grid.w);
                        let row = Math.round((rawTop - padding) / grid.h);

                        // Ensure non-negative
                        if (col < 0) col = 0;
                        if (row < 0) row = 0;

                        // Calculate snapped px
                        let snappedLeft = (col * grid.w) + padding;
                        let snappedTop = (row * grid.h) + padding;

                        // Collision Check (Simple: Don't snap ON TOP of another, find next spot if taken)
                        // Getting all OTHER positioned icons
                        const otherIcons = Array.from(document.querySelectorAll('.desktop-icon:not(.hidden)')).filter(i => i !== draggedIcon && i.style.position === 'absolute');

                        const isOccupied = (x, y) => {
                            return otherIcons.some(icon => {
                                const l = parseFloat(icon.style.left);
                                const t = parseFloat(icon.style.top);
                                // Allow small margin of error or exact match
                                return Math.abs(l - x) < 5 && Math.abs(t - y) < 5;
                            });
                        };

                        // If occupied, move to next free spot in the row, then next row
                        // Limit attempts to avoid infinite loop
                        let attempts = 0;
                        while (isOccupied(snappedLeft, snappedTop) && attempts < 100) {
                            snappedLeft += grid.w;
                            // Wrap if too wide?
                            if (snappedLeft + grid.w > desktop.clientWidth) { // Check if next spot would exceed desktop width
                                snappedLeft = padding;
                                snappedTop += grid.h;
                            }
                            attempts++;
                        }

                        // Apply final valid position
                        draggedIcon.style.left = snappedLeft + 'px';
                        draggedIcon.style.top = snappedTop + 'px';

                        // SAVE POSITION LOGIC
                        const appId = draggedIcon.dataset.app;
                        if (appId) {
                            const savedPositions = JSON.parse(localStorage.getItem('icon_positions') || '{}');
                            savedPositions[appId] = {
                                left: draggedIcon.style.left,
                                top: draggedIcon.style.top
                            };
                            localStorage.setItem('icon_positions', JSON.stringify(savedPositions));
                        }

                        draggedIcon = null;
                    }
                }

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
