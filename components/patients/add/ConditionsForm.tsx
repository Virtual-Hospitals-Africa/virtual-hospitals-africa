import AllergySearch from '../../../islands/AllergySearch.tsx'
import { OnboardingPatient } from '../../../types.ts'
import SectionHeader from '../../library/typography/SectionHeader.tsx'
import ConditionsForm from '../../../islands/ConditionsForm.tsx'
export default function PatientConditionsForm(
  { patient = {} }: { patient?: Partial<OnboardingPatient> },
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
        <ConditionsForm />
      </section>
    </>
  )
}
