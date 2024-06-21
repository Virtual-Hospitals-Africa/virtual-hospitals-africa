import { Pharmacists } from '../../db.d.ts'
import { TrxOrDb } from '../../types.ts'

export function update(
  trx: TrxOrDb,
  pharmacist_id: string,
  data: Omit<Partial<Pharmacists>, 'id' | 'created_at' | 'updated_at'>,
) {
  return trx.updateTable('pharmacists').set(data).where(
    'id',
    '=',
    pharmacist_id,
  ).execute()
}
