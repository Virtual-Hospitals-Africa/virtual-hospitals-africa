import { Media, PatientMedia, ReturnedSqlRow, TrxOrDb } from './../../types.ts'

export function insert(
  trx: TrxOrDb,
  opts: { binary_data: Uint8Array; mime_type: string },
): Promise<ReturnedSqlRow<PatientMedia>> {
  return trx.insertInto('media').values(opts).returningAll()
    .executeTakeFirstOrThrow()
}

export function get(
  trx: TrxOrDb,
  opts: {
    media_id: number
    appointment_id?: number
    nurse_registration_details_id?: number
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

  if (opts.nurse_registration_details_id) {
    query = query.innerJoin(
      'nurse_registration_details',
      'nurse_registration_details.national_id_media_id',
      'media.id',
    ).innerJoin(
      'nurse_registration_details',
      'ncz_registration_card_media_id',
      'media.id',
    )
      .innerJoin(
        'nurse_registration_details',
        'face_picture_media_id',
        'media.id',
      )
      .where(
        'nurse_registration_details.id',
        '=',
        opts.nurse_registration_details_id,
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
