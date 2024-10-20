import { useSignal } from '@preact/signals'
import FormRow from '../components/library/FormRow.tsx'
import OrganizationSearch from './OrganizationSearch.tsx'
import PersonSearch from './PersonSearch.tsx'
import FormSection from '../components/library/FormSection.tsx'

export function NearestHealthCare(
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
