import { describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import type { MedicinalProductOption } from '../../types.ts'
import type { Medication } from '../../shared/medication_s_expression.ts'
import { medicationChoices, withImplied, withoutImplied } from '../../shared/medication_options.ts'

const TABLET = { name: 'Tablet', category: 'basic dose form' as const }
const CAPSULE = { name: 'Capsule', category: 'basic dose form' as const }
const POWDER = { name: 'Powder', category: 'basic dose form' as const }
const ORAL = { name: 'Oral', category: 'intended site' as const }
const PARENTERAL = { name: 'Parenteral', category: 'intended site' as const }

function option(
  form: MedicinalProductOption['form'],
  route: MedicinalProductOption['route'],
  strength: string,
  dosage_units: string,
): MedicinalProductOption {
  return {
    clinical_drug: { snomed_concept_id: '1', name: `${strength}mg ${form?.name}`, category: 'clinical drug' },
    form,
    route,
    strengths: [{ value: strength, units: 'mg' }],
    dosage_units,
  }
}

// Like amoxicillin: several forms, the tablets and capsules oral, the powder injected
const SEVERAL_FORMS = [
  option(TABLET, ORAL, '500', 'tablet'),
  option(TABLET, ORAL, '875', 'tablet'),
  option(CAPSULE, ORAL, '250', 'capsule'),
  option(CAPSULE, ORAL, '500', 'capsule'),
  option(POWDER, PARENTERAL, '250', 'vial'),
]

// Like cetirizine tablets only: nothing to choose
const ONE_OPTION = [option(TABLET, ORAL, '10', 'tablet')]

const NOTHING_CHOSEN = { form: null, strength: null, route: null }

function medication(overrides: Partial<Medication> = {}): Medication {
  return {
    snomed_concept: { name: 'Product containing only amoxicillin', category: 'medicinal product' },
    form: null,
    route: null,
    strengths: [],
    dosage: null,
    frequency: null,
    duration: null,
    started: null,
    medication_id: null,
    notes: null,
    ...overrides,
  }
}

describe('shared/medication_options.ts', () => {
  describe('medicationChoices', () => {
    it('implies everything when the medicinal product comes only one way', () => {
      assertEquals(medicationChoices(ONE_OPTION, NOTHING_CHOSEN), {
        forms: [TABLET],
        strengths: [[{ value: '10', units: 'mg' }]],
        routes: [ORAL],
        form: TABLET,
        strength: [{ value: '10', units: 'mg' }],
        route: ORAL,
        dosage_units: 'tablet',
      })
    })

    it('offers every form, strength and route when nothing is chosen, with nothing in effect', () => {
      const choices = medicationChoices(SEVERAL_FORMS, NOTHING_CHOSEN)
      assertEquals(choices.forms, [TABLET, CAPSULE, POWDER])
      assertEquals(choices.strengths.map(([strength]) => strength.value), ['500', '875', '250'])
      assertEquals(choices.routes, [ORAL, PARENTERAL])
      assertEquals([choices.form, choices.strength, choices.route, choices.dosage_units], [null, null, null, null])
    })

    it('narrows the strengths and route to those of the chosen form', () => {
      const choices = medicationChoices(SEVERAL_FORMS, { ...NOTHING_CHOSEN, form: 'Tablet' })
      assertEquals(choices.form, TABLET)
      assertEquals(choices.strengths.map(([strength]) => strength.value), ['500', '875'])
      assertEquals(choices.routes, [ORAL])
      assertEquals(choices.route, ORAL, 'A tablet is only taken orally, so the route is implied')
      assertEquals(choices.dosage_units, 'tablet')
    })

    it('implies the strength and route of a form that comes in one strength', () => {
      const choices = medicationChoices(SEVERAL_FORMS, { ...NOTHING_CHOSEN, form: 'Powder' })
      assertEquals(choices.strength, [{ value: '250', units: 'mg' }])
      assertEquals(choices.route, PARENTERAL)
      assertEquals(choices.dosage_units, 'vial')
    })

    it('ignores a chosen strength the chosen form does not come in', () => {
      const choices = medicationChoices(SEVERAL_FORMS, { form: 'Tablet', strength: '250mg', route: null })
      assertEquals(choices.strength, null)
    })

    it('has nothing to offer or imply without options', () => {
      assertEquals(medicationChoices([], NOTHING_CHOSEN), {
        forms: [],
        strengths: [],
        routes: [],
        form: null,
        strength: null,
        route: null,
        dosage_units: null,
      })
    })
  })

  describe('withoutImplied', () => {
    it('drops what the medicinal product implies', () => {
      const entered = medication({ form: TABLET, route: ORAL, strengths: [{ value: '10', units: 'mg' }] })
      assertEquals(withoutImplied(entered, ONE_OPTION), medication())
    })

    it('keeps what was a choice, dropping only the route implied by the chosen form', () => {
      const entered = medication({ form: TABLET, route: ORAL, strengths: [{ value: '500', units: 'mg' }] })
      assertEquals(withoutImplied(entered, SEVERAL_FORMS), medication({ form: TABLET, strengths: [{ value: '500', units: 'mg' }] }))
    })
  })

  describe('withImplied', () => {
    it('fills in what the medicinal product implies', () => {
      assertEquals(withImplied(medication(), ONE_OPTION), medication({ form: TABLET, route: ORAL, strengths: [{ value: '10', units: 'mg' }] }))
    })

    it('fills in the route implied by the recorded form, and is the inverse of withoutImplied', () => {
      const recorded = medication({ form: TABLET, strengths: [{ value: '500', units: 'mg' }] })
      const in_full = withImplied(recorded, SEVERAL_FORMS)
      assertEquals(in_full, medication({ form: TABLET, route: ORAL, strengths: [{ value: '500', units: 'mg' }] }))
      assertEquals(withoutImplied(in_full, SEVERAL_FORMS), recorded)
    })

    it('leaves a medication as recorded when its options are not known', () => {
      const recorded = medication({ form: TABLET })
      assertEquals(withImplied(recorded, []), recorded)
    })
  })
})
