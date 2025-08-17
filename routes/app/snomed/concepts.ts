import { assert } from 'std/assert/assert.ts'
import { searchConcepts } from '../../../external-clients/snowstorm.ts'
import { jsonSearchHandler } from '../../../util/jsonSearchHandler.ts'
import type { ConceptMini } from '../../../external-clients/snowstorm/data-contracts.ts'
import { positive_number } from '../../../util/validators.ts'
import type { TrxOrDb } from '../../../types.ts'

type SearchTerms = {
  search: string
  parent_codes?: string
}

const rows_per_page = 10

export type SnomedConceptResult = {
  id: string
  name: string
}

export function toInternalSnomedConcept(
  { conceptId, pt }: ConceptMini,
): {
  id: string
  name: string
} {
  const snomed_concept_id = positive_number.parse(conceptId)
  assert(pt?.term)
  return {
    id: String(snomed_concept_id),
    name: pt?.term,
  }
}

export async function search(
  _trx: TrxOrDb,
  search_terms: SearchTerms,
  { page }: { page: number },
) {
  assert(search_terms.parent_codes, 'parent_codes is required')
  // SNOMED Expression Constraint Language
  // https://confluence.ihtsdotools.org/display/DOCECL?preview=/33493263/212338993/doc_ExpressionConstraintLanguage_v2.2-en-US_INT_20231122.pdf
  const ecl = search_terms.parent_codes.split(',').map((code) => `<< ${code}`)
    .join(
      ' OR ',
    )

  const offset = rows_per_page * (page - 1)
  console.time('searchConcepts')
  const response = await searchConcepts({
    ecl,
    term: search_terms.search,
    activeFilter: true,
    termActive: true,
    limit: rows_per_page,
    offset,
  }).catch((err) => {
    console.error(err)
    return { data: { items: [], total: 0 } }
  })
    .finally(() => {
      console.timeEnd('searchConcepts')
    })

  const results = response.data.items!.map(toInternalSnomedConcept)
  return {
    page,
    rows_per_page,
    results,
    search_terms,
    has_next_page: response.data.total! > offset + rows_per_page,
  }
}

export const handler = jsonSearchHandler({ search })
