import { assertEquals } from 'std/assert/assert_equals.ts'
import { assertThrows } from 'std/assert/assert_throws.ts'
import { describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { replaceParams } from '../../util/replaceParams.ts'

describe('replaceParams', () => {
  it('replaces params in the route', () => {
    const route =
      '/app/patients/:patient_id/encounters/:encounter_id/examinations'
    const params = { patient_id: '1029', encounter_id: 'open' }
    const replaced = replaceParams(route, params)
    assertEquals(
      replaced,
      '/app/patients/1029/encounters/open/examinations',
    )
  })

  it('throws if insufficient params are supplied', () => {
    const route =
      '/app/patients/:patient_id/encounters/:encounter_id/examinations'
    const params = { encounter_id: 'open' }
    const error = assertThrows(() => replaceParams(route, params))
    assert(error instanceof Error)
    assertEquals(
      error.message,
      `replaceParams failed to replace all params\nreplaceParams("/app/patients/:patient_id/encounters/:encounter_id/examinations", {"encounter_id":"open"}) => "/app/patients/:patient_id/encounters/open/examinations"`,
    )
  })
})
