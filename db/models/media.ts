import { PatientMedia, ReturnedSqlRow, TrxOrDb } from './../../types.ts'
import { sql } from 'kysely'
import * as whatsapp from '../../external-clients/whatsapp.ts'

export async function getPatientMediaCount(
  trx: TrxOrDb,
  opts: {paitent_id: number})
:Promise<number>{
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
  return await trx.selectFrom('media').where('patient_id', '=', opts.patient_id)
    .selectAll().execute()
}

export async function addMedia(
  trx: TrxOrDb,
  opts: { patient_id: number; media_id: string },
): Promise<ReturnedSqlRow<PatientMedia>> {
  const { url, mime_type } = await whatsapp.get(opts.media_id)
  const mediaFile = await whatsapp.getBinaryData(url)

  return await trx.insertInto('media').values(
    {
      file_name: 'testing123',
      file_type: mime_type,
      binary_data: mediaFile,
      id: opts.media_id,
      patient_id: opts.patient_id,
    },
  ).returningAll().execute()
}
