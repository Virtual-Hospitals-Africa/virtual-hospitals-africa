import { assert } from 'std/assert/assert.ts'
import { PageProps } from '$fresh/server.ts'
import * as appointments from '../../../../db/models/appointments.ts'
import PatientDetailedCard from '../../../../components/patients/DetailedCard.tsx'
import {
  AppointmentWithAllPatientInfo,
  EmployedHealthWorker,
  LoggedInHealthWorkerHandlerWithProps,
} from '../../../../types.ts'
import Layout from '../../../../components/library/Layout.tsx'
import AppointmentDetail from '../../../../components/patients/AppointmentDetail.tsx'

type AppointmentPageProps = {
  appointment: AppointmentWithAllPatientInfo
  healthWorker: EmployedHealthWorker
}

export const handler: LoggedInHealthWorkerHandlerWithProps<
  AppointmentPageProps
> = {
  async GET(_, ctx) {
    const { healthWorker } = ctx.state

    const { id } = ctx.params

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
      url={props.url}
      health_worker={props.data.healthWorker}
      variant='health worker home page'
    >
      <PatientDetailedCard patient={props.data.appointment.patient} />
      <AppointmentDetail
        appointment={props.data.appointment}
      />
    </Layout>
  )
}
