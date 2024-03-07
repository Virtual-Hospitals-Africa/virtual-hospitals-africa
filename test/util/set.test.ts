// deno-lint-ignore-file no-explicit-any
import { describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import set from '../../util/set.ts'

describe('set', () => {
  it('sets a simple key/value pair', () => {
    const original: any = { x: 'foo' }
    const updated = set(original, 'y', 'bar')
    assertEquals(updated, {
      x: 'foo',
      y: 'bar',
    })
    assertEquals(updated, original)
  })

  it('sets an array when a key is an integer', () => {
    const original: any = { x: 'foo' }
    set(original, 'y.0', 'bar')
    set(original, 'y.1', 'baz')
    assertEquals(original, {
      x: 'foo',
      y: ['bar', 'baz'],
    } as any)
  })

  it('sets a deep path', () => {
    const original: any = { x: 'foo' }
    set(original, 'a.b.c.d.e', 'wow')
    assertEquals(original, {
      x: 'foo',
      a: {
        b: {
          c: {
            d: {
              e: 'wow',
            },
          },
        },
      },
    } as any)
  })

  it('sets an array when a key is an integer in square brackets', () => {
    const original: any = { x: 'foo' }
    set(original, 'tobacco_products_used[0]', 2)
    set(original, 'tobacco_products_used[1]', 3)
    set(original, 'tobacco_products_used[2]', 5)
    set(original, 'tobacco_products_used[3]', 8)
    set(original, 'tobacco_products_used[4]', 9)
    set(original, 'tobacco_products_used[5]', 11)
    assertEquals(original, {
      x: 'foo',
      tobacco_products_used: [2, 3, 5, 8, 9, 11],
    } as any)
  })
})
