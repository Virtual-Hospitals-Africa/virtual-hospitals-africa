import {
  Maybe,
  Media,
  PatientMedia,
  ReturnedSqlRow,
  TrxOrDb,
} from './../../types.ts'

export function insert(
  trx: TrxOrDb,
  opts: { binary_data: Uint8Array; mime_type: string },
): Promise<ReturnedSqlRow<PatientMedia>> {
  // deno-lint-ignore no-explicit-any
  return trx.insertInto('media').values(opts as any).returningAll()
    .executeTakeFirstOrThrow()
}

export function get(
  trx: TrxOrDb,
  opts: {
    media_id: number
    appointment_id?: number
  },
): Promise<ReturnedSqlRow<Media>> {
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
): Promise<Maybe<ReturnedSqlRow<Media>>> {
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
