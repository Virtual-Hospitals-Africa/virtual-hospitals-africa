import AllergyInput from '../../../islands/allergy/Input.tsx'
import { OnboardingPatient, PastMedicalCondition, MajorSurgery } from '../../../types.ts'
import SectionHeader from '../../library/typography/SectionHeader.tsx'
import PastMedicalConditionsForm from '../../../islands/past-medical-conditions/Form.tsx'
import MajorSurgeriesForm from '../../../islands/major-surgeries/Form.tsx'

export default function History(
  { patient, pastMedicalConditions, majorSurgeries }: {
    patient?: Partial<OnboardingPatient>
    pastMedicalConditions: PastMedicalCondition[],
    majorSurgeries: MajorSurgery[]
  },
) {
  return (
    <>
      <section>
        <SectionHeader className='my-5 text-[20px]'>
          Past Medical Conditions
        </SectionHeader>
        <PastMedicalConditionsForm
          pastMedicalConditions={pastMedicalConditions}
        />
        <SectionHeader className='my-5 text-[20px]'>
          Major Sergeries and Procedures
        </SectionHeader>
        <MajorSurgeriesForm majorSurgeries={majorSurgeries} />
      </section>
    </>
  )
}
