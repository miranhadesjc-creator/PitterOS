import { db } from '../core/db.js';

export class SettingsApp {
    constructor(desktop) {
        this.desktop = desktop;
        this.sidebarItems = document.querySelectorAll('.settings-nav-item');
        this.tabs = document.querySelectorAll('.settings-tab');
        this.wallpaperItems = document.querySelectorAll('.wallpaper-item');
        this.init();
    }

    async init() {
        await db.init();
        await this.loadSavedWallpapers();

        this.sidebarItems.forEach(item => {
            item.addEventListener('click', () => {
                const tabId = item.dataset.tab;
                this.switchTab(tabId);
            });
        });

        this.setupWallpaperItems();

        const uploadBtn = document.getElementById('btn-upload-wallpaper');
        const uploadInput = document.getElementById('input-upload-wallpaper');
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        const blurSlider = document.getElementById('wallpaper-blur-slider');
        const blurDisplay = document.getElementById('blur-value-display');

        if (darkModeToggle) {
            darkModeToggle.addEventListener('change', (e) => {
                const isDark = e.target.checked;
                document.body.classList.toggle('dark-mode', isDark);
                localStorage.setItem('theme', isDark ? 'dark' : 'light');
            });
        }

        if (blurSlider) {
            blurSlider.addEventListener('input', (e) => {
                const val = e.target.value;
                document.documentElement.style.setProperty('--bg-blur', `${val}px`);
                if (blurDisplay) blurDisplay.textContent = `${val}px`;
                localStorage.setItem('wallpaper_blur', val);
            });
        }

        // Font grid is handled in init/renderFontGrid now

        if (uploadBtn && uploadInput) {
            uploadBtn.addEventListener('click', () => uploadInput.click());
            uploadInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (file) {
                    await db.saveWallpaper(file);
                    await this.loadSavedWallpapers();
                }
            });
        }

        // --- USER PROFILE EDITING ---
        const inputEditUsername = document.getElementById('input-edit-username');
        const btnChangePhoto = document.getElementById('btn-change-photo');
        const inputProfilePhoto = document.getElementById('input-profile-photo');

        if (inputEditUsername) {
            inputEditUsername.value = localStorage.getItem('pitter_user_name') || 'Jean';
            inputEditUsername.onchange = () => {
                const newName = inputEditUsername.value.trim();
                if (newName) {
                    localStorage.setItem('pitter_user_name', newName);
                    // Avisa o SO para atualizar a UI (idealmente via evento ou callback)
                    window.os?.updateProfileUI();
                }
            };
        }

        if (btnChangePhoto && inputProfilePhoto) {
            btnChangePhoto.onclick = () => inputProfilePhoto.click();
            inputProfilePhoto.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const base64 = event.target.result;
                        localStorage.setItem('pitter_user_photo', base64);
                        window.os?.updateProfileUI();
                    };
                    reader.readAsDataURL(file);
                }
            };
        }

        // --- PASSWORD MANAGEMENT ---
        const btnSavePassword = document.getElementById('btn-save-password');
        const inputNewPassword = document.getElementById('input-new-password');
        const passwordFeedback = document.getElementById('password-feedback');

        if (btnSavePassword && inputNewPassword) {
            btnSavePassword.onclick = () => {
                const newPassword = inputNewPassword.value.trim();
                localStorage.setItem('pitter_os_password', newPassword);

                if (passwordFeedback) {
                    passwordFeedback.textContent = 'Senha salva com sucesso!';
                    passwordFeedback.style.color = '#107c10';
                    passwordFeedback.style.display = 'block';
                    setTimeout(() => passwordFeedback.style.display = 'none', 3000);
                }
                inputNewPassword.value = '';
            };
        }

        this.syncUIWithSettings();
    }

    async loadSavedWallpapers() {
        const wallpapers = await db.getWallpapers();
        const grid = document.getElementById('wallpaper-grid');
        grid.querySelectorAll('.wallpaper-item[data-custom="true"]').forEach(el => el.remove());

        wallpapers.forEach(wp => {
            const url = URL.createObjectURL(wp.blob);
            const item = document.createElement('div');
            item.className = 'wallpaper-item';
            item.dataset.type = wp.type;
            item.dataset.src = url;
            item.dataset.id = wp.id; // Store ID for deletion
            item.dataset.custom = "true";

            const previewClass = wp.type === 'video' ? 'video-bg-preview' : 'default-bg';
            item.innerHTML = `
                <div class="preview ${previewClass}" style="${wp.type === 'image' ? `background-image: url('${url}'); background-size: cover;` : ''}">
                    ${wp.type === 'video' ? '<video src="' + url + '" muted loop onmouseover="this.play()" onmouseout="this.pause()"></video>' : ''}
                    <button class="btn-delete-wallpaper" title="Excluir Wallpaper">
                        <span class="delete-icon">🗑️</span>
                    </button>
                </div>
                <span>${wp.name}</span>
            `;
            grid.appendChild(item);
        });
        this.setupWallpaperItems();
    }

    setupWallpaperItems() {
        this.wallpaperItems = document.querySelectorAll('.wallpaper-item');
        this.wallpaperItems.forEach(item => {
            // Background Selection logic
            const preview = item.querySelector('.preview');
            if (preview) {
                preview.onclick = (e) => {
                    // Prevent trigger when clicking delete button
                    if (e.target.classList.contains('btn-delete-wallpaper')) return;

                    this.wallpaperItems.forEach(i => i.classList.remove('active'));
                    item.classList.add('active');
                    this.desktop.setWallpaper(item.dataset.type, item.dataset.src);
                };
            }

            // Deletion logic
            const deleteBtn = item.querySelector('.btn-delete-wallpaper');
            if (deleteBtn) {
                deleteBtn.onclick = async (e) => {
                    e.stopPropagation();
                    const wpId = item.dataset.id;
                    if (wpId) {
                        item.classList.add('deleting');
                        await new Promise(r => setTimeout(r, 400));
                        await db.deleteWallpaper(parseInt(wpId));
                        item.remove();
                    }
                };
            }
        });
    }

    switchTab(tabId) {
        this.sidebarItems.forEach(i => i.classList.toggle('active', i.dataset.tab === tabId));
        this.tabs.forEach(t => t.classList.toggle('active', t.id === `tab-${tabId}`));
    }

    syncUIWithSettings() {
        const type = localStorage.getItem('desktop_wallpaper_type') || 'image';
        const src = localStorage.getItem('desktop_wallpaper_src') || 'default';
        const theme = localStorage.getItem('theme') || 'light';
        const blur = localStorage.getItem('wallpaper_blur') || '0';

        this.wallpaperItems.forEach(item => {
            item.classList.toggle('active', item.dataset.type === type && item.dataset.src === src);
        });

        const darkModeToggle = document.getElementById('dark-mode-toggle');
        if (darkModeToggle) darkModeToggle.checked = theme === 'dark';

        const blurSlider = document.getElementById('wallpaper-blur-slider');
        const blurDisplay = document.getElementById('blur-value-display');
        if (blurSlider) {
            blurSlider.value = blur;
            document.documentElement.style.setProperty('--bg-blur', `${blur}px`);
            if (blurDisplay) blurDisplay.textContent = `${blur}px`;
        }

        const fontGrid = document.getElementById('font-grid');
        const savedFont = localStorage.getItem('system_font_preference');

        if (fontGrid) {
            this.renderFontGrid(fontGrid, savedFont);
        }

        if (savedFont) {
            document.documentElement.style.setProperty('--system-font', savedFont);
        }
    }

    renderFontGrid(container, savedFont) {
        const fonts = [
            { name: 'Padrão (Segoe UI)', value: "'Segoe UI', system-ui, -apple-system, sans-serif" },
            { name: 'Roboto', value: "'Roboto', sans-serif" },
            { name: 'Open Sans', value: "'Open Sans', sans-serif" },
            { name: 'Courier New', value: "'Courier New', monospace" },
            { name: 'Comic Sans MS', value: "'Comic Sans MS', 'Chalkboard SE', sans-serif" },
            { name: 'Times New Roman', value: "'Times New Roman', serif" }
        ];

        container.innerHTML = '';
        fonts.forEach(font => {
            const card = document.createElement('div');
            card.className = 'font-card';
            if (font.value === savedFont || (!savedFont && font.name.startsWith('Padrão'))) {
                card.classList.add('active');
            }

            card.innerHTML = `
                <div class="font-preview" style="font-family: ${font.value}">Pitter OS</div>
                <div class="font-name">${font.name}</div>
            `;

            card.onclick = () => {
                // Update UI
                container.querySelectorAll('.font-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');

                // Apply Font
                document.documentElement.style.setProperty('--system-font', font.value);
                localStorage.setItem('system_font_preference', font.value);
            };

            container.appendChild(card);
        });
    }
}
