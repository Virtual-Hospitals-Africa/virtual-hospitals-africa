import {
  patientIdentified,
  PatientIntakeContext,
  PatientIntakePage,
} from './_middleware.tsx'
import { z } from 'zod'
import { LoggedInHealthWorkerHandler } from '../../../../../../../types.ts'
import { parseRequest } from '../../../../../../../util/parseForm.ts'
import { completeStep } from './_middleware.tsx'

const PatientIntakeBiometricsSchema = z.object({})

export const handler: LoggedInHealthWorkerHandler<PatientIntakeContext> = {
  async POST(req, ctx: PatientIntakeContext) {
    const { trx } = ctx.state
    const patient_id = patientIdentified(ctx).personal.id

    const form_values = await parseRequest(
      trx,
      req,
      PatientIntakeBiometricsSchema.parse,
    )

    console.log({ form_values })

    return completeStep(ctx, patient_id)
  },
}

// deno-lint-ignore require-await
export async function PatientIntakeBiometricsPage(ctx: PatientIntakeContext) {
  const patient = patientIdentified(ctx)
  console.log({ patient })
  return {
    children: <>TODO</>,
    next_step_text: 'End and Save Intake',
  }
}

export default PatientIntakePage(PatientIntakeBiometricsPage)
