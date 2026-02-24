export function indexOf(str: string, pattern: string | RegExp) {
  if (typeof pattern === 'string') return str.indexOf(pattern)
  const match = str.match(pattern)
  if (!match) return -1
  return match.index!
}
