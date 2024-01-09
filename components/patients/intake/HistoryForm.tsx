import AllergyInput from '../../../islands/allergy/Input.tsx'
import { OnboardingPatient, PastMedicalCondition } from '../../../types.ts'
import SectionHeader from '../../library/typography/SectionHeader.tsx'
import PastMedicalConditionsForm from '../../../islands/past-medical-conditions/Form.tsx'

export default function History(
  { patient, pastMedicalConditions }: {
    patient?: Partial<OnboardingPatient>
    pastMedicalConditions: PastMedicalCondition[]
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
      </section>
    </>
  )
}
