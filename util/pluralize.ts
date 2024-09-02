const weirdPlurals = {
  diagnosis: 'diagnoses',
}

export const pluralize = (word: string, count: number): string =>
  count === 1 ? word : (weirdPlurals[word] || `${word}s`)
