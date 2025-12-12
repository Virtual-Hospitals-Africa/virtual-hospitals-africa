import { afterAll, describe, it } from 'std/testing/bdd.ts'
import db from '../../db/db.ts'
import {
  fromFindingDescription,
  fromParsedExpression,
  parseFindingExpression,
} from '../../db/models/simple_record_language.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { asResult } from '../../util/asResult.ts'
import { assert } from 'std/assert/assert.ts'
import { WARNING_SIGNS } from '../../shared/warning_signs.ts'

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
        qualifiers: [
          {
            type: 'qualifier',
            snomed_concept_id: '19032002',
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

    it('can parse all the expressions for warning signs', () => {
      for (const sign of WARNING_SIGNS) {
        console.log(sign)
        const parsed = parseFindingExpression(sign.clinical_finding_s_expression)
        console.log(parsed)
      }
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
        description: {
          id: '3035867011',
          term: 'Hemorrhage',
        },
        qualifiers: [
          {
            type: 'qualifier',
            snomed_category: 'qualifier value',
            snomed_concept_id: '19032002',
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
