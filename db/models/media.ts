import { Media, PatientMedia, ReturnedSqlRow, TrxOrDb } from './../../types.ts'
import { sql } from 'kysely'

export async function getPatientMediaCount(
  trx: TrxOrDb,
  opts: { paitent_id: number },
): Promise<number> {
  const result = await sql<number>`
    SELECT COUNT(*)
    FROM media
    WHERE patient_id = ${opts.paitent_id}
  `.execute(trx)
  return result.rows[0]
}

export async function insert(
  trx: TrxOrDb,
  opts: { binary_data: Uint8Array; mime_type: string },
): Promise<ReturnedSqlRow<PatientMedia>> {
  return await trx.insertInto('media').values(opts).returningAll()
    .executeTakeFirstOrThrow()
}

export async function retrieveImage(
  trx: TrxOrDb,
  opts: { media_id: number },
): Promise<BinaryData> {
  const { binary_data } = await trx.selectFrom('media').where(
    'media.id',
    '=',
    opts.media_id,
  ).select('binary_data').executeTakeFirstOrThrow()
  return binary_data
}

export function get(
  trx: TrxOrDb,
  opts: { media_id: number },
): Promise<ReturnedSqlRow<Media>> {
  return trx
    .selectFrom('media')
    .where(
      'media.id',
      '=',
      opts.media_id,
    )
    .selectAll()
    .executeTakeFirstOrThrow()
}
