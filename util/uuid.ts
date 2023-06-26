export default function generateUUID(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)

  // Set the UUID version and variant
  bytes[6] = (bytes[6] & 0x0f) | 0x40 // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80 // variant 1

  const hexBytes = Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))

  const uuid = `${hexBytes.slice(0, 4).join('')}-${
    hexBytes.slice(4, 6).join('')
  }-${hexBytes.slice(6, 8).join('')}-${hexBytes.slice(8, 10).join('')}-${
    hexBytes.slice(10).join('')
  }`
  return uuid
}
