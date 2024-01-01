import { PageProps } from '$fresh/server.ts'
import * as patients from '../../../db/models/patients.ts'
import PatientDetailedCard from '../../../components/patients/DetailedCard.tsx'
import {
  HealthWorker,
  LoggedInHealthWorkerHandler,
  PatientWithMedicalRecord,
  ReturnedSqlRow,
} from '../../../types.ts'
import Layout from '../../../components/library/Layout.tsx'
import { Container } from '../../../components/library/Container.tsx'
import SectionHeader from '../../../components/library/typography/SectionHeader.tsx'
import { Button } from '../../../components/library/Button.tsx'
import { assertOr404 } from '../../../util/assertOr.ts'

type PatientPageProps = {
  patient: PatientWithMedicalRecord
  healthWorker: ReturnedSqlRow<HealthWorker>
}

export const handler: LoggedInHealthWorkerHandler<PatientPageProps> = {
  async GET(_, ctx) {
    const { healthWorker } = ctx.state

    const patient_id = parseInt(ctx.params.patient_id)
    assertOr404(patient_id, 'Invalid patient id')

    const [patient] = await patients.getWithMedicalRecords(ctx.state.trx, {
      ids: [patient_id],
      health_worker_id: healthWorker.id,
    })

    assertOr404(patient, 'Patient not found')

    return ctx.render({
      patient,
      healthWorker,
    })
  },
}

export default function PatientPage(
  props: PageProps<PatientPageProps>,
) {
  return (
    <Layout
      title={props.data.patient.name || 'Patient'}
      route={props.route}
      url={props.url}
      avatarUrl={props.data.healthWorker.avatar_url}
      variant='standard'
    >
      <Container size='lg'>
        <div className='mt-4 divide-y divide-gray-100 text-sm leading-6 lg:col-span-7 xl:col-span-8 row-span-full'>
          <Button
            href={`/app/patients/add?patient_id=${props.data.patient.id}`}
          >
            Edit
          </Button>
          <SectionHeader>
            Demographic Data
          </SectionHeader>
          <PatientDetailedCard patient={props.data.patient} />
        </div>
      </Container>
    </Layout>
  )
}
