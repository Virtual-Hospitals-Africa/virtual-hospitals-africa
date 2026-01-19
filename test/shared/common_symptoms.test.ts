import { afterAll, describe, it } from 'std/testing/bdd.ts'
import db from '../../db/db.ts'
import { nameAndCategorySnomedConceptBase } from '../../db/models/s_expression.ts'
import { COMMON_SYMPTOMS } from '../../shared/common_symptoms.ts'
import { defined_finding } from '../../shared/s_expression_schemas.ts'
import { parseWithSchema } from '../../shared/s_expression.ts'
import { assert } from 'std/assert/assert.ts'
import { humanReadableJson } from '../../util/humanReadableJson.ts'

describe('shared/common_symptoms.ts', () => {
  afterAll(() => db.destroy())
  it('refers to existing snomed concepts in each case', async () => {
    for (const symptom of COMMON_SYMPTOMS) {
      const { specific_snomed_concept } = parseWithSchema(symptom.clinical_finding_s_expression, defined_finding)
      const result = await nameAndCategorySnomedConceptBase(db, specific_snomed_concept)
        .executeTakeFirst()
      assert(result, `No snomed concept found for ${humanReadableJson(symptom)}`)
    }
  })
})
