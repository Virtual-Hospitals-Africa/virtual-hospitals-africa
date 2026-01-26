import { afterAll } from 'std/testing/bdd.ts'
import db from '../../db/db.ts'
import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'

import { TASK_DEFS, TASKS } from '../../shared/tasks.ts'
import { pMap } from '../../util/inParallel.ts'
import { nameAndCategorySnomedConceptBase } from '../../db/models/s_expression.ts'
import { assert } from 'std/assert/assert.ts'
import { snomed_concept_id } from '../../util/validators.ts'
import { inverseSExpression } from '../../shared/s_expression_inverse.ts'
import { normalForm } from '../../shared/s_expression.ts'

describeParallel('db/models/additional_tasks.ts', () => {
  afterAll(() => db.destroy())

  itParallel(
    'all of the findings referenced to check_for actually exist',
    async () => {
      await pMap(TASKS, async (task) => {
        if (task.task.procedure.value?.atom !== 'finding') return

        const finding = task.task.procedure.value
        assert(finding.specific_snomed_concept)

        const { id } = await nameAndCategorySnomedConceptBase(
          db,
          finding.specific_snomed_concept,
        )
          .executeTakeFirstOrThrow()
          .catch((err) => {
            err.message = inverseSExpression(finding) + ' does not exist. ' +
              err.message
            throw err
          })
        snomed_concept_id.parse(id)
      })
    },
  )

  itParallel.only('foo', () => {
    console.log(TASK_DEFS.map(t => normalForm(t[1])).join('\n'))
  })
})
