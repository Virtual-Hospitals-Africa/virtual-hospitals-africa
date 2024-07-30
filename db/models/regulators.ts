
const regulator_emails = [
  'william.t.weiss@gmail.com',
  'zorachen84613@gmail.com',
  'mike.huang.mikank@gmail.com',
  '812046661lm@gmail.com',
]

import { TrxOrDb } from '../../types.ts'
import { now } from '../helpers.ts'


export function getBySession(trx: TrxOrDb, { regulator_session_id }: {
  regulator_session_id: string
}) {
  return trx.with(
    'matching_session',
    (qb) =>
      qb.updateTable('regulator_sessions')
        .where(
          'regulator_sessions.id',
          '=',
          regulator_session_id,
        )
        .set({ updated_at: now })
        .returning('regulator_sessions.entity_id'),
  ).selectFrom('regulators')
    .innerJoin(
      'matching_session',
      'regulators.id',
      'matching_session.entity_id',
    )
    .selectAll('regulators')
    .executeTakeFirst()
}

export function getByEmail(trx: TrxOrDb, email: string) {
  return trx.selectFrom('regulators')
    .where('email', '=', email)
    .selectAll()
    .executeTakeFirst()
}

export function update(
  trx: TrxOrDb,
  { id, name, avatar_url }: {
    id: string
    name: string
    avatar_url: string
  },
) {
  return trx.updateTable('regulators')
    .set({ name, avatar_url })
    .where('id', '=', id)
    .execute()
}
