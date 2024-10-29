import { CountryAddressTree, PatientIntake } from '../../../types.ts'
import AddressForm from '../../../islands/AddressForm.tsx'
import { NearestHealthCare } from '../../../islands/NearestHealthCare.tsx'
import FormSection from '../../library/FormSection.tsx'

function PatientAddress(
  { patient, country_address_tree }: {
    patient: PatientIntake
    country_address_tree: CountryAddressTree
  },
) {
  return (
    <FormSection header='Patient Address'>
      <AddressForm
        address={patient.address}
        country_address_tree={country_address_tree}
      />
    </FormSection>
  )
}

export default function PatientAddressForm(
  { patient, default_organization, country_address_tree }: {
    patient: PatientIntake
    default_organization?: { id: string; name: string; address: string }
    country_address_tree: CountryAddressTree
  },
) {
  const nearest_organization =
    patient.nearest_organization_id && patient.nearest_organization_name &&
      patient.nearest_organization_address
      ? {
        id: patient.nearest_organization_id,
        name: patient.nearest_organization_name,
        address: patient.nearest_organization_address,
      }
      : default_organization

  const primary_doctor =
    patient.primary_doctor_id && patient.primary_doctor_name
      ? {
        id: patient.primary_doctor_id,
        name: patient.primary_doctor_name,
      }
      : patient.unregistered_primary_doctor_name
      ? {
        name: patient.unregistered_primary_doctor_name,
        id: '',
      }
      : undefined

  return (
    <>
      <PatientAddress
        patient={patient}
        country_address_tree={country_address_tree}
      />
      <NearestHealthCare
        nearest_organization={nearest_organization}
        primary_doctor={primary_doctor}
      />
    </>
  )
}
