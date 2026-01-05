import { assert } from 'std/assert/assert.ts'

export default function assertIncludes(
  str: string,
  pattern: string,
) {
  assert(
    str.includes(pattern),
    `Expected string ${str} to include pattern ${pattern}`,
  )
}
