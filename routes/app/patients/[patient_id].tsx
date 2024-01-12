import * as patients from '../../../db/models/patients.ts'
import PatientDetailedCard from '../../../components/patients/DetailedCard.tsx'
import Layout from '../../../components/library/Layout.tsx'
import { Container } from '../../../components/library/Container.tsx'
import SectionHeader from '../../../components/library/typography/SectionHeader.tsx'
import { Button } from '../../../components/library/Button.tsx'
import { assertOr404 } from '../../../util/assertOr.ts'
import { LoggedInHealthWorkerContext } from '../../../types.ts'
import { getRequiredNumericParam } from '../../../util/getNumericParam.ts'
import redirect from '../../../util/redirect.ts'

export default async function PatientPage(
  req: Request,
  ctx: LoggedInHealthWorkerContext,
) {
  const { healthWorker } = ctx.state
  const patient_id = getRequiredNumericParam(ctx, 'patient_id')

  const [patient] = await patients.getWithMedicalRecords(ctx.state.trx, {
    ids: [patient_id],
    health_worker_id: healthWorker.id,
  })

  assertOr404(patient, 'Patient not found')

  if (!patient.completed_intake) {
    return redirect(`${req.url}/intake/personal`)
  }

  return (
    <Layout
      title='Patient Profile'
      route={ctx.route}
      url={ctx.url}
      avatarUrl={ctx.state.healthWorker.avatar_url}
      variant='home page'
    >
      <Container size='lg'>
        <div className='mt-4 divide-y divide-gray-100 text-sm leading-6 lg:col-span-7 xl:col-span-8 row-span-full'>
          <Button href={`${req.url}/edit`}>
            Edit
          </Button>
          <SectionHeader>
            Demographic Data
          </SectionHeader>
          <PatientDetailedCard patient={patient} />
        </div>
      </Container>
    </Layout>
  )
}
