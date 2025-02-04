import { FreshContext } from '$fresh/server.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { LoggedInHealthWorker } from '../../types.ts'

// deno-lint-ignore require-await
export default async function NotificationsWebsocket(
  req: Request,
  _ctx: FreshContext<LoggedInHealthWorker>,
) {
  console.log('we out here', req)

  assertEquals(
    req.headers.get('upgrade'),
    'websocket',
    'Only websocket connections supported',
  )

  const { socket, response } = Deno.upgradeWebSocket(req)

  socket.onopen = () => {
    console.log('CONNECTED')
  }
  socket.onmessage = (event) => {
    console.log(`RECEIVED: ${event.data}`)
    socket.send('pong')
  }
  socket.onclose = () => console.log('DISCONNECTED')
  socket.onerror = (error) => console.error('ERROR:', error)

  return response
}
