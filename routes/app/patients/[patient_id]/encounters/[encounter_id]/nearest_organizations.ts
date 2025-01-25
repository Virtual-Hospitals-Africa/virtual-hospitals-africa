import * as nearest_organizations from '../../../../../../db/models/nearest_organizations.ts'
import { jsonSearchHandler } from '../../../../../../util/jsonSearchHandler.ts'
import { EncounterContext } from './_middleware.tsx'

type OrganizationSearchResult = Awaited<
  ReturnType<typeof nearest_organizations.search>
>['results'][number]

export const handler = jsonSearchHandler<
  nearest_organizations.SearchOpts,
  OrganizationSearchResult,
  EncounterContext
>(nearest_organizations, (ctx) => {
  console.log('in seaarch handler', ctx.state)
  return {
    location: ctx.state.encounter.location,
  }
}, {
  verbose: 'bliwkwelklwek',
})
