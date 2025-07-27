import { Regulator, TrxOrDb } from '../../types.ts'
import { now } from '../helpers.ts'

export function getBySession(trx: TrxOrDb, { session_id }: {
  session_id: string
}) {
  return trx.with(
    'matching_session',
    (qb) =>
      qb.updateTable('sessions')
        .where(
          'sessions.id',
          '=',
          session_id,
        )
        .where('sessions.entity_type', '=', 'regulator')
        .set({ updated_at: now })
        .returning('sessions.entity_id'),
  )
    .selectFrom('regulators')
    .innerJoin(
      'matching_session',
      'regulators.id',
      'matching_session.entity_id',
    )
    .selectAll('regulators')
    .executeTakeFirst()
}

export function getByEmail(trx: TrxOrDb, email: string) {
  return trx
    .selectFrom('regulators')
    .where('email', '=', email)
    .selectAll()
    .executeTakeFirst()
}

export function update(
  trx: TrxOrDb,
  {
    id,
    name,
    avatar_url,
  }: {
    id: string
    name: string
    avatar_url: string
  },
) {
  return trx
    .updateTable('regulators')
    .set({ name, avatar_url })
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export function upsert(trx: TrxOrDb, regulator: Regulator & { id?: string }) {
  return trx
    .insertInto('regulators')
    .values(regulator)
    .onConflict((oc) => oc.column('email').doUpdateSet(regulator))
    .onConflict((oc) => oc.column('id').doUpdateSet(regulator))
    .returning(['id', 'name', 'email', 'avatar_url', 'country'])
    .executeTakeFirstOrThrow()
}

export function insert(trx: TrxOrDb, regulator: Regulator & { id: string }) {
  return trx
    .insertInto('regulators')
    .values(regulator)
    .returning(['id', 'name', 'email', 'avatar_url', 'country'])
    .executeTakeFirstOrThrow()
}
