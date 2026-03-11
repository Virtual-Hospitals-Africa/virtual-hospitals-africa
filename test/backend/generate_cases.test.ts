import { afterAll, describe, it } from 'std/testing/bdd.ts'
import { MedicineParser } from '../../backend/recommended_doses/MedicineParser.ts'
import { MedicineRow } from '../../backend/recommended_doses/shared.ts'
import { asResult } from '../../util/asResult.ts'
import { humanReadableJson } from '../../util/humanReadableJson.ts'
import { getZARecommendedDoses } from '../../backend/recommended_doses/south_africa_recommended_doses.ts'

describe('generate test cases', () => {
  const test_cases_file_path = './test/backend/recommended_doses_parser_test_cases.json'

  // deno-lint-ignore no-explicit-any
  const successes: any[] = []
  // deno-lint-ignore no-explicit-any
  const failures: any[] = []
  const za_recommended_doses = getZARecommendedDoses()

  afterAll(async () => {
    await Deno.writeTextFile(test_cases_file_path, humanReadableJson([...successes, ...failures]), { create: true })
  })

  function test(row: MedicineRow) {
    it(`works for ${row['MEDICINE NAME (International Nonproprietary Name)']}`, () => {
      const medicine_parser_result = asResult(() => MedicineParser.parse(row))
      if (!medicine_parser_result.success) {
        failures.push({
          row: row,
          error_message: medicine_parser_result.error.message,
          error_stack: medicine_parser_result.error.stack,
        })
        throw medicine_parser_result.error
      }
      successes.push({
        row: row,
        actual_parsed: medicine_parser_result.value.parsed,
        expected_parsed: medicine_parser_result.value.parsed,
      })
      return
    })
  }

  za_recommended_doses.forEach(test)
})
