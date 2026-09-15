import type { OpenEncounterContext } from '../types.ts'
import type { Workflow } from '../db.d.ts'
import { WORKFLOW_STEPS } from '../shared/workflow.ts'
import { assertOr400 } from '../util/assertOr.ts'
import compact from '../util/compact.ts'

/*
  For routes that sit outside any workflow. The workflow is the patient's current one,
  but the encounter only tracks which steps are complete, not which step page the
  health worker is on (they may be revisiting a completed step). So the step comes
  from the referer, whose path must be a step of the current workflow declared in
  shared/workflow.ts for this very encounter.
*/
export function workflowStepFromReferer(
  ctx: OpenEncounterContext,
): { workflow: Workflow; step: string } {
  const { current_workflow } = ctx.state.encounter.status.patient_presence
  assertOr400(current_workflow, 'The patient must be in a workflow to add a finding')

  const referer = ctx.req.headers.get('referer')
  assertOr400(referer, 'Missing referer header, expected to be sent from a workflow step page')

  const { pathname } = new URL(referer, ctx.url.origin)
  const workflow_step_prefix = `${ctx.state.open_encounter_pathname}/${current_workflow}/`
  assertOr400(
    pathname.startsWith(workflow_step_prefix),
    `Expected referer to be a ${current_workflow} step page of this patient's open encounter, got: ${pathname}`,
  )

  const [step, ...rest] = compact(pathname.slice(workflow_step_prefix.length).split('/'))
  assertOr400(step && WORKFLOW_STEPS[current_workflow].includes(step), `Invalid step in referer for ${current_workflow}: ${step}`)
  assertOr400(rest.length === 0, `Unexpected trailing path in referer: ${pathname}`)

  return { workflow: current_workflow, step }
}
