import { MajorSurgery, PastMedicalCondition } from '../../../types.ts'
import SectionHeader from '../../library/typography/SectionHeader.tsx'
import PastMedicalConditionsForm from '../../../islands/past-medical-conditions/Form.tsx'
import MajorSurgeriesForm from '../../../islands/major-surgeries/Form.tsx'

export default function History(
  { past_medical_conditions, major_surgeries }: {
    past_medical_conditions: PastMedicalCondition[]
    major_surgeries: MajorSurgery[]
  },
) {
  return (
    <>
      <section>
        <SectionHeader className='my-5 text-[20px]'>
          Past Medical Conditions
        </SectionHeader>
        <PastMedicalConditionsForm
          past_medical_conditions={past_medical_conditions}
        />
        <SectionHeader className='my-5 text-[20px]'>
          Major Surgeries and Procedures
        </SectionHeader>
        <MajorSurgeriesForm major_surgeries={major_surgeries} />
      </section>
    </>
  )
}
