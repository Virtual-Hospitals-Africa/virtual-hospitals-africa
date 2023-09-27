import { assert } from 'std/assert/assert.ts'
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

type PatientPageProps = {
  patient: PatientWithMedicalRecord
  healthWorker: ReturnedSqlRow<HealthWorker>
}

export const handler: LoggedInHealthWorkerHandler<PatientPageProps> = {
  async GET(_, ctx) {
    const { healthWorker } = ctx.state

    const id = parseInt(ctx.params.id)
    assert(!isNaN(id), 'Invalid appointment ID')

    const [patient] = await patients.getWithMedicalRecords(ctx.state.trx, {
      ids: [id],
      health_worker_id: healthWorker.id,
    })

    assert(patient, 'Patient not found')

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
      avatarUrl={props.data.healthWorker.avatar_url}
      variant='standard'
    >
      <Container size='lg'>
        <div className='mt-4 divide-y divide-gray-100 text-sm leading-6 lg:col-span-7 xl:col-span-8 row-span-full'>
          <SectionHeader>
            Demographic Data
          </SectionHeader>
          <PatientDetailedCard patient={props.data.patient} />
        </div>
      </Container>
    </Layout>
  )
}
