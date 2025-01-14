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
