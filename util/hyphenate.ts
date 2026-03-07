import words from './words.ts'

export function hyphenate(s: string): string {
  return words(s).map((word) => (word === '&' ? 'and' : word).toLowerCase()).join('-')
}
