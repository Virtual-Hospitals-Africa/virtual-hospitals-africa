import { describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import {
  parseExpression,
  parseExpressionExpectingAtom,
} from '../../shared/s_expression.ts'
import { inverseSExpression } from '../../shared/s_expression_inverse.ts'
import { CLINICAL_FINDING } from '../../shared/snomed_concepts.ts'

describe('shared/s_expression.ts', () => {
  it('can parse a simple finding expression', () => {
    const finding = parseExpression('(finding 182899812 1219200912)')
    assertEquals(finding, {
      atom: 'finding',
      root_snomed_concept: {
        atom: 'snomed_concept',
        type: 'id',
        id: '182899812',
      },
      specific_snomed_concept: {
        atom: 'snomed_concept',
        type: 'id',
        id: '1219200912',
      },
      exact: false,
      value_snomed_concept: null,
      attributes: [],
      events: [],
      qualifiers: [],
    })
  })

  it('can parse a finding expression with qualifiers', () => {
    const finding = parseExpression(
      '(finding 182899812 1219200912 (qualifier 121277))',
    )
    assertEquals(finding, {
      atom: 'finding',
      root_snomed_concept: {
        atom: 'snomed_concept',
        type: 'id',
        id: '182899812',
      },
      specific_snomed_concept: {
        atom: 'snomed_concept',
        type: 'id',
        id: '1219200912',
      },
      exact: false,
      value_snomed_concept: null,
      attributes: [],
      events: [],
      qualifiers: [{
        atom: 'qualifier',
        specific_snomed_concept: {
          atom: 'snomed_concept',
          type: 'id',
          id: '121277',
        },
        qualifiers: [],
      }],
    })
  })

  /**
   * finding: attribute
    relation: finding site
    specific_snomed_concept_id: the actual finding site
   */
  it('can parse a finding expression with attributes & snomed concepts', () => {
    const parsed = parseExpressionExpectingAtom(
      `(finding ${CLINICAL_FINDING.id} 
          (snomed_concept "Burn" "disorder")
          (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Left upper arm structure" "body structure"))
      )`,
      'finding',
    )

    assertEquals(parsed, {
      'atom': 'finding',
      'root_snomed_concept': {
        'atom': 'snomed_concept',
        'type': 'id',
        'id': '404684003',
      },
      'specific_snomed_concept': {
        'atom': 'snomed_concept',
        'name': 'Burn',
        'category': 'disorder',
        'type': 'name_and_category',
      },
      'value_snomed_concept': null,
      'exact': false,
      'qualifiers': [],
      'events': [],
      'attributes': [
        {
          'atom': 'attribute',
          'specific_snomed_concept': {
            'atom': 'snomed_concept',
            'name': 'Finding site',
            'category': 'attribute',
            'type': 'name_and_category',
          },
          'value': {
            'atom': 'snomed_concept',
            'name': 'Left upper arm structure',
            'category': 'body structure',
            'type': 'name_and_category',
          },
        },
      ],
    })

    assertEquals(
      inverseSExpression(parsed),
      `(finding ${CLINICAL_FINDING.id} (snomed_concept "Burn" "disorder") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Left upper arm structure" "body structure")))`,
    )
  })

  it('can parse bare evaluations', () => {
    const parsed = parseExpression('(evaluation (evaluates (finding)))')
    assertEquals(parsed, {
      'atom': 'evaluation',
      'root_snomed_concept': null,
      'specific_snomed_concept': null,
      'value_snomed_concept': null,
      'qualifiers': [],
      'evaluates': {
        'atom': 'evaluates',
        'expression': {
          'atom': 'finding',
          'root_snomed_concept': null,
          'specific_snomed_concept': null,
          'value_snomed_concept': null,
          'qualifiers': [],
          'attributes': [],
          'events': [],
          'exact': false,
        },
      },
      'attributes': [],
      'events': [],
    })
  })
})
