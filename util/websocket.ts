import { FreshContext } from 'fresh'
import { assert } from 'std/assert/assert.ts'
import { assertOr400 } from './assertOr.ts'

export function isWebsocketPath(ctx: FreshContext) {
  return ctx.url.pathname.endsWith('websocket')
}

export default function upgradeWebsocket<Context extends FreshContext>(
  callback: (
    req: Request,
    ctx: Context,
    socket: WebSocket,
  ) => void,
) {
  // deno-lint-ignore require-await
  return async function (
    req: Request,
    ctx: Context,
  ) {
    assert(
      isWebsocketPath(ctx),
      'Route must follow the convention that websocket routes end in websocket. This is used to determine whether to open a transaction or not.',
    )
    assertOr400(
      req.headers.get('upgrade') === 'websocket',
      'Only websocket connections supported',
    )

    const { socket, response } = Deno.upgradeWebSocket(req)
    callback(req, ctx, socket)
    return response
  }
}
