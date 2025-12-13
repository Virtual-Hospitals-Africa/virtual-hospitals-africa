import { afterAll, describe, it } from 'std/testing/bdd.ts'
import db from '../../db/db.ts'
import {
  fromFindingDescription,
} from '../../db/models/simple_record_language.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { asResult } from '../../util/asResult.ts'
import { assert } from 'std/assert/assert.ts'
import {
  fromParsedExpression,
  parseFindingExpression,
} from '../../shared/s_expression.ts'

describe('db/models/simple_record_language.ts', () => {
  afterAll(() => db.destroy())

  describe('parseFindingExpression', () => {
    it('can parse an expression signifying Uncontrolled Hemorrhage', () => {
      // 131148009 |Bleeding (finding)|
      // 19032002 |Uncontrolled (qualifier value)|

      const parsed = parseFindingExpression(
        `(finding 131148009 (qualifier 19032002))`,
      )
      assertEquals(parsed, {
        type: 'finding',
        snomed_concept_id: '131148009',
        value_snomed_concept_id: null,
        qualifiers: [
          {
            type: 'qualifier',
            snomed_concept_id: '19032002',
            value_snomed_concept_id: null,
            qualifiers: [],
          },
        ],
      })
    })

    it('throws an error if the expression is invalid', () => {
      const result = asResult(() =>
        parseFindingExpression('(finding 131148009 (qualifier 19032002')
      )
      assert(result.success === false)
      assert(result.error instanceof Error)
      assertEquals(result.error.message, 'Syntax error: Expected `)` - saw: ``')
    })

    it('throws an error if the expression is a valid s-expression but not a valid finding expression', () => {
      const result = asResult(() =>
        parseFindingExpression('(qualifier 19032002)')
      )
      assert(result.success === false)
      assert(result.error instanceof Error)
      assertEquals(
        result.error.message,
        'Expected top-level node to be "finding", got: "qualifier"',
      )
    })
  })

  describe('fromParsedExpression', () => {
    it('can convert a parsed expression to a finding description', () => {
      const expression = '(finding 131148009 (qualifier 19032002))'
      const result = fromParsedExpression(parseFindingExpression(expression))
      assertEquals(result, expression)
    })
  })

  describe('fromFindingDescription', () => {
    it('can parse a finding description', async () => {
      const result = await fromFindingDescription('Uncontrolled Hemorrhage')
      assertEquals(result, {
        type: 'finding',
        snomed_category: 'finding',
        snomed_concept_id: '131148009',
        value_snomed_concept_id: null,
        description: {
          id: '3035867011',
          term: 'Hemorrhage',
        },
        qualifiers: [
          {
            type: 'qualifier',
            snomed_category: 'qualifier value',
            snomed_concept_id: '19032002',
            value_snomed_concept_id: null,
            description: {
              id: '32082016',
              term: 'Uncontrolled',
            },
            qualifiers: [],
          },
        ],
      })
    })
  })
})
