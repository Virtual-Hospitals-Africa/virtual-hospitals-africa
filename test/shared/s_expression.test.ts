import { describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { normalForm, parseExpressionExpectingAtom } from '../../shared/s_expression.ts'
import * as schemas from '../../shared/s_expression_schemas.ts'
import { inverseSExpression } from '../../shared/s_expression_inverse.ts'
import { CLINICAL_FINDING, HEMOGLOBIN_SATURATION_WITH_OXYGEN } from '../../shared/snomed_concepts.ts'
import { assertMatches } from '../../util/assertMatches.ts'
import { positive_decimal } from '../../util/validators.ts'
import { assert } from 'std/assert/assert.ts'

describe('shared/s_expression.ts', () => {
  it('has schemas with proper casing', () => {
    for (const key in schemas) {
      assert(/^[a-z|\d|_]+$/.test(key), `What? ${key}`)
    }
  })

  it('can parse a clinical_finding expression with attributes & snomed concepts; its normal form is a (finding)', () => {
    const parsed = parseExpressionExpectingAtom(
      `(clinical_finding
          (snomed_concept "Burn" "disorder")
          (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Left upper arm structure" "body structure"))
      )`,
      'finding',
    )

    assertEquals(parsed, {
      'atom': 'finding',
      'root_snomed_concept': {
        'atom': 'snomed_concept',
        'name': 'Clinical finding',
        'category': 'finding',
      },
      'specific_snomed_concept': {
        'atom': 'snomed_concept',
        'name': 'Burn',
        'category': 'disorder',
      },
      'value_snomed_concept': null,
      'exact': false,
      'history': false,
      'existence': 'Yes',
      'qualifiers': [],
      'attributes': [
        {
          'atom': 'attribute',
          'specific_snomed_concept': {
            'atom': 'snomed_concept',
            'name': 'Finding site',
            'category': 'attribute',
          },
          'value': {
            'atom': 'snomed_concept',
            'name': 'Left upper arm structure',
            'category': 'body structure',
          },
        },
      ],
    })

    assertEquals(
      inverseSExpression(parsed),
      `(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Burn" "disorder") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Left upper arm structure" "body structure")))`,
    )
  })

  it('can parse bare evaluations', () => {
    const parsed = parseExpressionExpectingAtom('(evaluation (evaluates (finding)))', 'evaluation')
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
          'exact': false,
          'history': false,
          'existence': 'Yes',
        },
      },
      'attributes': [],
    })
  })

  it('can parse a measurement', () => {
    const parsed = parseExpressionExpectingAtom(
      `(< (measurement ${HEMOGLOBIN_SATURATION_WITH_OXYGEN.s_expression} %) 92)`,
      '<',
    )
    assertMatches(parsed, {
      atom: '<',
      measurement: {
        atom: 'measurement',
        snomed_concept: {
          atom: 'snomed_concept',
        },
        units: '%',
      },
      value: positive_decimal.parse(92),
    })
  })

  it('can produce a normal form', () => {
    const normal_for_age = normalForm(`
      (finding
        ${CLINICAL_FINDING.s_expression}
        (snomed_concept "Ability to move" "observable entity")
        (snomed_concept "Normal" "qualifier value")
        (qualifier (snomed_concept "For" "qualifier value")
          (qualifier (snomed_concept "Age" "qualifier value"))))
    `)
    assertEquals(
      normal_for_age,
      '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Ability to move" "observable entity") (snomed_concept "Normal" "qualifier value") (qualifier (snomed_concept "For" "qualifier value") (qualifier (snomed_concept "Age" "qualifier value"))))',
    )
  })
})
