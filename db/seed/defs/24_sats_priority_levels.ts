import type { DB } from '../../../db.d.ts'

import { define } from '../define.ts'
import entries from '../../../util/entries.ts'
import { PRIORITY_SNOMED_CODES } from '../../../shared/priorities.ts'
import { InsertObject } from 'kysely'

export const sats_priority_levels = entries(PRIORITY_SNOMED_CODES).map((
  [sats_name, id],
) => ({ id, sats_name })) satisfies InsertObject<DB, 'sats_priority_levels'>[]

export default define(
  ['sats_priority_levels'],
  (trx) =>
    trx.insertInto('sats_priority_levels')
      .values(sats_priority_levels)
      .execute(),
)
