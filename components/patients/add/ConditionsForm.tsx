import AllergySearch from '../../../islands/AllergySearch.tsx'
import ConditionSearch from '../../../islands/ConditionSearch.tsx'
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
      <section>
        <h1 className='mb-1'>
          Conditions
        </h1>
        <ConditionSearch />
      </section>
    </>
  )
}
