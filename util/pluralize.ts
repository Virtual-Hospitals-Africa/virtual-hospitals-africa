import { assert } from 'std/assert/assert.ts'

const weirdPlurals: Record<string, string> = {
  diagnosis: 'diagnoses',
}

export const pluralize = (word: string, count: number): string =>
  count === 1 ? word : (weirdPlurals[word] || `${word}s`)

export const unpluralize = (word: string, count: number): string => {
  assert(word.endsWith('s'))
  assert(!word.endsWith('es'))
  return count === 1 ? word.slice(0, -1) : word
}
