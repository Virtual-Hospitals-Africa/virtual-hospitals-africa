export function capLengthAt(str: string, length: number): string {
  return str.length <= length ? str : str.slice(0, length - 3) + '...'
}

export function capLengthAtWhatsAppDescription(str: string): string {
  return capLengthAt(str, 72)
}

export function capLengthAtWhatsAppTitle(str: string): string {
  return capLengthAt(str, 24)
}
