import { PreExistingConditionWithDrugs } from '../../../types.ts'
import PreExistingConditionsForm from '../../../islands/pre-existing-conditions/DiagnosisForm.tsx'
import FormSection from '../../library/FormSection.tsx'

export default function DiagnosesConditions(
  { diagnoses }: {
    diagnoses: PreExistingConditionWithDrugs[]
  },
) {
  return (
    <>
      <FormSection header='Chronic Conditions & Disabilities'>
        <PreExistingConditionsForm
          pre_existing_conditions={diagnoses}
        />
      </FormSection>
    </>
  )
}
