import * as patient_personal from '../../../../../../db/models/patient_personal.ts'
import { PatientIntakeStep } from '../../../../../../shared/patient_intake.ts'
import redirect from '../../../../../../util/redirect.ts'
import { replaceParams } from '../../../../../../util/replaceParams.ts'
import { OrganizationContext } from '../../_middleware.ts'
import { getPatientIntakeId } from './intake/_middleware.tsx'

export async function handler(
  _req: Request,
  ctx: OrganizationContext,
) {
  const patient_id = getPatientIntakeId(ctx)
  const { completed_intake } = patient_id === 'new'
    ? { completed_intake: false }
    : await patient_personal.getById(ctx.state.trx, { patient_id })

  const step: PatientIntakeStep = completed_intake ? 'this_visit' : 'personal'

  return redirect(replaceParams(
    '/app/organizations/:organization_id/patients/:patient_id/intake/:step',
    { ...ctx.params, step },
  ))
}
