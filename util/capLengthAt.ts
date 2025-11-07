export function capLengthAt(length: number): (str: string) => string {
  return function (str: string): string {
    return str.length <= length ? str : str.slice(0, length - 3) + '...'
  }
}

export const capLength_at_whats_app_description = capLengthAt(72)

export const capLength_at_whats_app_title = capLengthAt(24)
