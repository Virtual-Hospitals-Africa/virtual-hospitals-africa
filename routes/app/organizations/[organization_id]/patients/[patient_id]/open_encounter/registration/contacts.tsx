import {
  completeAndProceedToNextStep,
  OpenEncounterWorkflowContext,
  OpenEncounterWorkflowPage,
} from '../_middleware.tsx'
import { z } from 'zod'
import * as patient_address from '../../../../../../../../db/models/patient_address.ts'
import { postHandler } from '../../../../../../../../util/postHandler.ts'
import PatientContactInformationSection from '../../../../../../../../islands/PatientContactsSection.tsx'
import EmergencyContactSection from '../../../../../../../../islands/EmergencyContactsSection.tsx'

const PatientRegistrationContactsSchema = z.object({
  address: z.object({
    street: z.string().optional(),
    locality: z.string(),
    administrative_area_level_2: z.string().optional(),
    administrative_area_level_1: z.string().optional(),
    country: z.string(),
  })
    .or(z.string()) // This is wrong, but trying to move forward
    .optional(),
  emergency_contacts: z.array(z.object({
    name: z.string(),
    relationship: z.string(),
    phone_number: z.string(),
  })).min(1),
})

export const handler = postHandler(
  PatientRegistrationContactsSchema,
  // deno-lint-ignore require-await
  async (
    ctx: OpenEncounterWorkflowContext,
    { address, emergency_contacts },
  ) => {
    console.log('TODO use emergency_contacts', emergency_contacts)
    console.log('TODO use address', address)

    // await patient_address.updateById(
    //   ctx.state.trx,
    //   { patient_id: ctx.state.patient.id, address },
    // )

    return completeAndProceedToNextStep(ctx)
  },
)

export async function PatientRegistrationContactsPage(
  ctx: OpenEncounterWorkflowContext,
) {
  const address = await patient_address.getById(ctx.state.trx, {
    patient_id: ctx.state.patient.id,
  })
  return (
    <div>
      {/* <AddressSection address={address} /> */}
      <PatientContactInformationSection address={address} />
      <EmergencyContactSection />
    </div>
  )
}

export default OpenEncounterWorkflowPage(PatientRegistrationContactsPage)
