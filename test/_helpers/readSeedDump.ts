import { beforeAll } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { collect } from '../../util/inParallel.ts'
import { parseTsv } from '../../util/parseCsv.ts'
import { take } from '../../util/take.ts'

export function readFirstFiveRowsOfSeedDump(
  file_name: string,
) {
  assert(
    !file_name.endsWith('.tsv') && !file_name.includes('/'),
    'file_name should just be the file name without the extension nor the path',
  )
  // deno-lint-ignore no-explicit-any
  let rows: any[]
  beforeAll(async () => {
    rows = await collect(take(parseTsv(`./db/seed/dumps/${file_name}.tsv`), 5))
  })
  return {
    get value() {
      if (!rows) {
        throw new Error(
          'rows not initialized, must be called in a describe block',
        )
      }
      return rows
    },
  }
}

export function readSeedDump(
  file_name: string,
) {
  assert(
    !file_name.endsWith('.tsv') && !file_name.includes('/'),
    'file_name should just be the file name without the extension nor the path',
  )
  // deno-lint-ignore no-explicit-any
  let rows: any[]
  beforeAll(async () => {
    rows = await collect(parseTsv(`./db/seed/dumps/${file_name}.tsv`))
  })
  return {
    get value() {
      if (!rows) {
        throw new Error(
          'rows not initialized, must be called in a describe block',
        )
      }
      return rows
    },
  }
}
