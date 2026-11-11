import { describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { ClinicalFindingSchema } from '../../shared/clinical_finding_post.ts'
import { Medication, medicationDisplay, medicationToSExpression, parseMedicationSExpression } from '../../shared/medication_s_expression.ts'

const CETIRIZINE = '(snomed_concept "Product containing only cetirizine" "medicinal product")'

const FULL = `(medication ${CETIRIZINE} ` +
  '(form (snomed_concept "Tablet" "basic dose form")) ' +
  '(route (snomed_concept "Oral" "intended site")) ' +
  '(strength 10 "mg") ' +
  '(dosage 1 "tablet") ' +
  '(frequency (snomed_concept "Once daily" "qualifier value")) ' +
  '(duration 5 "days") ' +
  '(started "2026-11-01") ' +
  '(medication_id "0b9e4f0e-7c1b-4d0f-9d0a-1f2e3d4c5b6a") ' +
  '(notes "Taken at night"))'

function parsed(expression: string): Medication {
  const result = parseMedicationSExpression(expression)
  assert(result.ok, result.ok ? '' : result.error)
  return result.value
}

function error(expression: string): string {
  const result = parseMedicationSExpression(expression)
  assert(!result.ok, `Expected ${expression} not to parse`)
  return result.error
}

describe('shared/medication_s_expression.ts', () => {
  describe('parseMedicationSExpression', () => {
    it('parses a medication that is only a medicinal product', () => {
      assertEquals(parsed(`(medication ${CETIRIZINE})`), {
        snomed_concept: { name: 'Product containing only cetirizine', category: 'medicinal product' },
        form: null,
        route: null,
        strengths: [],
        dosage: null,
        frequency: null,
        duration: null,
        started: null,
        medication_id: null,
        notes: null,
      })
    })

    it('parses every attribute', () => {
      assertEquals(parsed(FULL), {
        snomed_concept: { name: 'Product containing only cetirizine', category: 'medicinal product' },
        form: { name: 'Tablet', category: 'basic dose form' },
        route: { name: 'Oral', category: 'intended site' },
        strengths: [{ value: '10', units: 'mg' }],
        dosage: { value: '1', units: 'tablet' },
        frequency: { name: 'Once daily', category: 'qualifier value' },
        duration: { value: '5', units: 'days' },
        started: '2026-11-01',
        medication_id: '0b9e4f0e-7c1b-4d0f-9d0a-1f2e3d4c5b6a',
        notes: 'Taken at night',
      })
    })

    it('takes attributes in any order, a strength per active ingredient, and fractional values', () => {
      const medication = parsed(
        '(medication (snomed_concept "Product containing only amoxicillin and clavulanic acid" "medicinal product") ' +
          '(dosage 0.5 "tablet") (strength 500 "mg") (strength 125 "mg"))',
      )
      assertEquals(medication.strengths, [{ value: '500', units: 'mg' }, { value: '125', units: 'mg' }])
      assertEquals(medication.dosage, { value: '0.5', units: 'tablet' })
    })

    it('rejects what is not a medication', () => {
      assertEquals(error('(medication (snomed_concept "Cough" "finding"))'), 'A medication must be a medicinal product')
      assertEquals(error('(clinical_finding (snomed_concept "Cough" "finding"))'), 'Expected (medication ...)')
      assertEquals(error(`(medication ${CETIRIZINE} (colour "red"))`), 'Unknown medication attribute colour')
      assertEquals(error(`(medication ${CETIRIZINE} (dosage 1 "tablet") (dosage 2 "tablet"))`), 'dosage given more than once')
      assertEquals(error(`(medication ${CETIRIZINE} (dosage 0 "tablet"))`), 'Expected (dosage <positive number> "<units>")')
      assertEquals(error(`(medication ${CETIRIZINE} (dosage one "tablet"))`), 'Expected (dosage <positive number> "<units>")')
      assertEquals(error(`(medication ${CETIRIZINE} (started "yesterday"))`), 'Expected (started "YYYY-MM-DD")')
      assertEquals(error(`(medication ${CETIRIZINE} (medication_id "12"))`), 'Expected (medication_id "<uuid>")')
      assertEquals(error(`(medication ${CETIRIZINE} (form "Tablet"))`), 'Expected (snomed_concept "name" "category")')
    })
  })

  describe('medicationToSExpression', () => {
    it('is the inverse of parsing a normal form', () => {
      assertEquals(medicationToSExpression(parsed(FULL)), FULL)
      assertEquals(medicationToSExpression(parsed(`(medication ${CETIRIZINE})`)), `(medication ${CETIRIZINE})`)
    })

    it('writes attributes in one order however they were given', () => {
      const reordered = `(medication ${CETIRIZINE} (notes "Taken at night") (dosage 1 "tablet") (strength 10 "mg"))`
      assertEquals(
        medicationToSExpression(parsed(reordered)),
        `(medication ${CETIRIZINE} (strength 10 "mg") (dosage 1 "tablet") (notes "Taken at night"))`,
      )
    })

    it('round trips notes with quotes, backslashes, parentheses and new lines', () => {
      const notes = 'Says "it helps" (a little)\nBuys it at C:\\pharmacy, 5 at a time'
      const medication: Medication = { ...parsed(`(medication ${CETIRIZINE})`), notes }
      assertEquals(parsed(medicationToSExpression(medication)).notes, notes)
    })
  })

  describe('medicationDisplay', () => {
    it('describes a medication by strength, active ingredients and form, then how it is taken', () => {
      assertEquals(medicationDisplay(parsed(FULL)), {
        strength: '10mg',
        name: 'cetirizine',
        form: 'tablet',
        schedule: '1 tablet once daily for 5 days',
        short: '10mg cetirizine tablet',
        full: '10mg cetirizine tablet, 1 tablet once daily for 5 days',
      })
    })

    it('names every active ingredient and strength of a combination, and pluralizes', () => {
      const medication = parsed(
        '(medication (snomed_concept "Product containing only amoxicillin and clavulanic acid" "medicinal product") ' +
          '(strength 500 "mg") (strength 125 "mg") (dosage 2 "tablet") (duration 1 "weeks"))',
      )
      assertEquals(medicationDisplay(medication).full, '500mg/125mg amoxicillin + clavulanic acid, 2 tablets for 1 week')
    })

    it('is just the active ingredient when nothing else is known', () => {
      assertEquals(medicationDisplay(parsed(`(medication ${CETIRIZINE})`)).full, 'cetirizine')
    })
  })

  describe('ClinicalFindingSchema', () => {
    const finding = {
      finding_id: '0b9e4f0e-7c1b-4d0f-9d0a-1f2e3d4c5b6a',
      s_expression: '(clinical_finding (snomed_concept "Cough" "finding"))',
    }

    it('parses medication_s_expressions into medications', () => {
      const { medication_s_expressions } = ClinicalFindingSchema.parse({ ...finding, medication_s_expressions: [FULL] })
      assertEquals(medication_s_expressions, [parsed(FULL)])
    })

    it('rejects a medication that does not parse, saying why', () => {
      const result = ClinicalFindingSchema.safeParse({ ...finding, medication_s_expressions: ['(medication (snomed_concept "Cough" "finding"))'] })
      assert(!result.success)
      assertEquals(result.error.issues.map((issue) => issue.message), ['A medication must be a medicinal product'])
    })
  })
})
