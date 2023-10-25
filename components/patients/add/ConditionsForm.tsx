import AllergySearch from '../../../islands/AllergySearch.tsx'
import { OnboardingPatient } from '../../../types.ts'

export default function PatientConditionsForm(
  { patient = {} }: { patient?: Partial<OnboardingPatient> },
) {
  return (
    <>
      <section>
        <h1 className='mb-1'>
          Allergies
        </h1>
        <AllergySearch />
      </section>
    </>
  )
}
