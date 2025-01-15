import { sql } from 'kysely'
import { RenderedNotification, TrxOrDb } from '../../types.ts'
import { timeAgoDisplay } from '../../util/timeAgoDisplay.ts'

export function insert(
  trx: TrxOrDb,
  notification: {
    action_title: string
    action_href: string
    avatar_url: string
    description: string
    health_worker_id: string
    table_name: string
    row_id: string
    notification_type: string
    title: string
  },
): Promise<{ id: string }> {
  return trx
    .insertInto('health_worker_web_notifications')
    .values(notification)
    .returning('id')
    .executeTakeFirstOrThrow()
}

export async function ofHealthWorker(
  trx: TrxOrDb,
  health_worker_id: string,
): Promise<RenderedNotification[]> {
  const notifications = await trx
    .selectFrom('health_worker_web_notifications')
    .selectAll('health_worker_web_notifications')
    .select(
      sql<
        string
      >`(current_timestamp - health_worker_web_notifications.created_at)::interval`
        .as('wait_time'),
    )
    .where('health_worker_id', '=', health_worker_id)
    .execute()

  return notifications.map((
    { id, wait_time, action_title, action_href, ...n },
  ) => ({
    ...n,
    notification_id: id,
    time_display: timeAgoDisplay(wait_time),
    action: {
      title: action_title,
      href: action_href,
    },
  }))
}
