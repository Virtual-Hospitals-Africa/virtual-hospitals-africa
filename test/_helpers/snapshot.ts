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
  const x = matches[0]
  const snapshot_line = file_contents.split('\n')[line_number]

  const stringified = JSON.stringify(object, null, 2)
}
