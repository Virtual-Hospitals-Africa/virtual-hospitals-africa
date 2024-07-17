import AllergyInput from '../../../islands/allergy/Input.tsx'
import { Allergy, PreExistingConditionWithDrugs } from '../../../types.ts'
import PreExistingConditionsForm from '../../../islands/pre-existing-conditions/Form.tsx'
import FormSection from '../../library/FormSection.tsx'

export default function PatientPreExistingConditions(
  { pre_existing_conditions, allergies, patient_allergies }: {
    pre_existing_conditions: PreExistingConditionWithDrugs[]
    allergies: Allergy[]
    patient_allergies: Allergy[]
  },
) {
  return (
    <>
      <FormSection header='Allergies'>
        <AllergyInput
          allergies={allergies}
          patient_allergies={patient_allergies}
        />
      </FormSection>
      <FormSection header='Chronic Conditions & Disabilities'>
        <PreExistingConditionsForm
          pre_existing_conditions={pre_existing_conditions}
        />
      </FormSection>
    </>
  )
}
