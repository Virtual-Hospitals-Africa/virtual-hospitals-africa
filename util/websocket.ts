import { Context } from 'fresh'
import { assert } from 'std/assert/assert.ts'
import { assertOr400 } from './assertOr.ts'

// deno-lint-ignore no-explicit-any
export function isWebsocketPath(ctx: Context<any>) {
  return ctx.url.pathname.endsWith('websocket')
}

export default function upgradeWebsocket<State>(
  callback: (
    ctx: Context<State>,
    socket: WebSocket,
  ) => void,
) {
  // deno-lint-ignore require-await
  return async function (
    ctx: Context<State>,
  ) {
    assert(
      isWebsocketPath(ctx),
      'Route must follow the convention that websocket routes end in websocket. This is used to determine whether to open a transaction or not.',
    )
    assertOr400(
      ctx.req.headers.get('upgrade') === 'websocket',
      'Only websocket connections supported',
    )

    const { socket, response } = Deno.upgradeWebSocket(ctx.req)
    callback(ctx, socket)
    return response
  }
}
