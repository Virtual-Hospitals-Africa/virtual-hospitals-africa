import {
  CountryAddressTree,
  PatientFamily,
  PatientIntake,
} from '../../types.ts'
import PatientAddressForm from './AddressForm.tsx'
import { NextOfKinFormSection } from './FamilyForm.tsx'
import PatientPersonalForm from './PersonalForm.tsx'

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
  return (
    <>
      <PatientPersonalForm
        patient={patient}
      />
      <PatientAddressForm
        patient={patient}
        default_organization={default_organization}
        country_address_tree={country_address_tree}
      />
      <NextOfKinFormSection />
    </>
  )
}
