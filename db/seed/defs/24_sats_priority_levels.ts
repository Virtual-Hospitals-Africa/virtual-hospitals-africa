import { SatsPriorityLevels } from '../../../db.d.ts'
import { InsertShape, PRIORITY_SNOMED_CODES } from '../../../types.ts'
import { define } from '../define.ts'
import entries from '../../../util/entries.ts'

export const sats_priority_levels = entries(PRIORITY_SNOMED_CODES).map((
  [sats_name, id],
) => ({ id, sats_name })) satisfies InsertShape<SatsPriorityLevels>[]

export default define(
  ['sats_priority_levels'],
  (trx) =>
    trx.insertInto('sats_priority_levels')
      .values(sats_priority_levels)
      .execute(),
)
