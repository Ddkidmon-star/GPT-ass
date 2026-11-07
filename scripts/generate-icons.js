import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPNG(width, height, r, g, b, hasPadding = false) {
  // Simple uncompressed/deflated raw RGBA PNG writer
  const rowSize = width * 4 + 1; // 1 filter byte per row
  const rawBuffer = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * (hasPadding ? 0.38 : 0.46);
  const cornerR = width * 0.22;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawBuffer[rowOffset] = 0; // Filter type None

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;

      // Rounded rectangle test
      const dx = Math.max(Math.abs(x - cx) - (cx - cornerR), 0);
      const dy = Math.max(Math.abs(y - cy) - (cy - cornerR), 0);
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= cornerR) {
        // Inside squircle
        // Check if inside inner symbol (vault / shield)
        const symDx = Math.abs(x - cx) / (width * 0.28);
        const symDy = (y - cy) / (height * 0.28);

        const inShield = (symDx < 0.6 && symDy > -0.6 && symDy < 0.7);
        const inG = Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cy, 2)) < (width * 0.18) &&
                    Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cy, 2)) > (width * 0.08);

        if (inG) {
          rawBuffer[pixelOffset] = 255;
          rawBuffer[pixelOffset + 1] = 255;
          rawBuffer[pixelOffset + 2] = 255;
          rawBuffer[pixelOffset + 3] = 255;
        } else {
          // Brand gradient: green top to deeper green bottom
          const t = y / height;
          rawBuffer[pixelOffset] = Math.round(0 * (1 - t) + 0 * t);
          rawBuffer[pixelOffset + 1] = Math.round(210 * (1 - t) + 138 * t);
          rawBuffer[pixelOffset + 2] = Math.round(135 * (1 - t) + 84 * t);
          rawBuffer[pixelOffset + 3] = 255;
        }
      } else {
        // Transparent outside
        rawBuffer[pixelOffset] = 0;
        rawBuffer[pixelOffset + 1] = 0;
        rawBuffer[pixelOffset + 2] = 0;
        rawBuffer[pixelOffset + 3] = 0;
      }
    }
  }

  // PNG header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // bit depth 8
  ihdrData.writeUInt8(6, 9); // color type RGBA (6)
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace

  const ihdrChunk = createChunk('IHDR', ihdrData);

  // IDAT chunk
  const compressed = zlib.deflateSync(rawBuffer);
  const idatChunk = createChunk('IDAT', compressed);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crc = calculateCRC(chunk.subarray(4, 8 + len));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

// Simple CRC32 table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function calculateCRC(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

const publicDir = path.resolve('public');
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPNG(192, 192, 0, 184, 117));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPNG(512, 512, 0, 184, 117));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, 0, 184, 117, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPNG(180, 180, 0, 184, 117));
console.log('Successfully generated PWA PNG icons!');
