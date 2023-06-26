import { assert } from 'https://deno.land/std@0.188.0/testing/asserts.ts'
import { PageProps } from '$fresh/server.ts'
import * as appointments from '../../../../db/models/appointments.ts'
import PatientCard from '../../../../components/patient.tsx'
import {
  Appointment,
  LoggedInHealthWorkerHandler,
  ReturnedSqlRow,
} from '../../../../types.ts'
import { isHealthWorkerWithGoogleTokens } from '../../../../db/models/health_workers.ts'

type AppointmentPageProps = {
  appointment: ReturnedSqlRow<Appointment>
}

export const handler: LoggedInHealthWorkerHandler<AppointmentPageProps> = {
  async GET(_, ctx) {
    const id = parseInt(ctx.params.id)
    assert(!isNaN(id), 'Invalid appointment ID')

    const healthWorker = ctx.state.session.data
    assert(
      isHealthWorkerWithGoogleTokens(healthWorker),
      'Invalid health worker',
    )

    const [appointment] = await appointments.getWithPatientInfo(ctx.state.trx, {
      id,
      health_worker_id: healthWorker.id,
    })

    assert(appointment, 'Appointment not found')

    return ctx.render({
      appointment,
    })
  },
}

export default function AppointmentPage(
  props: PageProps<AppointmentPageProps>,
) {
  console.log(props.data)
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 500px' }}>
      <div>
        Hello
      </div>
      <div className='p-2'>
        <PatientCard />
      </div>
    </div>
  )
}
