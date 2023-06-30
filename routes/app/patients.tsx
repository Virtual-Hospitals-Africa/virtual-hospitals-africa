import { assert } from 'std/testing/asserts.ts'
import { PageProps } from '$fresh/server.ts'
import { isHealthWorkerWithGoogleTokens } from '../../db/models/health_workers.ts'
import Layout from '../../components/library/Layout.tsx'
import {
  HealthWorkerWithGoogleTokens,
  LoggedInHealthWorkerHandler,
  Patient,
  ReturnedSqlRow,
} from '../../types.ts'
import PatientsView from '../../components/patients/View.tsx'
import { getAllWithNames } from '../../db/models/patients.ts'

type PatientsProps = {
  healthWorker: HealthWorkerWithGoogleTokens
  patients: ReturnedSqlRow<Patient & { name: string }>[]
}

export const handler: LoggedInHealthWorkerHandler<PatientsProps> = {
  async GET(req, ctx) {
    const healthWorker = ctx.state.session.data

    assert(isHealthWorkerWithGoogleTokens(healthWorker))

    return ctx.render({
      healthWorker,
      patients: await getAllWithNames(ctx.state.trx),
    })
  },
}

export default function PatientsPage(
  props: PageProps<PatientsProps>,
) {
  return (
    <Layout
      title='Patients'
      route={props.route}
      avatarUrl={props.data.healthWorker.avatar_url}
      variant='standard'
    >
      <PatientsView patients={props.data.patients} />
    </Layout>
  )
}
