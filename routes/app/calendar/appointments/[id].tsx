import { assert } from 'std/assert/assert.ts'
import { PageProps } from '$fresh/server.ts'
import * as appointments from '../../../../db/models/appointments.ts'
import PatientDetailedCard from '../../../../components/patients/DetailedCard.tsx'
import {
  AppointmentWithAllPatientInfo,
  HealthWorker,
  LoggedInHealthWorkerHandler,
  ReturnedSqlRow,
} from '../../../../types.ts'
import { isHealthWorkerWithGoogleTokens } from '../../../../db/models/health_workers.ts'
import Layout from '../../../../components/library/Layout.tsx'
import AppointmentDetail from '../../../../components/patients/AppointmentDetail.tsx'

type AppointmentPageProps = {
  appointment: AppointmentWithAllPatientInfo
  healthWorker: ReturnedSqlRow<HealthWorker>
}

export const handler: LoggedInHealthWorkerHandler<AppointmentPageProps> = {
  async GET(_, ctx) {
    const { healthWorker } = ctx.state

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
      <PatientDetailedCard patient={props.data.appointment.patient} />
      <AppointmentDetail
        appointment={props.data.appointment}
      />
    </Layout>
  )
}
