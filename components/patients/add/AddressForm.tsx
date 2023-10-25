import FormRow from '../../library/form/Row.tsx'
import SectionHeader from '../../library/typography/SectionHeader.tsx'
import FacilitySearch from '../../../islands/FacilitySearch.tsx'
import { FullCountryInfo, OnboardingPatient } from '../../../types.ts'
import PatientAddressInputs from '../../../islands/patient-address-inputs.tsx'
import PersonSearch from '../../../islands/PersonSearch.tsx'

function PatientAddress(
  { patient, adminDistricts }: {
    patient: Partial<OnboardingPatient>
    adminDistricts: FullCountryInfo
  },
) {
  return (
    <section className='mb-7'>
      <SectionHeader className='mb-3'>Patient Address</SectionHeader>
      <PatientAddressInputs patient={patient} adminDistricts={adminDistricts} />
    </section>
  )
}

function NearestHealthCare(
  { nearest_facility }: { nearest_facility?: { id: number; name: string } },
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
          value={nearest_facility}
        />
      </FormRow>
      <FormRow>
        <PersonSearch
          name='primary_doctor'
          label='Primary/Family Doctor'
          href='/app/health_workers?profession=doctor'
          required
        />
      </FormRow>
    </section>
  )
}

export default function PatientAddressForm(
  { patient = {}, defaultFacility, adminDistricts }: {
    patient?: Partial<OnboardingPatient>
    defaultFacility: { id: number; name: string }
    adminDistricts: FullCountryInfo
  },
) {
  const nearest_facility =
    patient.nearest_facility_id && patient.nearest_facility_name
      ? { id: patient.nearest_facility_id, name: patient.nearest_facility_name }
      : defaultFacility

  return (
    <>
      <PatientAddress patient={patient} adminDistricts={adminDistricts} />
      <NearestHealthCare nearest_facility={nearest_facility} />
    </>
  )
}
