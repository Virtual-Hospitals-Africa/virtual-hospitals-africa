// deno-lint-ignore-file no-explicit-any
import { Kysely, sql } from 'kysely'
import { XMLParser } from 'fast-xml-parser'
import natural from 'natural'
import { assert } from 'std/assert/assert.ts'
// import partition from '../../util/partition.ts'
import words from '../../util/words.ts'
import inParallel from '../../util/inParallel.ts'
import { byCodeWithSimilarity } from '../models/icd10.ts'
import { searchFlat } from '../models/icd10.ts'
import { human_readable } from './20240215045435_icd10_tabular.ts'

type ICD10IndexTitle = string | {
  nemod: string
  '#text': string | number
}

type ICD10IndexTerm = {
  title: ICD10IndexTitle
  code?: string
  see?: string
  seeAlso?: string
  term?: ICD10IndexTerm | ICD10IndexTerm[]
}

type ICD10Index = {
  'ICD10CM.index': {
    letter: {
      title: string
      mainTerm: ICD10IndexTerm[]
    }[]
  }
}

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

export async function up(db: Kysely<unknown>) {
  await loadIndex(db)
}

export function down(db: Kysely<any>) {
  return db.deleteFrom('icd10_diagnoses_includes')
    .where('sourced_from_index', '=', true)
    .execute()
}

/* Remaining problems to solve:
    - determine if the index term is already in the "includes"
    - for the index terms that don't point to codes, look for the closest match
*/
async function loadIndex(db: Kysely<any>) {
  const icd10_index = await readICD10Index()
  await inParallel(parse(icd10_index), async (parsed) => {
    if (parsed.type === 'code') {
      const diag = await byCodeWithSimilarity(db, parsed.code, parsed.note)
      assert(diag)
      if (diag.best_similarity >= 0.85) return
      return db.insertInto('icd10_diagnoses_includes')
        .values({
          code: parsed.code,
          note: human_readable(parsed.note),
          sourced_from_index: true,
        })
        .execute()
    }
    if (parsed.type === 'see') {
      const [candidate] = await searchFlat(db, { term: parsed.see, limit: 1 })
      if (!candidate) {
        console.log('No match found for see: ', parsed)
        return
      }
      if (candidate.best_similarity < 0.80) {
        console.log('Low similarity for see: ', parsed, candidate)
        return
      }
      return db.insertInto('icd10_diagnoses_includes')
        .values({
          code: candidate.code,
          note: human_readable(parsed.note),
          sourced_from_index: true,
        })
        .execute()
    }
  }, { concurrency: 10 })
}

function* indexableTerms(term: TidiedTerm, prefix?: string): Generator<
  {
    type: 'code'
    code: string
    note: string
  } | {
    type: 'see'
    see: string
    note: string
  }
> {
  const title_words = words(term.title)
  assert(title_words[0])
  const shortest_word = title_words.reduce(
    (shortest, word) => (word.length < shortest.length ? word : shortest),
    title_words[0],
  )
  const shortest_word_lower = shortest_word.toLowerCase()
  const shortest_word_stem = natural.PorterStemmer.stem(shortest_word)
  const all_words_share_stem = title_words.every(
    (word) => {
      if (word.toLowerCase() === shortest_word.toLowerCase()) return true
      const stem = natural.PorterStemmer.stem(word)
      return stem === shortest_word_stem || stem === shortest_word_lower
    },
  )
  const note_continued = all_words_share_stem ? shortest_word : term.title

  const note = prefix ? `${prefix} ${note_continued}` : note_continued
  // TODO: revisit this
  // if (term.nemod) {
  //   note += ` ${term.nemod}`
  // }
  if (term.code) {
    yield {
      type: 'code' as const,
      code: term.code,
      note,
    }
  }
  if (term.see) {
    yield {
      type: 'see' as const,
      see: term.see,
      note,
    }
  }
  if (term.term) {
    for (const subterm of term.term) {
      yield* indexableTerms(subterm, note)
    }
  }
}

function* tidiedTerms(icd10_index: ICD10Index) {
  for (const letter of icd10_index['ICD10CM.index'].letter) {
    for (const mainTerm of letter.mainTerm) {
      yield tidyTerm(mainTerm)
    }
  }
}

export function* parse(icd10_index: ICD10Index) {
  for (const term of tidiedTerms(icd10_index)) {
    yield* indexableTerms(term)
    // if (hasAnyCode(term)) {
    //   yield {
    //     type: 'with_code' as const,
    //     term,
    //   }
    // } else if (term.see?.startsWith('Neoplasm')) {
    //   yield {
    //     type: 'neoplasm' as const,
    //     term,
    //   }
    // } else if (term.see?.startsWith('Table of Drugs')) {
    //   yield {
    //     type: 'drug' as const,
    //     term,
    //   }
    // } else if (term.see?.startsWith('Index to External Causes of Injury')) {
    //   yield {
    //     type: 'injury' as const,
    //     term,
    //   }
    // } else {
    //   yield {
    //     type: 'without_code' as const,
    //     term,
    //   }
    // }
  }

  // const [with_codes, without_codes] = partition(to_export, (x) => hasAnyCode(x))

  // const [neoplasms, other_without_codes_pre2] = partition(
  //   without_codes,
  //   (x) => !!x.see?.startsWith('Neoplasm'),
  // )
  // const [drugs, other_without_codes_pre1] = partition(
  //   other_without_codes_pre2,
  //   (x) => !!x.see?.startsWith('Table of Drugs'),
  // )
  // const [injury, other_without_codes] = partition(
  //   other_without_codes_pre1,
  //   (x) => !!x.see?.startsWith('Index to External Causes of Injury'),
  // )

  // const no_matching_could_be_found = []

  // for (const term of other_without_codes) {
  //   assertAllHaveSeeOrSeeAlsoOrCodingNotes(term)

  //   const see = term.see || term.seeAlso
  //   if (!see) continue

  //   const see_words = lowerWords(see)

  //   const matching_term = findMatchingTerm(see_words, with_codes)
  //   if (!matching_term?.found) {
  //     no_matching_could_be_found.push({
  //       term,
  //       candidates: matching_term?.candidates,
  //     })
  //     continue
  //   }
  //   matching_term.match.aliases = matching_term.match.aliases || []
  //   matching_term.match.aliases.push(term.title)
  // }

  // return {
  //   to_export,
  //   with_codes,
  //   without_codes,
  //   neoplasms,
  //   drugs,
  //   injury,
  //   no_matching_could_be_found,
  // }
}

async function readICD10Index(): Promise<ICD10Index> {
  const file_contents = await Deno.readTextFile(
    'db/resources/icd10/icd10cm-index-April-2024.xml',
  )
  const booleans_coerced = file_contents
    .replace('<title>false</title>', '<title>False</title>')
    .replace('<title>true</title>', '<title>True</title>')
  return new XMLParser().parse(booleans_coerced)
}

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
    extra.code = code.endsWith('.-')
      ? code.slice(0, -2)
      : code.endsWith('-')
      ? code.slice(0, -1)
      : code
  }
  if (subcat) {
    extra.code = subcat.endsWith('.-')
      ? subcat.slice(0, -2)
      : subcat.endsWith('-')
      ? subcat.slice(0, -1)
      : subcat
    extra.is_subcat = true
  }
  return { ...extra, ...to_return }
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

const nounInflector = new natural.NounInflector()

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
