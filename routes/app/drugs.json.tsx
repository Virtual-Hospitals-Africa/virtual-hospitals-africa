import { searchResponse } from './drugs.tsx'
import { LoggedInHealthWorkerHandler } from '../../types.ts'

export const handler: LoggedInHealthWorkerHandler<unknown> = {
  GET(_req, ctx) {
    return searchResponse(ctx)
  },
}
