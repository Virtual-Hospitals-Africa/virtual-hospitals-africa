import { firstIncompleteStepStatus, WORKFLOW_STEPS } from '../../../../../../../shared/workflow.ts'
import redirect from '../../../../../../../util/redirect.ts'
import { OpenEncounterContext, OpenEncounterWorkflowContext } from './_middleware.tsx'
import { preferredName } from '../../../../../../../util/asNames.ts'

export function redirectToFirstIncompleteStep<T>(ctx: OpenEncounterContext<T> | OpenEncounterWorkflowContext<T>, opts?: { warning_message: string }) {
  const workflow = ctx.state.encounter.status.patient_presence.current_workflow
  if (!workflow) {
    return redirect('/app', {
      warning: `No current workflow for ${preferredName(ctx.state.patient, 'the patient')} found`,
    })
  }
  const workflow_status = ctx.state.encounter.workflows[workflow]
  const first_step = workflow_status ? firstIncompleteStepStatus(workflow_status) : WORKFLOW_STEPS[workflow][0]
  const search_params = ctx.url.searchParams
  if (opts?.warning_message) {
    search_params.set('warning', opts.warning_message)
  }

  return redirect(
    `${ctx.state.open_encounter_pathname}/${workflow}/${first_step}`,
    search_params,
  )
}
