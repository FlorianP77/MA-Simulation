export function peekBit(buffer, offset) {
  return extractBits(buffer, offset, 1)
}

export function extractSignedInt(buffer, offset, numBits) {
  if (peekBit(buffer, 8 * offset) === 1) {
    return -extractBits(buffer, 8 * offset + 1, numBits - 1);
  }
  return extractBits(buffer, 8 * offset, numBits);
}

export function extractBits(data, startBit, numBits) {
  if (numBits > 31 && peekBit(data, startBit) === 1) {
    throw new Error(`extractBit not implemeted for too many bits ${numBits}, ${peekBit(data, startBit)}`);
  }
  let byteOffset = Math.floor(startBit / 8);
  let bitOffset = startBit % 8;
  let extractedValue = 0;

  for (let i = 0; i < numBits; i++) {
    let currentByte = data[byteOffset];
    let bit = (currentByte >> (7 - bitOffset)) & 1;
    extractedValue = (extractedValue << 1) | bit;
    bitOffset++;
    if (bitOffset === 8) {
      bitOffset = 0;
      byteOffset++;
    }
  }

  return extractedValue;
}

