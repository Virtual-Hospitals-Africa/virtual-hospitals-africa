import { MajorSurgery, PastMedicalCondition } from '../../../types.ts'
import PastMedicalConditionsForm from '../../../islands/past-medical-conditions/Form.tsx'
import MajorSurgeriesForm from '../../../islands/major-surgeries/Form.tsx'
import FormSection from '../../library/FormSection.tsx'

export default function History(
  { past_medical_conditions, major_surgeries }: {
    past_medical_conditions: PastMedicalCondition[]
    major_surgeries: MajorSurgery[]
  },
) {
  return (
    <>
      <FormSection header='Past Medical Conditions'>
        <PastMedicalConditionsForm
          past_medical_conditions={past_medical_conditions}
        />
      </FormSection>
      <FormSection header='Major Surgeries and Procedures'>
        <MajorSurgeriesForm major_surgeries={major_surgeries} />
      </FormSection>
    </>
  )
}
