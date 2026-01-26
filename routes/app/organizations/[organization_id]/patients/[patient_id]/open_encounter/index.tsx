import { firstIncompleteStepStatus, WORKFLOW_STEPS } from '../../../../../../../shared/workflow.ts'
import redirect from '../../../../../../../util/redirect.ts'
import { OpenEncounterContext } from './_middleware.tsx'
import { preferredName } from '../../../../../../../util/asNames.ts'

// deno-lint-ignore require-await
export default async function RedirectToFirstIncompleteStep(ctx: OpenEncounterContext) {
  const workflow = ctx.state.encounter.status.patient_presence.current_workflow
  if (!workflow) {
    return redirect('/app', {
      warning: `No current workflow for ${preferredName(ctx.state.patient, 'the patient')} found`,
    })
  }
  const workflow_status = ctx.state.encounter.workflows[workflow]

  const first_step = workflow_status ? firstIncompleteStepStatus(workflow_status) : WORKFLOW_STEPS[workflow][0]
  return redirect(
    `${ctx.state.open_encounter_pathname}/${workflow}/${first_step}`,
    ctx.url.searchParams,
  )
}

// export default async function RedirectToFirstIncompleteStep(ctx: OpenEncounterContext) {
//   const encounter_workflows = compactMap(WORKFLOWS, (workflow) => ctx.state.encounter.workflows[workflow])
//   const workflow_status = encounter_workflows.find((w) => w.status === 'in progress') ||
//     encounter_workflows.find((w) => w.status === 'incomplete') ||
//     encounter_workflows.find((w) => w.status === 'not started')

//   assertOr400(workflow_status, 'No workflows found')

//   const first_step = firstIncompleteStepStatus(workflow_status) || WORKFLOW_STEPS[workflow_status.workflow][0]
//   return redirect(
//     path(
//       replaceParams(
//         `/app/organizations/:organization_id/patients/:patient_id/open_encounter/${workflow_status.workflow}/${first_step}`,
//         ctx.params,
//       ),
//       ctx.url.searchParams
//     )
//   )
// }
