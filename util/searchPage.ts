import { FreshContext } from '$fresh/server.ts'
import { assertOr400 } from './assertOr.ts'

export function searchPage({ url }: FreshContext<unknown>) {
  const page_search = url.searchParams.get('page')
  if (!page_search) return 1

  const page_int = parseInt(page_search)
  assertOr400(!isNaN(page_int), 'page must be a number')
  assertOr400(page_int > 0, 'page must be greater than 0')

  return page_int
}
