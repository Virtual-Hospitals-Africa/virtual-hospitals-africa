import { searchResponse } from '../drugs.tsx'
import { LoggedInHealthWorkerHandlerWithProps } from '../../types.ts'

export const handler: LoggedInHealthWorkerHandlerWithProps<unknown> = {
  GET(_req, ctx) {
    const search = ctx.url.searchParams.get('search')
    return searchResponse(search)
  },
}
