import { PatientPage } from './_middleware.tsx'
import * as patient_intake from '../../../../../db/models/patient_intake.ts'
import PatientProfile from '../../../../../components/patients/profile/PatientProfile.tsx'

export default PatientPage(
  'Profile',
  async function PatientProfileTab(_req, ctx) {
    const patient_summary = await patient_intake.getSummaryById(
      ctx.state.trx,
      ctx.state.patient.id,
    )
    return <PatientProfile patient={patient_summary} />
  },
)
