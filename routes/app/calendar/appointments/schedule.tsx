import { assert } from 'https://deno.land/std@0.188.0/testing/asserts.ts'
import { PageProps } from '$fresh/server.ts'
import * as appointments from '../../../../db/models/appointments.ts'
import PatientCard from '../../../../components/patients/DetailedCard.tsx'
import {
  AppointmentWithAllPatientInfo,
  HealthWorker,
  LoggedInHealthWorkerHandler,
  ReturnedSqlRow,
} from '../../../../types.ts'
import { isHealthWorkerWithGoogleTokens } from '../../../../db/models/health_workers.ts'
import Layout from '../../../../components/library/Layout.tsx'
import { Container } from '../../../../components/library/Container.tsx'
import ScheduleForm from '../../../../islands/schedule-form.tsx'
import { json } from '../../../../util/responses.ts'
import { parseRequest } from '../../../../util/parseForm.ts'

type SchedulePageProps = {
  healthWorker: ReturnedSqlRow<HealthWorker>
}

export const handler: LoggedInHealthWorkerHandler<SchedulePageProps> = {
  GET(_, ctx) {
    const healthWorker = ctx.state.session.data
    assert(
      isHealthWorkerWithGoogleTokens(healthWorker),
      'Invalid health worker',
    )

    return ctx.render({
      healthWorker,
    })
  },
  async POST(req, ctx) {
    const healthWorker = ctx.state.session.data
    assert(
      isHealthWorkerWithGoogleTokens(healthWorker),
      'Invalid health worker',
    )

    const scheduleData = await parseRequest(req, {})

    return json('OK')
  },
}

export default function SchedulePage(
  props: PageProps<SchedulePageProps>,
) {
  return (
    <Layout
      title='Schedule Appointment'
      route={props.route}
      avatarUrl={props.data.healthWorker.avatar_url}
      variant='form'
    >
      <Container size='lg'>
        <ScheduleForm />
      </Container>
    </Layout>
  )
}
