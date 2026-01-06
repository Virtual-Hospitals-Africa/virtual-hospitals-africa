import {
  completeAndProceedToNextStep,
  OpenEncounterWorkflowContext,
  OpenEncounterWorkflowPage,
} from '../_middleware.tsx'
import { z } from 'zod'
import { postHandler } from '../../../../../../../../util/postHandler.ts'

export const PatientRegistrationTermsAndConditionsSchema = z.object({})

export const handler = postHandler(
  PatientRegistrationTermsAndConditionsSchema,
  (ctx: OpenEncounterWorkflowContext, form_values) => {
    console.log({ form_values })
    return completeAndProceedToNextStep(ctx)
  },
)

// deno-lint-ignore require-await
export async function PatientRegistrationTermsAndConditionsPage(
  _ctx: OpenEncounterWorkflowContext,
) {
  return <>TODO</>
}

export default OpenEncounterWorkflowPage(
  PatientRegistrationTermsAndConditionsPage,
)
