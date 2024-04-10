import { PageProps } from '$fresh/server.ts'
import Layout from '../../../../components/library/Layout.tsx'
import {
  EmployedHealthWorker,
  LoggedInHealthWorkerHandlerWithProps,
  RenderedPatient,
} from '../../../../types.ts'
import PatientsView from '../../../../components/patients/View.tsx'
import { getAllWithNames } from '../../../../db/models/patients.ts'
import { json } from '../../../../util/responses.ts'
import { assertOr404 } from '../../../../util/assertOr.ts'

type PatientsProps = {
  healthWorker: EmployedHealthWorker
  patients: RenderedPatient[]
}

export const handler: LoggedInHealthWorkerHandlerWithProps<PatientsProps> = {
  async GET(req, ctx) {
    const search = ctx.url.searchParams.get('search')

    const patients = await getAllWithNames(ctx.state.trx, search)

    assertOr404(req.headers.get('accept') === 'application/json', 'We only accept JSON')

    return json(patients)

  },
}