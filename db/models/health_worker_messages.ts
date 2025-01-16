import { TrxOrDb } from '../../types.ts'

export function insert(
  trx: TrxOrDb,
  { health_worker_id, message }: { health_worker_id: string; message: string },
): Promise<{ id: string }> {
  return trx
    .insertInto('health_worker_messages')
    .values({
      health_worker_id,
      message,
    })
    .returning('id')
    .executeTakeFirstOrThrow()
}

export function getAll(
  trx: TrxOrDb,
  health_worker_id: string,
) {
  return trx
    .selectFrom('health_worker_messages')
    .selectAll()
    .where('health_worker_id', '=', health_worker_id)
    .execute()
}
