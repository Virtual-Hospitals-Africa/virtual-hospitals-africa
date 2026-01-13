import { completeAndProceedToNextStep, OpenEncounterWorkflowContext, OpenEncounterWorkflowPage } from '../_middleware.tsx'
import { z } from 'zod'
import { patient_address } from '../../../../../../../../db/models/patient_address.ts'
import { postHandler } from '../../../../../../../../backend/postHandler.ts'
import PatientContactInformationSection from '../../../../../../../../islands/PatientContactsSection.tsx'
import EmergencyContactSection from '../../../../../../../../islands/EmergencyContactsSection.tsx'
import { EmergencyContactSchema } from '../../../../../../../../shared/family.ts'
import { addressSearchHandler } from '../../../../../../../../util/googleMapsResponses.ts'

export const PatientRegistrationContactsSchema = z.object({
  address: z.object({
    formatted: z.string(),
    country: z.string(),
    administrative_area_level_1: z.string().nullable(),
    administrative_area_level_2: z.string().nullable(),
    locality: z.string().nullable(),
    route: z.string().nullable(),
    street_number: z.string().nullable(),
    unit: z.string().nullable(),
    street: z.string().nullable(),
    postal_code: z.string().nullable(),
  }),
  emergency_contacts: z.array(EmergencyContactSchema).min(1),
})

const addressSearch = addressSearchHandler<OpenEncounterWorkflowContext>({
  country: 'South Africa',
})

export const handler = {
  async GET(ctx: OpenEncounterWorkflowContext) {
    if (ctx.req.headers.get('accept') === 'application/json') {
      if (
        ctx.url.searchParams.has('search') ||
        ctx.url.searchParams.has('place_id')
      ) {
        return await addressSearch.GET(ctx)
      }
    }
    return PatientRegistrationContactsPage(ctx)
  },
  ...postHandler(
    PatientRegistrationContactsSchema,
    async (
      ctx: OpenEncounterWorkflowContext,
      { address, emergency_contacts },
    ) => {
      await Promise.all([
        patient_contacts.setContacts(
          ctx.state.trx,
          { patient_id: ctx.state.patient.id, contacts: emergency_contacts },
        ),
        patient_address.updateById(
          ctx.state.trx,
          { patient_id: ctx.state.patient.id, address: address },
        ),
      ])
      return completeAndProceedToNextStep(ctx)
    },
  ),
}

export async function PatientRegistrationContactsPage(
  ctx: OpenEncounterWorkflowContext,
) {
  const address = await patient_address.getById(ctx.state.trx, {
    patient_id: ctx.state.patient.id,
  })
  return (
    <>
      {/* <AddressSection address={address} /> */}
      <PatientContactInformationSection address={address} />
      <EmergencyContactSection />
    </>
  )
}

export default OpenEncounterWorkflowPage(PatientRegistrationContactsPage)
