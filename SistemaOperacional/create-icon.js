const fs = require('fs');
const path = require('path');

// Simple 16x16 ICO file in 32bpp format
// ICO file structure:
// - ICO Header (6 bytes)
// - ICO Directory Entry (16 bytes)
// - BITMAPINFOHEADER (40 bytes)
// - Pixel data (16x16x4 = 1024 bytes for 32bpp)
// - AND mask (16x16/8 = 32 bytes, with 4-byte row alignment = 64 bytes)

const headerSize = 6;
const dirEntrySize = 16;
const bmpHeaderSize = 40;
const pixelDataSize = 16 * 16 * 4; // 16x16 BGRA
const andMaskSize = 64; // 16 rows * 4 bytes per row (2 bytes data + 2 padding)

const totalSize = headerSize + dirEntrySize + bmpHeaderSize + pixelDataSize + andMaskSize;
const icoData = Buffer.alloc(totalSize);

let offset = 0;

// ICO Header (6 bytes)
icoData.writeUInt16LE(0, offset); offset += 2;     // Reserved
icoData.writeUInt16LE(1, offset); offset += 2;     // Type: 1 for ICO
icoData.writeUInt16LE(1, offset); offset += 2;     // Number of images

// ICO Directory Entry (16 bytes)
icoData.writeUInt8(16, offset); offset += 1;       // Width
icoData.writeUInt8(16, offset); offset += 1;       // Height
icoData.writeUInt8(0, offset); offset += 1;        // Color palette
icoData.writeUInt8(0, offset); offset += 1;        // Reserved
icoData.writeUInt16LE(1, offset); offset += 2;     // Color planes
icoData.writeUInt16LE(32, offset); offset += 2;    // Bits per pixel
const imageDataSize = bmpHeaderSize + pixelDataSize + andMaskSize;
icoData.writeUInt32LE(imageDataSize, offset); offset += 4; // Size of image data
icoData.writeUInt32LE(headerSize + dirEntrySize, offset); offset += 4; // Offset to image data

// BITMAPINFOHEADER (40 bytes)
icoData.writeUInt32LE(40, offset); offset += 4;    // Header size
icoData.writeInt32LE(16, offset); offset += 4;     // Width
icoData.writeInt32LE(32, offset); offset += 4;     // Height (doubled for ICO: image + mask)
icoData.writeUInt16LE(1, offset); offset += 2;     // Planes
icoData.writeUInt16LE(32, offset); offset += 2;    // Bits per pixel
icoData.writeUInt32LE(0, offset); offset += 4;     // Compression (BI_RGB)
icoData.writeUInt32LE(pixelDataSize, offset); offset += 4; // Image size
icoData.writeInt32LE(0, offset); offset += 4;      // X pixels per meter
icoData.writeInt32LE(0, offset); offset += 4;      // Y pixels per meter
icoData.writeUInt32LE(0, offset); offset += 4;     // Colors used
icoData.writeUInt32LE(0, offset); offset += 4;     // Important colors

// Pixel data (16x16 BGRA) - Blue color #0078D4
for (let i = 0; i < 256; i++) {
    icoData.writeUInt8(0xD4, offset); offset += 1;     // Blue
    icoData.writeUInt8(0x78, offset); offset += 1;     // Green
    icoData.writeUInt8(0x00, offset); offset += 1;     // Red
    icoData.writeUInt8(0xFF, offset); offset += 1;     // Alpha (fully opaque)
}

// AND mask (all zeros = fully visible)
for (let i = 0; i < andMaskSize; i++) {
    icoData.writeUInt8(0x00, offset); offset += 1;
}

// Create icons directory
const iconsDir = path.join(__dirname, 'src-tauri', 'icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

// Write ICO file
fs.writeFileSync(path.join(iconsDir, 'icon.ico'), icoData);
console.log('Icon created successfully! Size:', icoData.length, 'bytes');
