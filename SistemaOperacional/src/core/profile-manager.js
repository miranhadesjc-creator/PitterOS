export class ProfileManager {
    constructor() {
        this.nameElements = [
            'top-bar-user-name',
            'start-menu-user-name',
            'lock-user-name',
            'settings-user-name'
        ];
        this.photoElementsQuery = '.user-profile-photo, #settings-user-photo';
    }

    updateUI() {
        const name = localStorage.getItem('pitter_user_name') || 'Jean';
        const photo = localStorage.getItem('pitter_user_photo') || 'assets/lockscreen/christmas_spider.png';

        this.nameElements.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = name;
        });

        const photoElements = document.querySelectorAll(this.photoElementsQuery);
        photoElements.forEach(img => {
            if (img.src !== photo) {
                img.src = photo;
            }
        });
    }

    init() {
        this.updateUI();
        // Listen for profile changes from other parts of the app, e.g., settings
        window.addEventListener('profile-updated', () => this.updateUI());
    }
}
