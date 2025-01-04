import {
  CountryAddressTree,
  PatientFamily,
  PatientIntake,
} from '../../types.ts'
import PatientAddressForm from './AddressForm.tsx'
import PatientFamilyForm from './FamilyForm.tsx'
import PatientPersonalForm from './PersonalForm.tsx'
import { useSignal } from '@preact/signals'
import { useEffect } from 'preact/hooks'

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
  const ageEntered = useSignal<number>(0)
  const dobInput = useSignal<string>(
    patient.date_of_birth ? patient.date_of_birth : '',
  )

  useEffect(() => {
    console.log('strAgeEntered', dobInput.value)
    ageEntered.value = new Date().getFullYear() -
      new Date(dobInput.value).getFullYear()
  }, [dobInput.value])

  return (
    <div className='flex flex-col'>
      <PatientPersonalForm
        patient={patient}
        previously_completed={previously_completed}
        strAge={dobInput}
      />
      <PatientAddressForm
        patient={patient}
        default_organization={default_organization}
        country_address_tree={country_address_tree}
      />
      <PatientFamilyForm
        age_years={ageEntered.value}
        family={family}
      />
    </div>
  )
}
