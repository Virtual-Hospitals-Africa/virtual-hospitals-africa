import { assert } from 'https://deno.land/std@0.188.0/testing/asserts.ts'
import { PageProps } from '$fresh/server.ts'
import {
  HealthWorker,
  LoggedInHealthWorkerHandler,
  ReturnedSqlRow,
} from '../../../../types.ts'
import { isHealthWorkerWithGoogleTokens } from '../../../../db/models/health_workers.ts'
import Layout from '../../../../components/library/Layout.tsx'
import { Container } from '../../../../components/library/Container.tsx'
import ScheduleForm from '../../../../islands/schedule-form.tsx'
import { json } from '../../../../util/responses.ts'
import * as health_workers from '../../../../db/models/health_workers.ts'
import { parseRequest } from '../../../../util/parseForm.ts'
import { getHealthWorkerAvailability } from '../../../../chatbot/patient/getHealthWorkerAvailability.ts'

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

    // deno-lint-ignore no-explicit-any
    const scheduleData: any = await parseRequest(req, {})

    const toScheduleWith = await health_workers.getWithTokensById(
      ctx.state.trx,
      scheduleData.health_worker_id,
    )

    assert(toScheduleWith)

    const availability = await getHealthWorkerAvailability(toScheduleWith)

    return json(availability)
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
