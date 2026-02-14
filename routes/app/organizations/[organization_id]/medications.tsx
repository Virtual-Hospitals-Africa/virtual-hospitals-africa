import { medication_organizations } from '../../../../db/models/medication_organizations.ts'
import { getRequiredUUIDParam } from '../../../../util/getParam.ts'
import { jsonSearchHandler } from '../../../../util/jsonSearchHandler.ts'

export const handler = jsonSearchHandler(medication_organizations, (ctx) => ({
  organization_id: getRequiredUUIDParam(ctx, 'organization_id'),
}))
