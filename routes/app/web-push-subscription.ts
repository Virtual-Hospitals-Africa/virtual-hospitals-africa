import z from 'zod'
import { health_worker_web_push_subscriptions } from '../../db/models/health_worker_web_push_subscriptions.ts'
import { LoggedInHealthWorkerContext } from '../../types.ts'
import { parseWithValues } from '../../util/assertMatches.ts'
import { json } from '../../util/responses.ts'

const WebPushSubscriptionSchema = z.object({
  endpoint: z.string().min(1),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
})

export const handler = {
  async POST(ctx: LoggedInHealthWorkerContext) {
    const { endpoint, keys } = parseWithValues(
      WebPushSubscriptionSchema,
      await ctx.req.json(),
    )

    await health_worker_web_push_subscriptions.upsertForHealthWorker(
      ctx.state.trx,
      {
        health_worker_id: ctx.state.health_worker_id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        user_agent: ctx.req.headers.get('user-agent') ?? undefined,
      },
    )

    return json({ ok: true })
  },
}
