import { assert } from 'https://deno.land/std@0.188.0/testing/asserts.ts'
import { PageProps } from '$fresh/server.ts'
import * as patients from '../../../db/models/patients.ts'
import PatientCard from '../../../components/patient/Card.tsx'
import {
  HealthWorker,
  LoggedInHealthWorkerHandler,
  Patient,
  ReturnedSqlRow,
} from '../../../types.ts'
import { isHealthWorkerWithGoogleTokens } from '../../../db/models/health_workers.ts'
import Layout from '../../../components/library/Layout.tsx'

type PatientPageProps = {
  patient: Patient
  healthWorker: ReturnedSqlRow<HealthWorker>
}

export const handler: LoggedInHealthWorkerHandler<PatientPageProps> = {
  async GET(_, ctx) {
    const healthWorker = ctx.state.session.data
    assert(
      isHealthWorkerWithGoogleTokens(healthWorker),
      'Invalid health worker',
    )

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
      <PatientCard patient={props.data.patient} />
    </Layout>
  )
}
