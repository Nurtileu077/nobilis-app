// Generate PWA icons from SVG
// This creates simple PNG files using raw pixel data
const fs = require('fs');
const path = require('path');

// Minimal PNG encoder (no dependencies)
function createPNG(width, height, drawFn) {
  const pixels = new Uint8Array(width * height * 4);
  drawFn(pixels, width, height);

  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type (RGBA)
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // Raw image data with filter bytes
  const rawData = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    rawData[y * (1 + width * 4)] = 0; // filter: none
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 4;
      const dstIdx = y * (1 + width * 4) + 1 + x * 4;
      rawData[dstIdx] = pixels[srcIdx];
      rawData[dstIdx + 1] = pixels[srcIdx + 1];
      rawData[dstIdx + 2] = pixels[srcIdx + 2];
      rawData[dstIdx + 3] = pixels[srcIdx + 3];
    }
  }

  // Compress with zlib
  const zlib = require('zlib');
  const compressed = zlib.deflateSync(rawData);

  // Build chunks
  function makeChunk(type, data) {
    const chunk = Buffer.alloc(4 + type.length + data.length + 4);
    chunk.writeUInt32BE(data.length, 0);
    chunk.write(type, 4);
    data.copy(chunk, 4 + type.length);

    // CRC32
    const crcData = Buffer.concat([Buffer.from(type), data]);
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < crcData.length; i++) {
      crc ^= crcData[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
      }
    }
    crc ^= 0xFFFFFFFF;
    chunk.writeInt32BE(crc, chunk.length - 4);
    return chunk;
  }

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Draw the Nobilis logo
function drawNobilisLogo(pixels, w, h) {
  const cx = w / 2, cy = h / 2;

  function setPixel(x, y, r, g, b, a = 255) {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || x >= w || y < 0 || y >= h) return;
    const idx = (y * w + x) * 4;
    // Alpha blend
    const srcA = a / 255;
    const dstA = pixels[idx + 3] / 255;
    const outA = srcA + dstA * (1 - srcA);
    if (outA > 0) {
      pixels[idx] = Math.round((r * srcA + pixels[idx] * dstA * (1 - srcA)) / outA);
      pixels[idx + 1] = Math.round((g * srcA + pixels[idx + 1] * dstA * (1 - srcA)) / outA);
      pixels[idx + 2] = Math.round((b * srcA + pixels[idx + 2] * dstA * (1 - srcA)) / outA);
      pixels[idx + 3] = Math.round(outA * 255);
    }
  }

  function fillCircle(cx, cy, r, cr, cg, cb, ca = 255) {
    for (let y = Math.max(0, Math.floor(cy - r)); y <= Math.min(h - 1, Math.ceil(cy + r)); y++) {
      for (let x = Math.max(0, Math.floor(cx - r)); x <= Math.min(w - 1, Math.ceil(cx + r)); x++) {
        const dx = x - cx, dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= r) {
          const aa = dist > r - 1 ? Math.round(ca * (r - dist)) : ca;
          setPixel(x, y, cr, cg, cb, Math.max(0, aa));
        }
      }
    }
  }

  function fillEllipse(cx, cy, rx, ry, cr, cg, cb, ca = 255) {
    for (let y = Math.max(0, Math.floor(cy - ry)); y <= Math.min(h - 1, Math.ceil(cy + ry)); y++) {
      for (let x = Math.max(0, Math.floor(cx - rx)); x <= Math.min(w - 1, Math.ceil(cx + rx)); x++) {
        const dx = (x - cx) / rx, dy = (y - cy) / ry;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= 1) {
          const aa = dist > 0.95 ? Math.round(ca * (1 - dist) / 0.05) : ca;
          setPixel(x, y, cr, cg, cb, Math.max(0, aa));
        }
      }
    }
  }

  function strokeEllipse(cx, cy, rx, ry, thickness, cr, cg, cb, ca = 255) {
    for (let y = Math.max(0, Math.floor(cy - ry - thickness)); y <= Math.min(h - 1, Math.ceil(cy + ry + thickness)); y++) {
      for (let x = Math.max(0, Math.floor(cx - rx - thickness)); x <= Math.min(w - 1, Math.ceil(cx + rx + thickness)); x++) {
        const dx = (x - cx) / rx, dy = (y - cy) / ry;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const edge = Math.abs(dist - 1) * Math.min(rx, ry);
        if (edge < thickness / 2) {
          const aa = edge > thickness / 2 - 1 ? Math.round(ca * (thickness / 2 - edge)) : ca;
          setPixel(x, y, cr, cg, cb, Math.max(0, aa));
        }
      }
    }
  }

  const s = w / 512; // scale factor

  // Background circle (dark green)
  fillCircle(cx, cy, w * 0.49, 26, 58, 50);

  // Gold oval border
  strokeEllipse(cx, cy, 180 * s, 210 * s, 4 * s, 201, 162, 39);

  // Head silhouette (gold circle)
  fillCircle(cx, cy - 10 * s, 55 * s, 201, 162, 39);

  // Graduation cap - flat top (simplified as rectangle area)
  const capY = cy - 65 * s;
  for (let y = Math.floor(capY - 30 * s); y < Math.floor(capY + 5 * s); y++) {
    for (let x = Math.floor(cx - 70 * s); x < Math.floor(cx + 70 * s); x++) {
      // Diamond/rhombus shape for cap
      const relX = Math.abs(x - cx) / (70 * s);
      const relY = (y - capY) / (35 * s);
      if (relX + Math.abs(relY) < 1) {
        setPixel(x, y, 201, 162, 39);
      }
    }
  }

  // Cap button on top
  fillCircle(cx, capY - 30 * s, 6 * s, 240, 216, 97);

  // Tassel
  const tasselStartX = cx + 70 * s;
  const tasselStartY = capY;
  for (let t = 0; t < 1; t += 0.01) {
    const tx = tasselStartX + t * 15 * s;
    const ty = tasselStartY + t * 30 * s;
    fillCircle(tx, ty, 2 * s, 201, 162, 39);
  }
  fillCircle(tasselStartX + 15 * s, tasselStartY + 30 * s, 5 * s, 240, 216, 97);

  // Star at top
  const starCx = cx, starCy = cy - 170 * s;
  const starOuter = 18 * s, starInner = 8 * s;
  for (let y2 = Math.floor(starCy - starOuter); y2 <= Math.ceil(starCy + starOuter); y2++) {
    for (let x2 = Math.floor(starCx - starOuter); x2 <= Math.ceil(starCx + starOuter); x2++) {
      const dx = x2 - starCx, dy = y2 - starCy;
      const angle = Math.atan2(dy, dx);
      const dist = Math.sqrt(dx * dx + dy * dy);
      const starAngle = ((angle + Math.PI / 2) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
      const idx2 = Math.floor(starAngle / (Math.PI * 2) * 10);
      const frac = (starAngle / (Math.PI * 2) * 10) - idx2;
      const r1 = idx2 % 2 === 0 ? starOuter : starInner;
      const r2 = (idx2 + 1) % 2 === 0 ? starOuter : starInner;
      const maxR = r1 + (r2 - r1) * frac;
      if (dist <= maxR) {
        setPixel(x2, y2, 240, 216, 97);
      }
    }
  }

  // NOBILIS text (simple block letters - "N")
  const letterY = cy + 110 * s;
  const letterSize = 35 * s;
  // Draw a large N
  for (let ly = 0; ly < letterSize; ly++) {
    // Left stroke
    for (let lx = 0; lx < letterSize * 0.2; lx++) {
      setPixel(cx - letterSize * 0.3 + lx, letterY + ly, 201, 162, 39);
    }
    // Right stroke
    for (let lx = 0; lx < letterSize * 0.2; lx++) {
      setPixel(cx + letterSize * 0.1 + lx, letterY + ly, 201, 162, 39);
    }
    // Diagonal
    const diagX = cx - letterSize * 0.1 + (ly / letterSize) * letterSize * 0.4;
    for (let dx2 = -letterSize * 0.1; dx2 < letterSize * 0.1; dx2++) {
      setPixel(diagX + dx2, letterY + ly, 201, 162, 39);
    }
  }
}

// Generate icons
const publicDir = path.join(__dirname, '..', 'public');

console.log('Generating logo192.png...');
const png192 = createPNG(192, 192, drawNobilisLogo);
fs.writeFileSync(path.join(publicDir, 'logo192.png'), png192);

console.log('Generating logo512.png...');
const png512 = createPNG(512, 512, drawNobilisLogo);
fs.writeFileSync(path.join(publicDir, 'logo512.png'), png512);

console.log('Generating favicon.ico (as PNG)...');
const png32 = createPNG(32, 32, drawNobilisLogo);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), png32);

console.log('Done! Icons generated in public/');
