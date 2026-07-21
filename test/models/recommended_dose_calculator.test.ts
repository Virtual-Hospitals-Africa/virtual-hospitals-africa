import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { afterAll } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../db/db.ts'
import { recommended_dose_calculator } from '../../db/models/recommended_dose_calculator.ts'
import { PatientCaseSchema } from '../../shared/recommended_doses.ts'
import { RenderedPositiveRecordRelativeToHealthWorker } from '../../types.ts'

// The calculator maps each positive record's SNOMED concept to its primary
// ICD-10 code(s) (via the DB refset), then looks up EML medicines indicated for
// those codes and groups them by medicine name. These tests use real SNOMED
// concepts whose primary maps are stable, and real medicine entries from
// backend/recommended_doses/parsed/recommended_doses.json.
//
// lookup only reads each record's specific_snomed_concept_id, so the fixtures
// are bare objects with that field (plus an id, which the grouping uses to
// dedupe due_to records) rather than fully rendered records.
function asPositiveRecord(id: string, specific_snomed_concept_id: string): RenderedPositiveRecordRelativeToHealthWorker {
  return { id, specific_snomed_concept_id } as unknown as RenderedPositiveRecordRelativeToHealthWorker
}

// 40-year-old man, 175cm, 70kg → adult
const adult_case = PatientCaseSchema.parse({ sex: 'male', dob: '1986-01-01', height_cm: 175, weight_kg: 70 })

// Asthma → primary ICD-10 J45.9
const ASTHMA = '195967001'
// Chronic peptic ulcer → primary ICD-10 K27.9
const PEPTIC_ULCER = '13200003'

describeParallel('db/models/recommended_dose_calculator.ts', () => {
  afterAll(() => db.destroy())

  itParallel('recommends nothing when there are no positive records', async () => {
    const groups = await recommended_dose_calculator.lookup(db, adult_case, [])
    assertEquals(groups, [])
  })

  itParallel('recommends nothing when the concept does not map to any ICD-10 code', async () => {
    // 138875005 is the SNOMED CT root concept and has no ICD-10 complex map
    const groups = await recommended_dose_calculator.lookup(db, adult_case, [asPositiveRecord('r1', '138875005')])
    assertEquals(groups, [])
  })

  itParallel('recommends the EML medicines indicated for the mapped ICD-10 code', async () => {
    // Asthma maps to J45.9, which indicates inhaled bronchodilators/steroids and
    // systemic steroids
    const groups = await recommended_dose_calculator.lookup(db, adult_case, [asPositiveRecord('asthma', ASTHMA)])
    for (const g of groups) {
      console.log(g)
    }
    const names = groups.map((g) => g.medicine_name)
    assert(names.includes('Salbutamol'), `expected Salbutamol, got ${names.join(', ')}`)
    assert(names.includes('Prednisone'), `expected Prednisone, got ${names.join(', ')}`)
    assert(names.includes('Beclomethasone'), `expected Beclomethasone, got ${names.join(', ')}`)
  })

  itParallel('groups an EML row per medicine name and its options by form/route', async () => {
    const groups = await recommended_dose_calculator.lookup(db, adult_case, [asPositiveRecord('asthma', ASTHMA)])

    // Each medicine name appears once
    const names = groups.map((g) => g.medicine_name)
    assertEquals(names.length, new Set(names).size)

    // Salbutamol for asthma is stocked as both an inhaler and a nebuliser solution
    const salbutamol = groups.find((g) => g.medicine_name === 'Salbutamol')
    assert(salbutamol)
    const form_routes = salbutamol.forms.map((f) => f.form_route).sort()
    assertEquals(form_routes, ['Inhaler · Inhalation', 'Solution · Inhalation'])

    // form_route is form and route joined with " · ", and every form carries at
    // least one dosing option
    for (const form of salbutamol.forms) {
      assertEquals(form.form_route, [form.form, form.route].filter(Boolean).join(' · '))
      assert(form.options.length > 0)
    }
  })

  itParallel('applies the patient case to the recommended schedules', async () => {
    const groups = await recommended_dose_calculator.lookup(db, adult_case, [asPositiveRecord('asthma', ASTHMA)])
    const salbutamol = groups.find((g) => g.medicine_name === 'Salbutamol')
    assert(salbutamol)
    const options = salbutamol.forms.flatMap((f) => f.options)
    assert(options.length > 0)
    // applyPatientCase strips per_size once weight is applied, so no surviving
    // schedule should still be expressed per kilogram
    for (const option of options) {
      for (const schedule of option.schedules) {
        assertEquals(schedule.per_size, undefined)
      }
    }
  })

  itParallel('attributes each recommendation to the positive record(s) that produced it', async () => {
    const asthma = asPositiveRecord('asthma', ASTHMA)
    const ulcer = asPositiveRecord('ulcer', PEPTIC_ULCER)
    const groups = await recommended_dose_calculator.lookup(db, adult_case, [asthma, ulcer])

    const salbutamol = groups.find((g) => g.medicine_name === 'Salbutamol')
    assert(salbutamol)
    assertEquals(salbutamol.due_to.map((r) => r.id), ['asthma'])

    // Pantoprazole is indicated for the peptic ulcer code, not asthma
    const pantoprazole = groups.find((g) => g.medicine_name === 'Pantoprazole')
    assert(pantoprazole)
    assertEquals(pantoprazole.due_to.map((r) => r.id), ['ulcer'])
  })

  itParallel('unions and dedupes due_to across records that share an indication', async () => {
    // Two distinct asthma findings both map to J45.9, so both contribute to the
    // same recommendations; each medicine's due_to lists both records once
    const first = asPositiveRecord('asthma-1', ASTHMA)
    const second = asPositiveRecord('asthma-2', ASTHMA)
    const groups = await recommended_dose_calculator.lookup(db, adult_case, [first, second])

    const salbutamol = groups.find((g) => g.medicine_name === 'Salbutamol')
    assert(salbutamol)
    assertEquals(salbutamol.due_to.map((r) => r.id).sort(), ['asthma-1', 'asthma-2'])
  })
})
