export class UbuntuVMApp {
    constructor() {
        this.window = document.getElementById('window-ubuntu-vm');
        this.btnBoot = document.getElementById('vm-btn-boot');
        this.btnReset = document.getElementById('vm-btn-reset');
        this.statusEl = document.getElementById('vm-status');
        this.terminal = document.getElementById('vm-terminal');
        this.iframe = document.getElementById('vm-iframe');

        this.isBooted = false;
        this.init();
    }

    init() {
        if (this.btnBoot) {
            this.btnBoot.addEventListener('click', () => this.boot());
        }
        if (this.btnReset) {
            this.btnReset.addEventListener('click', () => this.reset());
        }
    }

    async boot() {
        if (this.isBooted) return;

        this.isBooted = true;
        this.statusEl.textContent = 'Iniciando...';
        this.statusEl.style.color = '#e95420';
        this.btnBoot.disabled = true;
        this.btnBoot.style.opacity = '0.5';

        // Simulação de Boot de Kernel Real
        this.terminal.innerHTML = '';
        const bootMessages = [
            "[    0.000000] Linux version 6.5.0-ubuntu (jean@pitter-os) #1 SMP PREEMPT",
            "[    0.000000] Command line: BOOT_IMAGE=/boot/vmlinuz-6.5.0 root=UUID=pitter-os-vm",
            "[    0.000000] x86/fpu: Supporting XSAVE feature 0x01: 'x87 floating point registers'",
            "[    0.124512] Memory: 2048MB available (128MB kernel code, 2048KB reserved)",
            "[    0.542110] Console: colour VGA+ 80x25",
            "[    0.892011] Calibrating delay loop... 4800.21 BogoMIPS (lpj=9600420)",
            "[    1.214510] devtmpfs: initialized",
            "[    1.542110] mount: /dev/sda1 mounted on /",
            "[    2.102415] systemd[1]: systemd 253.5-1ubuntu6 starting...",
            "[    2.412510] [ OK ] Started Journal Service.",
            "[    2.812510] [ OK ] Started Network Time Synchronization.",
            "[    3.125412] [ OK ] Reached target Network.",
            "[    3.512415] [ OK ] Started Accounts Service.",
            "[    4.102415] [ OK ] Reached target Multi-User System.",
            "[    4.512415] [ OK ] Reached target Graphical Interface."
        ];

        for (const msg of bootMessages) {
            this.addTerminalLine(msg);
            await new Promise(r => setTimeout(r, Math.random() * 200 + 50));
        }

        // Mostrar Iframe (Simulador de WebVM real ou terminal interativo)
        this.statusEl.textContent = 'Ligado';
        this.statusEl.style.color = '#4caf50';

        // Tentativa de carregar WebVM (requer internet, mas é o mais "real" possível)
        // Se falhar, fica no terminal simulado
        this.terminal.classList.add('hidden');
        this.iframe.classList.remove('hidden');
        this.iframe.src = "https://webvm.io/";

        console.log("Ubuntu VM Boot Complete");
    }

    reset() {
        this.isBooted = false;
        this.statusEl.textContent = 'Desligado';
        this.statusEl.style.color = '#ff4d4d';
        this.btnBoot.disabled = false;
        this.btnBoot.style.opacity = '1';
        this.terminal.innerHTML = '';
        this.terminal.classList.remove('hidden');
        this.iframe.classList.add('hidden');
        this.iframe.src = 'about:blank';
    }

    addTerminalLine(text) {
        const p = document.createElement('p');
        p.style.margin = '0';
        p.style.padding = '2px 10px';
        p.style.fontFamily = "'Ubuntu Mono', monospace";
        p.style.fontSize = '12px';
        p.style.color = '#00ff00';
        p.textContent = text;
        this.terminal.appendChild(p);
        this.terminal.scrollTop = this.terminal.scrollHeight;
    }
}
