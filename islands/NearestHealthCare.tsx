import { useSignal } from '@preact/signals'
import FormRow from '../components/library/form/Row.tsx'
import SectionHeader from '../components/library/typography/SectionHeader.tsx'
import FacilitySearch from './FacilitySearch.tsx'
import PersonSearch from './PersonSearch.tsx'

export function NearestHealthCare(
  { nearest_facility, primary_doctor }: {
    nearest_facility?: { id: number; name: string; address: string }
    primary_doctor?: { id: number; name: string }
  },
) {
  const nearest_facility_signal = useSignal(nearest_facility)
  let doctor_search_href = '/app/providers?profession=doctor'
  if (nearest_facility_signal.value) {
    doctor_search_href +=
      `&prioritize_facility_id=${nearest_facility_signal.value.id}`
  }

  return (
    <section>
      <SectionHeader className='mb-3'>Nearest Health Care</SectionHeader>
      <FormRow>
        <FacilitySearch
          name='nearest_facility'
          href='/app/facilities'
          label='Nearest Facility'
          value={nearest_facility_signal.value}
          onSelect={(facility) => nearest_facility_signal.value = facility}
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
