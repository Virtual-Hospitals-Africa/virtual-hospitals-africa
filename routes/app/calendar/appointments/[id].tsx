import { assert } from 'std/assert/assert.ts'
import * as appointments from '../../../../db/models/appointments.ts'
import PatientDetailedCard from '../../../../components/patients/DetailedCard.tsx'
import AppointmentDetail from '../../../../components/patients/AppointmentDetail.tsx'
import { HealthWorkerHomePageLayout } from '../../_middleware.tsx'

export default HealthWorkerHomePageLayout(
  async function AppointmentPage(
    _req,
    ctx,
  ) {
    const { healthWorker } = ctx.state

    const { id } = ctx.params

    const [appointment] = await appointments.getWithPatientInfo(ctx.state.trx, {
      id,
      health_worker_id: healthWorker.id,
    })

    assert(appointment, 'Appointment not found')
    return {
      title: `Appointment with ${appointment.patient.name}`,
      children: (
        <>
          <PatientDetailedCard patient={appointment.patient} />
          <AppointmentDetail appointment={appointment} />
        </>
      ),
    }
  },
)
