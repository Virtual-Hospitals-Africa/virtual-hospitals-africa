import { nearest_organizations, type NearestOrganizationSearchResult, type SearchOpts } from '../../../../../../../../db/models/nearest_organizations.ts'
import { BlankRecord } from '../../../../../../../../types.ts'
import { jsonSearchHandler } from '../../../../../../../../util/jsonSearchHandler.ts'
import { OpenEncounterWorkflowContext } from '../_middleware.tsx'

export const handler = jsonSearchHandler<
  SearchOpts,
  NearestOrganizationSearchResult,
  OpenEncounterWorkflowContext<BlankRecord>
>(nearest_organizations, (ctx) => ({
  location: ctx.state.encounter.organization.location!,
  excluding_id: ctx.state.encounter_employee_presence.organization_id,
  // has_doctors: true,
}), {
  verbose: true, // turn on to log every query
})
