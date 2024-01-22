import SectionHeader from '../../library/typography/SectionHeader.tsx'
import { FullCountryInfo, PatientIntake } from '../../../types.ts'
import AddressForm from '../../../islands/address-inputs.tsx'
import { NearestHealthCare } from '../../../islands/NearestHealthCare.tsx'

function PatientAddress(
  { patient, adminDistricts }: {
    patient: PatientIntake
    adminDistricts: FullCountryInfo
  },
) {
  return (
    <section className='mb-7'>
      <SectionHeader className='mb-3'>Patient Address</SectionHeader>
      <AddressForm
        address={patient.address}
        adminDistricts={adminDistricts}
      />
    </section>
  )
}

export default function PatientAddressForm(
  { patient, defaultFacility, adminDistricts }: {
    patient: PatientIntake
    defaultFacility: { id: number; name: string; address: string }
    adminDistricts: FullCountryInfo
  },
) {
  const nearest_facility =
    patient.nearest_facility_id && patient.nearest_facility_name &&
      patient.nearest_facility_address
      ? {
        id: patient.nearest_facility_id,
        name: patient.nearest_facility_name,
        address: patient.nearest_facility_address,
      }
      : defaultFacility

  const primary_doctor =
    patient.primary_doctor_id && patient.primary_doctor_name
      ? {
        id: patient.primary_doctor_id,
        name: patient.primary_doctor_name,
      }
      : patient.unregistered_primary_doctor_name
      ? {
        name: patient.unregistered_primary_doctor_name,
        id: Number.NaN,
      }
      : undefined

  return (
    <>
      <PatientAddress patient={patient} adminDistricts={adminDistricts} />
      <NearestHealthCare
        nearest_facility={nearest_facility}
        primary_doctor={primary_doctor}
      />
    </>
  )
}
