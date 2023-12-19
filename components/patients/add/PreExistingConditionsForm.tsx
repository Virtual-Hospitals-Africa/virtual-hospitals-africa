import AllergyInput from '../../../islands/allergy/Input.tsx'
import {
  OnboardingPatient,
  PreExistingAllergy,
  PreExistingConditionWithDrugs,
} from '../../../types.ts'
import SectionHeader from '../../library/typography/SectionHeader.tsx'
import PreExistingConditionsForm from '../../../islands/PreExistingConditionsForm.tsx'

export default function PatientPreExistingConditions(
  { patient = {}, preExistingConditions, allergies }: {
    patient?: Partial<OnboardingPatient>
    preExistingConditions: PreExistingConditionWithDrugs[]
    allergies: PreExistingAllergy[]
  },
) {
  return (
    <>
      <section>
        <SectionHeader className='my-5 text-[20px]'>Allergies</SectionHeader>
        <AllergyInput allergies={allergies} />
      </section>
      <section>
        <SectionHeader className='my-5 text-[20px]'>
          Chronic Conditions & Disabilities
        </SectionHeader>
        <PreExistingConditionsForm
          preExistingConditions={preExistingConditions}
        />
      </section>
    </>
  )
}
