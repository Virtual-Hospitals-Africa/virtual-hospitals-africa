import { completeAndProceedToNextStep, OpenEncounterWorkflowPage } from '../_middleware.tsx'
import type { OpenEncounterWorkflowPostContext } from '../../../../../../../../types.ts'
import { z } from 'zod'
import { postHandler } from '../../../../../../../../backend/postHandler.ts'

export const PatientRegistrationTermsAndConditionsSchema = z.object({})

export const handler = postHandler(
  PatientRegistrationTermsAndConditionsSchema,
  (ctx: OpenEncounterWorkflowPostContext, _form_values) => {
    return completeAndProceedToNextStep(ctx)
  },
)

// deno-lint-ignore require-await
export async function PatientRegistrationTermsAndConditionsPage(
  _ctx: OpenEncounterWorkflowPostContext,
) {
  return <>TODO</>
}

export default OpenEncounterWorkflowPage(
  PatientRegistrationTermsAndConditionsPage,
)
