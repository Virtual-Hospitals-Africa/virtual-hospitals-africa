import { WARNING_SIGNS } from '../../shared/warning_signs.ts'
import { TrxOrDb } from '../../types.ts'

export function getForEncounter(
  trx: TrxOrDb,
  { encounter_id }: { encounter_id: string },
) {
  WARNING_SIGNS
  return trx.selectFrom('warning_signs')
    .where('encounter_id', '=', encounter_id)
    .execute()
}
