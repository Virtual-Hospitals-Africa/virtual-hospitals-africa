import {
  patientIdentified,
  PatientIntakeContext,
  PatientIntakePage,
} from './_middleware.tsx'
import { z } from 'zod'
import { LoggedInHealthWorkerHandler } from '../../../../../../../types.ts'
import { parseRequest } from '../../../../../../../util/parseForm.ts'
import { completeStep } from './_middleware.tsx'
import { NearestHealthCareSection } from '../../../../../../../islands/NearestHealthCare.tsx'
import {
  setNearestHealthFacility,
  setPrimaryDoctor,
  setUnregisteredPrimaryDoctor,
} from '../../../../../../../db/models/patient_primary_care.ts'

const PatientIntakePrimaryCareSchema = z.object({
  primary_doctor_id: z.string().uuid().optional(),
  primary_doctor_name: z.string(),
  nearest_organization_id: z.string(),
})

export const handler: LoggedInHealthWorkerHandler<PatientIntakeContext> = {
  async POST(req, ctx: PatientIntakeContext) {
    const { trx } = ctx.state
    const patient_id = patientIdentified(ctx).personal.id

    const { primary_doctor_id, primary_doctor_name, nearest_organization_id } =
      await parseRequest(
        trx,
        req,
        PatientIntakePrimaryCareSchema.parse,
      )

    await Promise.all([
      primary_doctor_id
        ? setPrimaryDoctor(trx, {
          patient_id,
          primary_doctor_id,
        })
        : setUnregisteredPrimaryDoctor(trx, {
          patient_id,
          primary_doctor_name,
        }),
      setNearestHealthFacility(trx, {
        patient_id,
        nearest_organization_id,
      }),
    ])
    return completeStep(ctx, patient_id)
  },
}

// deno-lint-ignore require-await
export async function PatientIntakePrimaryCarePage(ctx: PatientIntakeContext) {
  const patient = patientIdentified(ctx)
  return <NearestHealthCareSection {...patient.primary_care} />
}

export default PatientIntakePage(PatientIntakePrimaryCarePage)
