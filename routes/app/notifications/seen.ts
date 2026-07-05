import { z } from 'zod'
import { notifications } from '../../../db/models/notifications.ts'
import { LoggedInHealthWorkerContext } from '../../../types.ts'
import { promiseProps } from '../../../util/promiseProps.ts'
import { json } from '../../../util/responses.ts'

const MarkNotificationsSeenSchema = z.object({
  notification_ids: z.array(z.string().uuid()).min(1),
}).strict()

export const handler = {
  async POST(ctx: LoggedInHealthWorkerContext) {
    const { notification_ids } = MarkNotificationsSeenSchema.parse(
      await ctx.req.json(),
    )
    const { trx, health_worker_id } = ctx.state

    const marked_count = await notifications.markSeen(trx, {
      health_worker_id,
      notification_ids,
    })

    const { unread_count, highest_priority } = await promiseProps({
      unread_count: notifications.countAll(trx, {
        health_worker_id,
        only_unread: true,
      }),
      highest_priority: notifications.highestUnreadPriority(trx, {
        health_worker_id,
      }),
    })

    return json({
      ok: true,
      marked_count,
      unread_count,
      highest_priority,
    })
  },
}
