import FormRow from '../../library/form/Row.tsx'
import Buttons from '../../library/form/buttons.tsx'
import SectionHeader from '../../library/typography/SectionHeader.tsx'
import FacilitySearch from '../../../islands/FacilitySearch.tsx'
import { AdminDistricts, Facility, ReturnedSqlRow } from '../../../types.ts'
import PatientAddressInputs from '../../../islands/patient-address-inputs.tsx'
import PersonSearch from '../../../islands/PersonSearch.tsx'

function PatientAddress(
  { adminDistricts }: { adminDistricts?: AdminDistricts },
) {
  return (
    <section className='mb-7'>
      <SectionHeader className='mb-3'>Patient Address</SectionHeader>
      <PatientAddressInputs adminDistricts={adminDistricts} />
    </section>
  )
}

function NearestHealthCare(
  { defaultFacility }: { defaultFacility?: ReturnedSqlRow<Facility> },
) {
  return (
    <section>
      <SectionHeader className='mb-3'>Nearest Health Care</SectionHeader>
      <FormRow>
        <FacilitySearch
          name='nearest_facility'
          href='/app/facilities'
          label='Nearest Facility'
          required
          defaultFacility={defaultFacility}
        />
      </FormRow>
      <FormRow>
        <PersonSearch
        name = 'primary_doctor'
        label="Primary/Family Doctor"
        href='/app/health_workers'
        />
      </FormRow>
    </section>
  )
}

export default function PatientAddressForm(
  { defaultFacility, adminDistricts }: {
    defaultFacility?: ReturnedSqlRow<Facility>
    adminDistricts?: AdminDistricts
  },
) {
  return (
    <>
      <PatientAddress adminDistricts={adminDistricts} />
      <NearestHealthCare defaultFacility={defaultFacility} />
      <hr className='my-2' />
      <Buttons cancelHref='/app/patients/add?step=personal' />
    </>
  )
}
