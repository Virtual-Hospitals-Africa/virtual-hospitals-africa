import SectionHeader from '../../library/typography/SectionHeader.tsx'
import { FullCountryInfo, PatientIntake } from '../../../types.ts'
import AddressForm from '../../../islands/address-inputs.tsx'
import { NearestHealthCare } from '../../../islands/NearestHealthCare.tsx'

function PatientAddress(
  { patient, country_address_tree }: {
    patient: PatientIntake
    country_address_tree: FullCountryInfo
  },
) {
  return (
    <section className='mb-7'>
      <SectionHeader className='mb-3'>Patient Address</SectionHeader>
      <AddressForm
        address={patient.address}
        country_address_tree={country_address_tree}
      />
    </section>
  )
}

export default function PatientAddressForm(
  { patient, default_facility, country_address_tree }: {
    patient: PatientIntake
    default_facility?: { id: number; name: string; address: string }
    country_address_tree: FullCountryInfo
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
      : default_facility

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
      <PatientAddress
        patient={patient}
        country_address_tree={country_address_tree}
      />
      <NearestHealthCare
        nearest_facility={nearest_facility}
        primary_doctor={primary_doctor}
      />
    </>
  )
}
