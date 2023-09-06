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
import { get, retrieveImage } from '../../../../db/models/media.ts'
import AppointmentDetail from '../../../../components/patients/AppointmentDetail.tsx'

type AppointmentPageProps = {
  appointment: AppointmentWithAllPatientInfo
  healthWorker: ReturnedSqlRow<HealthWorker>
  medias: number[]
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

    const appointment_media_ids = await appointments.getAppointmentMediaId(
      ctx.state.trx,
      { appointment_id: id },
    )
    // const appointment_medias = appointment_media_ids.map((media_id) =>
    //   get(ctx.state.trx, { media_id })
    // )
    // const resolved_appointment_medias = await Promise.all(appointment_medias)
    // const media_details = resolved_appointment_medias.map((resolved_media) => ({
    //   binary_data: resolved_media.binary_data,
    //   mime_type: resolved_media.mime_type,
    // }))
    assert(appointment, 'Appointment not found')

    return ctx.render({
      appointment,
      healthWorker,
      medias: appointment_media_ids,
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
        medias={props.data.medias}
      >
      </AppointmentDetail>
    </Layout>
  )
}
