import { jsonSearchHandler } from '../../../util/jsonSearchHandler.ts'
import { search } from './concepts.ts'

type SearchTerms = {
  search: string
}

export const handler = jsonSearchHandler({
  search: (_trx, search_terms: SearchTerms, { page }) =>
    search(_trx, {
      ...search_terms,
      parent_codes: '609328004',
    }, { page }),
})
