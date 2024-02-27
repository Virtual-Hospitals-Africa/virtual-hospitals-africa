import * as patients from '../../../../db/models/patients.ts'
import PatientDetailedCard from '../../../../components/patients/DetailedCard.tsx'
import Layout from '../../../../components/library/Layout.tsx'
import { Container } from '../../../../components/library/Container.tsx'
import SectionHeader from '../../../../components/library/typography/SectionHeader.tsx'
import { Button } from '../../../../components/library/Button.tsx'
import { assertOr404 } from '../../../../util/assertOr.ts'
import { LoggedInHealthWorkerContext } from '../../../../types.ts'
import { getRequiredNumericParam } from '../../../../util/getNumericParam.ts'
import redirect from '../../../../util/redirect.ts'

export default async function PatientPage(
  req: Request,
  ctx: LoggedInHealthWorkerContext,
) {
  const { healthWorker } = ctx.state
  const patient_id = getRequiredNumericParam(ctx, 'patient_id')

  const [patient] = await patients.getWithOpenEncounter(ctx.state.trx, {
    ids: [patient_id],
    health_worker_id: healthWorker.id,
  })

  assertOr404(patient, 'Patient not found')

  if (!patient.completed_intake) {
    const intakeStep = await patients.getFirstIncompletedIntakeStep(
      ctx.state.trx,
      patient.id,
    )
    return redirect(`${req.url}/${intakeStep}`)
  }
  return redirect(`${req.url.replace('/intake', '')}`)
}
