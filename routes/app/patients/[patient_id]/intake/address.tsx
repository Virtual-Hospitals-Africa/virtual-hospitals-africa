import * as addresses from '../../../../../db/models/addresses.ts'
import * as patients from '../../../../../db/models/patients.ts'
import PatientAddressForm from '../../../../../components/patients/intake/AddressForm.tsx'
import isObjectLike from '../../../../../util/isObjectLike.ts'
import { assertOr400 } from '../../../../../util/assertOr.ts'
import { IntakePage, postHandlerAsserts } from './_middleware.tsx'
import isString, {
  assertHasNonEmptyString,
} from '../../../../../util/isString.ts'

type AddressFormValues = {
  address: {
    street?: string
    locality: string
    administrative_area_level_2?: string
    administrative_area_level_1?: string
    country: string
  }
  nearest_organization_id: string
  nearest_organization_name: string
  primary_doctor_id: string
  primary_doctor_name: string
}

function assertIsAddress(
  patient: unknown,
): asserts patient is AddressFormValues {
  assertOr400(isObjectLike(patient))
  assertOr400(isObjectLike(patient.address))
  assertHasNonEmptyString(patient.address, 'locality')
  assertHasNonEmptyString(patient.address, 'country')

  if (patient.street) assertOr400(isString(patient.street))
  if (patient.administrative_area_level_2) assertOr400(isString(patient.street))
  if (patient.administrative_area_level_1) assertOr400(isString(patient.street))

  assertOr400(
    !!patient.nearest_organization_id &&
      typeof patient.nearest_organization_id === 'string',
  )
  assertOr400(
    !!(patient.primary_doctor_id &&
      typeof patient.primary_doctor_id === 'string') ||
      patient.primary_doctor_name,
  )
  const primary_doctor_id = patient.primary_doctor_id
  const primary_doctor_name = patient.primary_doctor_name
  delete patient.primary_doctor_name
  delete patient.nearest_organization_name
  if (!primary_doctor_id && primary_doctor_name) {
    patient.unregistered_primary_doctor_name = primary_doctor_name
  }
}

export const handler = postHandlerAsserts(
  assertIsAddress,
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
