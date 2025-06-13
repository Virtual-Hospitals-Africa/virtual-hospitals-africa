import {
  patientIdentified,
  PatientIntakeContext,
  PatientIntakePage,
} from './_middleware.tsx'
import { z } from 'zod'
import { LoggedInHealthWorkerHandler } from '../../../../../../../types.ts'
import * as patient_address from '../../../../../../../db/models/patient_address.ts'
import { parseRequest } from '../../../../../../../util/parseForm.ts'
import { completeStep } from './_middleware.tsx'
import AddressSection from '../../../../../../../components/patient-intake/AddressSection.tsx'

const PatientIntakeContactsSchema = z.object({
  address: z.object({
    street: z.string().optional(),
    locality: z.string(),
    administrative_area_level_2: z.string().optional(),
    administrative_area_level_1: z.string().optional(),
    country: z.string(),
  }),
})

export const handler: LoggedInHealthWorkerHandler<PatientIntakeContext> = {
  async POST(req, ctx: PatientIntakeContext) {
    const { trx } = ctx.state
    const patient_id = patientIdentified(ctx).personal.id

    const { address } = await parseRequest(
      trx,
      req,
      PatientIntakeContactsSchema.parse,
    )

    await patient_address.updateById(
      trx,
      { patient_id, address },
    )

    return completeStep(ctx, patient_id)
  },
}

// deno-lint-ignore require-await
export async function PatientIntakeContactsPage(ctx: PatientIntakeContext) {
  const patient = patientIdentified(ctx)
  console.log({ patient })
  return (
    <>
      <AddressSection address={patient.address} />
    </>
  )
}

export default PatientIntakePage(PatientIntakeContactsPage)
