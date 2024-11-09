import { assert } from 'std/assert/assert.ts'
import type { SnomedConcepts } from '../../../db.d.ts'
import { searchConcepts } from '../../../external-clients/snowstorm.ts'
import type { ConceptMini } from '../../../external-clients/snowstorm/data-contracts.ts'
import { jsonSearchHandler } from '../../../util/jsonSearchHandler.ts'

type SearchTerms = {
  search: string
}

const rows_per_page = 10

function toInternalSnomedConcept(result: ConceptMini): SnomedConcepts {
  assert(result.conceptId)
  assert(result.pt?.term)
  return {
    snomed_concept_id: result.conceptId,
    snomed_english_term: result.pt?.term,
  }
}

export const handler = jsonSearchHandler({
  async search(_trx, search_terms: SearchTerms, { page }) {
    // SNOMED Expression Constraint Language
    // https://confluence.ihtsdotools.org/display/DOCECL?preview=/33493263/212338993/doc_ExpressionConstraintLanguage_v2.2-en-US_INT_20231122.pdf
    // https://browser.ihtsdotools.org/?perspective=full&conceptId1=609328004&edition=MAIN/2024-11-01&release=&languages=en
    // This is the code for Allergic Disposition (finding)
    const ecl = '<< 609328004'
    const offset = rows_per_page * (page - 1)
    console.time('searchConcepts')

    if (search_terms.search.length < 3) {
      return {
        page,
        rows_per_page,
        results: [],
        search_terms,
        has_next_page: false,
      }
    }

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
  },
})
