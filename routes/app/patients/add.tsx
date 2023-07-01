import { PageProps } from '$fresh/server.ts'
import Layout from '../../../components/library/Layout.tsx'
import { HealthWorker, LoggedInHealthWorkerHandler } from '../../../types.ts'
import { assert } from 'std/testing/asserts.ts'
import { isHealthWorkerWithGoogleTokens } from '../../../db/models/health_workers.ts'
import redirect from '../../../util/redirect.ts'
import { Container } from '../../../components/library/Container.tsx'
import { Steps } from '../../../components/library/Steps.tsx'

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

const stepNames = [
  'personal' as const,
  'address' as const,
  'history' as const,
  'allergies' as const,
  'age' as const,
]

function getSteps(url: URL) {
  const step = url.searchParams.get('step')
  let completed = false

  return stepNames.map((name) => {
    console.log(completed, step, name)
    if (step === name) {
      completed = true
      return { name, status: 'current' as const }
    }
    if (completed) {
      return { name, status: 'upcoming' as const }
    }
    return { name, status: 'complete' as const }
  })
}

export default function AddPatient(
  props: PageProps<
    { healthWorker: HealthWorker }
  >,
) {
  console.log(getSteps(props.url))

  return (
    <Layout
      title='Add Patient'
      route={props.route}
      avatarUrl={props.data.healthWorker.avatar_url}
      variant='form'
    >
      <Container size='lg'>
        <Steps route={props.route} steps={getSteps(props.url)} />
        <form method='POST'></form>
      </Container>
    </Layout>
  )
}
