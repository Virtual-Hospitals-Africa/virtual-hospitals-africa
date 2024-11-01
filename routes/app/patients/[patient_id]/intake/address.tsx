import * as addresses from '../../../../../db/models/addresses.ts'
import * as patients from '../../../../../db/models/patients.ts'
import PatientAddressForm from '../../../../../components/patients/intake/AddressForm.tsx'
import { IntakePage, postHandler } from './_middleware.tsx'
import { z } from 'zod'

export const AddressSchema = z.object({
  address: z.object({
    street: z.string().optional(),
    locality: z.string(),
    administrative_area_level_2: z.string().optional(),
    administrative_area_level_1: z.string().optional(),
    country: z.string(),
  }),
  nearest_organization_id: z.string().uuid().optional(),
  nearest_organization_name: z.string().optional(),
  primary_doctor_id: z.string().uuid().optional(),
  primary_doctor_name: z.string().optional(),
})

export const handler = postHandler(
  AddressSchema.parse,
  async function updateAddress(ctx, patient_id, form_values) {
    const created_address = await addresses.insert(
      ctx.state.trx,
      form_values.address,
    )
    await patients.update(ctx.state.trx, {
      id: patient_id,
      address_id: created_address.id,
      nearest_organization_id: form_values.nearest_organization_id,
      primary_doctor_id: form_values.primary_doctor_id,
    })
  },
)

export default IntakePage(async function AddressPage({ ctx, patient }) {
  const { healthWorker, trx } = ctx.state
  const country_address_tree = await addresses.getCountryAddressTree(trx)

  let default_organization:
    | { id: string; name: string; address: string }
    | undefined

  for (const employment of healthWorker.employment) {
    if (employment.organization.address) {
      default_organization = {
        id: employment.organization.id,
        name: employment.organization.name,
        address: employment.organization.address,
      }
      break
    }
  }

  return (
    <PatientAddressForm
      patient={patient}
      default_organization={default_organization}
      country_address_tree={country_address_tree}
    />
  )
})
