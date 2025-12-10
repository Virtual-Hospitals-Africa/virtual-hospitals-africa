// Generate all possible n-grams (contiguous substrings of words)
type Ngram = { term: string; indices: number[] }

export function getAllNgrams(input_words: string[]): Ngram[] {
  const ngrams: Ngram[] = []
  for (let size = input_words.length; size >= 1; size--) {
    for (let i = 0; i <= input_words.length - size; i++) {
      const indices = Array.from({ length: size }, (_, j) => i + j)
      ngrams.push({
        term: input_words.slice(i, i + size).join(' '),
        indices,
      })
    }
  }
  return ngrams
}
