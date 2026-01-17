import { assertEquals } from 'std/assert/assert_equals.ts'
import { json } from './responses.ts'
import { getAddressSuggestions, getPlaceDetails } from '../external-clients/google-maps.ts'
import type { Coordinates } from '../types.ts'

type GoogleMapsContext = {
  url: URL
  req: Request
}

type AddressSuggestionResult = {
  id: string
  name: string
  label: string
  main_text: string
  secondary_text: string
}

export function addressSearchHandler<Ctx extends GoogleMapsContext>(
  options?: {
    get_location?: (ctx: Ctx) => Coordinates | undefined
    country?: string | ((ctx: Ctx) => string | undefined)
  },
) {
  return {
    async GET(ctx: Ctx) {
      assertEquals(ctx.req.headers.get('accept'), 'application/json')

      const url = ctx.url

      const search_query = url.searchParams.get('search')
      const place_id = url.searchParams.get('place_id')

      if (!search_query && !place_id) {
        return json({
          results: [],
          total: 0,
          page: 1,
          has_next_page: false,
        })
      }

      if (search_query !== null) {
        const location = options?.get_location?.(ctx)

        const country = typeof options?.country === 'function' ? options.country(ctx) : options?.country

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

      if (place_id) {
        const details = await getPlaceDetails(place_id)
        return json(details)
      }

      return json({
        results: [],
        total: 0,
        page: 1,
        has_next_page: false,
      })
    },
  }
}
