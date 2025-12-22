const fs = require('fs');
const { createCanvas } = require('canvas');
const path = require('path');

const iconsDir = path.join(__dirname, 'src-tauri', 'icons');
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

function generateIcon(size, name) {
    try {
        const canvas = createCanvas(size, size);
        const ctx = canvas.getContext('2d');

        // Gradient background
        const gradient = ctx.createLinearGradient(0, 0, size, size);
        gradient.addColorStop(0, '#772953'); // Ubuntu Purple
        gradient.addColorStop(1, '#e95420'); // Ubuntu Orange
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        // Text
        ctx.fillStyle = 'white';
        ctx.font = `bold ${Math.floor(size * 0.5)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('P', size / 2, size / 2);

        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(path.join(iconsDir, name), buffer);
        console.log(`Generated ${name}`);
    } catch (e) {
        console.error(`Failed to generate ${name}: ${e.message}`);
        console.log('Falling back to empty file to satisfy Tauri build structure...');
        fs.writeFileSync(path.join(iconsDir, name), Buffer.alloc(0));
    }
}

generateIcon(32, '32x32.png');
generateIcon(128, '128x128.png');
generateIcon(256, '128x128@2x.png'); // Actually 256 for @2x
generateIcon(256, 'icon.png');
