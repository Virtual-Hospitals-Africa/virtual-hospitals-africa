import { FreshContext } from '$fresh/server.ts'
import * as waiting_room from '../../../../db/models/waiting_room.ts'
import Layout from '../../../../components/library/Layout.tsx'
import { LoggedInHealthWorker } from '../../../../types.ts'
import WaitingRoomView from '../../../../components/waiting-room/View.tsx'
import { assertOr404 } from '../../../../util/assertOr.ts'

export default async function WaitingRoomPage(
  _req: Request,
  ctx: FreshContext<LoggedInHealthWorker>,
) {
  const facility_id = parseInt(ctx.params.facility_id)
  assertOr404(facility_id)

  return (
    <Layout
      title='Waiting Room'
      route={ctx.route}
      url={ctx.url}
      avatarUrl={ctx.state.healthWorker.avatar_url}
      variant='home page'
    >
      <WaitingRoomView
        facility_id={facility_id}
        waiting_room={await waiting_room.get(ctx.state.trx, { facility_id })}
      />
    </Layout>
  )
}
