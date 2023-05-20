export default function padLeft(
  str: string,
  len: number,
  padChar = ' ',
): string {
  while (str.length < len) {
    str = padChar + str
  }
  return str
}
