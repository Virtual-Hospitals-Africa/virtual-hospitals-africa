import { describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import {
  parseExpression,
  parseExpressionExpectingAtom,
} from '../../shared/s_expression.ts'
import { CLINICAL_FINDING_SNOMED_CONCEPT_ID } from '../../db/models/patient_findings.ts'
import { inverseSExpression } from '../../shared/s_expression_inverse.ts'

describe('shared/s_expression.ts', () => {
  it('can parse a simple finding expression', () => {
    const finding = parseExpression('(finding 182899812 1219200912)')
    assertEquals(finding, {
      atom: 'finding',
      snomed_concept: { atom: 'snomed_concept', type: 'id', id: '182899812' },
      finding_snomed_concept: {
        atom: 'snomed_concept',
        type: 'id',
        id: '1219200912',
      },
      value_snomed_concept: null,
      attributes: [],
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
      snomed_concept: { atom: 'snomed_concept', type: 'id', id: '182899812' },
      finding_snomed_concept: {
        atom: 'snomed_concept',
        type: 'id',
        id: '1219200912',
      },
      value_snomed_concept: null,
      attributes: [],
      qualifiers: [{
        atom: 'qualifier',
        snomed_concept: { atom: 'snomed_concept', type: 'id', id: '121277' },
        value_snomed_concept: null,
        qualifiers: [],
      }],
      not_findings: [],
    })
  })

  /**
   * finding: attribute
    relation: finding site
    finding_snomed_concept_id: the actual finding site
   */
  it('can parse a finding expression with attributes & snomed concepts', () => {
    const parsed = parseExpressionExpectingAtom(
      `(finding ${CLINICAL_FINDING_SNOMED_CONCEPT_ID} 
          (snomed_concept "Burn" "disorder")
          (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Left upper arm structure" "body structure"))
      )`,
      'finding',
    )

    assertEquals(parsed, {
      'atom': 'finding',
      'snomed_concept': {
        'atom': 'snomed_concept',
        'type': 'id',
        'id': '404684003',
      },
      'finding_snomed_concept': {
        'atom': 'snomed_concept',
        'name': 'Burn',
        'category': 'disorder',
        'type': 'name_and_category',
      },
      'value_snomed_concept': null,
      'qualifiers': [],
      'attributes': [
        {
          'atom': 'attribute',
          'relation_snomed_concept': {
            'atom': 'snomed_concept',
            'name': 'Finding site',
            'category': 'attribute',
            'type': 'name_and_category',
          },
          'finding_snomed_concept': {
            'atom': 'snomed_concept',
            'name': 'Left upper arm structure',
            'category': 'body structure',
            'type': 'name_and_category',
          },
        },
      ],
      'not_findings': [],
    })

    assertEquals(
      inverseSExpression(parsed),
      `(finding ${CLINICAL_FINDING_SNOMED_CONCEPT_ID} (snomed_concept "Burn" "disorder") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Left upper arm structure" "body structure")))`,
    )
  })
})
