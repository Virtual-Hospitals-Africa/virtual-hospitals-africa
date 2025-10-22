import { assert } from 'std/assert/assert.ts'
import { getCaller } from '../../util/getFileLineNumber.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'

/**
 * Replaces the line with an assertEquals()
 * @param object
 */
export function snapshot(object: unknown) {
  const { pretty_file_name, line_number, column_number } = getCaller(1)
  assert(
    pretty_file_name.startsWith('test'),
    'Used to snapshot objects in tests, nothing more',
  )
  const file_contents = Deno.readTextFileSync(pretty_file_name)
  const matches = Array.from(file_contents.matchAll(/snapshot\(/))
  assertEquals(
    matches.length,
    1,
    `Cannot snapshot 2 things at once as the file ${pretty_file_name} could get mangled. Run these one at a time.`,
  )

  const lines = file_contents.split('\n')
  const snapshot_line = lines[line_number]

  const leading_spaces = ' '.repeat(column_number - 1)
  assert(
    snapshot_line.startsWith(leading_spaces),
    `Snapshot line does not start with ${
      column_number - 1
    } spaces as expected.`,
  )
  assert(snapshot_line.endsWith(')'), 'Snapshot line does not end with )')

  const variable_being_snapshot = snapshot_line.split('(')[1].split(')')[0]
  assert(variable_being_snapshot, 'Variable being snapshot is not defined')
  const stringified = JSON.stringify(object, null, 2)
  const new_line = leading_spaces +
    `assertEquals(${variable_being_snapshot}, ${stringified})`

  const already_has_assert_equals = file_contents.includes(
    'std/assert/assert_equals.ts',
  )
  let new_file_contents = file_contents.replace(snapshot_line, new_line)
  if (!already_has_assert_equals) {
    new_file_contents =
      "import { assertEquals } from 'std/assert/assert_equals.ts'\n" +
      new_file_contents
  }
  Deno.writeTextFileSync(pretty_file_name, new_file_contents)
}
