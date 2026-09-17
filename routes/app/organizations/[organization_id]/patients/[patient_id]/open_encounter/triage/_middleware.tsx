import { TriageContext, TriageState } from '../../../../../../../../types.ts'
import { assertOr400, assertOrRedirect } from '../../../../../../../../util/assertOr.ts'
import { OpenEncounterWorkflowPage, type Render, workflowHandler } from '../_middleware.tsx'

export const handler = workflowHandler

export function redirectToRoutePatientIfEmergency(ctx: TriageContext) {
  assertOrRedirect(
    ctx.state.encounter.priority?.name !== 'Emergency',
    `${ctx.state.open_encounter_pathname}/triage/route_patient`,
  )
}

export function TriagePage<State extends TriageState = TriageState>(
  render: Render<State>,
) {
  return OpenEncounterWorkflowPage<State>((ctx) => {
    assertOr400(ctx.state.patient_age_determination, 'Age must be known to do triage')
    return render(ctx)
  })
}
