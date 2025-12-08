import { describe, afterAll, it } from 'std/testing/bdd.ts'
import db from '../../db/db.ts'
import { WARNING_SIGNS } from '../../shared/warning_signs.ts'
import { assertArrayEmpty } from '../../util/arraySize.ts'

describe('db/models/warning_signs.ts', () => {
  afterAll(() => db.destroy())
  
  describe('foo', () => {
    it.only('foo', async () => {
      const not_matching = []

      for (const sign of WARNING_SIGNS) {
        const snomed_concept = await db.selectFrom('snomed_inferred_canonical_name_and_category')
          .where('id', '=', sign.finding_snomed_concept_id)
          .selectAll()
          .executeTakeFirst()
        
        if (snomed_concept?.name !== sign.sats_primary_name) {
          const maybe = await db.selectFrom('snomed_inferred_canonical_name_and_category')
            .where('name', '=', sign.sats_primary_name)
            .selectAll()
            .executeTakeFirst()

          not_matching.push({ sign, snomed_concept, maybe })
        }
      }

      console.log(not_matching)
      assertArrayEmpty(not_matching)

  //       sign: {
  //   finding_snomed_concept_id: "284549007",
  //   qualifer_relationship_snomed_concept_id: "246112005",
  //   qualifer_value_snomed_concept_id: "6736007",
  //   qualifer_value_concrete: null,
  //   sats_primary_name: "Burn",
  //   sats_secondary_text: "Moderate pain",
  //   sats_priority_snomed_concept_id: "103391001"
  // },
  // result: {
  //   id: "284549007",
  //   description_id: "678455013",
  //   language_code: "en",
  //   name: "Laceration of hand",
  //   category: "disorder"
  // }
    })
  })
})
