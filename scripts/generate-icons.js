import fs from 'fs'
import path from 'path'
import { deflateSync } from 'zlib'

const iconDir = path.join(process.cwd(), 'public', 'icons')

if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir, { recursive: true })
}

const createPNG = (width, height, r, g, b) => {
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])
  
  const createChunk = (type, data) => {
    const length = Buffer.alloc(4)
    length.writeUInt32BE(data.length, 0)
    const typeBuffer = Buffer.from(type)
    const crcData = Buffer.concat([typeBuffer, data])
    let crc = 0xFFFFFFFF
    for (let i = 0; i < crcData.length; i++) {
      crc ^= crcData[i]
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0)
      }
    }
    crc ^= 0xFFFFFFFF
    const crcBuffer = Buffer.alloc(4)
    crcBuffer.writeUInt32BE(crc >>> 0, 0)
    return Buffer.concat([length, typeBuffer, data, crcBuffer])
  }
  
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0
  
  const rawData = []
  for (let y = 0; y < height; y++) {
    rawData.push(0)
    for (let x = 0; x < width; x++) {
      const cx = width / 2, cy = height / 2
      const dist = Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cy, 2))
      if (dist < Math.min(width, height) * 0.35) {
        rawData.push(r, g, b, 255)
      } else {
        rawData.push(248, 250, 252, 255)
      }
    }
  }
  
  const compressed = deflateSync(Buffer.from(rawData))
  
  const ihdrChunk = createChunk('IHDR', ihdr)
  const idatChunk = createChunk('IDAT', compressed)
  const iendChunk = createChunk('IEND', Buffer.alloc(0))
  
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk])
}

const blue = [59, 130, 246]

for (const size of [192, 512]) {
  const png = createPNG(size, size, ...blue)
  fs.writeFileSync(path.join(iconDir, `icon-${size}.png`), png)
  console.log(`Generated public/icons/icon-${size}.png`)
}

console.log('✅ All icons generated successfully')