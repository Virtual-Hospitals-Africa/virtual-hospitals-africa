import { describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { assertMatches } from '../../util/assertMatches.ts'
import { asResult } from '../../util/asResult.ts'
import { assert } from 'std/assert/assert.ts'
import z from 'zod'

describe('assertMatches', () => {
  it('passes when the object matches the test', () => {
    assertMatches({ foo: 'bar', baz: 'bing' }, { foo: 'bar', baz: z.string() })
  })

  it('fails when the object does not match the test', () => {
    const result = asResult(() => {
      assertMatches({ foo: 'bar', baz: 'bing' }, {
        foo: 'bar',
        baz: z.number(),
      })
    })
    assert(result.success === false)
    assert(result.error instanceof Error)
    assertEquals(JSON.parse(result.error.message), [
      {
        'code': 'invalid_type',
        'expected': 'number',
        'received': 'string',
        'path': [
          'baz',
        ],
        'message': 'Expected number, received string',
        'actual_value': 'bing',
      },
    ])
  })

  it('handles arrays that pass', () => {
    assertMatches([{ foo: 'bar', baz: 'bing' }], [{
      foo: 'bar',
      baz: z.string(),
    }])
  })

  it('handles arrays that fail', () => {
    const result = asResult(() => {
      assertMatches([{ foo: 'bar', baz: 'bing' }], [{
        foo: 'bar',
        baz: z.number(),
      }])
    })
    assert(result.success === false)
    assert(result.error instanceof Error)
    assertEquals(JSON.parse(result.error.message), [
      {
        'code': 'invalid_type',
        'expected': 'number',
        'received': 'string',
        'path': [
          0,
          'baz',
        ],
        'message': 'Expected number, received string',
        'actual_value': 'bing',
      },
    ])
  })
})
/*
  assertMatches({ foo: 'bar', baz: 'bing' }, { foo: 'bar', baz: z.string() }) // passes
  assertMatches({ foo: 'bar', baz: 'bing' }, { foo: 'bar', baz: z.number() }) // fails
*/
