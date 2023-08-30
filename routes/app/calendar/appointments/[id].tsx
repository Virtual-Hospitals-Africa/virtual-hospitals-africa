import { assert } from 'std/testing/asserts.ts'
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
import { retrieveImage } from '../../../../db/models/media.ts'
import AppointmentDetail from '../../../../components/patients/AppointmentDetail.tsx'

type AppointmentPageProps = {
  appointment: AppointmentWithAllPatientInfo
  healthWorker: ReturnedSqlRow<HealthWorker>
  medias: BinaryData[]
}

export const handler: LoggedInHealthWorkerHandler<AppointmentPageProps> = {
  async GET(_, ctx) {
    const healthWorker = ctx.state.session.data
    assert(isHealthWorkerWithGoogleTokens(healthWorker))

    const id = parseInt(ctx.params.id)
    assert(!isNaN(id), 'Invalid appointment ID')

    const [appointment] = await appointments.getWithPatientInfo(ctx.state.trx, {
      id,
      health_worker_id: healthWorker.id,
    })

    const appointment_medias = await appointments.getAppointmentMediaId(ctx.state.trx, {appointment_id: id})
    const media_binary = appointment_medias.map(media_id => retrieveImage(ctx.state.trx, {media_id}))
    const resolved_binary = await Promise.all(media_binary)

    assert(appointment, 'Appointment not found')

    return ctx.render({
      appointment,
      healthWorker,
      medias: resolved_binary
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
      <AppointmentDetail appointment={props.data.appointment} medias={props.data.medias}></AppointmentDetail>
    </Layout>
  )
}
