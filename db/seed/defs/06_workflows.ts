import { define } from '../define.ts'
import {
  WORKFLOW_SNOMED_CONCEPT_IDS,
  WORKFLOWS,
} from '../../../shared/workflow.ts'
import entries from '../../../util/entries.ts'
import { ensureAllEnumValuesExist } from '../../helpers.ts'

export default define(['workflows'], async (trx) => {
  await ensureAllEnumValuesExist(trx, 'workflow', WORKFLOWS)

  const workflows = entries(WORKFLOW_SNOMED_CONCEPT_IDS).map(
    ([workflow, snomed_concept_id], index) => ({
      workflow,
      snomed_concept_id,
      order: index + 1,
    }),
  )

  await trx.insertInto('workflows')
    .values(workflows)
    .execute()
})
