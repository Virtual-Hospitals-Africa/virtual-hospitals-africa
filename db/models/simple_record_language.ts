import words from '../../util/words.ts'
import db from '../db.ts'
import { SnomedCategory } from '../../db.d.ts'
import { orderByArrayPosition } from '../helpers.ts'
import { TrxOrDb } from '../../types.ts'
import { getAllNgrams } from '../../util/ngrams.ts'
import {
  ParsedFindingExpression,
  ParsedQualifierExpression,
} from '../../shared/s_expression.ts'

type ParsedQualifierExpressionWithDescription = ParsedQualifierExpression & {
  snomed_category: SnomedCategory
  description: {
    id: string
    term: string
  }
  qualifiers: ParsedQualifierExpressionWithDescription[]
}

type ParsedFindingExpressionWithDescription = ParsedFindingExpression & {
  snomed_category: SnomedCategory
  description: {
    id: string
    term: string
  }
  qualifiers: ParsedQualifierExpressionWithDescription[]
}

// Search for a term in the database
function searchTerm(
  trx: TrxOrDb,
  term: string,
) {
  return trx
    .selectFrom('snomed_description')
    .innerJoin(
      'snomed_concept',
      'snomed_description.concept_id',
      'snomed_concept.id',
    )
    .innerJoin(
      'snomed_inferred_canonical_name_and_category',
      'snomed_concept.id',
      'snomed_inferred_canonical_name_and_category.id',
    )
    .where('snomed_description.term', 'ilike', term)
    .where('snomed_description.active', '=', true)
    .where('snomed_concept.active', '=', true)
    .select([
      'snomed_description.id as description_id',
      'snomed_description.term',
      'snomed_concept.id as concept_id',
      'snomed_inferred_canonical_name_and_category.category',
    ])
    .orderBy(
      (eb) =>
        orderByArrayPosition(
          eb,
          'snomed_inferred_canonical_name_and_category.category',
          ['finding', 'disorder', 'morphologic abnormality', 'qualifier value'],
        ),
      'desc',
    )
    .limit(1)
    .executeTakeFirst()
}

const FINDING_LIKE = ['finding', 'disorder', 'morphologic abnormality']

// This is somewhat suspect, not for production use
export async function fromFindingDescription(
  description: string,
): Promise<ParsedFindingExpressionWithDescription> {
  const description_words = words(description)

  // Try to match the whole description first
  const whole_match = await searchTerm(db, description)
  if (
    whole_match &&
    FINDING_LIKE.includes(whole_match.category)
  ) {
    return {
      type: 'finding',
      snomed_category: whole_match.category,
      snomed_concept_id: String(whole_match.concept_id),
      value_snomed_concept_id: null,
      description: {
        id: String(whole_match.description_id),
        term: whole_match.term,
      },
      qualifiers: [],
    }
  }

  // Search all n-grams
  const ngrams = getAllNgrams(description_words)
  const match_promises = ngrams.map(async (ngram) => ({
    ...ngram,
    match: await searchTerm(db, ngram.term),
  }))
  const matches = await Promise.all(match_promises)

  // Find the main finding (prefer "finding" over "morphologic abnormality", prefer longer matches)
  const finding_matches = matches.filter((m) =>
    m.match &&
    FINDING_LIKE.includes(m.match.category)
  ).sort((a, b) => b.indices.length - a.indices.length)

  const main_finding = finding_matches[0]
  if (!main_finding || !main_finding.match) {
    throw new Error(`No finding found for description: ${description}`)
  }

  // Find qualifiers from remaining words
  const used_indexes = new Set(main_finding.indices)
  const remaining_words = description_words.filter((_, i) =>
    !used_indexes.has(i)
  )

  // For each remaining word, search for qualifier
  const qualifiers: ParsedQualifierExpressionWithDescription[] = []
  for (const word of remaining_words) {
    const match = await searchTerm(db, word)
    if (match) {
      qualifiers.push({
        type: 'qualifier',
        snomed_category: match.category,
        snomed_concept_id: String(match.concept_id),
        value_snomed_concept_id: null,
        description: {
          id: String(match.description_id),
          term: match.term,
        },
        qualifiers: [],
      })
    }
  }

  return {
    type: 'finding',
    snomed_category: main_finding.match.category,
    snomed_concept_id: String(main_finding.match.concept_id),
    value_snomed_concept_id: null,
    description: {
      id: String(main_finding.match.description_id),
      term: main_finding.match.term,
    },
    qualifiers,
  }
}
