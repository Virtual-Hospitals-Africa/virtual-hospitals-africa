export default function capLengthAt(length: number): (str: string) => string {
  return function (str: string): string {
    return str.length <= length ? str : str.slice(0, length - 3) + '...'
  }
}

export const capLengthAtWhatsAppDescription = capLengthAt(72)

export const capLengthAtWhatsAppTitle = capLengthAt(24)
