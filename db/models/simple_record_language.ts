import s_expression from "s-expression"
import words from '../../util/words.ts'
import db from '../db.ts'
import { SnomedCategory } from '../../db.d.ts'

type ExpressionType = 'finding' | 'qualifier'

type ParsedExpression = {
  type: ExpressionType
  snomed_concept_id: string
  snomed_category?: SnomedCategory
  description?: {
    id: string
    term: string
  }
  qualifiers: ParsedExpression[]
}

export type FullParsedExpression = Required<ParsedExpression> & {
  qualifiers: FullParsedExpression[]
}

type SExpressionNode = string | SExpressionNode[]

function parseNode(node: SExpressionNode): ParsedExpression {
  if (!Array.isArray(node)) {
    throw new Error(`Expected array, got: ${JSON.stringify(node)}`)
  }

  const [type, snomed_concept_id, ...rest] = node

  if (type !== 'finding' && type !== 'qualifier') {
    throw new Error(`Expected 'finding' or 'qualifier', got: ${JSON.stringify(type)}`)
  }

  if (typeof snomed_concept_id !== 'string') {
    throw new Error(`Expected snomed_concept_id to be a string, got: ${JSON.stringify(snomed_concept_id)}`)
  }

  const qualifiers = rest.map(parseNode)

  return {
    type,
    snomed_concept_id,
    qualifiers,
  }
}

export function parseFindingExpression(expression: string): ParsedExpression {
  const parsed = s_expression(expression)
  const result = parseNode(parsed)
  if (result.type !== 'finding') {
    throw new Error(`Expected top-level node to be "finding", got: ${JSON.stringify(result.type)}`)
  }
  return result
}

export function fromParsedExpression(parsed: ParsedExpression): string {
  const qualifiersStr = parsed.qualifiers.map(fromParsedExpression).join(' ')
  return qualifiersStr
    ? `(${parsed.type} ${parsed.snomed_concept_id} ${qualifiersStr})`
    : `(${parsed.type} ${parsed.snomed_concept_id})`
}

export async function fromFindingDescription(description: string): Promise<FullParsedExpression> {
  const description_words = words(description)
  
  // Search for a term in the database
  async function searchTerm(term: string) {
    const results = await db
      .selectFrom('snomed_description')
      .innerJoin(
        'snomed_concept',
        'snomed_description.concept_id',
        'snomed_concept.id'
      )
      .innerJoin(
        'snomed_inferred_canonical_name_and_category',
        'snomed_concept.id',
        'snomed_inferred_canonical_name_and_category.id'
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
      .execute()
    
    // Prefer "finding" over "morphologic abnormality"
    const finding = results.find(r => r.category === 'finding')
    if (finding) return finding
    
    const morphologicAbnormality = results.find(r => r.category === 'morphologic abnormality')
    if (morphologicAbnormality) return morphologicAbnormality
    
    const qualifierValue = results.find(r => r.category === 'qualifier value')
    if (qualifierValue) return qualifierValue
    
    return results[0] || null
  }
  
  // Try to match the whole description first
  const wholeMatch = await searchTerm(description)
  if (wholeMatch && (wholeMatch.category === 'finding' || wholeMatch.category === 'morphologic abnormality')) {
    return {
      type: 'finding',
      snomed_category: wholeMatch.category,
      snomed_concept_id: String(wholeMatch.concept_id),
      description: {
        id: String(wholeMatch.description_id),
        term: wholeMatch.term,
      },
      qualifiers: [],
    }
  }
  
  // Generate all possible n-grams (contiguous substrings of words)
  type Ngram = { term: string; indices: number[] }
  function getAllNgrams(input_words: string[]): Ngram[] {
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
  
  // Search all n-grams
  const ngrams = getAllNgrams(description_words)
  const matchPromises = ngrams.map(async ngram => ({
    ...ngram,
    match: await searchTerm(ngram.term),
  }))
  const matches = await Promise.all(matchPromises)
  
  // Find the main finding (prefer "finding" over "morphologic abnormality", prefer longer matches)
  const findingMatches = matches.filter(m =>
    m.match && (m.match.category === 'finding' || m.match.category === 'morphologic abnormality')
  )
  
  // Sort: prefer longer matches, then prefer "finding" over "morphologic abnormality"
  findingMatches.sort((a, b) => {
    const lenDiff = b.indices.length - a.indices.length
    if (lenDiff !== 0) return lenDiff
    if (a.match!.category === 'finding' && b.match!.category !== 'finding') return -1
    if (b.match!.category === 'finding' && a.match!.category !== 'finding') return 1
    return 0
  })
  
  const mainFinding = findingMatches[0]
  if (!mainFinding || !mainFinding.match) {
    throw new Error(`No finding found for description: ${description}`)
  }
  
  // Find qualifiers from remaining words
  const usedIndices = new Set(mainFinding.indices)
  const remainingWords = description_words.filter((_, i) => !usedIndices.has(i))
  
  // For each remaining word, search for qualifier
  const qualifiers: FullParsedExpression[] = []
  for (const word of remainingWords) {
    const match = await searchTerm(word)
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
    snomed_category: mainFinding.match.category,
    snomed_concept_id: String(mainFinding.match.concept_id),
    description: {
      id: String(mainFinding.match.description_id),
      term: mainFinding.match.term,
    },
    qualifiers,
  }
}