import { sql } from 'kysely'
import { HasStringId, Maybe, Media, TrxOrDb } from './../../types.ts'

export function insert(
  trx: TrxOrDb,
  opts: { binary_data: Uint8Array; mime_type: string },
): Promise<{
  id: string
  mime_type: string
  url: string
}> {
  return trx.insertInto('media')
    // deno-lint-ignore no-explicit-any
    .values(opts as any)
    .returning([
      'id',
      'mime_type',
      sql<string>`concat('/app/media/', uuid)`.as('url'),
    ])
    .executeTakeFirstOrThrow()
}

export function get(
  trx: TrxOrDb,
  opts: {
    media_id: string
    appointment_id?: string
  },
): Promise<HasStringId<Media>> {
  let query = trx
    .selectFrom('media')
    .where(
      'media.id',
      '=',
      opts.media_id,
    )

  if (opts.appointment_id) {
    query = query
      .innerJoin(
        'appointment_media',
        'appointment_media.media_id',
        'media.id',
      )
      .where(
        'appointment_media.appointment_id',
        '=',
        opts.appointment_id,
      )
  }

  return query
    .select([
      'media.id',
      'media.mime_type',
      'media.binary_data',
      'media.created_at',
      'media.updated_at',
    ])
    .executeTakeFirstOrThrow()
}

export function getByUUID(
  trx: TrxOrDb,
  uuid: string,
): Promise<Maybe<HasStringId<Media>>> {
  return trx
    .selectFrom('media')
    .where(
      'media.uuid',
      '=',
      uuid,
    ).select([
      'media.id',
      'media.mime_type',
      'media.binary_data',
      'media.created_at',
      'media.updated_at',
    ])
    .executeTakeFirst()
}
