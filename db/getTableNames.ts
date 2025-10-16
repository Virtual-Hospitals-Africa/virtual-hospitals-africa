import { assertNotEquals } from 'std/assert/assert_not_equals.ts'
import { collectSortedUniqStrings } from '../util/collectSorted.ts'
import memoize from '../util/memoize.ts'
import { assert } from 'std/assert/assert.ts'

function* yieldTableNames() {
  const file = Deno.readFileSync('db.d.ts')
  const file_contents = new TextDecoder().decode(file)
  const db_lines = file_contents.split('\n')

  const db_interface_start = db_lines.findIndex((line) =>
    line === 'export interface DB {'
  )

  assertNotEquals(db_interface_start, -1)
  const remaining_lines = db_lines.slice(db_interface_start + 1)
  const db_interface_end = remaining_lines.findIndex(
    (line) => line === '}',
  )
  assertNotEquals(db_interface_end, -1)

  const table_lines = remaining_lines.slice(
    0,
    db_interface_end,
  )

  let preceding_line: string = ''
  for (let table_line of table_lines) {
    table_line = (preceding_line + table_line).trim()
    const match = table_line.match(/^(.*): .*$/)
    if (!match) {
      preceding_line = table_line
      continue
    }
    yield match[1]
    preceding_line = ''
  }
  assert(!preceding_line)
}

export const getTableNames = memoize(function () {
  return collectSortedUniqStrings(yieldTableNames())
})
