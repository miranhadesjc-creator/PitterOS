import { windowManager } from './window-manager.js';

export class DesktopManager {
    constructor() {
        this.desktop = document.getElementById('desktop');
        this.contextMenu = document.getElementById('context-menu');
        this.selectionBox = document.getElementById('selection-box');
        this.targetIcon = null;
        this.isSelecting = false;
        this.startX = 0;
        this.startY = 0;
    }

    init() {
        if (!this.desktop) return;

        this.loadIconSize();
        this.initContextMenu();
        this.initSelectionBox();
        this.initIconSelectionCleanup();
        this.restoreDeletedIcons();
    }

    loadIconSize() {
        const savedSize = localStorage.getItem('desktop_icon_size') || 'icons-medium';
        this.desktop.classList.remove('icons-small', 'icons-medium', 'icons-large');
        this.desktop.classList.add(savedSize);
        this.updateMenuActiveOption(savedSize.split('-')[1]);
    }

    updateMenuActiveOption(size) {
        this.contextMenu?.querySelectorAll('[data-action^="size-"]').forEach(item => {
            item.classList.toggle('active-option', item.dataset.action === `size-${size}`);
        });
    }

    restoreDeletedIcons() {
        const deletedApps = JSON.parse(localStorage.getItem('deleted_apps') || '[]');
        document.querySelectorAll('.desktop-icon').forEach(icon => {
            if (deletedApps.includes(icon.dataset.app)) {
                icon.classList.add('hidden');
            }
        });
    }

    initContextMenu() {
        const protectedApps = ['terminal', 'settings', 'task-manager', 'file-explorer', 'system-info', 'google', 'ubuntu-vm'];

        this.desktop.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (e.target.closest('.window') || e.target.closest('.taskbar')) return;

            const clickedIcon = e.target.closest('.desktop-icon');
            const deleteItem = document.getElementById('ctx-delete');
            const deleteSep = document.getElementById('ctx-sep-delete');
            this.targetIcon = null;

            if (clickedIcon) {
                document.querySelectorAll('.desktop-icon.selected').forEach(i => i.classList.remove('selected'));
                clickedIcon.classList.add('selected');
                const appId = clickedIcon.dataset.app;
                const isProtected = protectedApps.includes(appId);
                
                deleteItem?.classList.toggle('hidden', isProtected);
                deleteSep?.classList.toggle('hidden', isProtected);

                if (!isProtected) {
                    this.targetIcon = clickedIcon;
                }
            } else {
                deleteItem?.classList.add('hidden');
                deleteSep?.classList.add('hidden');
            }

            this.showContextMenu(e.clientX, e.clientY);
        });

        // Hide menu on click or drag
        document.addEventListener('mousedown', (e) => {
            if (this.contextMenu && !this.contextMenu.contains(e.target)) {
                this.contextMenu.classList.add('hidden');
            }
        });

        // Menu Actions
        this.contextMenu?.querySelectorAll('.context-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleMenuAction(item.dataset.action);
                this.contextMenu.classList.add('hidden');
            });
        });
    }

    showContextMenu(x, y) {
        if (!this.contextMenu) return;
        this.contextMenu.style.left = `${x}px`;
        this.contextMenu.style.top = `${y}px`;
        this.contextMenu.classList.remove('hidden');

        const rect = this.contextMenu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            this.contextMenu.style.left = `${window.innerWidth - rect.width - 5}px`;
        }
        if (rect.bottom > window.innerHeight) {
            this.contextMenu.style.top = `${window.innerHeight - rect.height - 5}px`;
        }
    }

    handleMenuAction(action) {
        if (!action) return;

        if (action.startsWith('size-')) {
            const size = action.split('-')[1];
            const sizeClass = 'icons-' + size;
            this.desktop.classList.remove('icons-small', 'icons-medium', 'icons-large');
            this.desktop.classList.add(sizeClass);
            localStorage.setItem('desktop_icon_size', sizeClass);
            this.updateMenuActiveOption(size);
        } else if (action === 'refresh') {
            location.reload();
        } else if (action === 'personalize') {
            windowManager.open('settings');
        } else if (action === 'delete-app' && this.targetIcon) {
            const appId = this.targetIcon.dataset.app;
            this.targetIcon.classList.add('hidden');
            const deletedApps = JSON.parse(localStorage.getItem('deleted_apps') || '[]');
            if (!deletedApps.includes(appId)) {
                deletedApps.push(appId);
                localStorage.setItem('deleted_apps', JSON.stringify(deletedApps));
            }
        }
    }

    initSelectionBox() {
        this.desktop.addEventListener('mousedown', (e) => {
            if (e.button !== 0 || e.target.closest('.window, .taskbar, .desktop-icon, #desktop-clock, .context-menu')) {
                return;
            }

            document.querySelectorAll('.desktop-icon.selected').forEach(icon => icon.classList.remove('selected'));

            this.isSelecting = true;
            this.startX = e.clientX;
            this.startY = e.clientY;

            this.selectionBox.style.left = `${this.startX}px`;
            this.selectionBox.style.top = `${this.startY}px`;
            this.selectionBox.style.width = '0px';
            this.selectionBox.style.height = '0px';
            this.selectionBox.classList.remove('hidden');
        });

        document.addEventListener('mousemove', (e) => {
            if (!this.isSelecting) return;

            const rect = this.desktop.getBoundingClientRect();
            const mouseX = Math.max(rect.left, Math.min(rect.right, e.clientX));
            const mouseY = Math.max(rect.top, Math.min(rect.bottom, e.clientY));

            const width = Math.abs(mouseX - this.startX);
            const height = Math.abs(mouseY - this.startY);
            const left = Math.min(mouseX, this.startX);
            const top = Math.min(mouseY, this.startY);

            this.selectionBox.style.width = `${width}px`;
            this.selectionBox.style.height = `${height}px`;
            this.selectionBox.style.left = `${left}px`;
            this.selectionBox.style.top = `${top}px`;

            this.updateSelection(left, top, width, height);
        });

        document.addEventListener('mouseup', () => {
            if (this.isSelecting) {
                this.isSelecting = false;
                this.selectionBox.classList.add('hidden');
            }
        });
    }

    updateSelection(left, top, width, height) {
        const selectionRect = { left, top, right: left + width, bottom: top + height };
        document.querySelectorAll('.desktop-icon:not(.hidden)').forEach(icon => {
            const iconRect = icon.getBoundingClientRect();
            const isIntersecting = !(
                iconRect.right < selectionRect.left ||
                iconRect.left > selectionRect.right ||
                iconRect.bottom < selectionRect.top ||
                iconRect.top > selectionRect.bottom
            );
            icon.classList.toggle('selected', isIntersecting);
        });
    }

    initIconSelectionCleanup() {
        this.desktop.addEventListener('click', (e) => {
            if (e.target === this.desktop || e.target.id === 'wallpaper-container') {
                const rect = this.selectionBox.getBoundingClientRect();
                if (rect.width < 5 && rect.height < 5) {
                    document.querySelectorAll('.desktop-icon.selected').forEach(icon => {
                        icon.classList.remove('selected');
                    });
                }
            }
        });
    }
}
