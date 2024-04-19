import { Lifestyle } from '../types.ts'

import SexualActivitySection from './lifestyle/SexualActivityForm.tsx'
import AlcoholSection from './lifestyle/AlcoholForm.tsx'
import SmokingSection from './lifestyle/SmokingForm.tsx'
import SubstanceUseSection from './lifestyle/SubstanceUseForm.tsx'
import ExerciseSection from './lifestyle/ExerciseForm.tsx'
import DietSection from './lifestyle/DietForm.tsx'

export function LifestyleForm({
  lifestyle = {
    sexual_activity: null,
    alcohol: null,
    smoking: null,
    exercise: null,
    diet: null,
    substance_use: null,
  },
  age_years,
}: {
  lifestyle?: Lifestyle
  age_years: number
}) {
  return (
    <>
      <SexualActivitySection
        lifestyle={lifestyle}
        age_years={age_years}
      />

      <AlcoholSection
        lifestyle={lifestyle}
        age_years={age_years}
      />

      <SmokingSection
        lifestyle={lifestyle}
        age_years={age_years}
      />

      <SubstanceUseSection
        lifestyle={lifestyle}
        age_years={age_years}
      />

      <ExerciseSection
        lifestyle={lifestyle}
      />

      <DietSection
        lifestyle={lifestyle}
      />
    </>
  )
}
