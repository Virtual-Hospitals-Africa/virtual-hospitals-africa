import Layout from '../../components/library/Layout.tsx'
import {
  EmployedHealthWorker,
  LoggedInHealthWorkerContext,
  RenderedPatient,
} from '../../types.ts'
// import PatientsView from '../../components/patients/View.tsx'

type PatientsProps = {
  healthWorker: EmployedHealthWorker
  patients: RenderedPatient[]
}

// deno-lint-ignore require-await
export default async function PatientsPage(
  _req: Request,
  ctx: LoggedInHealthWorkerContext,
) {
  return (
    <Layout
      variant='practitioner home page'
      title='Patients'
      route={ctx.route}
      url={ctx.url}
      health_worker={ctx.state.healthWorker}
    >
      {/* <PatientsView patients={props.data.patients} /> */}
      TODO Reimplement
    </Layout>
  )
}
