import { afterAll } from 'std/testing/bdd.ts'
import db from '../../db/db.ts'
import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'

import { TASKS } from '../../shared/tasks.ts'
import { pMap } from '../../util/inParallel.ts'
import { nameAndCategorySnomedConceptBase } from '../../db/models/s_expression.ts'
import { assert } from 'std/assert/assert.ts'
import { snomed_concept_id } from '../../util/validators.ts'
import { inverseSExpression } from '../../shared/s_expression_inverse.ts'

describeParallel('db/models/additional_tasks.ts', () => {
  afterAll(() => db.destroy())

  itParallel(
    'all of the findings referenced to check_for actually exist',
    async () => {
      await pMap(TASKS, async (task) => {
        if (!Array.isArray(task.procedure.value)) return

        for (const finding of task.procedure.value) {
          const snomed_concept = finding.atom === 'measurement' ? finding.snomed_concept : finding.specific_snomed_concept

          assert(snomed_concept)

          const { id } = await nameAndCategorySnomedConceptBase(
            db,
            snomed_concept,
          )
            .executeTakeFirstOrThrow()
            .catch((err) => {
              err.message = inverseSExpression(finding) + ' does not exist. ' +
                err.message
              throw err
            })
          snomed_concept_id.parse(id)
        }
      })
    },
  )
})
