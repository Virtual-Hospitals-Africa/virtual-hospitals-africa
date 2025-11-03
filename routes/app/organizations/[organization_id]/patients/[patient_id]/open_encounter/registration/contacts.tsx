import {
  completeAndProceedToNextStep,
  OpenEncounterWorkflowContext,
  OpenEncounterWorkflowPage,
} from '../_middleware.tsx'
import { z } from 'zod'
import * as patient_address from '../../../../../../../../db/models/patient_address.ts'
import AddressSection from '../../../../../../../../components/patient-registration/AddressSection.tsx'
import { postHandler } from '../../../../../../../../util/postHandler.ts'

const PatientRegistrationContactsSchema = z.object({
  address: z.object({
    street: z.string().optional(),
    locality: z.string(),
    administrative_area_level_2: z.string().optional(),
    administrative_area_level_1: z.string().optional(),
    country: z.string(),
  }),
})

export const handler = postHandler(
  PatientRegistrationContactsSchema,
  async (ctx: OpenEncounterWorkflowContext, { address }) => {
    await patient_address.updateById(
      ctx.state.trx,
      { patient_id: ctx.state.patient.id, address },
    )

    return completeAndProceedToNextStep(ctx)
  },
)

export async function PatientRegistrationContactsPage(
  ctx: OpenEncounterWorkflowContext,
) {
  const address = await patient_address.getById(ctx.state.trx, {
    patient_id: ctx.state.patient.id,
  })
  return <AddressSection address={address} />
}

export default OpenEncounterWorkflowPage(PatientRegistrationContactsPage)
