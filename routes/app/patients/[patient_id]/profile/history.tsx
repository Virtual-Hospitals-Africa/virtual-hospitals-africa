import { PatientPage } from './_middleware.tsx'
import * as patient_intake from '../../../../../db/models/patient_intake.ts'
import PatientHistory from '../../../../../components/patients/profile/PatientHistory.tsx'

export default PatientPage(
  'History',
  async function PatientHistoryTab(_req, ctx) {
    const patient_summary = await patient_intake.getSummaryById(
      ctx.state.trx,
      ctx.state.patient.id,
    )

    return <PatientHistory patient={patient_summary} />
  },
)
