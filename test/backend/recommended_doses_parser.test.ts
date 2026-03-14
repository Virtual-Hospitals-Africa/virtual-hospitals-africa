import { afterAll, it } from 'std/testing/bdd.ts'
import { MedicineParser } from '../../backend/recommended_doses/MedicineParser.ts'
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

it('parses all test cases', () => {
  const failures: Error[] = []

  for (const test_case of test_cases) {
    const medicine_parser_result = asResult(() => MedicineParser.parse(test_case.row))
    if (!medicine_parser_result.success) {
      results.push({
        row: test_case.row,
        expected_parsed: test_case.expected_parsed,
        error_message: medicine_parser_result.error.message,
        error_stack: medicine_parser_result.error.stack,
      })
      failures.push(medicine_parser_result.error)
      continue
    }
    if (!test_case.expected_parsed) {
      results.push({
        row: test_case.row,
        actual_parsed: medicine_parser_result.value.parsed,
        expected_parsed: medicine_parser_result.value.parsed,
      })
      continue
    }
    const assertion_result = asResult(() => assertMatches(medicine_parser_result.value.parsed, test_case.expected_parsed))
    if (assertion_result.success) {
      results.push({
        row: test_case.row,
        actual_parsed: medicine_parser_result.value.parsed,
        expected_parsed: medicine_parser_result.value.parsed,
      })
      continue
    }
    results.push({
      row: test_case.row,
      actual_parsed: medicine_parser_result.value.parsed,
      expected_parsed: test_case.expected_parsed,
      error_message: assertion_result.error.message,
      error_stack: assertion_result.error.stack,
    })
    failures.push(assertion_result.error)
  }

  if (failures.length > 0) {
    throw new AggregateError(failures, `${failures.length} test case(s) failed`)
  }
})
