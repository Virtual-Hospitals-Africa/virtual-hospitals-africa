import { assert } from 'std/assert/assert.ts'
import levenshtein from 'fast-levenshtein'
import { assertEquals } from 'std/assert/assert_equals.ts'

function* asTrigrams(phrase: string) {
  for (let i = phrase.length - 3; i >= 0; i = i - 1) {
    yield phrase.slice(i, i + 3)
  }
}

type SearchResult = { phrase: string; distance: number; indexes: number[] }

type Serialized = {
  phrases: string[]
  trigram_index: [string, string[]][]
  terms: [string, string[]][]
  unique_phrases: [string, number[]][]
}

export class TrigramIndex {
  public trigram_index = new Map<string, string[]>()
  public terms = new Map<string, string[]>()
  public unique_phrases = new Map<string, number[]>()
  constructor(public phrases: string[]) {
    this.phrases.forEach((phrase, index) => this.index(phrase, index))
  }

  static deserialize(serialized: Serialized): TrigramIndex {
    return Object.setPrototypeOf({
      phrases: serialized.phrases,
      trigram_index: new Map(serialized.trigram_index),
      terms: new Map(serialized.terms),
      unique_phrases: new Map(serialized.unique_phrases),
    }, TrigramIndex.prototype)
  }

  serialize(): Serialized {
    return {
      phrases: this.phrases,
      trigram_index: Array.from(this.trigram_index.entries()),
      terms: Array.from(this.terms.entries()),
      unique_phrases: Array.from(this.unique_phrases.entries()),
    }
  }

  index(phrase: string, index: number) {
    assert(phrase, 'phrase is required')
    assert(phrase === phrase.toLowerCase(), 'phrase must be lowercase')
    if (this.unique_phrases.has(phrase)) {
      this.unique_phrases.get(phrase)!.push(index)
      return
    }
    this.unique_phrases.set(phrase, [index])
    for (const trigram of asTrigrams(phrase)) {
      if (!this.trigram_index.has(trigram)) {
        this.trigram_index.set(trigram, [phrase])
      } else {
        this.trigram_index.get(trigram)!.push(phrase)
      }
    }
    const terms = phrase.split(' ')
    this.terms.set(phrase, terms)
  }

  find(search: string, max_results = 25): SearchResult[] {
    search = search.toLowerCase()
    const phrase_matches = new Set<string>()
    const results: SearchResult[] = []

    let results_size = 0
    let best_distance = Infinity
    let threshold_distance = Infinity

    for (const trigram of asTrigrams(search)) {
      const phrases_with_trigram = this.trigram_index.get(trigram)
      if (!phrases_with_trigram) continue
      for (const phrase of phrases_with_trigram) {
        if (phrase_matches.has(phrase)) continue
        phrase_matches.add(phrase)
        const terms = this.terms.get(phrase)!
        const overall_distance = levenshtein.get(search, phrase)
        const min_term_distance = Math.min(
          ...terms.map((term) => levenshtein.get(search, term)),
        )

        const distance = min_term_distance * 64 + overall_distance

        assertEquals(
          results_size,
          results.reduce((acc, result) => acc + result.indexes.length, 0),
        )
        if ((results_size >= max_results) && (distance >= threshold_distance)) {
          continue
        }

        const indexes = this.unique_phrases.get(phrase)!
        const result = { phrase, distance, indexes }

        if (distance <= best_distance) {
          results.unshift(result)
          best_distance = distance
        } else {
          // Binary insertion
          let low = 0
          let high = results.length - 1
          while (low <= high) {
            const mid = Math.floor((low + high) / 2)
            if (results[mid].distance === distance) {
              low = mid
              break
            } else if (results[mid].distance < distance) {
              low = mid + 1
            } else {
              high = mid - 1
            }
          }
          results.splice(low, 0, result)
        }

        results_size += indexes.length

        while (
          results_size - results[results.length - 1].indexes.length >=
            max_results
        ) {
          const removed_result = results.pop()!
          threshold_distance = results[results.length - 1].distance
          results_size -= removed_result.indexes.length
        }
      }
    }

    return results
  }

  // Just using trigrams
  // find(search: string): SearchResult[] {
  //   const phrase_matches = new Map<number, number>();
  //   for (const trigram of asTrigrams(search)) {
  //     const phrases_with_trigram = this.trigram_index.get(trigram);
  //     if (!phrases_with_trigram) continue
  //     for (const phrase_index of phrases_with_trigram) {
  //       if (phrase_matches.has(phrase_index)) {
  //         phrase_matches.set(phrase_index, phrase_matches.get(phrase_index)! + 1);
  //       } else {
  //         phrase_matches.set(phrase_index, 1);
  //       }
  //     }
  //   }
  //   const results: SearchResult[] = [];
  //   phrase_matches.forEach((matches, index) => {
  //     results.push({ phrase: this.phrases[index], matches, index });
  //   })

  //   return sortBy(results, result => -result.matches);
  // }
}
