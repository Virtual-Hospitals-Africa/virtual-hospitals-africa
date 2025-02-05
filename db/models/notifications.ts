import { sql } from 'kysely'
import { RenderedNotification, TrxOrDb } from '../../types.ts'
import { timeAgoDisplay } from '../../util/timeAgoDisplay.ts'

export function insert(
  trx: TrxOrDb,
  { health_worker_id, employment_id, ...notification }:
    & {
      action_title: string
      action_href: string
      avatar_url: string
      description: string
      table_name: string
      row_id: string
      notification_type: string
      title: string
    }
    & (
      | { health_worker_id: string; employment_id?: never }
      | { health_worker_id?: never; employment_id: string }
    ),
): Promise<{ id: string }> {
  return trx
    .insertInto('health_worker_web_notifications')
    .values({
      ...notification,
      health_worker_id: health_worker_id ||
        trx.selectFrom('employment').select('health_worker_id').where(
          'id',
          '=',
          employment_id!,
        ),
    })
    .returning('id')
    .executeTakeFirstOrThrow()
}

export async function ofHealthWorker(
  trx: TrxOrDb,
  health_worker_id: string,
  opts?: {
    past_ts: number | Date
  },
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
    .orderBy('health_worker_web_notifications.created_at asc')
    .$if(
      !!opts?.past_ts,
      (qb) =>
        qb.where(
          'health_worker_web_notifications.created_at',
          '>',
          new Date(opts?.past_ts!),
        ),
    )
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
