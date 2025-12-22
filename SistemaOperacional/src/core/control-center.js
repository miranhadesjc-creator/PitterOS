export class ControlCenter {
    constructor() {
        this.element = null;
        this.isVisible = false;
        this.state = {
            wifi: true,
            bluetooth: true,
            airplane: false,
            saver: false,
            brightness: 100,
            volume: 75
        };
    }

    init() {
        this.element = document.getElementById('control-center');
        this.setupListeners();
        this.render();
    }

    setupListeners() {
        // Toggle via System Tray (wifi/volume icons)
        const systemTray = document.querySelector('.system-tray');
        if (systemTray) {
            systemTray.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggle();
            });
        }

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isVisible && !this.element.contains(e.target) && !systemTray.contains(e.target)) {
                this.hide();
            }
        });

        // Delegate clicks inside control center
        this.element?.addEventListener('click', (e) => {
            const btn = e.target.closest('.cc-btn');
            if (btn) {
                const action = btn.dataset.action;
                this.toggleAction(action);
            }
        });

        // Sliders
        const sliders = this.element?.querySelectorAll('input[type="range"]');
        sliders?.forEach(slider => {
            slider.addEventListener('input', (e) => {
                const type = e.target.dataset.type;
                this.state[type] = e.target.value;
                // Update CSS variable or visual feedback
                if (type === 'brightness') {
                    document.body.style.filter = `brightness(${this.state.brightness}%)`;
                }
            });
        });
    }

    toggle() {
        this.isVisible = !this.isVisible;
        if (this.isVisible) {
            this.element.classList.remove('hidden');
            this.element.classList.add('visible');
        } else {
            this.hide();
        }
    }

    hide() {
        this.isVisible = false;
        this.element.classList.remove('visible');
        this.element.classList.add('hidden');
    }

    toggleAction(action) {
        if (this.state.hasOwnProperty(action)) {
            this.state[action] = !this.state[action];

            // Se ativar modo avião, desliga WiFi e Bluetooth
            if (action === 'airplane' && this.state.airplane) {
                this.state.wifi = false;
                this.state.bluetooth = false;
                // Dispara evento global para notificar outros módulos
                window.dispatchEvent(new CustomEvent('airplaneMode', { detail: { enabled: true } }));
            }

            // Se desativar modo avião, religa WiFi
            if (action === 'airplane' && !this.state.airplane) {
                this.state.wifi = true;
                window.dispatchEvent(new CustomEvent('airplaneMode', { detail: { enabled: false } }));
            }

            // Se tentar ligar WiFi com modo avião ativo, desativa modo avião
            if (action === 'wifi' && this.state.wifi && this.state.airplane) {
                this.state.airplane = false;
                window.dispatchEvent(new CustomEvent('airplaneMode', { detail: { enabled: false } }));
            }

            this.render();
        }
    }

    render() {
        // Update button states
        const buttons = this.element.querySelectorAll('.cc-btn');
        buttons.forEach(btn => {
            const action = btn.dataset.action;
            if (this.state[action]) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
}
