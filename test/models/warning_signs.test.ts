import { afterAll, describe, it } from 'std/testing/bdd.ts'
import db from '../../db/db.ts'
import { WARNING_SIGNS } from '../../shared/warning_signs.ts'
import { assertArrayEmpty } from '../../util/arraySize.ts'

describe('db/models/warning_signs.ts', () => {
  afterAll(() => db.destroy())

  describe('foo', () => {
    it.only('foo', async () => {
      const not_matching = []

      for (const sign of WARNING_SIGNS) {
        const snomed_concept = await db.selectFrom(
          'snomed_inferred_canonical_name_and_category',
        )
          .where('id', '=', sign.finding_snomed_concept_id)
          .selectAll()
          .executeTakeFirst()

        if (snomed_concept?.name !== sign.sats_primary_name) {
          const maybe = await db.selectFrom(
            'snomed_inferred_canonical_name_and_category',
          )
            .where('name', '=', sign.sats_primary_name)
            .selectAll()
            .executeTakeFirst()

          not_matching.push({ sign, snomed_concept, maybe })
        }
      }

      console.log(not_matching)
      assertArrayEmpty(not_matching)
    })
  })
})
