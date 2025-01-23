import { NearestHealthCareSection } from '../../islands/NearestHealthCare.tsx'
import { NextOfKinFormSection } from '../../islands/patient-intake/FamilyForm.tsx'
import {
  CountryAddressTree,
  PatientFamily,
  PatientIntake,
} from '../../types.ts'
import AddressSection from './AddressSection.tsx'
import PersonalSection from './PersonalSection.tsx'

export default function PatientIntakeForm(
  {
    patient,
    default_organization,
    country_address_tree,
  }: {
    patient: Partial<PatientIntake>
    previously_completed: boolean
    default_organization?: { id: string; name: string; address: string }
    country_address_tree: CountryAddressTree
    family: Partial<PatientFamily>
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
      <PersonalSection
        patient={patient}
      />
      <AddressSection
        address={patient.address}
        country_address_tree={country_address_tree}
      />
      <NearestHealthCareSection
        nearest_organization={nearest_organization}
        primary_doctor={primary_doctor}
      />
      <NextOfKinFormSection />
    </>
  )
}
