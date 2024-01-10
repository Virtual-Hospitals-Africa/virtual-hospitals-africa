import AllergyInput from '../../../islands/allergy/Input.tsx'
import {
  Allergy,
  OnboardingPatient,
  PreExistingConditionWithDrugs,
} from '../../../types.ts'
import SectionHeader from '../../library/typography/SectionHeader.tsx'
import PreExistingConditionsForm from '../../../islands/pre-existing-conditions/Form.tsx'

export default function PatientPreExistingConditions(
  { patient = {}, pre_existing_conditions, allergies, patient_allergies }: {
    patient?: Partial<OnboardingPatient>
    pre_existing_conditions: PreExistingConditionWithDrugs[]
    allergies: Allergy[]
    patient_allergies: Allergy[]
  },
) {
  return (
    <>
      <section>
        <SectionHeader className='my-5 text-[20px]'>Allergies</SectionHeader>
        <AllergyInput
          allergies={allergies}
          patient_allergies={patient_allergies}
        />
      </section>
      <section>
        <SectionHeader className='my-5 text-[20px]'>
          Chronic Conditions & Disabilities
        </SectionHeader>
        <PreExistingConditionsForm
          pre_existing_conditions={pre_existing_conditions}
        />
      </section>
    </>
  )
}
