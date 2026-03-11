import { it } from 'std/testing/bdd.ts'
import { assertMatches } from '../../util/assertMatches.ts'
import { parseJSONSync } from '../../util/parseJSON.ts'
import { ParsedDoseSchema } from '../../routes/recommended_dose_calculator/recommended_medications.tsx'

const test_cases_file_path = './backend/recommended_doses/parsed/recommended_doses.json'
const test_cases = parseJSONSync(test_cases_file_path)

it('adheres to the schema', () => {
  for (const medicine of test_cases) {
    for (const schedule of medicine.schedules) {
      if (schedule.min) {
        console.log(schedule)
      }
      console.log(medicine,schedule)
      ParsedDoseSchema.strict().parse(schedule)
    }
  }
})