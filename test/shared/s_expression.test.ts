import { describe, it } from 'std/testing/bdd.ts'
import { normalForm, parseExpressionExpectingAtom, parseWithSchema } from '../../shared/s_expression.ts'
import * as schemas from '../../shared/s_expression_schemas.ts'
import { inverseSExpression } from '../../shared/s_expression_inverse.ts'
import { CLINICAL_FINDING, HEMOGLOBIN_SATURATION_WITH_OXYGEN, STATUS_ATTRIBUTE } from '../../shared/snomed_concepts.ts'
import { assertMatches } from '../../util/assertMatches.ts'
import { positive_decimal } from '../../util/validators.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import assertLength from '../../util/assertLength.ts'
import { asResult } from '../../util/asResult.ts'

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
      'excluding': [],
      'attributes': [
        {
          'atom': 'attribute',
          'root_snomed_concept': { 'atom': 'snomed_concept', 'name': 'Attribute', 'category': 'attribute' },
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

  it('parses an event time comparison whose onset subject is an active_condition', () => {
    const parsed = parseExpressionExpectingAtom(
      `(>= (onset (active_condition (snomed_concept "Constipation" "finding"))) (time_ago 24 hours))`,
      '>=',
    )
    assert(parsed.type === 'event_time_comparison')
    assertMatches(parsed, {
      atom: '>=',
      type: 'event_time_comparison',
      timestamp_of_event: {
        atom: 'timestamp_of_event',
        event_snomed_concept: {
          atom: 'snomed_concept',
          name: 'Time of onset',
          category: 'observable entity',
        },
        subject: {
          atom: 'active_condition',
          snomed_concept: {
            atom: 'snomed_concept',
            name: 'Constipation',
            category: 'finding',
          },
          possible: false,
        },
      },
      duration: { value: 24, units: 'hours' },
    })
    assertEquals(
      inverseSExpression(parsed),
      `(>= (onset (active_condition (snomed_concept "Constipation" "finding"))) (time_ago 24 hours))`,
    )
  })

  it('parses excluding', () => {
    const parsed = parseExpressionExpectingAtom(`(finding (excluding (finding ${STATUS_ATTRIBUTE.s_expression})))`, 'finding')
    assertLength(parsed.excluding, 1)
  })

  it('parses manage with approved_by: role', () => {
    const parsed = parseWithSchema(`(manage (snomed_concept "Oxygen therapy" "procedure") (approved_by (role doctor)))`, schemas.manage)
    assertEquals(parsed.permissions, [
      { type: 'approved_by', role: 'doctor' },
    ])
  })

  it('parses manage with approved_by: role/specialty', () => {
    const parsed = parseWithSchema(
      `(manage (snomed_concept "Oxygen therapy" "procedure") (approved_by (role nurse) (specialty "Primary care")))`,
      schemas.manage,
    )
    assertEquals(parsed.permissions, [
      { type: 'approved_by', role: 'nurse', specialty: 'Primary care' },
    ])
  })

  it('parses manage with approved_by: multiple role/specialties', () => {
    const parsed = parseWithSchema(
      `(manage (snomed_concept "Oxygen therapy" "procedure") (approved_by (role nurse) (specialty "Primary care")) (approved_by (role nurse) (specialty "Pediatrics")))`,
      schemas.manage,
    )
    assertEquals(parsed.permissions, [
      { type: 'approved_by', role: 'nurse', specialty: 'Primary care' },
      { type: 'approved_by', role: 'nurse', specialty: 'Pediatrics' },
    ])
  })

  describe('helpful parse errors', () => {
    it('gives an error message pointing to the atom that is incorrect and what might be expected', () => {
      const result = asResult(() =>
        parseWithSchema(
          `(manage (snomed_concept "Oxygen therapy" "procedure") (not_an_atom (role nurse) (specialty "Primary care")) (approved_by (role nurse) (specialty "Pediatrics")))`,
          schemas.manage,
        )
      )
      assert(!result.success)
      assertEquals(
        result.error.message,
        `Error parsing
  (manage
    (snomed_concept "Oxygen therapy" "procedure")
    (not_an_atom
     ^ Error
      (role nurse)
      (specialty "Primary care")
    )
    (approved_by
      (role nurse)
      (specialty "Pediatrics")
    )
  )

using schema manage
saw: "not_an_atom"`,
      )
    })

    it('gives an error message for a value that is deeply nested', () => {
      const result = asResult(() =>
        parseWithSchema(
          `(task
  "Check blood pressure"
  all_ages
  (and
    (active_condition 38341003)
  )
  (measure
    (measurement 75367002 mmHg)
  )
)
`,
          schemas.any_rule,
        )
      )
      assert(!result.success)
      assertEquals(
        result.error.message,
        `Error parsing
  (task
    "Check blood pressure"
    all_ages
    (and
      (active_condition 38341003)
                        ^ Error
    )
    (measure
      (measurement 75367002 mmHg)
    )
  )

using schema any_rule
saw: "38341003"`,
      )
    })
  })
})
