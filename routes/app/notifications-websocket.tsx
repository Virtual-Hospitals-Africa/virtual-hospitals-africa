import { FreshContext } from 'fresh'
import * as notifications from '../../db/models/notifications.ts'
import { LoggedInHealthWorker } from '../../types.ts'
import upgradeWebsocket from '../../util/websocket.ts'
// import last from '../../util/last.ts'

export default upgradeWebsocket((
  _req: Request,
  ctx: FreshContext<LoggedInHealthWorker>,
  socket: WebSocket,
) => {
  let timeout: number
  let past_ts: Date | undefined

  async function loop() {
    const new_notifs = await notifications.ofHealthWorker(
      ctx.state.trx,
      ctx.state.health_worker.id,
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
    //   ctx.state.health_worker.id,
    // )
    // past_ts = last(notifs)?.created_at
    // await loop()
  }
  socket.onclose = () => clearTimeout(timeout)
  socket.onerror = (error) => {
    console.error('SOCKET ERROR:', error)
    clearTimeout(timeout)
  }
})
