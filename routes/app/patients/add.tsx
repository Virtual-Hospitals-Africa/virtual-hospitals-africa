import { PageProps } from '$fresh/server.ts'
import Layout from '../../../components/library/Layout.tsx'
import {
  HealthWorker,
  LoggedInHealthWorkerHandler,
  Patient,
} from '../../../types.ts'
import { assert } from 'std/testing/asserts.ts'
import { isHealthWorkerWithGoogleTokens } from '../../../db/models/health_workers.ts'
import redirect from '../../../util/redirect.ts'
import { Container } from '../../../components/library/Container.tsx'
import { useAddPatientSteps } from '../../../components/patients/add/Steps.tsx'

type AddPatientProps = {
  healthWorker: HealthWorker
  patient: Partial<Patient>
}

export const handler: LoggedInHealthWorkerHandler<AddPatientProps> = {
  GET(_, ctx) {
    const healthWorker = ctx.state.session.data
    assert(isHealthWorkerWithGoogleTokens(healthWorker))
    return ctx.render({ healthWorker, patient: {} })
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
  props: PageProps<AddPatientProps>,
) {
  const { steps, currentStep } = useAddPatientSteps(props)

  return (
    <Layout
      title='Add Patient'
      route={props.route}
      avatarUrl={props.data.healthWorker.avatar_url}
      variant='form'
    >
      <Container size='lg'>
        {steps}
        <form method='POST'>
          {currentStep === 'personal' && <div>TODO personal form</div>}
          {currentStep === 'address' && <div>TODO address form</div>}
          {currentStep === 'history' && <div>TODO history form</div>}
          {currentStep === 'allergies' && <div>TODO allergies form</div>}
          {currentStep === 'age' && <div>TODO age form</div>}
        </form>
      </Container>
    </Layout>
  )
}
