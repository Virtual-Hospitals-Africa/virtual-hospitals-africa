import { completeAndProceedToNextStep, OpenEncounterWorkflowContext, OpenEncounterWorkflowPage } from '../_middleware.tsx'
import { z } from 'zod'
import { patient_emergency_contacts } from '../../../../../../../../db/models/patient_emergency_contacts.ts'
import { patient_address } from '../../../../../../../../db/models/patient_address.ts'
import { postHandler } from '../../../../../../../../backend/postHandler.ts'
import PatientContactInformationSection from '../../../../../../../../islands/PatientContactsSection.tsx'
import EmergencyContactSection from '../../../../../../../../islands/EmergencyContactsSection.tsx'
import { EmergencyContactSchema } from '../../../../../../../../shared/family.ts'
import { patient_contacts } from '../../../../../../../../db/models/patient_contacts.ts'
import { SERVER_COUNTRY } from '../../../../../../../../db/models/countries.ts'
import { getPlaceDetails } from '../../../../../../../../external-clients/google-maps.ts'
import { assertOr404 } from '../../../../../../../../util/assertOr.ts'
import { international_phone_number } from '../../../../../../../../util/validators.ts'

export const PatientRegistrationContactsSchema = z.object({
  google_maps_place_id: z.string(),
  phone_number: international_phone_number.optional(),
  emergency_contacts: z.array(EmergencyContactSchema).min(1),
})

export const handler = postHandler(
  PatientRegistrationContactsSchema,
  async (
    ctx: OpenEncounterWorkflowContext,
    { google_maps_place_id, phone_number, emergency_contacts },
  ) => {
    await Promise.all([
      patient_emergency_contacts.setContacts(
        ctx.state.trx,
        { patient_id: ctx.state.patient.id, contacts: emergency_contacts },
      ),
      getPlaceDetails(google_maps_place_id).then((address) => {
        assertOr404(address, `No google maps place exists with id ${google_maps_place_id}`)

        return patient_address.updateByPatientId(
          ctx.state.trx,
          {
            patient_id: ctx.state.patient.id,
            address: {
              ...address,
              google_maps_place_id,
            },
          },
        )
      }),
      patient_contacts.updatePhoneNumber(
        ctx.state.trx,
        { patient_id: ctx.state.patient.id, phone_number },
      ),
    ])
    return completeAndProceedToNextStep(ctx)
  },
)

export async function PatientRegistrationContactsPage(
  ctx: OpenEncounterWorkflowContext,
) {
  const address = await patient_address.getByPatientId(ctx.state.trx, {
    patient_id: ctx.state.patient.id,
  })
  const existing_contacts = await patient_emergency_contacts.getByPatientId(
    ctx.state.trx,
    { patient_id: ctx.state.patient.id },
  )
  const patient_phone = (await patient_contacts.get(
    ctx.state.trx,
    { patient_id: ctx.state.patient.id },
  ))?.phone_number ?? undefined

  return (
    <>
      <PatientContactInformationSection
        address={address}
        default_country={SERVER_COUNTRY}
        phone_number={patient_phone}
        organization_id={ctx.state.organization.id}
      />
      <EmergencyContactSection existing_contacts={existing_contacts} />
    </>
  )
}

export default OpenEncounterWorkflowPage(PatientRegistrationContactsPage)
