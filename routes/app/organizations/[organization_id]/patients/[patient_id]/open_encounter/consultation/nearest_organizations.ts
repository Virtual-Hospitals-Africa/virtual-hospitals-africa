import { nearest_organizations, type NearestOrganizationSearchResult, type SearchOpts } from '../../../../../../../../db/models/nearest_organizations.ts'
import { BlankRecord } from '../../../../../../../../types.ts'
import { jsonSearchHandler } from '../../../../../../../../util/jsonSearchHandler.ts'
import { OpenEncounterWorkflowContext } from '../_middleware.tsx'

export const handler = jsonSearchHandler<
  SearchOpts,
  NearestOrganizationSearchResult,
  OpenEncounterWorkflowContext<BlankRecord>
>(nearest_organizations, (ctx) => ({
  location: ctx.state.organization.location!,
  excluding_id: ctx.state.organization.id,
  // has_doctors: true,
}))
