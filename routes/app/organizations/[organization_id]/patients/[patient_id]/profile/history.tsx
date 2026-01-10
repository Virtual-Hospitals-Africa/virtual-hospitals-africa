import { PatientProfilePage } from './_middleware.tsx'
import { patient_registration } from '../../../../../../../db/models/patient_registration.ts'
import PatientHistory from '../../../../../../../components/patients/profile/PatientHistory.tsx'

export default PatientProfilePage(
  'History',
  async function PatientHistoryTab(ctx) {
    const patient_summary = await patient_registration.getSummaryById(
      ctx.state.trx,
      ctx.state.patient.id,
    )

    return <PatientHistory patient={patient_summary} />
  },
)
