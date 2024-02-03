import { assert } from 'std/assert/assert.ts'
import levenshtein from 'fast-levenshtein'
import { assertEquals } from 'std/assert/assert_equals.ts'

function * asTrigrams(phrase: string) {
  for (let i = phrase.length - 3; i >= 0; i = i - 1 ) {
    yield phrase.slice(i, i + 3 )
  }
}

type SearchResult = { phrase: string, distance: number, index: number }

export class TrigramIndex {
  public trigram_index = new Map<string, number[]>();
  public terms: string[][] = []
  constructor(public phrases: string[]) {
    this.phrases.forEach((phrase, index) => this.index(phrase, index));
    assertEquals(this.phrases.length, this.terms.length)
  }

  static deserialize(data: { phrases: string[], trigram_index: [string, number[]][] }): TrigramIndex {
    return Object.setPrototypeOf({
      phrases: data.phrases,
      trigram_index: new Map(data.trigram_index)
    }, TrigramIndex.prototype);
  }

  index(phrase: string, index: number) {
    assert(phrase, "phrase is required");
    assert(phrase === phrase.toLowerCase(), "phrase must be lowercase");
    for (const trigram of asTrigrams(phrase)) {
      if (!this.trigram_index.has(trigram)) {
        this.trigram_index.set(trigram, [index]);
      } else {
        this.trigram_index.get(trigram)!.push(index);
      }
    }
    const terms = phrase.split(' ')
    this.terms.push(terms)
  }

  serialize() {
    return {
      phrases: this.phrases,
      trigram_index: Array.from(this.trigram_index.entries())
    }
  }

  find(search: string, max_results = 25): SearchResult[] {
    search = search.toLowerCase();
    const phrase_matches = new Set<number>();
    const results: SearchResult[] = [];
    
    let at_max_results = false;
    let best_distance = Infinity;
    let threshold_distance = Infinity;
  
    for (const trigram of asTrigrams(search)) {
      const phrases_with_trigram = this.trigram_index.get(trigram);
      if (!phrases_with_trigram) continue
      for (const index of phrases_with_trigram) {
        if (phrase_matches.has(index)) continue
        phrase_matches.add(index);
        const phrase = this.phrases[index];
        const terms = this.terms[index]
        const overall_distance = levenshtein.get(search, phrase);
        const min_term_distance = Math.min(...terms.map(term => levenshtein.get(search, term)));
        const distance = Math.min(overall_distance, min_term_distance)
        if (at_max_results && (distance >= threshold_distance)) continue
        const result = { phrase, distance, index }

        if (distance <= best_distance) {
          results.unshift(result);
          best_distance = distance
        } else {
          // Binary insertion
          let low = 0;
          let high = results.length - 1;
          while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            if (results[mid].distance === distance) {
              low = mid
              break
            } else if (results[mid].distance < distance) {
              low = mid + 1;
            } else {
              high = mid - 1;
            }
          }
          results.splice(low, 0, result);
        }

        if (at_max_results) {
          results.pop()
          threshold_distance = results[results.length - 1].distance
        } else if (results.length === max_results) {
          at_max_results = true
          threshold_distance = results[results.length - 1].distance
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
