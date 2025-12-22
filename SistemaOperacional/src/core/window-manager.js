// ============================================
// SISTEMA OPERACIONAL - GERENCIADOR DE JANELAS
// ============================================

export class WindowManager {
    constructor() {
        this.windows = new Map();
        this.activeWindow = null;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.zIndex = 1000;

        // Estado de redimensionamento
        this.isResizing = false;
        this.resizeDir = null;
        this.initialResize = { x: 0, y: 0, width: 0, height: 0, top: 0, left: 0 };
        this.onUpdate = null; // Callback para sincronização

        this.initDragListeners();
    }

    notifyUpdate() {
        if (typeof this.onUpdate === 'function') {
            this.onUpdate(this.activeWindow);
        }
    }

    /**
     * Registra uma janela no gerenciador
     */
    register(windowId, windowElement) {
        const header = windowElement.querySelector('.window-header');
        const closeBtn = windowElement.querySelector('.win-btn.close');
        const minimizeBtn = windowElement.querySelector('.win-btn.minimize');
        const maximizeBtn = windowElement.querySelector('.win-btn.maximize');

        this.windows.set(windowId, {
            element: windowElement,
            isMaximized: false,
            originalStyles: {}
        });

        // Injetar alças de redimensionamento
        this.addResizeHandles(windowElement);

        // Arrastar janela
        header?.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('win-btn')) return;
            this.startDrag(windowId, e);
        });

        // Focar janela ao clicar
        windowElement.addEventListener('mousedown', () => this.focus(windowId));

        // Botões da janela
        closeBtn?.addEventListener('click', () => this.close(windowId));
        minimizeBtn?.addEventListener('click', () => this.minimize(windowId));
        maximizeBtn?.addEventListener('click', () => this.toggleMaximize(windowId));
    }

    addResizeHandles(windowElement) {
        const directions = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
        directions.forEach(dir => {
            const handle = document.createElement('div');
            handle.className = `resize-handle ${dir}`;
            handle.addEventListener('mousedown', (e) => this.startResize(e, dir, windowElement));
            windowElement.appendChild(handle);
        });
    }

    startResize(e, dir, windowElement) {
        e.preventDefault();
        e.stopPropagation();

        this.isResizing = true;
        this.resizeDir = dir;
        this.activeWindow = this.getWindowIdFromElement(windowElement);
        this.focus(this.activeWindow);

        const rect = windowElement.getBoundingClientRect();
        this.initialResize = {
            startX: e.clientX,
            startY: e.clientY,
            width: rect.width,
            height: rect.height,
            top: rect.top,
            left: rect.left
        };
    }

    getWindowIdFromElement(element) {
        for (const [id, win] of this.windows.entries()) {
            if (win.element === element) return id;
        }
        return null;
    }

    /**
     * Inicia arraste de janela
     */
    startDrag(windowId, e) {
        const win = this.windows.get(windowId);
        if (!win || win.isMaximized) return;

        this.isDragging = true;
        this.activeWindow = windowId;
        this.lastDragX = e.clientX; // Track X for velocity
        this.dragOffset = {
            x: e.clientX - win.element.offsetLeft,
            y: e.clientY - win.element.offsetTop
        };

        // Remove transition specifically for transform/movement during drag to avoid lag
        win.element.style.transition = 'none';

        this.focus(windowId);
    }

    /**
     * Inicializa listeners globais de arraste e resize
     */
    initDragListeners() {
        document.addEventListener('mousemove', (e) => {
            if (this.isResizing) {
                this.handleResize(e);
                return;
            }

            if (!this.isDragging || !this.activeWindow) return;
            const win = this.windows.get(this.activeWindow);
            if (!win) return;

            const currentX = e.clientX;
            const deltaX = currentX - this.lastDragX;
            this.lastDragX = currentX;

            // Apply Jelly Effect (Skew based on velocity)
            const maxSkew = 15;
            // Velocity factor: higher value = more wobble
            let skew = deltaX * -0.8;
            // Clamp skew
            skew = Math.max(Math.min(skew, maxSkew), -maxSkew);

            win.element.style.left = (e.clientX - this.dragOffset.x) + 'px';
            win.element.style.top = (e.clientY - this.dragOffset.y) + 'px';
            win.element.style.transform = `skewX(${skew}deg)`;

            this.notifyUpdate();
        });

        document.addEventListener('mouseup', () => {
            if (this.isDragging && this.activeWindow) {
                const win = this.windows.get(this.activeWindow);
                if (win) {
                    // Snap back effect
                    win.element.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.2s'; // Elastic bounce
                    win.element.style.transform = 'skewX(0deg)';

                    // Restore original transition after bounce
                    setTimeout(() => {
                        win.element.style.transition = '';
                    }, 500);
                }
            }
            this.isDragging = false;
            this.isResizing = false;
            document.body.style.cursor = 'default';
        });
    }

    handleResize(e) {
        const win = this.windows.get(this.activeWindow);
        if (!win || win.isMaximized) return;

        const deltaX = e.clientX - this.initialResize.startX;
        const deltaY = e.clientY - this.initialResize.startY;

        const style = win.element.style;
        const init = this.initialResize;
        const minW = 300;
        const minH = 200;

        if (this.resizeDir.includes('e')) {
            const newW = Math.max(init.width + deltaX, minW);
            style.width = newW + 'px';
        }
        if (this.resizeDir.includes('s')) {
            const newH = Math.max(init.height + deltaY, minH);
            style.height = newH + 'px';
        }
        if (this.resizeDir.includes('w')) {
            const newW = Math.max(init.width - deltaX, minW);
            style.width = newW + 'px';
            // Só move se realmente mudou a largura (não atingiu min-width)
            if (newW > minW) style.left = (init.left + deltaX) + 'px';
        }
        if (this.resizeDir.includes('n')) {
            const newH = Math.max(init.height - deltaY, minH);
            style.height = newH + 'px';
            if (newH > minH) style.top = (init.top + deltaY) + 'px';
        }
        this.notifyUpdate();
    }

    /**
     * Foca uma janela
     */
    focus(windowId) {
        const win = this.windows.get(windowId);
        if (!win) return;

        this.windows.forEach((w, id) => {
            w.element.classList.remove('active');
            // Mantém no nível base para janelas (acima da taskbar que está em 99)
            w.element.style.zIndex = Math.max(100, parseInt(w.element.style.zIndex || 100));
        });

        win.element.classList.remove('hidden');
        win.element.classList.add('active');
        this.zIndex++;
        win.element.style.zIndex = this.zIndex;
        this.activeWindow = windowId;
        this.notifyUpdate();

        // Notificar taskbar
        if (typeof window.updateTaskbar === 'function') {
            window.updateTaskbar();
        }
    }

    /**
     * Abre uma janela
     */
    open(windowId) {
        this.focus(windowId);
    }

    /**
     * Fecha uma janela
     */
    close(windowId) {
        const win = this.windows.get(windowId);
        if (!win) return;

        win.element.classList.add('closing');
        setTimeout(() => {
            win.element.classList.remove('closing');
            win.element.classList.add('hidden');
            if (typeof window.updateTaskbar === 'function') {
                window.updateTaskbar();
            }
        }, 200); // Sincronizado com CSS (0.2s)
    }

    /**
     * Minimiza uma janela
     */
    minimize(windowId) {
        this.close(windowId);
    }

    /**
     * Alterna maximização
     */
    toggleMaximize(windowId) {
        const win = this.windows.get(windowId);
        if (!win) return;

        if (win.isMaximized) {
            // Restaurar
            Object.assign(win.element.style, win.originalStyles);
            win.isMaximized = false;
        } else {
            // Maximizar
            win.originalStyles = {
                width: win.element.style.width,
                height: win.element.style.height,
                top: win.element.style.top,
                left: win.element.style.left,
                borderRadius: win.element.style.borderRadius
            };
            win.element.style.width = '100%';
            win.element.style.height = 'calc(100vh - 48px)';
            win.element.style.top = '0';
            win.element.style.left = '0';
            win.element.style.borderRadius = '0';
            win.isMaximized = true;
        }
        this.notifyUpdate();
    }

    /**
     * Verifica se uma janela está visível
     */
    isVisible(windowId) {
        const win = this.windows.get(windowId);
        return win && !win.element.classList.contains('hidden');
    }

    /**
     * Verifica se uma janela está ativa
     */
    isActive(windowId) {
        const win = this.windows.get(windowId);
        return win && win.element.classList.contains('active');
    }
}

// Exporta instância global
export const windowManager = new WindowManager();
