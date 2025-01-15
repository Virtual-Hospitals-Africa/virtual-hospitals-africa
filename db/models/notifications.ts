import { TrxOrDb } from '../../types.ts'

export function insert(
  trx: TrxOrDb,
  notification: {
    action_title: string
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

export function ofHealthWorker(
  trx: TrxOrDb,
  health_worker_id: string,
) {
  return trx
    .selectFrom('health_worker_web_notifications')
    .selectAll('health_worker_web_notifications')
    .where('health_worker_id', '=', health_worker_id)
    .execute()
}
