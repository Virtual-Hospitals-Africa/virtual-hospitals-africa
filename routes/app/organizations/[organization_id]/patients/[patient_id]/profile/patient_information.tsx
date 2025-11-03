import { FreshContext } from 'fresh'
import redirect from '../../../../../../../util/redirect.ts'
import { replaceParams } from '../../../../../../../util/replaceParams.ts'

export function handler(
  ctx: FreshContext,
) {
  return redirect(replaceParams(
    '/app/organizations/:organization_id/patients/:patient_id/profile/patient_information/general',
    ctx.params,
  ))
}
