import { describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import snakeCase from '../../util/snakeCase.ts'

describe('snakeCase', () => {
  it('works', () => {
    assertEquals(snakeCase('camelCase'), 'camel_case')
    assertEquals(snakeCase('PascalCase'), 'pascal_case')
    assertEquals(snakeCase('kebab-case'), 'kebab_case')
    assertEquals(snakeCase('foo bar baz'), 'foo_bar_baz')
    assertEquals(snakeCase('XMLHttpRequest'), 'xml_http_request')
    assertEquals(snakeCase('IOError'), 'io_error')
  })
})
