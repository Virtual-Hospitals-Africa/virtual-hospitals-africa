import s_expression from 's-expression'
import words from '../../util/words.ts'
import db from '../db.ts'
import { SnomedCategory } from '../../db.d.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { assert } from 'std/assert/assert.ts'
import { arrayIsEmpty } from '../../util/arraySize.ts'
import { orderByArrayPosition } from '../helpers.ts'
import { TrxOrDb } from '../../types.ts'
import { getAllNgrams } from '../../util/ngrams.ts'

export type ParsedFindingExpression = {
  type: 'finding'
  snomed_concept_id: string
  qualifiers: ParsedQualifierOrNotExpression[]
}

export type ParsedQualifierOrNotExpression =
  | ParsedQualifierExpression
  | ParsedNotExpression

export type ParsedQualifierExpression = {
  type: 'qualifier'
  snomed_concept_id: string
  // May support this later
  // concrete_value?: any
  snomed_concept_id_value?: string
  qualifiers: ParsedQualifierOrNotExpression[]
}

export type ParsedNotExpression = {
  type: 'not'
  qualifier: ParsedQualifierExpression
}

export type ParsedExpression =
  | ParsedFindingExpression
  | ParsedQualifierExpression
  | ParsedNotExpression

export type SExpressionNode = string | SExpressionNode[]

const PARSERS = {
  finding: (node: SExpressionNode): ParsedFindingExpression => {
    assert(Array.isArray(node))
    const [type, snomed_concept_id, ...qualifiers] = node
    assertEquals(type, 'finding')
    if (typeof snomed_concept_id !== 'string') {
      throw new Error(
        `Expected snomed_concept_id to be a string, got: ${
          JSON.stringify(snomed_concept_id)
        }`,
      )
    }
    return {
      type: 'finding',
      snomed_concept_id,
      qualifiers: qualifiers.map(parseArrayNode).map((parsed) => {
        assert(
          parsed.type === 'qualifier' || parsed.type === 'not',
          `Expected parsed to be a qualifier or not expression, got: ${
            JSON.stringify(parsed.type)
          }`,
        )
        return parsed
      }),
    }
  },
  qualifier: (node: SExpressionNode): ParsedQualifierExpression => {
    assert(Array.isArray(node))
    const [type, snomed_concept_id, ...rest] = node
    assertEquals(type, 'qualifier')
    if (typeof snomed_concept_id !== 'string') {
      throw new Error(
        `Expected snomed_concept_id to be a string, got: ${
          JSON.stringify(snomed_concept_id)
        }`,
      )
    }
    if (arrayIsEmpty(rest)) {
      return {
        type: 'qualifier',
        snomed_concept_id,
        qualifiers: [],
      }
    }
    const [maybe_snomed_concept_id_value, ...qualifiers] = rest
    if (typeof maybe_snomed_concept_id_value === 'string') {
      return {
        type: 'qualifier',
        snomed_concept_id,
        snomed_concept_id_value: maybe_snomed_concept_id_value,
        qualifiers: qualifiers.map(parseArrayNode).map((parsed) => {
          assert(
            parsed.type === 'qualifier' || parsed.type === 'not',
            `Expected parsed to be a qualifier or not expression, got: ${
              JSON.stringify(parsed.type)
            }`,
          )
          return parsed
        }),
      }
    }
    return {
      type: 'qualifier',
      snomed_concept_id,
      qualifiers: rest.map(parseArrayNode).map((parsed) => {
        assert(
          parsed.type === 'qualifier' || parsed.type === 'not',
          `Expected parsed to be a qualifier or not expression, got: ${
            JSON.stringify(parsed.type)
          }`,
        )
        return parsed
      }),
    }
  },
  not: (node: SExpressionNode): ParsedNotExpression => {
    assert(Array.isArray(node))
    const [type, qualifier] = node
    assertEquals(type, 'not')
    if (!Array.isArray(qualifier)) {
      throw new Error(`Expected array, got: ${JSON.stringify(qualifier)}`)
    }
    return {
      type: 'not',
      qualifier: PARSERS.qualifier(qualifier),
    }
  },
}

const FROM_PARSERS = {
  finding: (parsed: ParsedFindingExpression): string => {
    const qualifiers = parsed.qualifiers.map(fromParsedExpression).join(' ')
    return qualifiers
      ? `(${parsed.type} ${parsed.snomed_concept_id} ${qualifiers})`
      : `(${parsed.type} ${parsed.snomed_concept_id})`
  },
  qualifier: (parsed: ParsedQualifierExpression): string => {
    const qualifiers = parsed.qualifiers.map(fromParsedExpression).join(' ')
    return qualifiers
      ? `(${parsed.type} ${parsed.snomed_concept_id} ${qualifiers})`
      : `(${parsed.type} ${parsed.snomed_concept_id})`
  },
  not: (parsed: ParsedNotExpression): string => {
    return `(not ${fromParsedExpression(parsed.qualifier)})`
  },
}

function parseArrayNode(node: SExpressionNode): ParsedExpression {
  assert(Array.isArray(node))
  const parser = PARSERS[node[0] as keyof typeof PARSERS]
  if (!parser) {
    throw new Error(`Unknown node type: ${JSON.stringify(node[0])}`)
  }
  return parser(node)
}

export function parseFindingExpression(
  expression: string,
): ParsedFindingExpression {
  const parsed = s_expression(expression)
  if (parsed instanceof Error) {
    throw parsed
  }
  const result = parseArrayNode(parsed)
  if (result.type !== 'finding') {
    throw new Error(
      `Expected top-level node to be "finding", got: ${
        JSON.stringify(result.type)
      }`,
    )
  }
  return result
}

export function fromParsedExpression(parsed: ParsedExpression): string {
  // deno-lint-ignore no-explicit-any
  return FROM_PARSERS[parsed.type](parsed as any)
}

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
    description: {
      id: String(main_finding.match.description_id),
      term: main_finding.match.term,
    },
    qualifiers,
  }
}
