import { PageProps } from '$fresh/server.ts'
import Layout from '../../../components/library/Layout.tsx'
import { HealthWorker, LoggedInHealthWorkerHandler } from '../../../types.ts'
import { assert } from 'std/testing/asserts.ts'
import { isHealthWorkerWithGoogleTokens } from '../../../db/models/health_workers.ts'
import redirect from '../../../util/redirect.ts'
import { Container } from '../../../components/library/Container.tsx'

export const handler: LoggedInHealthWorkerHandler<
  { healthWorker: HealthWorker }
> = {
  GET(_, ctx) {
    const healthWorker = ctx.state.session.data
    assert(isHealthWorkerWithGoogleTokens(healthWorker))
    return ctx.render({ healthWorker })
  },
  async POST(req, ctx) {
    const _params = new URLSearchParams(await req.text())
    return redirect('/app')
  },
}

export default function AddPatient(
  props: PageProps<
    { healthWorker: HealthWorker }
  >,
) {
  return (
    <Layout
      title='Add Patient'
      route={props.route}
      avatarUrl={props.data.healthWorker.avatar_url}
      variant='with-back-button-on-mobile'
    >
      <Container size='lg'>
        <form method='POST'></form>
      </Container>
    </Layout>
  )
}
