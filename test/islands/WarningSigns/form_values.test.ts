import { describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { warningSignsFormValues } from '../../../islands/WarningSigns/form_values.ts'
import { CheckedWarningSign } from '../../../islands/WarningSigns/shared.ts'
import { WarningSignWithMaybeRecord } from '../../../types.ts'

const finding = (name: string) => `(clinical_finding (snomed_concept "${name}" "finding"))`

function sign(name: string, existing_record?: WarningSignWithMaybeRecord['existing_record']): WarningSignWithMaybeRecord {
  return {
    category: 'Common Symptoms',
    key: name,
    name,
    description: null,
    clinical_finding_s_expression: finding(name),
    predefined_attributes: [],
    relevant_qualifiers: [],
    onset_required: false,
    existing_record,
  }
}

function checked(
  base: WarningSignWithMaybeRecord,
  saving: CheckedWarningSign['saving'] = false,
  s_expression = base.clinical_finding_s_expression,
): CheckedWarningSign {
  return { ...base, entered: { s_expression, display: base.name }, saving }
}

const cough = sign('Cough')
const fever = sign('Fever')
const headache = sign('Headache')

describe('islands/WarningSigns/form_values.ts', () => {
  describe('warningSignsFormValues', () => {
    it('lists every sign on the page that is not checked as none_of_these, in a lisp array', () => {
      const { none_of_these } = warningSignsFormValues({
        warning_signs: [cough, fever, headache],
        checked_signs: [checked({ ...fever, existing_record: { id: 'fever-id', existence: 'Yes' } })],
      })
      assertEquals(none_of_these.s_expressions, `(${finding('Cough')} ${finding('Headache')})`)
    })

    it('sends the empty lisp array when every sign is checked', () => {
      const { none_of_these } = warningSignsFormValues({
        warning_signs: [cough],
        checked_signs: [checked({ ...cough, existing_record: { id: 'cough-id', existence: 'Yes' } })],
      })
      assertEquals(none_of_these.s_expressions, '()')
    })

    it('treats a sign as checked even when what was entered augments the sign', () => {
      const { none_of_these } = warningSignsFormValues({
        warning_signs: [cough, fever],
        checked_signs: [checked({ ...cough, existing_record: { id: 'cough-id', existence: 'Yes' } }, false, `${finding('Cough')} augmented`)],
      })
      assertEquals(none_of_these.s_expressions, `(${finding('Fever')})`)
    })

    it('lists the ids of positive records among the checked signs as saved_record_ids', () => {
      const { saved_record_ids } = warningSignsFormValues({
        warning_signs: [cough, fever],
        checked_signs: [
          checked({ ...cough, existing_record: { id: 'cough-id', existence: 'Yes' } }),
          checked({ ...fever, existing_record: { id: 'fever-id', existence: 'Yes' } }),
        ],
      })
      assertEquals(saved_record_ids, ['cough-id', 'fever-id'])
    })

    it('lists the id a sign still saving will have, rather than the negative record it is overturning', () => {
      const { saved_record_ids } = warningSignsFormValues({
        warning_signs: [cough],
        checked_signs: [checked({ ...cough, existing_record: { id: 'no-cough-id', existence: 'No' } }, { as_finding_id: 'cough-id' })],
      })
      assertEquals(saved_record_ids, ['cough-id'])
    })

    it('lists a record once when two signs stand for it, as when a symptom and a warning sign match the same record', () => {
      const shortness_of_breath = sign('Shortness of breath')
      const acute_shortness_of_breath: WarningSignWithMaybeRecord = {
        ...sign('Shortness of breath'),
        category: 'Very urgent',
        key: 'Acute shortness of breath',
        priority: 'Very urgent',
      }
      const { saved_record_ids } = warningSignsFormValues({
        warning_signs: [shortness_of_breath, acute_shortness_of_breath],
        checked_signs: [
          checked({ ...shortness_of_breath, existing_record: { id: 'sob-id', existence: 'Yes' } }),
          checked({ ...acute_shortness_of_breath, existing_record: { id: 'sob-id', existence: 'Yes' } }),
        ],
      })
      assertEquals(saved_record_ids, ['sob-id'])
    })

    it('does not list a checked sign that has no record and is not saving', () => {
      const { saved_record_ids } = warningSignsFormValues({
        warning_signs: [cough],
        checked_signs: [checked(cough)],
      })
      assertEquals(saved_record_ids, [])
    })

    it('includes checked signs not among the page signs, such as search results, in saved_record_ids only', () => {
      const ear_pain = sign('Pain of ear')
      const { saved_record_ids, none_of_these } = warningSignsFormValues({
        warning_signs: [cough],
        checked_signs: [checked({ ...ear_pain, existing_record: { id: 'ear-id', existence: 'Yes' } })],
      })
      assertEquals(saved_record_ids, ['ear-id'])
      assertEquals(none_of_these.s_expressions, `(${finding('Cough')})`)
    })
  })
})
