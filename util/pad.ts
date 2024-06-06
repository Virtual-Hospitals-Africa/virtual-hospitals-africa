export function padLeft(
  str: string,
  len: number,
  padChar = ' ',
): string {
  while (str.length < len) {
    str = padChar + str
  }
  return str
}

export function padTime(num?: number): string {
  return num ? padLeft(String(num), 2, '0') : '00'
}
