import { FreshContext } from '$fresh/server.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import * as notifications from '../../db/models/notifications.ts'
import { LoggedInHealthWorker } from '../../types.ts'
// import last from '../../util/last.ts'

// deno-lint-ignore require-await
export default async function NotificationsWebsocket(
  req: Request,
  ctx: FreshContext<LoggedInHealthWorker>,
) {
  console.log('we out here', req)

  assertEquals(
    req.headers.get('upgrade'),
    'websocket',
    'Only websocket connections supported',
  )

  const { socket, response } = Deno.upgradeWebSocket(req)

  let timeout: number
  let past_ts: Date | undefined

  async function loop() {
    const new_notifs = await notifications.ofHealthWorker(
      ctx.state.trx,
      ctx.state.healthWorker.id,
    )
    for (const new_notif of new_notifs) {
      if (!past_ts || (new_notif.created_at > past_ts)) {
        socket.send(JSON.stringify(new_notif))
      }
      past_ts = new_notif.created_at
    }
    timeout = setTimeout(loop, 150)
  }

  socket.onopen = async () => {
    // const notifs = await notifications.ofHealthWorker(
    //   ctx.state.trx,
    //   ctx.state.healthWorker.id,
    // )
    // past_ts = last(notifs)?.created_at
    // await loop()
  }
  socket.onclose = () => clearTimeout(timeout)
  socket.onerror = (error) => {
    console.error('SOCKET ERROR:', error)
    clearTimeout(timeout)
  }

  return response
}
