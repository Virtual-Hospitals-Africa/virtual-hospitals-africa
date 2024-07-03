import { TrxOrDb } from '../../types.ts'

export function update(
  trx: TrxOrDb,
  pharmacist_id: string,
  data: {
    licence_number?: string
    pin?: string | null
  },
) {
  return trx.updateTable('pharmacists').set(data).where(
    'id',
    '=',
    pharmacist_id,
  ).execute()
}
