import { completeAndProceedToNextStep, OpenEncounterWorkflowContext, OpenEncounterWorkflowPage } from '../_middleware.tsx'
import { z } from 'zod'
import { patient_emergency_contacts } from '../../../../../../../../db/models/patient_emergency_contacts.ts'
import * as patient_address from '../../../../../../../../db/models/patient_address.ts'
import { postHandler } from '../../../../../../../../backend/postHandler.ts'
import PatientContactInformationSection from '../../../../../../../../islands/PatientContactsSection.tsx'
import EmergencyContactSection from '../../../../../../../../islands/EmergencyContactsSection.tsx'
import { EmergencyContactSchema } from '../../../../../../../../shared/family.ts'
import { patient_contacts } from '../../../../../../../../db/models/patient_contacts.ts'

const AddressSchema = z.preprocess(
  (v) => {
    if (typeof v === 'string') {
      try {
        return JSON.parse(v)
      } catch {
        return v
      }
    }
    return v
  },
  z.object({
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
)

export const PhoneNumberSchema = z.string()

export const PatientRegistrationContactsSchema = z.object({
  address: AddressSchema,
  phone_number: PhoneNumberSchema,
  emergency_contacts: z.array(EmergencyContactSchema).min(1),
})

export const handler = postHandler(
  PatientRegistrationContactsSchema,
  async (
    ctx: OpenEncounterWorkflowContext,
    { address, phone_number, emergency_contacts },
  ) => {
    await Promise.all([
      patient_emergency_contacts.setContacts(
        ctx.state.trx,
        { patient_id: ctx.state.patient.id, contacts: emergency_contacts },
      ),
      patient_address.updateById(
        ctx.state.trx,
        { patient_id: ctx.state.patient.id, address: address },
      ),
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
  const address = await patient_address.getById(ctx.state.trx, {
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
        phone_number={patient_phone}
        organization_id={ctx.state.organization.id}
      />
      <EmergencyContactSection existing_contacts={existing_contacts} />
    </>
  )
}

export default OpenEncounterWorkflowPage(PatientRegistrationContactsPage)
