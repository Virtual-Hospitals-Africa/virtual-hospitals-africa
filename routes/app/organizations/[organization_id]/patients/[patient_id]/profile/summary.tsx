import { PatientProfilePage } from './_middleware.tsx'
import * as patient_registration from '../../../../../../../db/models/patient_registration.ts'
import PatientSummary from '../../../../../../../components/patients/profile/PatientSummary.tsx'

export default PatientProfilePage(
  'Summary',
  async function PatientSummaryTab(_req, ctx) {
    const patient_summary = await patient_registration.getSummaryById(
      ctx.state.trx,
      ctx.state.patient.id,
    )
    return <PatientSummary patient={patient_summary} />
  },
)
