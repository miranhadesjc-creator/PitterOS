export class ClockManager {
    constructor() {
        // Top bar clock
        this.topBarClockEl = document.getElementById('top-bar-clock');

        // Desktop HUD clock
        this.hudClockEl = document.getElementById('desktop-clock');
        this.hudTimeEl = document.querySelector('#desktop-clock .time');
        this.hudDateEl = document.querySelector('#desktop-clock .date');
        
        // HUD move functionality
        this.btnMoveHud = document.getElementById('btn-move-hud');
        this.isMovingHud = false;
        this.isDraggingHud = false;
        this.hudOffset = { x: 0, y: 0 };
    }

    init() {
        this.initDesktopClock();
        this.initHudMove();
    }

    initDesktopClock() {
        const update = () => {
            const now = new Date();
            const time = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

            if (this.topBarClockEl) this.topBarClockEl.textContent = time;
            if (this.hudTimeEl) this.hudTimeEl.textContent = time;
            if (this.hudDateEl) {
                this.hudDateEl.textContent = now.toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                });
            }
        };
        setInterval(update, 1000);
        update();
    }

    initHudMove() {
        if (!this.hudClockEl || !this.btnMoveHud) return;

        this.restoreHudPosition();

        this.btnMoveHud.onclick = () => this.toggleMoveMode();

        this.hudClockEl.onmousedown = (e) => this.startDrag(e);
        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('mouseup', () => this.stopDrag());
    }

    restoreHudPosition() {
        const savedPos = localStorage.getItem('hud_clock_pos');
        if (savedPos) {
            const pos = JSON.parse(savedPos);
            this.hudClockEl.style.top = pos.top;
            this.hudClockEl.style.left = pos.left;
            this.hudClockEl.style.transform = pos.transform;
            this.hudClockEl.style.margin = '0';
        }
    }

    toggleMoveMode() {
        this.isMovingHud = !this.isMovingHud;
        this.hudClockEl.classList.toggle('moving', this.isMovingHud);
        this.btnMoveHud.classList.toggle('primary', this.isMovingHud);

        if (this.isMovingHud) {
            this.btnMoveHud.textContent = 'Feito';
            this.hudClockEl.style.pointerEvents = 'auto';
        } else {
            this.btnMoveHud.textContent = 'Ver HUD';
            this.hudClockEl.style.pointerEvents = 'none';
            this.saveHudPosition();
        }
    }

    saveHudPosition() {
        localStorage.setItem('hud_clock_pos', JSON.stringify({
            top: this.hudClockEl.style.top,
            left: this.hudClockEl.style.left,
            transform: this.hudClockEl.style.transform
        }));
    }

    startDrag(e) {
        if (!this.isMovingHud) return;
        this.isDraggingHud = true;

        const rect = this.hudClockEl.getBoundingClientRect();
        this.hudOffset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };

        this.hudClockEl.style.transform = 'none';
        this.hudClockEl.style.margin = '0';
        this.hudClockEl.style.left = rect.left + 'px';
        this.hudClockEl.style.top = rect.top + 'px';
    }

    drag(e) {
        if (!this.isDraggingHud) return;
        e.preventDefault();
        const x = e.clientX - this.hudOffset.x;
        const y = e.clientY - this.hudOffset.y;
        this.hudClockEl.style.left = x + 'px';
        this.hudClockEl.style.top = y + 'px';
    }

    stopDrag() {
        if (!this.isDraggingHud) return;
        this.isDraggingHud = false;
    }
}
