import { DeleteResult, sql, UpdateResult } from 'kysely'
import { GoogleTokens, HasStringId, TrxOrDb } from '../../types.ts'
import { assert } from 'std/assert/assert.ts'

// Shave a minute so that we refresh too early rather than too late
const expiresInAnHourSql = sql<
  Date
>`(SELECT now() + (59 * interval '1 minute'))`

export type EntityType = 'health_worker' | 'regulator'

export function upsert(
  trx: TrxOrDb,
  entity_type: EntityType,
  entity_id: string,
  tokens: GoogleTokens,
): Promise<HasStringId<GoogleTokens> | undefined> {
  assert(entity_id)
  return trx
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
}

export async function updateTokensByEmail(
  trx: TrxOrDb,
  entity_type: EntityType,
  email: string,
  tokens: GoogleTokens,
): Promise<null | { id: string }> {
  const tableName = entity_type === 'health_worker'
    ? 'health_workers'
    : 'regulators'
  const entity = await trx.selectFrom(tableName).where(
    'email',
    '=',
    email,
  ).select('id').executeTakeFirst()
  if (!entity) return null
  await upsert(trx, entity_type, entity.id, tokens)
  return entity
}

export function getByEntityId(
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
}

export function getAllAboutToExpire(trx: TrxOrDb): Promise<
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
}

export function updateAccessToken(
  trx: TrxOrDb,
  entity_type: EntityType,
  entity_id: string,
  access_token: string,
): Promise<UpdateResult> {
  return trx
    .updateTable('google_tokens')
    .where('entity_type', '=', entity_type)
    .where('entity_id', '=', entity_id)
    .set({ access_token, expires_at: expiresInAnHourSql })
    .executeTakeFirstOrThrow()
}

export function removeExpiredAccessToken(
  trx: TrxOrDb,
  entity_type: EntityType,
  entity_id: string,
): Promise<DeleteResult> {
  return trx.deleteFrom('google_tokens')
    .where('entity_type', '=', entity_type)
    .where('entity_id', '=', entity_id)
    .executeTakeFirstOrThrow()
}
