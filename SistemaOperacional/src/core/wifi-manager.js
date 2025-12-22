// ============================================
// WIFI MANAGER - Sincroniza com conexão real
// ============================================

export class WifiManager {
    constructor() {
        this.wifiElement = document.getElementById('top-bar-wifi');
        this.connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        this.isOnline = navigator.onLine;
        this.airplaneMode = false;
    }

    init() {
        // Criar elemento se não existir
        if (!this.wifiElement) {
            this.createWifiElement();
        }

        this.updateWifiDisplay();
        this.addEventListeners();
        this.initWifiPanel();
        console.log('✅ WiFi Manager inicializado com sucesso');
    }

    initWifiPanel() {
        this.wifiPanel = document.getElementById('wifi-panel');
        this.authModal = document.getElementById('wifi-auth-modal');
        this.passwordInput = document.getElementById('wifi-password-input');

        const wifiBtn = document.querySelector('[data-action="wifi"]');
        const closeBtn = document.getElementById('wifi-panel-close');
        const authCancel = document.getElementById('wifi-auth-cancel');
        const authConnect = document.getElementById('wifi-auth-connect');
        const scanBtn = document.getElementById('wifi-scan-btn');
        const showAddBtn = document.getElementById('wifi-show-add');
        const addForm = document.getElementById('wifi-add-form');
        const addBtn = document.getElementById('wifi-add-btn');
        const newNameInput = document.getElementById('wifi-new-name');

        // Lista de redes simuladas - Nomes mais realistas comuns
        this.networks = [
            { name: 'VIVO-Fiber-5G-A28F', signal: 4, secured: true, connected: true },
            { name: 'CLARO_WIFI_72', signal: 3, secured: true, connected: false },
            { name: 'NET-CLARO-WIFI', signal: 2, secured: false, connected: false }
        ];

        // Carregar redes salvas se houver
        const savedNetworks = JSON.parse(localStorage.getItem('pitter_wifi_history') || '[]');
        savedNetworks.forEach(sn => {
            if (!this.networks.find(n => n.name === sn.name)) {
                this.networks.push(sn);
            }
        });

        // Scan button
        scanBtn?.addEventListener('click', () => {
            scanBtn.textContent = 'Procurando...';
            scanBtn.disabled = true;
            setTimeout(() => {
                const randomSSIDs = ['TP-Link_9284', 'iPhone_de_Pitter', 'OI_WIFI_CASA', 'SKY_WIFI_FAST'];
                randomSSIDs.forEach(name => {
                    if (!this.networks.find(n => n.name === name)) {
                        this.networks.push({ name, signal: Math.floor(Math.random() * 3) + 1, secured: true, connected: false });
                    }
                });
                this.renderNetworks();
                scanBtn.textContent = 'Procurar redes';
                scanBtn.disabled = false;
            }, 1500);
        });

        // Show add manual
        showAddBtn?.addEventListener('click', () => {
            addForm?.classList.toggle('hidden');
        });

        // Add manual network
        addBtn?.addEventListener('click', () => {
            const name = newNameInput?.value;
            if (name) {
                const newNet = { name, signal: 4, secured: true, connected: false };
                this.networks.push(newNet);

                // Salvar no histórico
                const history = JSON.parse(localStorage.getItem('pitter_wifi_history') || '[]');
                history.push(newNet);
                localStorage.setItem('pitter_wifi_history', JSON.stringify(history));

                this.renderNetworks();
                newNameInput.value = '';
                addForm?.classList.add('hidden');
            }
        });

        // Clique no botão WiFi para abrir painel
        if (wifiBtn) {
            wifiBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleWifiPanel();
            });
        }

        // Fechar painel
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.wifiPanel?.classList.add('hidden');
            });
        }

        // Modal de Senha
        authCancel?.addEventListener('click', () => {
            this.authModal?.classList.add('hidden');
            this.passwordInput.value = '';
        });

        authConnect?.addEventListener('click', () => {
            const networkName = document.getElementById('auth-network-name').textContent;
            this.completeConnection(networkName);
        });

        // Fechar ao clicar fora
        document.addEventListener('click', (e) => {
            if (this.wifiPanel && !this.wifiPanel.contains(e.target) &&
                !e.target.closest('[data-action="wifi"]') &&
                !this.authModal?.contains(e.target)) {
                this.wifiPanel.classList.add('hidden');
            }
        });

        this.renderNetworks();
    }

    toggleWifiPanel() {
        if (this.wifiPanel) {
            this.wifiPanel.classList.toggle('hidden');
            if (!this.wifiPanel.classList.contains('hidden')) {
                this.renderNetworks();
            }
        }
    }

    renderNetworks() {
        const list = document.getElementById('wifi-networks-list');
        if (!list) return;

        list.innerHTML = this.networks.map(net => `
            <div class="wifi-network-item ${net.connected ? 'connected' : ''}" data-network="${net.name}">
                <div class="wifi-network-icon">
                    ${this.getWifiIcon(net.signal)}
                </div>
                <div class="wifi-network-info">
                    <div class="wifi-network-name">${net.name}</div>
                    <div class="wifi-network-status">
                        ${net.connected ? 'Conectado' : (net.secured ? '🔒 Protegida' : 'Aberta')}
                    </div>
                </div>
                ${net.connected ? '<span class="wifi-network-signal">✓</span>' : ''}
            </div>
        `).join('');

        // Eventos de clique nas redes
        list.querySelectorAll('.wifi-network-item').forEach(item => {
            item.addEventListener('click', () => {
                const networkName = item.dataset.network;
                this.handleNetworkClick(networkName);
            });
        });
    }

    handleNetworkClick(networkName) {
        const net = this.networks.find(n => n.name === networkName);
        if (!net || net.connected) return;

        if (net.secured) {
            this.showPasswordModal(networkName);
        } else {
            this.completeConnection(networkName);
        }
    }

    showPasswordModal(networkName) {
        if (this.authModal) {
            document.getElementById('auth-network-name').textContent = networkName;
            this.authModal.classList.remove('hidden');
            this.passwordInput.focus();
        }
    }

    completeConnection(networkName) {
        // Simula o processo de conexão
        this.networks.forEach(net => {
            net.connected = net.name === networkName;
        });

        if (this.authModal) this.authModal.classList.add('hidden');
        if (this.passwordInput) this.passwordInput.value = '';

        this.renderNetworks();
        this.isOnline = true;
        this.updateWifiDisplay();

        // Notificar sistema
        console.log(`Conectado a ${networkName}`);
    }

    createWifiElement() {
        // Encontrar o span de wifi existente e dar um ID
        const topBarRight = document.querySelector('.top-bar-right');
        if (topBarRight) {
            const wifiSpan = topBarRight.querySelector('span:first-child');
            if (wifiSpan && wifiSpan.textContent.includes('📶')) {
                wifiSpan.id = 'top-bar-wifi';
                this.wifiElement = wifiSpan;
            }
        }
    }

    addEventListeners() {
        // Detecta mudanças online/offline
        window.addEventListener('online', () => {
            if (!this.airplaneMode) {
                this.isOnline = true;
                this.updateWifiDisplay();
            }
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.updateWifiDisplay();
        });

        // Detecta modo avião do Control Center
        window.addEventListener('airplaneMode', (e) => {
            this.airplaneMode = e.detail.enabled;
            if (this.airplaneMode) {
                this.isOnline = false;
            } else {
                this.isOnline = navigator.onLine;
            }
            this.updateWifiDisplay();
        });

        // Detecta mudanças na conexão (se suportado)
        if (this.connection) {
            this.connection.addEventListener('change', () => {
                this.updateWifiDisplay();
            });
        }

        // Atualiza periodicamente para medir a qualidade
        setInterval(() => this.updateWifiDisplay(), 5000);
    }

    updateWifiDisplay() {
        const status = this.getConnectionStatus();

        const htmlContent = `
            <span class="wifi-indicator ${status.colorClass}" title="${status.tooltip}">
                ${status.icon} ${status.label}
            </span>
        `;

        // Atualiza barra superior
        if (this.wifiElement) {
            this.wifiElement.innerHTML = htmlContent;

            // Adiciona animação se offline
            if (!this.isOnline) {
                this.wifiElement.classList.add('offline');
            } else {
                this.wifiElement.classList.remove('offline');
            }
        }

        // Atualiza taskbar também
        const taskbarWifi = document.getElementById('taskbar-wifi');
        if (taskbarWifi) {
            taskbarWifi.innerHTML = status.icon;
            taskbarWifi.title = status.tooltip;
        }
    }

    getConnectionStatus() {
        if (!this.isOnline) {
            return {
                icon: '📵',
                label: 'Offline',
                colorClass: 'wifi-offline',
                tooltip: 'Sem conexão com a internet'
            };
        }

        // Se a API de conexão estiver disponível
        if (this.connection) {
            const effectiveType = this.connection.effectiveType;
            const downlink = this.connection.downlink; // Mbps
            const rtt = this.connection.rtt; // Round-trip time em ms

            return this.getSignalQuality(effectiveType, downlink, rtt);
        }

        // Fallback: online mas sem detalhes
        return {
            icon: '📶',
            label: '',
            colorClass: 'wifi-good',
            tooltip: 'Conectado à internet'
        };
    }

    getSignalQuality(effectiveType, downlink, rtt) {
        // Baseado no tipo de conexão efetiva e velocidade

        // Conexão excelente: 4G com alta velocidade
        if (effectiveType === '4g' && downlink >= 10) {
            return {
                icon: this.getWifiIcon(4),
                label: '',
                colorClass: 'wifi-excellent',
                tooltip: `Excelente | ${downlink.toFixed(1)} Mbps`
            };
        }

        // Conexão boa: 4G ou alta velocidade
        if (effectiveType === '4g' || downlink >= 5) {
            return {
                icon: this.getWifiIcon(3),
                label: '',
                colorClass: 'wifi-good',
                tooltip: `Boa | ${downlink.toFixed(1)} Mbps`
            };
        }

        // Conexão média: 3G ou velocidade moderada
        if (effectiveType === '3g' || downlink >= 1) {
            return {
                icon: this.getWifiIcon(2),
                label: '',
                colorClass: 'wifi-medium',
                tooltip: `Média | ${downlink.toFixed(1)} Mbps`
            };
        }

        // Conexão fraca: 2G ou velocidade baixa
        if (effectiveType === '2g' || downlink >= 0.5) {
            return {
                icon: this.getWifiIcon(1),
                label: '',
                colorClass: 'wifi-weak',
                tooltip: `Fraca | ${downlink.toFixed(1)} Mbps`
            };
        }

        // Conexão muito fraca
        return {
            icon: this.getWifiIcon(0),
            label: '!',
            colorClass: 'wifi-very-weak',
            tooltip: `Muito fraca | ${downlink ? downlink.toFixed(1) + ' Mbps' : 'Lenta'}`
        };
    }

    getWifiIcon(strength) {
        // Retorna ícone SVG com arcos de WiFi
        // 4 = todos os arcos ativos, 0 = nenhum arco ativo

        const activeColor = this.getActiveColor(strength);
        const inactiveColor = '#4b5563'; // Cinza para arcos inativos

        // Cores para cada arco baseado na força
        const arc1 = strength >= 1 ? activeColor : inactiveColor; // Arco menor (mais interno)
        const arc2 = strength >= 2 ? activeColor : inactiveColor; // Arco médio
        const arc3 = strength >= 3 ? activeColor : inactiveColor; // Arco grande
        const arc4 = strength >= 4 ? activeColor : inactiveColor; // Arco maior (mais externo)
        const dot = strength >= 1 ? activeColor : inactiveColor;  // Ponto central

        return `<svg width="16" height="14" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle;">
            <!-- Arco 4 (maior/externo) -->
            <path d="M2 8C5.5 4.5 10 2.5 12 2.5C14 2.5 18.5 4.5 22 8" 
                  stroke="${arc4}" stroke-width="2" stroke-linecap="round" fill="none"/>
            <!-- Arco 3 -->
            <path d="M5 11C7.5 8.5 10 7 12 7C14 7 16.5 8.5 19 11" 
                  stroke="${arc3}" stroke-width="2" stroke-linecap="round" fill="none"/>
            <!-- Arco 2 -->
            <path d="M8 14C9.5 12.5 11 11.5 12 11.5C13 11.5 14.5 12.5 16 14" 
                  stroke="${arc2}" stroke-width="2" stroke-linecap="round" fill="none"/>
            <!-- Ponto central -->
            <circle cx="12" cy="17" r="2" fill="${dot}"/>
        </svg>`;
    }

    getActiveColor(strength) {
        // Retorna a cor baseada na força do sinal
        if (strength >= 4) return '#22c55e'; // Verde brilhante - Excelente
        if (strength >= 3) return '#4ade80'; // Verde - Bom
        if (strength >= 2) return '#fbbf24'; // Amarelo - Médio
        if (strength >= 1) return '#f97316'; // Laranja - Fraco
        return '#ef4444'; // Vermelho - Muito fraco
    }

    // Método para testar velocidade real (ping simples)
    async measureLatency() {
        try {
            const start = performance.now();
            await fetch('https://www.google.com/favicon.ico', {
                mode: 'no-cors',
                cache: 'no-store'
            });
            const end = performance.now();
            return Math.round(end - start);
        } catch (error) {
            return null;
        }
    }
}
