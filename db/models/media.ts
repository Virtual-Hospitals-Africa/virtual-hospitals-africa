import { PatientMedia, ReturnedSqlRow, TrxOrDb } from './../../types.ts'
import { sql } from 'kysely'
import * as whatsapp from '../../external-clients/whatsapp.ts'

export async function getPatientMediaCount(
  trx: TrxOrDb,
  opts: { paitent_id: number },
): Promise<number> {
  const result = await sql<number>`
  SELECT COUNT(*)
  FROM media
  WHERE patient_id = ${opts.paitent_id}`.execute(trx)
  return result.rows[0]
}

export async function insertMediaReceived(
  trx: TrxOrDb,
  opts: { phone_number: string; media_id: string; file_name: string },
): Promise<ReturnedSqlRow<PatientMedia>> {
  const { url, mime_type } = await whatsapp.get(opts.media_id)
  const mediaFile = await whatsapp.getBinaryData(url)

  return await trx.insertInto('media').values({
    binary_data: mediaFile,
    file_name: opts.file_name,
    file_type: mime_type,
  }).returningAll().executeTakeFirstOrThrow()
}
