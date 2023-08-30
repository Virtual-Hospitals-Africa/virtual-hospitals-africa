import { MiddlewareHandlerContext } from '$fresh/server.ts'
import { WithSession } from 'fresh_session'
import { assert } from 'std/testing/asserts.ts'

export async function handler(
  req: Request,
  ctx: MiddlewareHandlerContext<
    WithSession
  >,
) {
  await console.log('ctx', ctx)
  console.log('req', req)
  // console.log('appointmentId', (ctx as any).params.id)
  return ctx.next()
}
