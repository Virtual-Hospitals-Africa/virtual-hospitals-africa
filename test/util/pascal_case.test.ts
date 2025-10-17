import { describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import pascalCase from '../../util/pascalCase.ts'

describe('pascalCase', () => {
  it('works', () => {
    assertEquals(pascalCase('camelCase'), 'CamelCase')
    assertEquals(pascalCase('snake_case'), 'SnakeCase')
    assertEquals(pascalCase('PascalCase'), 'PascalCase')
    assertEquals(pascalCase('kebab-case'), 'KebabCase')
  })
})
