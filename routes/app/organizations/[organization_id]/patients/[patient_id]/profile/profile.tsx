import { PatientProfilePage } from './_middleware.tsx'
import * as patient_registration from '../../../../../../../db/models/patient_registration.ts'
import PatientProfile from '../../../../../../../components/patients/profile/PatientProfile.tsx'

export default PatientProfilePage(
  'Profile',
  async function PatientProfileTab(_req, ctx) {
    const patient_summary = await patient_registration.getSummaryById(
      ctx.state.trx,
      ctx.state.patient.id,
    )
    return <PatientProfile patient={patient_summary} />
  },
)
