import { describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { parseExpression } from '../../shared/s_expression_parsing.ts'

describe('shared/s_expression.ts', () => {
  it('can parse a simple finding expression', () => {
    const foo = parseExpression('(finding 182899812)')
    assertEquals(foo, {
      atom: 'finding',
      snomed_concept_id: '182899812',
      value_snomed_concept_id: null,
      qualifiers: []
    })
  })

  it('can parse a finding expression with qualifiers', () => {
    const foo = parseExpression('(finding 182899812 (qualifiers (qualifier 121277)))')
    console.log({ foo })
    assertEquals(foo, {
      atom: 'finding',
      snomed_concept_id: '182899812',
      value_snomed_concept_id: null,
      qualifiers: [{
        atom: 'qualifier',
        snomed_concept_id: '121277',
        value_snomed_concept_id: null,
        qualifiers: []
      }]
    })
  })

  // (finding 404684003 (qualifier 75478009) (not (qualifier 1149222004)))
  const x = `(and 
                (finding 404684003 (qualifiers (qualifier 75478009)))
                (not (finding (qualifiers (qualifier 1149222004))))
              )`
})

