import { assertEquals } from 'std/assert/assert_equals.ts'
import { describe, it } from 'std/testing/bdd.ts'
import { KEYED_WARNING_SIGNS } from '../../shared/warning_signs.ts'
import { parseExpression } from '../../shared/s_expression.ts'
import { capture } from 'test/_helpers/capture.ts'

describe('shared/warning_signs.ts', () => {
  describe('parsing signs', () => {
    it('works', () => {
      const warning_signs = []
      for (
        const {
          clinical_finding_s_expression,
          prompt_when_s_expression,
          ...sign
        } of KEYED_WARNING_SIGNS
      ) {
        try {
          warning_signs.push({
            ...sign,
            clinical_finding: parseExpression(clinical_finding_s_expression),
            prompt_when: prompt_when_s_expression
              ? parseExpression(prompt_when_s_expression)
              : null,
          })
        } catch (err) {
          console.log(sign)
          throw err
        }
      }

      capture(warning_signs)
    })
  })
})
