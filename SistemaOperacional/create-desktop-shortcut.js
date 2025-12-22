const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Cria um ícone 256x256 mais elaborado para o Pitter OS
function createPitterOSIcon() {
    const sizes = [256, 48, 32, 16];
    const images = [];

    for (const size of sizes) {
        images.push(createIconImage(size));
    }

    // ICO Header
    const headerSize = 6;
    const dirEntrySize = 16;

    let totalDataSize = headerSize + (dirEntrySize * images.length);
    const dataOffsets = [];

    for (const img of images) {
        dataOffsets.push(totalDataSize);
        totalDataSize += img.length;
    }

    const icoBuffer = Buffer.alloc(totalDataSize);
    let offset = 0;

    // ICO Header
    icoBuffer.writeUInt16LE(0, offset); offset += 2;        // Reserved
    icoBuffer.writeUInt16LE(1, offset); offset += 2;        // Type: ICO
    icoBuffer.writeUInt16LE(images.length, offset); offset += 2; // Number of images

    // Directory entries
    for (let i = 0; i < images.length; i++) {
        const size = sizes[i];
        icoBuffer.writeUInt8(size === 256 ? 0 : size, offset); offset += 1;  // Width
        icoBuffer.writeUInt8(size === 256 ? 0 : size, offset); offset += 1;  // Height
        icoBuffer.writeUInt8(0, offset); offset += 1;           // Color palette
        icoBuffer.writeUInt8(0, offset); offset += 1;           // Reserved
        icoBuffer.writeUInt16LE(1, offset); offset += 2;        // Color planes
        icoBuffer.writeUInt16LE(32, offset); offset += 2;       // Bits per pixel
        icoBuffer.writeUInt32LE(images[i].length, offset); offset += 4; // Size
        icoBuffer.writeUInt32LE(dataOffsets[i], offset); offset += 4;   // Offset
    }

    // Image data
    for (const img of images) {
        img.copy(icoBuffer, offset);
        offset += img.length;
    }

    return icoBuffer;
}

function createIconImage(size) {
    const bmpHeaderSize = 40;
    const pixelDataSize = size * size * 4;
    const andMaskRowSize = Math.ceil(size / 8);
    const andMaskRowPadded = Math.ceil(andMaskRowSize / 4) * 4;
    const andMaskSize = andMaskRowPadded * size;

    const totalSize = bmpHeaderSize + pixelDataSize + andMaskSize;
    const buffer = Buffer.alloc(totalSize);
    let offset = 0;

    // BITMAPINFOHEADER
    buffer.writeUInt32LE(40, offset); offset += 4;          // Header size
    buffer.writeInt32LE(size, offset); offset += 4;         // Width
    buffer.writeInt32LE(size * 2, offset); offset += 4;     // Height (doubled)
    buffer.writeUInt16LE(1, offset); offset += 2;           // Planes
    buffer.writeUInt16LE(32, offset); offset += 2;          // Bits per pixel
    buffer.writeUInt32LE(0, offset); offset += 4;           // Compression
    buffer.writeUInt32LE(pixelDataSize, offset); offset += 4;
    buffer.writeInt32LE(0, offset); offset += 4;
    buffer.writeInt32LE(0, offset); offset += 4;
    buffer.writeUInt32LE(0, offset); offset += 4;
    buffer.writeUInt32LE(0, offset); offset += 4;

    // Pixel data (bottom-up, BGRA)
    const center = size / 2;
    const outerRadius = size * 0.45;
    const innerRadius = size * 0.25;

    for (let y = size - 1; y >= 0; y--) {
        for (let x = 0; x < size; x++) {
            const dx = x - center;
            const dy = y - center;
            const dist = Math.sqrt(dx * dx + dy * dy);

            let r, g, b, a;

            if (dist <= outerRadius) {
                // Gradiente roxo/violeta para o fundo
                const t = dist / outerRadius;

                // Fundo gradiente roxo escuro para violeta
                const bgR = Math.floor(75 + t * 30);   // 75-105
                const bgG = Math.floor(25 + t * 20);   // 25-45
                const bgB = Math.floor(130 + t * 30);  // 130-160

                // Desenhar aranha estilizada
                const angle = Math.atan2(dy, dx);
                const normalizedAngle = ((angle + Math.PI) / (2 * Math.PI)) * 8;
                const legAngle = normalizedAngle % 1;

                // Corpo da aranha (centro)
                if (dist <= innerRadius * 0.5) {
                    // Corpo principal - preto com brilho
                    const shine = Math.max(0, 1 - dist / (innerRadius * 0.5));
                    r = Math.floor(30 + shine * 40);
                    g = Math.floor(30 + shine * 40);
                    b = Math.floor(50 + shine * 50);
                    a = 255;
                } else if (dist <= innerRadius * 0.7) {
                    // Anel do corpo
                    r = 20;
                    g = 20;
                    b = 40;
                    a = 255;
                } else if (dist > innerRadius && dist < outerRadius * 0.9) {
                    // Pernas da aranha (8 linhas radiais)
                    const legWidth = 0.08;
                    const isLeg = (legAngle < legWidth || legAngle > (1 - legWidth));

                    if (isLeg) {
                        // Perna - gradiente de preto para cyan
                        const legT = (dist - innerRadius) / (outerRadius * 0.9 - innerRadius);
                        r = Math.floor(20 + legT * 30);
                        g = Math.floor(180 * legT);
                        b = Math.floor(80 + legT * 175);
                        a = 255;
                    } else {
                        r = bgR;
                        g = bgG;
                        b = bgB;
                        a = 255;
                    }
                } else {
                    r = bgR;
                    g = bgG;
                    b = bgB;
                    a = 255;
                }

                // Borda brilhante
                if (Math.abs(dist - outerRadius) < 2) {
                    r = 0;
                    g = 200;
                    b = 255;
                    a = 255;
                }
            } else {
                // Fora do círculo - transparente
                r = 0;
                g = 0;
                b = 0;
                a = 0;
            }

            buffer.writeUInt8(b, offset); offset += 1;
            buffer.writeUInt8(g, offset); offset += 1;
            buffer.writeUInt8(r, offset); offset += 1;
            buffer.writeUInt8(a, offset); offset += 1;
        }
    }

    // AND mask (all zeros = use alpha)
    for (let i = 0; i < andMaskSize; i++) {
        buffer.writeUInt8(0, offset); offset += 1;
    }

    return buffer;
}

// Criar o ícone
const iconPath = path.join(__dirname, 'pitter-os.ico');
const iconBuffer = createPitterOSIcon();
fs.writeFileSync(iconPath, iconBuffer);
console.log('Ícone criado:', iconPath);

// Criar atalho na área de trabalho usando PowerShell
const desktopPath = path.join(process.env.USERPROFILE, 'OneDrive', 'Área de Trabalho');
const shortcutPath = path.join(desktopPath, 'Pitter OS.lnk');
const batPath = path.join(__dirname, 'Pitter OS - Atalho Desktop.bat');

const psScript = `
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut('${shortcutPath.replace(/\\/g, '\\\\')}')
$Shortcut.TargetPath = '${batPath.replace(/\\/g, '\\\\')}'
$Shortcut.WorkingDirectory = '${__dirname.replace(/\\/g, '\\\\')}'
$Shortcut.IconLocation = '${iconPath.replace(/\\/g, '\\\\')}'
$Shortcut.Description = 'Pitter OS - Sistema Operacional'
$Shortcut.WindowStyle = 7
$Shortcut.Save()
Write-Host 'Atalho criado com sucesso!'
`;

exec(`powershell -Command "${psScript.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`, (error, stdout, stderr) => {
    if (error) {
        console.error('Erro ao criar atalho:', stderr);
    } else {
        console.log(stdout);
        console.log('Atalho criado na área de trabalho com ícone personalizado!');
    }
});
