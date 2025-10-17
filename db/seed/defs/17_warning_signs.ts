import z from 'zod'
import { WarningSigns } from '../../../db.d.ts'
import { InsertShape } from '../../../types.ts'
import { define } from '../define.ts'
import { collectTsvResource } from '../../parseTsvResource.ts'
import { snomed_concept_id } from '../../../util/validators.ts'

export const warning_signs: InsertShape<WarningSigns>[] =
  await collectTsvResource(
    'warning_signs',
    z.object({
      id: snomed_concept_id,
      sats_primary_name: z.string(),
      sats_priority_snomed_concept_id: snomed_concept_id,
      sats_secondary_text: z.string().nullable(),
    }),
  )

export default define(
  ['warning_signs'],
  (trx) =>
    trx.insertInto('warning_signs')
      .values(warning_signs)
      .execute(),
)
