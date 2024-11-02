import { assert } from 'std/assert/assert.ts'
import { searchConcepts } from '../../../external-clients/snowstorm.ts'
import { jsonSearchHandler } from '../../../util/jsonSearchHandler.ts'

type SearchTerms = {
  search: string
  parent_codes: string
}

const rows_per_page = 50

export const handler = jsonSearchHandler({
  async search(_trx, search_terms: SearchTerms, { page }) {
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
    })
    console.timeEnd('searchConcepts')

    console.log('response', response)
    const results = response.data.items!.map((item) => ({
      ...item,
      name: item.pt!.term!,
    }))
    return {
      page,
      rows_per_page,
      results,
      search_terms,
      has_next_page: response.data.total! > offset + rows_per_page,
    }
  },
})
