// ============================================
// BATTERY MANAGER - Sincroniza com bateria real
// ============================================

export class BatteryManager {
    constructor() {
        this.battery = null;
        this.batteryElement = document.getElementById('top-bar-battery');
        this.isSupported = 'getBattery' in navigator;
    }

    async init() {
        if (!this.isSupported) {
            console.warn('Battery Status API não suportada neste navegador');
            this.showFallback();
            return;
        }

        try {
            this.battery = await navigator.getBattery();
            this.updateBatteryDisplay();
            this.addEventListeners();
            console.log('✅ Battery Manager inicializado com sucesso');
        } catch (error) {
            console.error('Erro ao acessar bateria:', error);
            this.showFallback();
        }
    }

    addEventListeners() {
        if (!this.battery) return;

        // Atualiza quando o nível muda
        this.battery.addEventListener('levelchange', () => {
            this.updateBatteryDisplay();
        });

        // Atualiza quando status de carregamento muda
        this.battery.addEventListener('chargingchange', () => {
            this.updateBatteryDisplay();
        });

        // Atualiza tempo restante quando muda
        this.battery.addEventListener('chargingtimechange', () => {
            this.updateBatteryDisplay();
        });

        this.battery.addEventListener('dischargingtimechange', () => {
            this.updateBatteryDisplay();
        });
    }

    updateBatteryDisplay() {
        if (!this.battery) return;

        const level = Math.round(this.battery.level * 100);
        const isCharging = this.battery.charging;

        // Ícone baseado no nível e carregamento
        let icon = this.getBatteryIcon(level, isCharging);
        let statusText = isCharging ? '⚡' : '';

        // Cor baseada no nível
        let colorClass = this.getBatteryColorClass(level);

        // Tempo restante
        let timeInfo = this.getTimeRemaining();

        // Atualiza barra superior
        if (this.batteryElement) {
            this.batteryElement.innerHTML = `
                <span class="battery-indicator ${colorClass}" title="${timeInfo}">
                    ${icon} ${statusText}${level}%
                </span>
            `;

            // Adiciona classe de animação quando carregando
            if (isCharging) {
                this.batteryElement.classList.add('charging');
            } else {
                this.batteryElement.classList.remove('charging');
            }

            // Atualiza atributo de dados para uso em CSS
            this.batteryElement.setAttribute('data-level', level);
            this.batteryElement.setAttribute('data-charging', isCharging);
        }

        // Atualiza taskbar também
        const taskbarBattery = document.getElementById('taskbar-battery');
        if (taskbarBattery) {
            taskbarBattery.innerHTML = this.getBatteryIconSVG(level, isCharging);
            taskbarBattery.title = timeInfo;
        }
    }

    getBatteryIcon(level, isCharging) {
        if (isCharging) {
            return '🔌';
        }

        if (level >= 80) return '🔋';
        if (level >= 50) return '🔋';
        if (level >= 20) return '🪫';
        return '🪫'; // Bateria baixa
    }

    getBatteryColorClass(level) {
        if (level >= 50) return 'battery-good';
        if (level >= 20) return 'battery-medium';
        return 'battery-low';
    }

    getBatteryIconSVG(level, isCharging) {
        // Calcula a largura do preenchimento baseado no nível
        const fillWidth = Math.max(2, (level / 100) * 14);

        // Cor baseada no nível
        let fillColor;
        if (isCharging) {
            fillColor = '#22c55e'; // Verde para carregando
        } else if (level >= 50) {
            fillColor = '#4ade80'; // Verde
        } else if (level >= 20) {
            fillColor = '#fbbf24'; // Amarelo
        } else {
            fillColor = '#ef4444'; // Vermelho
        }

        const chargingBolt = isCharging ? '<path d="M11 2L8 6h2.5L9 10l4-4.5h-2.5L11 2z" fill="#fff"/>' : '';

        return `<svg width="18" height="12" viewBox="0 0 20 12" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle;">
            <rect x="1" y="1" width="16" height="10" rx="2" stroke="#fff" stroke-width="1.5" fill="none"/>
            <rect x="17" y="3.5" width="2" height="5" rx="0.5" fill="#fff"/>
            <rect x="2.5" y="2.5" width="${fillWidth}" height="7" rx="1" fill="${fillColor}"/>
            ${chargingBolt}
        </svg>`;
    }

    getTimeRemaining() {
        if (!this.battery) return 'Desconhecido';

        if (this.battery.charging) {
            const time = this.battery.chargingTime;
            if (time === Infinity || isNaN(time)) {
                return 'Carregando...';
            }
            return `Carregamento completo em ${this.formatTime(time)}`;
        } else {
            const time = this.battery.dischargingTime;
            if (time === Infinity || isNaN(time)) {
                return 'Calculando tempo restante...';
            }
            return `Tempo restante: ${this.formatTime(time)}`;
        }
    }

    formatTime(seconds) {
        if (!seconds || seconds === Infinity) return '--:--';

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (hours > 0) {
            return `${hours}h ${minutes}min`;
        }
        return `${minutes}min`;
    }

    showFallback() {
        if (this.batteryElement) {
            this.batteryElement.innerHTML = `
                <span class="battery-indicator battery-unknown" title="API de bateria não disponível">
                    🔋 ---%
                </span>
            `;
        }
    }
}
