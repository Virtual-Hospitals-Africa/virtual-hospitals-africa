import { assert } from 'std/assert/assert.ts'

export default function assertNotIncludes(
  str: string,
  pattern: string,
) {
  assert(
    !str.includes(pattern),
    `Expected string ${str} to not include pattern ${pattern}`,
  )
}
