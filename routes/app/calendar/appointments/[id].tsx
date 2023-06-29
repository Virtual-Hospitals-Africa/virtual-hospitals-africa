import { assert } from 'https://deno.land/std@0.188.0/testing/asserts.ts'
import { PageProps } from '$fresh/server.ts'
import * as appointments from '../../../../db/models/appointments.ts'
import PatientCard from '../../../../components/patient/Card.tsx'
import {
  AppointmentWithAllPatientInfo,
  HealthWorker,
  LoggedInHealthWorkerHandler,
  ReturnedSqlRow,
} from '../../../../types.ts'
import { isHealthWorkerWithGoogleTokens } from '../../../../db/models/health_workers.ts'
import Layout from '../../../../components/library/Layout.tsx'

type AppointmentPageProps = {
  appointment: AppointmentWithAllPatientInfo
  healthWorker: ReturnedSqlRow<HealthWorker>
}

export const handler: LoggedInHealthWorkerHandler<AppointmentPageProps> = {
  async GET(_, ctx) {
    const healthWorker = ctx.state.session.data
    assert(
      isHealthWorkerWithGoogleTokens(healthWorker),
      'Invalid health worker',
    )

    const id = parseInt(ctx.params.id)
    assert(!isNaN(id), 'Invalid appointment ID')

    const [appointment] = await appointments.getWithPatientInfo(ctx.state.trx, {
      id,
      health_worker_id: healthWorker.id,
    })

    assert(appointment, 'Appointment not found')

    return ctx.render({
      appointment,
      healthWorker,
    })
  },
}

export default function AppointmentPage(
  props: PageProps<AppointmentPageProps>,
) {
  return (
    <Layout
      title={`Appointment with ${props.data.appointment.patient.name}`}
      route={props.route}
      avatarUrl={props.data.healthWorker.avatar_url}
      variant='standard'
    >
      <PatientCard patient={props.data.appointment.patient} />
    </Layout>
  )
}
