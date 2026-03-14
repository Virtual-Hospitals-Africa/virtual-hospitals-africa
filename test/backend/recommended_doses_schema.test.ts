import { it } from 'std/testing/bdd.ts'

import { parseJSONSync } from '../../util/parseJSON.ts'
import { ParsedDoseSchema } from '../../shared/recommended_doses.ts'

const test_cases_file_path = './backend/recommended_doses/parsed/recommended_doses.json'
const test_cases = parseJSONSync(test_cases_file_path)

it('adheres to the schema', () => {
  for (const medicine of test_cases) {
    for (const schedule of medicine.schedules) {
      ParsedDoseSchema.strict().parse(schedule)
    }
  }
})
