import { useSignal } from '@preact/signals'
import FormRow from '../components/library/FormRow.tsx'
import OrganizationSearch from './OrganizationSearch.tsx'
import PersonSearch from './PersonSearch.tsx'
import FormSection from '../components/library/FormSection.tsx'
import { OrganizationSortOptions } from '../types.ts'

export function NearestHealthCareSection(
  { nearest_health_facility, primary_doctor }: {
    nearest_health_facility?: { id: string; name: string; address?: string }
    primary_doctor?: { id: string | null; name: string }
  },
) {
  const nearest_health_facility_signal = useSignal(nearest_health_facility)
  let doctor_search_href = '/app/providers?profession=doctor'
  if (nearest_health_facility_signal.value) {
    doctor_search_href +=
      `&prioritize_organization_id=${nearest_health_facility_signal.value.id}`
  }

  return (
    <FormSection header='Nearest Health Care'>
      <FormRow>
        {/* TODO point to organization's nearest organizations  */}
        <OrganizationSearch
          name='nearest_organization'
          filters={{ is_physical: true }}
          label='Nearest Health Facility'
          // deno-lint-ignore no-explicit-any
          value={nearest_health_facility_signal.value as any}
          sort={{ by: OrganizationSortOptions.closest, direction: 'asc' }}
          onSelect={(organization) =>
            nearest_health_facility_signal.value = organization}
          required
        />
      </FormRow>
      <FormRow>
        <PersonSearch
          name='primary_doctor'
          label='Primary/Family Doctor'
          search_route={doctor_search_href}
          required
          value={primary_doctor && {
            id: primary_doctor.id || 'add',
            name: primary_doctor.name,
          }}
          addable
        />
      </FormRow>
    </FormSection>
  )
}
