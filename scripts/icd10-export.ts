import { XMLParser } from 'fast-xml-parser'
// import { Handlers, PageProps } from '$fresh/server.ts'
import { ICD10Index, ICD10IndexTerm, ICD10Searchable } from '../shared/icd10.ts'
import { assert } from 'std/assert/assert.ts'
import partition from '../util/partition.ts'
import words from '../util/words.ts'
import natural from 'natural'

const parser = new XMLParser()

export const icd10_index: ICD10Index = await Deno.readTextFile(
  'db/resources/icd10/icd10cm-index-April-2024.xml',
).then(
  (data) =>
    parser.parse(
      data.replace('<title>false</title>', '<title>False</title>').replace(
        '<title>true</title>',
        '<title>True</title>',
      ),
    ),
)

const to_export = []

type TidiedTerm = {
  title: string
  title_lower_words: string[]
  code?: string
  see?: string
  seeAlso?: string
  term?: TidiedTerm[]
  coding_notes?: string
  nemod?: string
  is_subcat?: boolean
  aliases?: string[]
}

const nounInflector = new natural.NounInflector()

function lowerWords(x: string) {
  x = x?.toLowerCase().replace(',', '').replace('(of)', '')
  return Array.from(words(x))
}

function tidyTerm(x: any): TidiedTerm {
  if (!x) return x
  if (typeof x !== 'object') return x
  let { title, term, code, subcat, ...to_return } = x
  const extra: any = {}
  if (title === false) {
    title = 'false'
  } else if (title === true) {
    title = 'true'
  }
  if (!title) {
    console.log(x)
    throw new Error('no title')
  }
  let split_title: string
  let nemod = null
  if (typeof title === 'object' && title['#text']) {
    if (
      typeof title['#text'] !== 'string' && typeof title['#text'] !== 'number'
    ) {
      console.log(x)
      throw new Error('title is not a string')
    }
    assert(typeof title.nemod === 'string', JSON.stringify(title))
    split_title = String(title['#text'])
    nemod = title.nemod
  } else {
    split_title = String(title)
  }
  const [use_title_pre2, coding_notes] = split_title.split(' - code ')
  const [use_title_pre1, see] = use_title_pre2.split(/ --? see? /)
  const [use_title, omit] = use_title_pre1.split(/- omit code/)
  extra.title = use_title.trim()
  extra.title_lower_words = lowerWords(extra.title)
  if (coding_notes) {
    extra.coding_notes = coding_notes
  }
  if (nemod) {
    if (nemod.startsWith('(see ')) {
      assert(!extra.see)
      extra.see = nemod.slice(5, -1)
    } else {
      extra.nemod = nemod
    }
  }
  if (see) {
    assert(!extra.see)
    extra.see = see
  }
  if (typeof omit === 'string') {
    assert(!extra.coding_notes)
    extra.coding_notes = 'omit'
  }

  if (term) {
    if (Array.isArray(term)) {
      extra.term = term.map((t) => tidyTerm(t))
    } else {
      extra.term = [tidyTerm(term)]
    }
  }
  if (code) {
    extra.code = code
  }
  if (subcat) {
    extra.code = subcat
    extra.is_subcat = true
  }
  return { ...extra, ...to_return }
}

for (const letter of icd10_index['ICD10CM.index'].letter) {
  for (const mainTerm of letter.mainTerm) {
    to_export.push(tidyTerm(mainTerm))
  }
}

function hasAnyCode(x: TidiedTerm) {
  if (x.code) return true
  if (x.term) {
    for (const term of x.term) {
      if (hasAnyCode(term)) return true
    }
  }
  return false
}

const [with_codes, without_codes] = partition(to_export, (x) => hasAnyCode(x))

function assertAllHaveSeeOrSeeAlsoOrCodingNotes(x: TidiedTerm) {
  if (!x.term) {
    console.log(x)
    assert(x.see || x.seeAlso || x.coding_notes)
    return
  }
  for (const term of x.term) {
    assertAllHaveSeeOrSeeAlsoOrCodingNotes(term)
  }
}

const [neoplasms, other_without_codes_pre2] = partition(
  without_codes,
  (x) => !!x.see?.startsWith('Neoplasm'),
)
const [drugs, other_without_codes_pre1] = partition(
  other_without_codes_pre2,
  (x) => !!x.see?.startsWith('Table of Drugs'),
)
const [injury, other_without_codes] = partition(
  other_without_codes_pre1,
  (x) => !!x.see?.startsWith('Index to External Causes of Injury'),
)

const matching_words = [
  [['b', 'cell', 'type'], []],
]

function wordsMatch(test_words: string[], candidate_words: string[]) {
  test_words.every((word, i) => {
    const candidate_word = candidate_words[i]
    if (!candidate_word) return false
    return word === candidate_word ||
      nounInflector.singularize(word) ===
        nounInflector.singularize(candidate_word) ||
      natural.PorterStemmer.stem(word) ===
        natural.PorterStemmer.stem(candidate_word)
  })
}

function findMatchingTerm(
  see_words: string[],
  candidates: TidiedTerm[],
): { found: true; match: TidiedTerm } | {
  found: false
  candidates?: TidiedTerm[]
} {
  let testLength: number = see_words.length
  let bestMatch: TidiedTerm | undefined

  while (testLength) {
    const test_words = see_words.slice(0, testLength)
    const matching_candidates = candidates.filter((candidate) => {
      if (!candidate.title_lower_words) {
        console.log(candidate)
        throw new Error('no title_lower_words')
      }
      const candidate_words = candidate.title_lower_words.slice(0, testLength)
      return test_words.every((word, i) => {
        const candidate_word = candidate_words[i]
        if (!candidate_word) return false
        return word === candidate_word ||
          nounInflector.singularize(word) ===
            nounInflector.singularize(candidate_word) ||
          natural.PorterStemmer.stem(word) ===
            natural.PorterStemmer.stem(candidate_word)
      })
    })
    if (matching_candidates.length === 1) {
      bestMatch = matching_candidates[0]
      break
    }
    if (matching_candidates.length > 1) {
      if (testLength > 1) {
        return { found: false, candidates: matching_candidates }
      }
      const candidates_with_one_word = matching_candidates.filter(
        (candidates) => candidates.title_lower_words.length === 1,
      )
      if (candidates_with_one_word.length === 1) {
        bestMatch = candidates_with_one_word[0]
        break
      }
      if (candidates_with_one_word.length > 1) {
        const exact_matches = candidates_with_one_word.filter((candidate) => {
          return candidate.title_lower_words[0] === see_words[0]
        })
        if (exact_matches.length === 1) {
          bestMatch = exact_matches[0]
          break
        }
        if (exact_matches.length > 1) {
          console.log(see_words)
          console.log(exact_matches)
          throw new Error('multiple exact matches')
        }
      }
      return { found: false, candidates: matching_candidates }
    }

    testLength--
  }

  if (!bestMatch) {
    return {
      found: false,
      candidates: candidates.length > 100 ? undefined : candidates,
    }
  }

  const see_words_remaining = see_words.slice(testLength)
  if (!see_words_remaining.length) return { found: true, match: bestMatch }
  if (!bestMatch.term) {
    console.log('no bestMatch.term', bestMatch)
    console.log(see_words)
    console.log(see_words_remaining)

    if (!bestMatch.nemod) {
      return { found: false, candidates }
    }
    const nemod_words = lowerWords(bestMatch.nemod)
    assert(nemod_words.length === 1)
    const nemod_word = nemod_words[0]
    const title_lower_words_remaining = bestMatch.title_lower_words.slice(
      testLength,
    )
    const with_nemod_in_front = [nemod_word, ...title_lower_words_remaining]
    if (
      see_words_remaining.every((word, i) => word === with_nemod_in_front[i])
    ) {
      return { found: true, match: bestMatch }
    }

    throw new Error('no term')
  }
  return findMatchingTerm(see_words_remaining, bestMatch.term!)
}

const no_matching_could_be_found = []

for (const term of other_without_codes) {
  assertAllHaveSeeOrSeeAlsoOrCodingNotes(term)

  const see = term.see || term.seeAlso
  if (!see) continue

  const see_words = lowerWords(see)

  const matching_term = findMatchingTerm(see_words, with_codes)
  if (!matching_term?.found) {
    no_matching_could_be_found.push({
      term,
      candidates: matching_term?.candidates,
    })
    continue
  }
  matching_term.match.aliases = matching_term.match.aliases || []
  matching_term.match.aliases.push(term.title)

  // console.log('without', term)
  // console.log('zzz', matching_first_word)

  // const found = to_export.find(x => x.title_lower === see.toLowerCase())
  // if (!found) {
  //   console.log(term)
  //   throw new Error('see not found')
  // }
}

await Deno.writeTextFile(
  'db/resources/icd10/icd10cm-index-April-2024.json',
  JSON.stringify(to_export, null, 2),
)

await Deno.writeTextFile(
  'db/resources/icd10/icd10cm-index-April-2024-with-code.json',
  JSON.stringify(with_codes, null, 2),
)

await Deno.writeTextFile(
  'db/resources/icd10/icd10cm-index-April-2024-no-code.json',
  JSON.stringify(other_without_codes, null, 2),
)

await Deno.writeTextFile(
  'db/resources/icd10/icd10cm-index-April-2024-neoplasm.json',
  JSON.stringify(neoplasms, null, 2),
)

await Deno.writeTextFile(
  'db/resources/icd10/icd10cm-index-April-2024-drugs.json',
  JSON.stringify(drugs, null, 2),
)

await Deno.writeTextFile(
  'db/resources/icd10/icd10cm-index-April-2024-injury.json',
  JSON.stringify(injury, null, 2),
)

await Deno.writeTextFile(
  'db/resources/icd10/icd10cm-index-April-2024-no-matching.json',
  JSON.stringify(no_matching_could_be_found, null, 2),
)
