import { PageProps } from '$fresh/server.ts'
import Layout from '../../components/library/Layout.tsx'
import {
  EmployedHealthWorker,
  LoggedInHealthWorkerHandlerWithProps,
  RenderedPatient,
} from '../../types.ts'
import PatientsView from '../../components/patients/View.tsx'
import { getAllWithNames } from '../../db/models/patients.ts'
import { json } from '../../util/responses.ts'

type PatientsProps = {
  healthWorker: EmployedHealthWorker
  patients: RenderedPatient[]
}

export const handler: LoggedInHealthWorkerHandlerWithProps<PatientsProps> = {
  async GET(req, ctx) {
    const search = ctx.url.searchParams.get('search')

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
      variant='home page'
      title='Patients'
      route={props.route}
      url={props.url}
      health_worker={props.data.healthWorker}
    >
      <PatientsView patients={props.data.patients} />
    </Layout>
  )
}
