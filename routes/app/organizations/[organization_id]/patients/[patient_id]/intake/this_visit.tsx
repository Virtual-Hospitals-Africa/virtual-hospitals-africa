import {
  patientIdentified,
  PatientIntakeContext,
  PatientIntakePage,
} from './_middleware.tsx'
import { z } from 'zod'
import { LoggedInHealthWorkerHandler } from '../../../../../../../types.ts'
import { parseRequest } from '../../../../../../../util/parseForm.ts'
import { completeStep } from './_middleware.tsx'
import * as patient_intake_this_visit from '../../../../../../../db/models/patient_intake_this_visit.ts'
import ThisVisitSection from '../../../../../../../components/patient-intake/ThisVisitSection.tsx'

const PatientIntakeThisVisitSchema = z.object({
  reason: z.enum([
    'seeking treatment',
    'maternity',
    'appointment',
    'follow up',
    'referral',
    'checkup',
    'emergency',
    'other',
  ]),
  emergency: z.boolean().default(false),
  department_id: z.string().uuid(),
  notes: z.string().optional(),
})

export const handler: LoggedInHealthWorkerHandler<PatientIntakeContext> = {
  async POST(req, ctx: PatientIntakeContext) {
    const { trx } = ctx.state
    const patient = patientIdentified(ctx)

    const this_visit_updates = await parseRequest(
      trx,
      req,
      PatientIntakeThisVisitSchema.parse,
    )

    console.log('z', patient)

    await patient_intake_this_visit.upsertReason(trx, {
      patient_intake_id: patient.this_visit.id,
      ...this_visit_updates,
    })

    return completeStep(ctx, patient.personal.id)
  },
}

// deno-lint-ignore require-await
export async function PatientIntakeThisVisitPage(ctx: PatientIntakeContext) {
  const patient = patientIdentified(ctx)
  return (
    <ThisVisitSection
      this_visit={patient.this_visit}
      departments={ctx.state.organization.departments}
    />
  )
}

export default PatientIntakePage(PatientIntakeThisVisitPage)
