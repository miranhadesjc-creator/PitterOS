const fs = require('fs');
const path = require('path');

// Cria um ícone com aranha estilizada para o Pitter OS
function createSpiderIcon() {
    const size = 64;
    const bmpHeaderSize = 40;
    const pixelDataSize = size * size * 4;
    const andMaskRowPadded = Math.ceil(size / 32) * 4;
    const andMaskSize = andMaskRowPadded * size;

    // ICO structure
    const headerSize = 6;
    const dirEntrySize = 16;
    const imageDataSize = bmpHeaderSize + pixelDataSize + andMaskSize;
    const totalSize = headerSize + dirEntrySize + imageDataSize;

    const buffer = Buffer.alloc(totalSize);
    let offset = 0;

    // ICO Header
    buffer.writeUInt16LE(0, offset); offset += 2;
    buffer.writeUInt16LE(1, offset); offset += 2;
    buffer.writeUInt16LE(1, offset); offset += 2;

    // Directory Entry
    buffer.writeUInt8(size, offset); offset += 1;
    buffer.writeUInt8(size, offset); offset += 1;
    buffer.writeUInt8(0, offset); offset += 1;
    buffer.writeUInt8(0, offset); offset += 1;
    buffer.writeUInt16LE(1, offset); offset += 2;
    buffer.writeUInt16LE(32, offset); offset += 2;
    buffer.writeUInt32LE(imageDataSize, offset); offset += 4;
    buffer.writeUInt32LE(headerSize + dirEntrySize, offset); offset += 4;

    // BITMAPINFOHEADER
    buffer.writeUInt32LE(40, offset); offset += 4;
    buffer.writeInt32LE(size, offset); offset += 4;
    buffer.writeInt32LE(size * 2, offset); offset += 4;
    buffer.writeUInt16LE(1, offset); offset += 2;
    buffer.writeUInt16LE(32, offset); offset += 2;
    buffer.writeUInt32LE(0, offset); offset += 4;
    buffer.writeUInt32LE(pixelDataSize, offset); offset += 4;
    buffer.writeInt32LE(0, offset); offset += 4;
    buffer.writeInt32LE(0, offset); offset += 4;
    buffer.writeUInt32LE(0, offset); offset += 4;
    buffer.writeUInt32LE(0, offset); offset += 4;

    const cx = size / 2;
    const cy = size / 2;

    // Função para verificar se um ponto está na aranha
    function isSpider(x, y) {
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Corpo principal (abdômen) - oval grande
        const abdomenX = cx;
        const abdomenY = cy + 5;
        const abdomenRX = 12;
        const abdomenRY = 14;
        const dax = (x - abdomenX) / abdomenRX;
        const day = (y - abdomenY) / abdomenRY;
        if (dax * dax + day * day <= 1) return { part: 'abdomen', glow: false };

        // Cefalotórax (cabeça) - círculo menor
        const headX = cx;
        const headY = cy - 12;
        const headR = 8;
        const dhx = x - headX;
        const dhy = y - headY;
        if (dhx * dhx + dhy * dhy <= headR * headR) return { part: 'head', glow: false };

        // Olhos (8 olhos em 2 fileiras)
        const eyePositions = [
            { x: cx - 4, y: cy - 14, r: 2 },
            { x: cx + 4, y: cy - 14, r: 2 },
            { x: cx - 6, y: cy - 11, r: 1.5 },
            { x: cx + 6, y: cy - 11, r: 1.5 },
            { x: cx - 2, y: cy - 10, r: 1.5 },
            { x: cx + 2, y: cy - 10, r: 1.5 },
        ];
        for (const eye of eyePositions) {
            const dex = x - eye.x;
            const dey = y - eye.y;
            if (dex * dex + dey * dey <= eye.r * eye.r) return { part: 'eye', glow: true };
        }

        // 8 Pernas da aranha
        const legAngles = [
            -150, -120, -60, -30,  // Pernas da esquerda e frente
            150, 120, 60, 30       // Pernas da direita e trás
        ];

        const legOriginY = cy - 5;

        for (let i = 0; i < legAngles.length; i++) {
            const angle = legAngles[i] * Math.PI / 180;
            const legLength = 22 + (i % 2) * 4;

            // Primeiro segmento (coxa)
            const seg1EndX = cx + Math.cos(angle) * 12;
            const seg1EndY = legOriginY + Math.sin(angle) * 8;

            // Segundo segmento (tíbia) - vai para baixo
            const angle2 = angle + (angle > 0 ? 0.8 : -0.8);
            const seg2EndX = seg1EndX + Math.cos(angle2) * 14;
            const seg2EndY = seg1EndY + Math.abs(Math.sin(angle2)) * 12 + 5;

            // Verificar se ponto está em algum segmento
            if (isPointOnLine(x, y, cx, legOriginY, seg1EndX, seg1EndY, 2.5)) {
                return { part: 'leg', glow: false };
            }
            if (isPointOnLine(x, y, seg1EndX, seg1EndY, seg2EndX, seg2EndY, 2)) {
                return { part: 'leg', glow: false };
            }
        }

        return null;
    }

    function isPointOnLine(px, py, x1, y1, x2, y2, thickness) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len === 0) return false;

        const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (len * len)));
        const nearX = x1 + t * dx;
        const nearY = y1 + t * dy;
        const dist = Math.sqrt((px - nearX) ** 2 + (py - nearY) ** 2);

        return dist <= thickness;
    }

    // Pixel data (bottom-up, BGRA)
    for (let y = size - 1; y >= 0; y--) {
        for (let x = 0; x < size; x++) {
            let r, g, b, a;

            const dx = x - cx;
            const dy = y - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);

            const spider = isSpider(x, y);

            if (dist <= 30) {
                // Fundo circular roxo/violeta com gradiente
                const t = dist / 30;
                const bgR = Math.floor(80 - t * 30);
                const bgG = Math.floor(20);
                const bgB = Math.floor(120 + t * 40);

                if (spider) {
                    if (spider.part === 'eye') {
                        // Olhos vermelhos brilhantes
                        r = 255;
                        g = 50;
                        b = 50;
                    } else if (spider.part === 'abdomen') {
                        // Abdômen preto com reflexo
                        const shine = Math.max(0, 1 - Math.abs(x - cx - 3) / 8 - Math.abs(y - cy - 2) / 10);
                        r = Math.floor(20 + shine * 60);
                        g = Math.floor(20 + shine * 60);
                        b = Math.floor(30 + shine * 70);
                    } else if (spider.part === 'head') {
                        // Cabeça preta
                        r = 25;
                        g = 25;
                        b = 35;
                    } else {
                        // Pernas pretas
                        r = 15;
                        g = 15;
                        b = 25;
                    }
                    a = 255;
                } else {
                    r = bgR;
                    g = bgG;
                    b = bgB;
                    a = 255;
                }

                // Borda brilhante cyan
                if (Math.abs(dist - 30) < 2) {
                    r = 0;
                    g = 220;
                    b = 255;
                    a = 255;
                }
            } else {
                // Transparente fora do círculo
                r = 0; g = 0; b = 0; a = 0;
            }

            buffer.writeUInt8(b, offset); offset += 1;
            buffer.writeUInt8(g, offset); offset += 1;
            buffer.writeUInt8(r, offset); offset += 1;
            buffer.writeUInt8(a, offset); offset += 1;
        }
    }

    // AND mask
    for (let i = 0; i < andMaskSize; i++) {
        buffer.writeUInt8(0, offset); offset += 1;
    }

    return buffer;
}

// Criar o ícone
const iconPath = path.join(__dirname, 'pitter-os.ico');
fs.writeFileSync(iconPath, createSpiderIcon());
console.log('Ícone de aranha criado:', iconPath);
console.log('Tamanho:', fs.statSync(iconPath).size, 'bytes');
