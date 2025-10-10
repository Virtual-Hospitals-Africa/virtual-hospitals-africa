import {
  completeAndProceedToNextStep,
  OpenEncounterWorkflowContext,
  OpenEncounterWorkflowPage,
} from '../_middleware.tsx'
import { z } from 'zod'
import { postHandler } from '../../../../../../../../util/postHandler.ts'

const PatientRegistrationBiometricsSchema = z.object({})

export const handler = postHandler(
  PatientRegistrationBiometricsSchema,
  (_req, ctx: OpenEncounterWorkflowContext, form_values) => {
    console.log({ form_values })
    return completeAndProceedToNextStep(ctx)
  },
)

// deno-lint-ignore require-await
export async function PatientRegistrationBiometricsPage(
  _ctx: OpenEncounterWorkflowContext,
) {
  return <>TODO</>
}

export default OpenEncounterWorkflowPage(PatientRegistrationBiometricsPage)
