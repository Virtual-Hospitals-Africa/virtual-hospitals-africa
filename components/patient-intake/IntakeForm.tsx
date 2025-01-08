import {
  CountryAddressTree,
  PatientFamily,
  PatientIntake,
} from '../../types.ts'
import NextOfKinInput from '../../islands/family/NextOfKin.tsx'
import PatientAddressForm from './AddressForm.tsx'
import PatientPersonalForm from './PersonalForm.tsx'

export default function PatientIntakeForm(
  {
    patient,
    previously_completed,
    default_organization,
    country_address_tree,
    family,
  }: {
    patient: PatientIntake
    previously_completed: boolean
    default_organization?: { id: string; name: string; address: string }
    country_address_tree: CountryAddressTree
    family: PatientFamily
  },
) {
  return (
    <>
      <PatientPersonalForm
        patient={patient}
        previously_completed={previously_completed}
      />
      <PatientAddressForm
        patient={patient}
        default_organization={default_organization}
        country_address_tree={country_address_tree}
      />
      <NextOfKinInput name='family.next_of_kin' />
    </>
  )
}
