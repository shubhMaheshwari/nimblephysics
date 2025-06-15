// Detect environment
const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;

async function readNimbleRecording(filePathOrUrl) {
  let buffer;

  if (isNode) {
    // Node.js: use fs and zlib
    const fs = require('fs');
    const zlib = require('zlib');
    const filePath = filePathOrUrl;
    const gunzip = zlib.createGunzip();
    const input = fs.createReadStream(filePath);

    buffer = await new Promise((resolve, reject) => {
      let chunks = [];
      input.pipe(gunzip);
      gunzip.on('data', chunk => chunks.push(chunk));
      gunzip.on('end', () => resolve(Buffer.concat(chunks)));
      gunzip.on('error', reject);
    });
  } else {
    // Browser: use fetch and DecompressionStream
    const url = filePathOrUrl;
    const response = await fetch(url);
    if (!response.ok || !response.body) throw new Error("Failed to fetch file");
    let stream = response.body;
    if (url.endsWith('.gz')) {
      stream = stream.pipeThrough(new DecompressionStream('gzip'));
    }
    const reader = stream.getReader();
    let chunks = [];
    let totalLength = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        totalLength += value.length;
      }
    }
    buffer = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      buffer.set(chunk, offset);
      offset += chunk.length;
    }
  }

  // Parse frames
  let cursor = 0;
  let frameIdx = 0;
  const frames = [];
  while (cursor + 4 <= buffer.length) {
    // Read 4 bytes for frame size (little-endian uint32)
    let frameSize;
    if (isNode) {
      frameSize = buffer.readUInt32LE(cursor);
    } else {
      frameSize = buffer[cursor] | (buffer[cursor+1] << 8) | (buffer[cursor+2] << 16) | (buffer[cursor+3] << 24);
    }
    cursor += 4;
    if (frameSize === 0) break; // End of frames
    if (cursor + frameSize > buffer.length) {
      console.log('Incomplete frame at end of file.');
      break;
    }
    const frameBytes = buffer.slice(cursor, cursor + frameSize);
    frames.push(frameBytes);
    console.log(`Frame ${frameIdx}: size=${frameSize} bytes`);
    cursor += frameSize;
    frameIdx++;
  }
  console.log(`Total frames: ${frames.length}`);
}

// Usage (Node.js):
if (typeof process !== 'undefined' && process.argv && process.argv[1] && process.argv[1].endsWith('read-nimble-recording-unified.js')) {
  if (process.argv.length < 3) {
    console.error('Usage: node read-nimble-recording-unified.js <path-to-file.gz>');
    process.exit(1);
  }
  readNimbleRecording(process.argv[2]);
}

// Usage (Browser):
// readNimbleRecording('yourfile.gz');