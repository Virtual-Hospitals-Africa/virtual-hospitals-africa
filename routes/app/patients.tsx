import { PageProps } from '$fresh/server.ts'
import Layout from '../../components/library/Layout.tsx'
import {
  HealthWorkerWithGoogleTokens,
  LoggedInHealthWorkerHandler,
  RenderedPatient,
} from '../../types.ts'
import PatientsView from '../../components/patients/View.tsx'
import { getAllWithNames } from '../../db/models/patients.ts'
import { json } from '../../util/responses.ts'

type PatientsProps = {
  healthWorker: HealthWorkerWithGoogleTokens
  patients: RenderedPatient[]
}

export const handler: LoggedInHealthWorkerHandler<PatientsProps> = {
  async GET(req, ctx) {
    const search = new URL(req.url).searchParams.get('search')

    const patients = await getAllWithNames(ctx.state.trx, search)

    if (req.headers.get('accept') === 'application/json') {
      return json(patients)
    }

    return ctx.render({
      healthWorker: ctx.state.healthWorker,
      patients: await getAllWithNames(ctx.state.trx, search),
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
      url={props.url}
      avatarUrl={props.data.healthWorker.avatar_url}
      variant='standard'
    >
      <PatientsView patients={props.data.patients} />
    </Layout>
  )
}
