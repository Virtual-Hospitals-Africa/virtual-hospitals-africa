import { SearchResult } from '../../../../../../db/models/_base.ts'
import * as nearest_organizations from '../../../../../../db/models/nearest_organizations.ts'
import { jsonSearchHandler } from '../../../../../../util/jsonSearchHandler.ts'
import { EncounterContext } from './_middleware.tsx'

export const handler = jsonSearchHandler<
  nearest_organizations.SearchOpts,
  SearchResult<typeof nearest_organizations>,
  EncounterContext
>(nearest_organizations, (ctx) => ({
  location: ctx.state.encounter.location,
  excluding_id: ctx.state.encounter_provider.organization_id,
  has_doctors: true,
}), {
  verbose: true, // turn on to log every query
})
