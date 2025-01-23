import { useSignal } from '@preact/signals'
import FormRow from '../components/library/FormRow.tsx'
import OrganizationSearch from './OrganizationSearch.tsx'
import PersonSearch from './PersonSearch.tsx'
import FormSection from '../components/library/FormSection.tsx'

// export default function AddressSection(
//   { patient = {}, default_organization, country_address_tree }: {
//     patient?: Partial<PatientIntake>
//     default_organization?: { id: string; name: string; address: string }
//     country_address_tree: CountryAddressTree
//   },
// ) {
//   const nearest_organization =
//     patient.nearest_organization_id && patient.nearest_organization_name &&
//       patient.nearest_organization_address
//       ? {
//         id: patient.nearest_organization_id,
//         name: patient.nearest_organization_name,
//         address: patient.nearest_organization_address,
//       }
//       : default_organization

//   const primary_doctor =
//     patient.primary_doctor_id && patient.primary_doctor_name
//       ? {
//         id: patient.primary_doctor_id,
//         name: patient.primary_doctor_name,
//       }
//       : patient.unregistered_primary_doctor_name
//       ? {
//         name: patient.unregistered_primary_doctor_name,
//         id: '',
//       }
//       : undefined

//   return (
//     <AddressSection
//       address={patient.address}
//       country_address_tree={country_address_tree}
//     />
//   )
// }

export function NearestHealthCareSection(
  { nearest_organization, primary_doctor }: {
    nearest_organization?: { id: string; name: string; address: string }
    primary_doctor?: { id: string; name: string }
  },
) {
  const nearest_organization_signal = useSignal(nearest_organization)
  let doctor_search_href = '/app/providers?profession=doctor'
  if (nearest_organization_signal.value) {
    doctor_search_href +=
      `&prioritize_organization_id=${nearest_organization_signal.value.id}`
  }

  return (
    <FormSection header='Nearest Health Care'>
      <FormRow>
        <OrganizationSearch
          name='nearest_organization'
          kind='physical'
          label='Nearest Organization'
          value={nearest_organization_signal.value}
          onSelect={(organization) =>
            nearest_organization_signal.value = organization}
          required
        />
      </FormRow>
      <FormRow>
        <PersonSearch
          name='primary_doctor'
          label='Primary/Family Doctor'
          search_route={doctor_search_href}
          required
          value={primary_doctor}
          addable
        />
      </FormRow>
    </FormSection>
  )
}
