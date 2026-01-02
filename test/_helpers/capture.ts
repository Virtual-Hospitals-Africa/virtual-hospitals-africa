import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { getCaller } from '../../util/getFileLineNumber.ts'
import { humanReadableJson } from '../../util/humanReadableJson.ts'
import { JsonSerializable } from '../../types.ts'

/**
 * Replaces the line with an assertEquals()
 * @param object
 */
export function capture(object: unknown) {
  const { pretty_file_name, line_number, column_number } = getCaller(1)
  assert(
    pretty_file_name.startsWith('test'),
    `Can only be used in test files, but ran from ${pretty_file_name}`,
  )
  const file_contents = Deno.readTextFileSync(pretty_file_name)
  const lines = file_contents.split('\n')
  const capture_line = lines[line_number - 1]

  const lines_capturing = lines.filter((line) => line.includes('capture('))

  assertEquals(
    lines_capturing.length,
    1,
    `Cannot capture 2 things at once as the file ${pretty_file_name} could get mangled. Run these one at a time.`,
  )

  const leading_spaces = ' '.repeat(column_number - 1)
  assert(
    capture_line.startsWith(leading_spaces),
    `capture line does not start with ${column_number - 1} spaces as expected.`,
  )
  assert(capture_line.endsWith(')'), 'capture line does not end with )')

  const variable_being_capture = capture_line.split('(')[1].split(')')[0]
  assert(variable_being_capture, 'Variable being capture is not defined')
  const stringified = humanReadableJson(object as JsonSerializable)
  const new_line = leading_spaces +
    `assertEquals(${variable_being_capture}, ${stringified})`

  const already_has_assert_equals = file_contents.includes(
    'std/assert/assert_equals.ts',
  )

  const capture_import_line_regex = /import \{ capture \} from .*\n/
  let new_file_contents = file_contents.replace(capture_line, new_line)
    .replace(capture_import_line_regex, '')
  if (!already_has_assert_equals) {
    new_file_contents =
      "import { assertEquals } from 'std/assert/assert_equals.ts'\n" +
      new_file_contents
  }
  Deno.writeTextFileSync(pretty_file_name, new_file_contents)
}
