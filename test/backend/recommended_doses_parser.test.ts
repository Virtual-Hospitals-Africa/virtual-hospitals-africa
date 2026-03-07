import { afterAll, it } from 'std/testing/bdd.ts'
import { MedicineParser } from '../../backend/recommended_doses/MedicineParser.ts'
import { MedicineRow, ParsedMedicineRecommendedDose } from '../../backend/recommended_doses/shared.ts'
import { humanReadableJson } from '../../util/humanReadableJson.ts'
import { asResult } from '../../util/asResult.ts'
import { assertMatches } from '../../util/assertMatches.ts'
import { parseJSONSync } from '../../util/parseJSON.ts'

const test_cases_file_path = './test/backend/recommended_doses_parser_test_cases.json'
const test_cases = parseJSONSync(test_cases_file_path)

// deno-lint-ignore no-explicit-any
const results: any[] = []
afterAll(async () => {
  console.log('wEKLLKE')
  await Deno.writeTextFile(test_cases_file_path, humanReadableJson(results), { create: true })
})

function test(test_case: { row: MedicineRow; expected_parsed?: ParsedMedicineRecommendedDose }) {
  it(`works for ${test_case.row['MEDICINE NAME (International Nonproprietary Name)']} / ${test_case.row['ADULT/ CHILDREN']}`, () => {
    const medicine_parser_result = asResult(() => MedicineParser.parse(test_case.row))
    if (!medicine_parser_result.success) {
      results.push({
        row: test_case.row,
        expected_parsed: test_case.expected_parsed,
        error_message: medicine_parser_result.error.message,
        error_stack: medicine_parser_result.error.stack,
      })
      throw medicine_parser_result.error
    }
    if (!test_case.expected_parsed) {
      results.push({
        row: test_case.row,
        actual_parsed: medicine_parser_result.value.parsed,
        expected_parsed: medicine_parser_result.value.parsed,
      })
      return
    }
    const assertion_result = asResult(() => assertMatches(medicine_parser_result.value.parsed, test_case.expected_parsed))
    if (assertion_result.success) {
      results.push({
        row: test_case.row,
        actual_parsed: medicine_parser_result.value.parsed,
        expected_parsed: medicine_parser_result.value.parsed,
      })
      return
    }
    results.push({
      row: test_case.row,
      actual_parsed: medicine_parser_result.value.parsed,
      expected_parsed: test_case.expected_parsed,
      error_message: assertion_result.error.message,
      error_stack: assertion_result.error.stack,
    })
    throw assertion_result.error
  })
}

test_cases.forEach(test)
