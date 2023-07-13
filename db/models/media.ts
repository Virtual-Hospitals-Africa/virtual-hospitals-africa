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

export async function getAllPatientMedia(
  trx: TrxOrDb,
  opts: { patient_id: number },
): Promise<ReturnedSqlRow<PatientMedia>[]> {
  const patient = await trx.selectFrom('patients').where(
    'id',
    '=',
    opts.patient_id,
  ).select('phone_number').execute()
  const { phone_number } = patient[0]
  return await trx.selectFrom('media').where('phone_number', '=', phone_number)
    .selectAll().execute()
}

export async function insertMediaReceived(
  trx: TrxOrDb,
  opts: { phone_number: string; media_id: string },
) {
  const { url, mime_type } = await whatsapp.get(opts.media_id)
  const mediaFile = await whatsapp.getBinaryData(url)

  return await trx.insertInto('media').values({
    media_id: opts.media_id,
    phone_number: opts.phone_number,
    binary_data: mediaFile,
    file_name: 'abc',
    file_type: mime_type,
  }).returningAll().execute()
}
