import { FreshContext } from '$fresh/server.ts'
import * as waiting_room from '../../../../db/models/waiting_room.ts'
import Layout from '../../../../components/library/Layout.tsx'
import { LoggedInHealthWorker } from '../../../../types.ts'
import WaitingRoomView from '../../../../components/waiting_room/View.tsx'
import { assertOr404 } from '../../../../util/assertOr.ts'

export default async function WaitingRoomPage(
  _req: Request,
  ctx: FreshContext<LoggedInHealthWorker>,
) {
  const { organization_id } = ctx.params
  assertOr404(organization_id)

  return (
    <Layout
      title='Waiting Room'
      route={ctx.route}
      url={ctx.url}
      health_worker={ctx.state.healthWorker}
      variant='home page'
    >
      <WaitingRoomView
        organization_id={organization_id}
        waiting_room={await waiting_room.get(ctx.state.trx, {
          organization_id,
        })}
      />
    </Layout>
  )
}
