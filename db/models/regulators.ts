import { Regulator, TrxOrDb } from '../../types.ts'
import { now } from '../helpers.ts'

export function getBySession(
  trx: TrxOrDb,
  {
    regulator_session_id,
  }: {
    regulator_session_id: string
  },
) {
  return trx
    .with('matching_session', (qb) =>
      qb
        .updateTable('regulator_sessions')
        .where('regulator_sessions.id', '=', regulator_session_id)
        .set({ updated_at: now })
        .returning('regulator_sessions.entity_id'))
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
    .execute()
}

export function upsert(trx: TrxOrDb, regulator: Regulator) {
  return trx
    .insertInto('regulators')
    .values(regulator)
    .onConflict((oc) => oc.column('email').doUpdateSet(regulator))
    .returning(['id', 'name', 'email', 'avatar_url'])
    .executeTakeFirstOrThrow()
}
