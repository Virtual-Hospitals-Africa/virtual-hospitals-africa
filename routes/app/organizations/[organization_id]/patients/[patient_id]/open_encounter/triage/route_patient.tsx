import { z } from 'zod'
import { VerticalRadioButtons } from '../../../../../../../../components/library/VerticalRadioButtons.tsx'
import { updateForOpenEncounterAfterCompletingWorkflow } from '../../../../../../../../db/models/patient_presence.ts'
import { pluralize } from '../../../../../../../../util/pluralize.ts'
import { postHandler } from '../../../../../../../../util/postHandler.ts'
import { promiseProps } from '../../../../../../../../util/promiseProps.ts'
import redirect from '../../../../../../../../util/redirect.ts'
import {
  completeLastStep,
  nextRouteAfterCompletingWorkflow,
  OpenEncounterWorkflowContext,
  OpenEncounterWorkflowPage,
} from '../_middleware.tsx'

const TriageRoutePatientSchema = z.object({
  triage_route_patient: z.enum([
    'consultation',
    'stabilization',
    'call_for_help',
  ]),
})

const senoirHealthCareWorker = 'Ramasela Le Roux'
const patientName = 'Lukman'
const targetTreatmentTime = 10

const mockData = [
  {
    id: 'consultation',
    name: 'Consultation with primary care department',
    description: [
      `I will transfer ${patientName} to the waiting room`,
      `The next available health worker will see ${patientName}`,
      `Target time to treatment: ${targetTreatmentTime} minute ${
        pluralize(
          'minute',
          targetTreatmentTime,
        )
      }`,
    ],
  },
  {
    id: 'stablization',
    name: 'Stabilization with emergency department',
    description: [
      `I will transfer ${patientName} to the stabilization area`,
      `${senoirHealthCareWorker} will be notified immediately to meet us in the stabilization area`,
    ],
  },
  {
    id: 'call_for_help',
    name: 'Call for help in triage area',
    description: [
      `I will stay here in the triage area with ${patientName}`,
      `${senoirHealthCareWorker} will be notified immediately to join us in the triage area`,
    ],
  },
]

// https://localhost:8000/app/organizations/00000000-0000-0000-0000-000000000001/patients/fb486201-0fc8-49a6-8fb6-1e509fe69599/open_encounter/triage/route_patient

export const handler = postHandler(
  TriageRoutePatientSchema,
  async (_req, ctx: OpenEncounterWorkflowContext, _form_values) => {
    console.log('\n\nn===============', _form_values)
    const { trx, encounter, organization_employment } = ctx.state

    const { next_patient_presence } = await promiseProps({
      completed_last_step: completeLastStep(ctx),
      next_patient_presence: updateForOpenEncounterAfterCompletingWorkflow(
        trx,
        encounter,
        organization_employment,
      ),
    })

    return redirect(
      nextRouteAfterCompletingWorkflow(ctx, next_patient_presence),
    )
  },
)

// deno-lint-ignore require-await
export async function TriageRoutePatientPage(
  _ctx: OpenEncounterWorkflowContext,
) {
  return (
    <VerticalRadioButtons
      options={mockData}
      name='triage_route_patient'
      defaultValue='consultation'
    />
  )
}

export default OpenEncounterWorkflowPage(TriageRoutePatientPage)
