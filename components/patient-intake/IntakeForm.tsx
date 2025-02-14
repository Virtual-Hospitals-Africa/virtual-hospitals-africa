import { NearestHealthCareSection } from '../../islands/NearestHealthCare.tsx'
import { NextOfKinFormSection } from '../../islands/family/FamilyForm.tsx'
import { PatientFamily, PatientIntake } from '../../types.ts'
import AddressSection from './AddressSection.tsx'
import PersonalSection from './PersonalSection.tsx'

export default function PatientIntakeForm(
  {
    patient,
    default_organization,
  }: {
    patient: Partial<PatientIntake>
    previously_completed: boolean
    default_organization?: { id: string; name: string; address: string }
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
      />
      <NearestHealthCareSection
        nearest_organization={nearest_organization}
        primary_doctor={primary_doctor}
      />
      <NextOfKinFormSection />
    </>
  )
}
