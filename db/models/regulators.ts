import { Regulator, TrxOrDb } from '../../types.ts'
import { now } from '../helpers.ts'
import { sql } from 'kysely'

export const avatar_url_sql = sql<string | null>`
  CASE WHEN regulators.avatar_media_id IS NOT NULL
    THEN concat('/app/regulators/', regulators.id::text, '/avatar')
    ELSE NULL
  END
`

export const regulators = {
  getBySession(trx: TrxOrDb, { session_id }: {
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
  },
  getByEmail(trx: TrxOrDb, email: string) {
    return trx
      .selectFrom('regulators')
      .where('email', '=', email)
      .selectAll()
      .executeTakeFirst()
  },
  update(
    trx: TrxOrDb,
    {
      id,
      name,
      avatar_media_id,
    }: {
      id: string
      name: string
      avatar_media_id: string | null
    },
  ) {
    return trx
      .updateTable('regulators')
      .set({ name, avatar_media_id })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow()
  },
  upsert(trx: TrxOrDb, regulator: Regulator & { id?: string }) {
    return trx
      .insertInto('regulators')
      .values(regulator)
      .onConflict((oc) => oc.column('email').doUpdateSet(regulator))
      .onConflict((oc) => oc.column('id').doUpdateSet(regulator))
      .returning(['id', 'name', 'email', 'country'])
      .executeTakeFirstOrThrow()
  },
  insert(trx: TrxOrDb, regulator: Regulator & { id: string }) {
    return trx
      .insertInto('regulators')
      .values(regulator)
      .returning(['id', 'name', 'email', 'country'])
      .executeTakeFirstOrThrow()
  },
  getAvatar(trx: TrxOrDb, opts: { regulator_id: string }) {
    return trx
      .selectFrom('media')
      .innerJoin('regulators', 'regulators.avatar_media_id', 'media.id')
      .select(['media.mime_type', 'media.binary_data'])
      .where('regulators.id', '=', opts.regulator_id)
      .executeTakeFirst()
  },
}
