import { sql } from 'kysely'
import { GoogleTokens, IdSelection, TrxOrDb } from '../../types.ts'
import { base, simpleBaseQuery } from './_base.ts'

// Shave a minute so that we refresh too early rather than too late
const expires_in_an_hour_sql = sql<
  Date
>`(SELECT now() + (59 * interval '1 minute'))`

export type EntityType = 'health_worker' | 'regulator'

const baseQuery = simpleBaseQuery('google_tokens' as const)

export const google_tokens = base({
  top_level_table: 'google_tokens' as const,
  baseQuery,
  formatResult: (
    x,
  ): GoogleTokens & {
    id: string
    entity_id: string
    entity_type: EntityType
  } => x,
  handleSearch(qb, search_terms: { entity_type?: EntityType }) {
    if (search_terms.entity_type) {
      return qb.where('entity_type', '=', search_terms.entity_type)
    }
    return qb
  },

  async upsert(
    trx: TrxOrDb,
    entity_type: EntityType,
    entity_id: string | IdSelection,
    tokens: GoogleTokens,
  ) {
    const result = await trx
      .insertInto('google_tokens')
      .values({
        entity_type,
        entity_id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: tokens.expires_at,
      })
      .onConflict((oc) =>
        oc.column('entity_id').doUpdateSet({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: tokens.expires_at,
        })
      )
      .returningAll()
      .executeTakeFirst()
    return result
  },

  async updateTokensByEmail(
    trx: TrxOrDb,
    entity_type: EntityType,
    email: string,
    tokens: GoogleTokens,
  ): Promise<null | { id: string }> {
    const table_name = entity_type === 'health_worker'
      ? 'health_workers'
      : 'regulators'
    const entity = await trx.selectFrom(table_name).where(
      'email',
      '=',
      email,
    ).select('id').executeTakeFirst()
    if (!entity) return null
    await google_tokens.upsert(trx, entity_type, entity.id, tokens)
    return entity
  },

  getByEntityId(
    trx: TrxOrDb,
    entity_type: EntityType,
    entity_id: string,
  ): Promise<
    (GoogleTokens & { entity_id: string; entity_type: EntityType }) | undefined
  > {
    return trx
      .selectFrom('google_tokens')
      .where('entity_type', '=', entity_type)
      .where('entity_id', '=', entity_id)
      .select([
        'entity_id',
        'entity_type',
        'access_token',
        'refresh_token',
        'expires_at',
      ])
      .executeTakeFirst()
  },

  getAllAboutToExpire(trx: TrxOrDb): Promise<
    Array<{ entity_id: string; entity_type: EntityType } & GoogleTokens>
  > {
    return trx
      .selectFrom('google_tokens')
      .select([
        'entity_id',
        'entity_type',
        'access_token',
        'refresh_token',
        'expires_at',
      ])
      .where(
        'google_tokens.expires_at',
        '<',
        sql<Date>`now() + (5 * interval '1 minute')`,
      )
      .execute()
  },

  updateAccessToken(
    trx: TrxOrDb,
    entity_type: EntityType,
    entity_id: string,
    access_token: string,
  ) {
    return trx
      .updateTable('google_tokens')
      .where('entity_type', '=', entity_type)
      .where('entity_id', '=', entity_id)
      .set({ access_token, expires_at: expires_in_an_hour_sql })
      .executeTakeFirstOrThrow()
  },

  removeExpiredAccessToken(
    trx: TrxOrDb,
    entity_type: EntityType,
    entity_id: string,
  ) {
    return trx.deleteFrom('google_tokens')
      .where('entity_type', '=', entity_type)
      .where('entity_id', '=', entity_id)
      .executeTakeFirstOrThrow()
  },
})
