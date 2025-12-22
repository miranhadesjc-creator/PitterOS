// ============================================
// SISTEMA OPERACIONAL - DESKTOP
// ============================================

export class Desktop {
    constructor(windowManager) {
        this.windowManager = windowManager;
        this.containerElement = document.getElementById('wallpaper-container');
    }

    /**
     * Inicializa o desktop
     */
    init() {
        this.initDesktopIcons();
        this.loadSettings();
    }

    /**
     * Inicializa ícones do desktop
     */
    initDesktopIcons() {
        document.querySelectorAll('.desktop-icon').forEach(icon => {
            icon.addEventListener('dblclick', () => {
                const appId = icon.dataset.app;
                if (appId) {
                    this.windowManager.open(appId);
                }
            });
        });
    }

    /**
     * Carrega configurações salvas
     */
    loadSettings() {
        const savedType = localStorage.getItem('desktop_wallpaper_type') || 'image';
        const savedSrc = localStorage.getItem('desktop_wallpaper_src') || 'default';
        const savedTheme = localStorage.getItem('theme') || 'light';

        this.setWallpaper(savedType, savedSrc);

        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }

    /**
     * Define o papel de parede
     * @param {string} type - 'image', 'video' ou 'css'
     * @param {string} src - URL, caminho ou classe CSS
     */
    setWallpaper(type, src) {
        if (!this.containerElement) return;

        // Limpa visual atual
        this.containerElement.innerHTML = '';
        this.containerElement.className = '';
        document.body.style.backgroundImage = '';

        // Salva preferência
        localStorage.setItem('desktop_wallpaper_type', type);
        localStorage.setItem('desktop_wallpaper_src', src);

        switch (type) {
            case 'video':
                const video = document.createElement('video');
                video.src = src;
                video.autoplay = true;
                video.loop = true;
                video.muted = true;
                video.playsInline = true;
                video.className = 'video-bg';

                // Força play
                video.play().catch(e => console.warn('Autoplay bloqueado:', e));

                this.containerElement.appendChild(video);
                break;

            case 'css':
                this.containerElement.className = src; // Espera uma classe CSS
                break;

            case 'image':
            default:
                if (src === 'default') {
                    // Padrão do Windows 11 (definido no CSS do body, então só limpamos overlay)
                    document.body.style.backgroundImage = '';
                } else {
                    document.body.style.backgroundImage = `url('${src}')`;
                    document.body.style.backgroundSize = 'cover';
                    document.body.style.backgroundPosition = 'center';
                }
                break;
        }
    }
}
