import { assertEquals } from 'std/assert/assert_equals.ts'
import { getAddressSuggestions } from '../../../../external-clients/google-maps.ts'
import { json } from '../../../../util/responses.ts'
import { OrganizationContext } from './_middleware.ts'
import { SERVER_COUNTRY } from '../../../../db/models/countries.ts'
import { assert } from 'std/assert/assert.ts'

// type GoogleMapsContext = {
//   url: URL
//   req: Request
// }

type AddressSuggestionResult = {
  id: string
  name: string
  label: string
  main_text: string
  secondary_text: string
}

export const handler = {
  async GET(ctx: OrganizationContext) {
    assertEquals(ctx.req.headers.get('accept'), 'application/json')

    const url = ctx.url

    const search_query = url.searchParams.get('search')
    const country = url.searchParams.get('country') || SERVER_COUNTRY
    const { location } = ctx.state.organization
    assert(location, 'Only supporting organizations with a location')

    if (!search_query) {
      return json({
        results: [],
        total: 0,
        page: 1,
        has_next_page: false,
      })
    }

    if (search_query !== null) {
      const suggestions = await getAddressSuggestions(search_query, {
        location,
        radius: location ? 50000 : undefined,
        country,
      })

      const results: AddressSuggestionResult[] = suggestions.map((s) => ({
        id: s.place_id,
        name: s.description,
        label: s.description,
        main_text: s.structured_formatting.main_text,
        secondary_text: s.structured_formatting.secondary_text,
      }))

      console.log('Address search results:', results)

      return json({
        results,
        total: results.length,
        page: 1,
        has_next_page: false,
      })
    }

    return json({
      results: [],
      total: 0,
      page: 1,
      has_next_page: false,
    })
  },
}
