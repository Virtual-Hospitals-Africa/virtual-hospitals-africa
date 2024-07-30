import { FreshContext } from '$fresh/server.ts'
import Layout from '../../components/library/Layout.tsx'
import db from '../../db/db.ts'
import * as prescriptions from '../../db/models/prescriptions.ts'
import { assertOr400, StatusError } from '../../util/assertOr.ts'

export default async function PrescriptionPage(
  req: Request,
  ctx: FreshContext,
) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  assertOr400(code, 'code is required')
  const prescription = await prescriptions.getById(
    db,
    ctx.params.prescription_id,
  )

  if (!prescription) {
    throw new StatusError('Could not find that prescription', 404)
  }
  if (prescription.alphanumeric_code !== code) {
    throw new StatusError('Could not find that prescription', 404)
  }

  return (
    <Layout
      title='Waiting Room'
      url={ctx.url}
      variant='just logo'
    >
      TODO: real prescription
    </Layout>
  )
}
