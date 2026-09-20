import { describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { warningSignsFormValues } from '../../../islands/WarningSigns/form_values.ts'
import { uniqueIdentifier } from '../../../islands/WarningSigns/shared.ts'
import { RecordedFinding, WarningSignWithMaybeRecord } from '../../../types.ts'

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

// A sign recorded on this page, at the id of its record (or the id its save is in flight under)
function recorded(
  base: WarningSignWithMaybeRecord,
  record_id: string,
  { saving = false, failed = false, s_expression = base.clinical_finding_s_expression }: { saving?: boolean; failed?: boolean; s_expression?: string } = {},
): RecordedFinding {
  return { key: uniqueIdentifier(base), entered: { s_expression, display: base.name }, record_id, saving, ...(failed ? { failed } : {}) }
}

const cough = sign('Cough')
const fever = sign('Fever')
const headache = sign('Headache')

describe('islands/WarningSigns/form_values.ts', () => {
  describe('warningSignsFormValues', () => {
    it('lists every sign on the page that is not checked as none_of_these, in a lisp array', () => {
      const { none_of_these } = warningSignsFormValues({
        warning_signs: [cough, fever, headache],
        recorded: [recorded(fever, 'fever-id')],
      })
      assertEquals(none_of_these.s_expressions, `(${finding('Cough')} ${finding('Headache')})`)
    })

    it('sends the empty lisp array when every sign is checked', () => {
      const { none_of_these } = warningSignsFormValues({
        warning_signs: [cough],
        recorded: [recorded(cough, 'cough-id')],
      })
      assertEquals(none_of_these.s_expressions, '()')
    })

    it('treats a sign as checked even when what was entered augments the sign', () => {
      const { none_of_these } = warningSignsFormValues({
        warning_signs: [cough, fever],
        recorded: [
          recorded(cough, 'cough-id', {
            s_expression: `(clinical_finding (snomed_concept "Cough" "finding") (qualifier (snomed_concept "Severe" "qualifier value")))`,
          }),
        ],
      })
      assertEquals(none_of_these.s_expressions, `(${finding('Fever')})`)
    })

    it('lists the ids of positive records among the checked signs as saved_record_ids', () => {
      const { saved_record_ids } = warningSignsFormValues({
        warning_signs: [cough, fever],
        recorded: [recorded(cough, 'cough-id'), recorded(fever, 'fever-id')],
      })
      assertEquals(saved_record_ids, ['cough-id', 'fever-id'])
    })

    it('lists the id a sign still saving will have, rather than the negative record it is overturning', () => {
      const { saved_record_ids } = warningSignsFormValues({
        warning_signs: [{ ...cough, existing_record: { id: 'no-cough-id', existence: 'No' } }],
        recorded: [recorded(cough, 'cough-id', { saving: true })],
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
        recorded: [recorded(shortness_of_breath, 'sob-id'), recorded(acute_shortness_of_breath, 'sob-id')],
      })
      assertEquals(saved_record_ids, ['sob-id'])
    })

    it('does not vouch for a sign whose save failed, but still does not list it as absent', () => {
      const { saved_record_ids, none_of_these } = warningSignsFormValues({
        warning_signs: [cough],
        recorded: [recorded(cough, 'cough-id', { failed: true })],
      })
      assertEquals(saved_record_ids, [])
      assertEquals(none_of_these.s_expressions, '()')
    })

    it('includes checked signs not among the page signs, such as search results, in saved_record_ids only', () => {
      const ear_pain = sign('Pain of ear')
      const { saved_record_ids, none_of_these } = warningSignsFormValues({
        warning_signs: [cough],
        recorded: [recorded(ear_pain, 'ear-id')],
      })
      assertEquals(saved_record_ids, ['ear-id'])
      assertEquals(none_of_these.s_expressions, `(${finding('Cough')})`)
    })
  })
})
