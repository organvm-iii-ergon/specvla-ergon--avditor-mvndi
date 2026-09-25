import fs from "fs";
import path from "path";
import zlib from "zlib";

function createCosmicPNG(size) {
  const width = size;
  const height = size;
  const rowSize = width * 4 + 1;
  const buffer = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.42;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    buffer[rowOffset] = 0; // Filter type None
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;

      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Deep dark void background (#090a0f)
      let r = 9;
      let g = 10;
      let b = 15;
      let a = 255;

      // Outer radial purple glow
      const normDist = dist / (width * 0.5);
      if (normDist < 1.0) {
        const glow = Math.pow(1 - normDist, 2);
        r += Math.round(glow * 45);
        g += Math.round(glow * 18);
        b += Math.round(glow * 80);
      }

      // Outer golden alignment ring
      const ringWidth = size * 0.035;
      const ringDist = Math.abs(dist - radius);
      if (ringDist < ringWidth) {
        const intensity = 1 - ringDist / ringWidth;
        r = Math.min(255, r + Math.round(250 * intensity));
        g = Math.min(255, g + Math.round(185 * intensity));
        b = Math.min(255, b + Math.round(65 * intensity));
      }

      // Cardinal rays (cross / alignment sigil)
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      const rayWidth = size * 0.025;

      if (
        (absDx < rayWidth && dist < radius) ||
        (absDy < rayWidth && dist < radius)
      ) {
        const rayIntensity =
          Math.max(
            absDx < rayWidth ? 1 - absDx / rayWidth : 0,
            absDy < rayWidth ? 1 - absDy / rayWidth : 0
          ) *
          (1 - dist / radius);
        r = Math.min(255, r + Math.round(255 * rayIntensity));
        g = Math.min(255, g + Math.round(210 * rayIntensity));
        b = Math.min(255, b + Math.round(100 * rayIntensity));
      }

      // 45-degree diagonal rays (cyan/purple)
      const diag1 = Math.abs(dx - dy) / Math.SQRT2;
      const diag2 = Math.abs(dx + dy) / Math.SQRT2;
      if (
        (diag1 < rayWidth * 0.7 && dist < radius * 0.75) ||
        (diag2 < rayWidth * 0.7 && dist < radius * 0.75)
      ) {
        const diagIntensity =
          Math.max(
            diag1 < rayWidth * 0.7 ? 1 - diag1 / (rayWidth * 0.7) : 0,
            diag2 < rayWidth * 0.7 ? 1 - diag2 / (rayWidth * 0.7) : 0
          ) *
          (1 - dist / (radius * 0.75)) *
          0.7;
        r = Math.min(255, r + Math.round(220 * diagIntensity));
        g = Math.min(255, g + Math.round(160 * diagIntensity));
        b = Math.min(255, b + Math.round(255 * diagIntensity));
      }

      // Central core bright star
      if (dist < size * 0.12) {
        const coreIntensity = Math.pow(1 - dist / (size * 0.12), 2);
        r = Math.min(255, r + Math.round(255 * coreIntensity));
        g = Math.min(255, g + Math.round(240 * coreIntensity));
        b = Math.min(255, b + Math.round(200 * coreIntensity));
      }

      buffer[pixelOffset] = Math.min(255, r);
      buffer[pixelOffset + 1] = Math.min(255, g);
      buffer[pixelOffset + 2] = Math.min(255, b);
      buffer[pixelOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(buffer);

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, "ascii");
    const body = Buffer.concat([typeBuf, data]);
    let crc = 0xffffffff;
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      table[n] = c;
    }
    for (let i = 0; i < body.length; i++) {
      crc = table[(crc ^ body[i]) & 0xff] ^ (crc >>> 8);
    }
    crc = (crc ^ 0xffffffff) >>> 0;
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc, 0);
    return Buffer.concat([len, body, crcBuf]);
  }

  const pngHeader = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  ]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const ihdrChunk = makeChunk("IHDR", ihdr);
  const idatChunk = makeChunk("IDAT", compressed);
  const iendChunk = makeChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([pngHeader, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve(process.cwd(), "public");
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, "icon-192.png"), createCosmicPNG(192));
fs.writeFileSync(path.join(publicDir, "icon-512.png"), createCosmicPNG(512));
fs.writeFileSync(path.join(publicDir, "apple-touch-icon.png"), createCosmicPNG(180));

console.log("PWA Icons generated successfully in public/");
