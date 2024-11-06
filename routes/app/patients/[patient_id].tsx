import * as patients from '../../../db/models/patients.ts'
import Layout from '../../../components/library/Layout.tsx'
import { assertOr404 } from '../../../util/assertOr.ts'
import { LoggedInHealthWorkerContext } from '../../../types.ts'
import { getRequiredUUIDParam } from '../../../util/getParam.ts'
import redirect from '../../../util/redirect.ts'
import PatientBasicInfo from '../../../components/patients/PatientBasicInfo.tsx'

export default async function PatientPage(
  _req: Request,
  ctx: LoggedInHealthWorkerContext,
) {
  const patient_id = getRequiredUUIDParam(ctx, 'patient_id')

  const patient = await patients.getByID(ctx.state.trx, {
    id: patient_id,
  })

  assertOr404(patient, 'Patient not found')

  if (!patient.completed_intake) {
    return redirect(`/app/patients/${patient_id}/intake`)
  }

  return (
    <Layout
      title='Patient Profile'
      route={ctx.route}
      url={ctx.url}
      health_worker={ctx.state.healthWorker}
      variant='practitioner home page'
    >
      <div className="container my-4 mx-6">
        <PatientBasicInfo patient={patient} />
      </div>
    </Layout>
  )
}
