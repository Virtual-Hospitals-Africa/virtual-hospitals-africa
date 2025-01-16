import { PatientPage } from './_middleware.tsx'
import * as patient_intake from '../../../../../db/models/patient_intake.ts'
import PatientSummary from '../../../../../components/patients/profile/PatientSummary.tsx'

export default PatientPage(
  'Summary',
  async function PatientSummaryTab(_req, ctx) {
    const patient_summary = await patient_intake.getSummaryById(
      ctx.state.trx,
      ctx.state.patient.id,
    )
    return <PatientSummary patient={patient_summary} />
  },
)
