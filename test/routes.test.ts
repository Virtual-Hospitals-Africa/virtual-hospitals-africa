import { describe, it } from 'std/testing/bdd.ts'
import { Workflow, WORKFLOW_STEPS } from '../shared/workflow.ts'
import entries from '../util/entries.ts'
import { forEach } from '../util/inParallel.ts'

const SUPPORTED_WORKFLOWS = new Set<Workflow>([
  'registration',
  'triage',
  'consultation',
])

function* allSupportedWorkflowSteps() {
  for (const [workflow, steps] of entries(WORKFLOW_STEPS)) {
    if (!SUPPORTED_WORKFLOWS.has(workflow)) continue
    for (const step of steps) {
      yield { workflow, step }
    }
  }
}

describe(
  '/app/organizations/[organization_id]/patients/[patient_id]/open_encounter',
  () => {
    it('has a .tsx file for every supported workflow step', async () => {
      await forEach(allSupportedWorkflowSteps(), async ({ workflow, step }) => {
        const path =
          `routes/app/organizations/[organization_id]/patients/[patient_id]/open_encounter/${workflow}/${step}.tsx`
        await Deno.readFile(path)
      })
    })
  },
)
