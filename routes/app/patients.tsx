import { EmployedHealthWorker, RenderedPatient } from '../../types.ts'
import PatientsView from '../../components/patients/View.tsx'
import { getAllWithNames } from '../../db/models/patients.ts'
import { json } from '../../util/responses.ts'
import { HealthWorkerHomePageLayout } from './_middleware.tsx'

type PatientsProps = {
  healthWorker: EmployedHealthWorker
  patients: RenderedPatient[]
}

export default HealthWorkerHomePageLayout(
  'Patients',
  async function PatientsPage({ req, ctx }) {
    const { searchParams } = ctx.url
    const search = searchParams.get('search')
    const completed_intake = searchParams.has('completed_intake')
      ? searchParams.get('completed_intake') === 'true'
      : undefined

    const patients = await getAllWithNames(ctx.state.trx, {
      search,
      completed_intake,
    })

    if (req.headers.get('accept') === 'application/json') {
      return json(patients)
    }

    return <PatientsView patients={patients} />
  },
)
