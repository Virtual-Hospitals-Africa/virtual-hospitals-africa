import { describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { parseExpression, parseExpressionExpectingAtom } from '../../shared/s_expression.ts'
import { CLINICAL_FINDING_SNOMED_CONCEPT_ID } from '../../db/models/patient_findings.ts'

describe('shared/s_expression.ts', () => {
  it('can parse a simple finding expression', () => {
    const finding = parseExpression('(finding 182899812 1219200912)')
    assertEquals(finding, {
      atom: 'finding',
      snomed_concept_id: '182899812',
      finding_snomed_concept_id: '1219200912',
      value_snomed_concept_id: null,
      qualifiers: [],
      not_findings: [],
    })
  })

  it('can parse a finding expression with qualifiers', () => {
    const finding = parseExpression(
      '(finding 182899812 1219200912 (qualifier 121277))',
    )
    assertEquals(finding, {
      atom: 'finding',
      snomed_concept_id: '182899812',
      finding_snomed_concept_id: '1219200912',
      value_snomed_concept_id: null,
      qualifiers: [{
        atom: 'qualifier',
        snomed_concept_id: '121277',
        value_snomed_concept_id: null,
        qualifiers: [],
      }],
      not_findings: [],
    })
  })

  it('can parse a finding expression with attributes & snomed concepts', () => {
    const parsed = parseExpressionExpectingAtom(
      `(finding ${CLINICAL_FINDING_SNOMED_CONCEPT_ID} 
          (snomed_concept "Burn" "disorder")
          (attribute (snomed_concept "Finding site") (snomed_concept "Left upper arm structure"))
      )`,
      'finding',
    )

    console.log(parsed)
  })
})
