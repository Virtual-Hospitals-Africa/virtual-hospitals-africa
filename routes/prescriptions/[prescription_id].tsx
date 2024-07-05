import { FreshContext } from '$fresh/server.ts'
import Layout from '../../components/library/Layout.tsx'
import db from '../../db/db.ts'
import * as prescriptions from '../../db/models/prescriptions.ts'
import { StatusError } from '../../util/assertOr.ts'

export default async function WaitingRoomPage(
  req: Request,
  ctx: FreshContext,
) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const { prescription_id } = ctx.params
  const prescription = await prescriptions.get(db, {
    id: prescription_id,
  })

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
      {prescription.contents}
    </Layout>
  )
}
