import { KernelAPI } from '../core/kernel-api.js';

export class TerminalApp {
    constructor() {
        this.inputElement = document.getElementById('terminal-input');
        this.outputElement = document.getElementById('terminal-output');
        this.isActive = false;

        this.init();
    }

    init() {
        if (this.inputElement) {
            this.inputElement.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const cmd = this.inputElement.value;
                    if (cmd) {
                        this.processCommand(cmd);
                        this.inputElement.value = '';
                    }
                }
            });
        }
    }

    async processCommand(command) {
        const cmd = command.trim();
        if (!cmd) return;

        // Prompt estilo Ubuntu
        this.addLine(`jean@pitter-os:~$ ${command}`, 'prompt');

        if (cmd.toLowerCase() === 'clear' || cmd.toLowerCase() === 'cls') {
            this.outputElement.innerHTML = '';
            return;
        }

        if (cmd.toLowerCase() === 'exit') {
            this.addLine('Terminal session ended.', 'info');
            // Poderia fechar a janela aqui
            return;
        }

        // Executar comando real no WSL via Kernel
        try {
            const result = await KernelAPI.runBashCommand(cmd);
            if (result) {
                this.addLine(result);
            }
        } catch (error) {
            this.addLine(`Error: ${error}`, 'error');
        }
    }

    addLine(text, type = '') {
        if (!this.outputElement) return;
        const line = document.createElement('p');
        line.className = `terminal-line ${type}`;
        line.textContent = text;
        this.outputElement.appendChild(line);
        this.outputElement.scrollTop = this.outputElement.scrollHeight;
    }
}
