import { useSignal } from '@preact/signals'
import FormRow from './form/Row.tsx'
import SectionHeader from '../components/library/typography/SectionHeader.tsx'
import OrganizationSearch from './OrganizationSearch.tsx'
import PersonSearch from './PersonSearch.tsx'

export function NearestHealthCare(
  { nearest_organization, primary_doctor }: {
    nearest_organization?: { id: string; name: string; address: string }
    primary_doctor?: { id: number; name: string }
  },
) {
  const nearest_organization_signal = useSignal(nearest_organization)
  let doctor_search_href = '/app/providers?profession=doctor'
  if (nearest_organization_signal.value) {
    doctor_search_href +=
      `&prioritize_organization_id=${nearest_organization_signal.value.id}`
  }

  return (
    <section>
      <SectionHeader className='mb-3'>Nearest Health Care</SectionHeader>
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
          href={doctor_search_href}
          required
          value={primary_doctor}
          addable
        />
      </FormRow>
    </section>
  )
}
