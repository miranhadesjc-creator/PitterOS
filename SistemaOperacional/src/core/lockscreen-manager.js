export class LockscreenManager {
    constructor() {
        this.lockScreenEl = document.getElementById('lock-screen');
        this.passwordInput = document.getElementById('lock-password-input');
        this.errorMsg = document.getElementById('lock-error-msg');
        this.timeEl = document.getElementById('lock-screen-time');
        this.lockClockInterval = null;
    }

    init() {
        const btnUnlock = document.getElementById('btn-unlock');
        if (btnUnlock) {
            btnUnlock.onclick = () => this.unlock();
        }

        if (this.passwordInput) {
            this.passwordInput.onkeypress = (e) => {
                if (e.key === 'Enter') this.unlock();
            };
        }

        // --- Custom Shortcut: L + S to Lock ---
        const pressedKeys = new Set();
        document.addEventListener('keydown', (e) => {
            // Ignore if typing in an input field
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            pressedKeys.add(e.key.toLowerCase());
            if (pressedKeys.has('l') && pressedKeys.has('s')) {
                this.lock();
                pressedKeys.clear();
            }
        });

        document.addEventListener('keyup', (e) => {
            pressedKeys.delete(e.key.toLowerCase());
        });
    }

    lock() {
        if (!this.lockScreenEl) return;

        this.lockScreenEl.classList.remove('hidden');
        this.updateLockTime();

        if (this.lockClockInterval) clearInterval(this.lockClockInterval);
        this.lockClockInterval = setInterval(() => this.updateLockTime(), 1000);

        if (this.passwordInput) {
            this.passwordInput.value = '';
            this.passwordInput.focus();
        }
    }

    unlock() {
        if (!this.passwordInput || !this.lockScreenEl) return;
        
        const savedPassword = localStorage.getItem('pitter_os_password') || '';

        if (this.passwordInput.value === savedPassword) {
            this.lockScreenEl.classList.add('animate-unlock');

            setTimeout(() => {
                this.lockScreenEl.classList.add('hidden');
                this.lockScreenEl.classList.remove('animate-unlock');
                if (this.lockClockInterval) clearInterval(this.lockClockInterval);
            }, 600);

            this.passwordInput.value = '';
            this.errorMsg.classList.add('hidden');
        } else {
            this.errorMsg.classList.remove('hidden');
            this.passwordInput.value = '';
            this.passwordInput.focus();
        }
    }

    updateLockTime() {
        if (!this.timeEl) return;
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        this.timeEl.textContent = `${hours}:${minutes}`;
    }
}
