import AllergySearch from '../../../islands/AllergySearch.tsx'
import { OnboardingPatient, PreExistingCondition } from '../../../types.ts'
import SectionHeader from '../../library/typography/SectionHeader.tsx'
import PreExistingConditionsForm from '../../../islands/PreExistingConditionsForm.tsx'

export default function PatientPreExistingConditions(
  { patient = {}, preExistingConditions }: {
    patient?: Partial<OnboardingPatient>
    preExistingConditions: PreExistingCondition[]
  },
) {
  return (
    <>
      <section>
        <SectionHeader className='my-5 text-[20px]'>Allergies</SectionHeader>
        <AllergySearch />
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
