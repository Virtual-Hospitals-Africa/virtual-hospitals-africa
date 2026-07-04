import { describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { assertExists } from 'std/assert/assert_exists.ts'
import { recommended_doses } from '../../db/models/recommended_doses.ts'
import { AppliedDose, ParsedPatientCase, PatientCaseSchema } from '../../shared/recommended_doses.ts'

// These tests exercise unique dose shapes present in
// backend/recommended_doses/parsed/recommended_doses.json against a variety of
// patients. Each test names the real medicine entry it targets. No schedule in
// the current dataset is sex-specific, so patient sex varies across cases but
// does not affect matching.

function dobYearsAgo(years: number): string {
  const date = new Date()
  date.setFullYear(date.getFullYear() - years)
  // Move safely past the birthday so the patient is unambiguously `years` old
  date.setDate(date.getDate() - 45)
  return date.toISOString().slice(0, 10)
}

function testPatient(opts: {
  sex?: 'male' | 'female'
  age_years: number
  height_cm: number
  weight_kg: number
  conditions: string[]
}): ParsedPatientCase {
  return PatientCaseSchema.parse({
    sex: opts.sex ?? 'female',
    dob: dobYearsAgo(opts.age_years),
    height_cm: opts.height_cm,
    weight_kg: opts.weight_kg,
    conditions: opts.conditions,
  })
}

// 40-year-old man, 175cm, 70kg → adult
const adult_male = (conditions: string[]) => testPatient({ sex: 'male', age_years: 40, height_cm: 175, weight_kg: 70, conditions })

// 30-year-old woman, 160cm, 55kg → adult
const adult_female = (conditions: string[]) => testPatient({ sex: 'female', age_years: 30, height_cm: 160, weight_kg: 55, conditions })

// 7-year-old, 120cm, 25kg → child
const child_7yo = (conditions: string[]) => testPatient({ sex: 'male', age_years: 7, height_cm: 120, weight_kg: 25, conditions })

// 1-year-old, 72cm, 8kg → child
const infant_1yo = (conditions: string[]) => testPatient({ sex: 'female', age_years: 1, height_cm: 72, weight_kg: 8, conditions })

type RecommendedMedicine = Awaited<ReturnType<typeof recommended_doses.getRecommendedDosesWithPatientCaseApplied>>[number]

function getMedicines(results: RecommendedMedicine[], name: string, raw_dose?: string): RecommendedMedicine[] {
  return results.filter((m) => m.medicine.name === name && (!raw_dose || m.raw_dose === raw_dose))
}

function getMedicine(results: RecommendedMedicine[], name: string, raw_dose?: string): RecommendedMedicine {
  const [medicine] = getMedicines(results, name, raw_dose)
  assertExists(medicine, `expected recommended doses to include ${name}${raw_dose ? ` (${raw_dose})` : ''}`)
  return medicine
}

describe('db/models/recommended_doses.ts', () => {
  describe('indication matching', () => {
    it('recommends nothing for a patient with no conditions', async () => {
      const results = await recommended_doses.getRecommendedDosesWithPatientCaseApplied(adult_male([]))
      assertEquals(results, [])
    })

    it('recommends nothing when no medicine indication matches the patient conditions', async () => {
      // QQ is not an ICD-10 chapter, so no indicator code can prefix-match it
      const results = await recommended_doses.getRecommendedDosesWithPatientCaseApplied(adult_male(['QQ99']))
      assertEquals(results, [])
    })

    it('matches when the patient condition code is more specific than the indicator code', async () => {
      // Aciclovir "400mg" is indicated for B00.1; a more specific patient code shares that prefix
      const results = await recommended_doses.getRecommendedDosesWithPatientCaseApplied(adult_female(['B00.11']))
      getMedicine(results, 'Aciclovir', '400mg')
    })

    it('does not match when only some groups of an "and" indication match', async () => {
      // Albumin "40g (20%)" requires (R18 | K72.9 | K74.6) AND (I98.2* | I98.3*)
      const results = await recommended_doses.getRecommendedDosesWithPatientCaseApplied(adult_male(['R18']))
      assertEquals(getMedicines(results, 'Albumin'), [])
    })

    it('matches an "and" indication when every group matches, including wildcard codes by prefix', async () => {
      // Patient code I98.20 matches the wildcard indicator I98.2*
      const results = await recommended_doses.getRecommendedDosesWithPatientCaseApplied(adult_male(['R18', 'I98.20']))
      const albumin = getMedicine(results, 'Albumin', '40g (20%)')
      assertEquals(albumin.schedules.length, 1)
      assertEquals(albumin.schedules[0].value, 40)
      assertEquals(albumin.schedules[0].units, 'g')
    })
  })

  describe('age-based schedule filtering', () => {
    // Benzyl benzoate (B85.1) has one adolescent and one adult schedule

    it('gives an adult only the adult-classified schedules', async () => {
      const results = await recommended_doses.getRecommendedDosesWithPatientCaseApplied(adult_female(['B85.1']))
      const benzyl = getMedicine(results, 'Benzyl benzoate')
      assertEquals(benzyl.schedules.map((s) => s.age_classifier), ['adult'])
    })

    it('gives a child only the child-classified schedules (adolescent is a child classifier)', async () => {
      const results = await recommended_doses.getRecommendedDosesWithPatientCaseApplied(child_7yo(['B85.1']))
      const benzyl = getMedicine(results, 'Benzyl benzoate')
      assertEquals(benzyl.schedules.map((s) => s.age_classifier), ['adolescent'])
    })

    it('treats a patient 150cm or taller as an adult regardless of age', async () => {
      const tall_11yo = testPatient({ sex: 'male', age_years: 11, height_cm: 152, weight_kg: 45, conditions: ['B85.1'] })
      const results = await recommended_doses.getRecommendedDosesWithPatientCaseApplied(tall_11yo)
      const benzyl = getMedicine(results, 'Benzyl benzoate')
      assertEquals(benzyl.schedules.map((s) => s.age_classifier), ['adult'])
    })

    it('treats a patient 12 or older as an adult regardless of height', async () => {
      const short_13yo = testPatient({ sex: 'female', age_years: 13, height_cm: 140, weight_kg: 40, conditions: ['B85.1'] })
      const results = await recommended_doses.getRecommendedDosesWithPatientCaseApplied(short_13yo)
      const benzyl = getMedicine(results, 'Benzyl benzoate')
      assertEquals(benzyl.schedules.map((s) => s.age_classifier), ['adult'])
    })

    it('keeps all schedules when none match the patient age group', async () => {
      // Aciclovir "250 mg/m2/dose" (B00.1) only has a child schedule; an adult
      // still sees the medicine rather than an empty schedule list
      const results = await recommended_doses.getRecommendedDosesWithPatientCaseApplied(adult_male(['B00.1']))
      const aciclovir = getMedicine(results, 'Aciclovir', '250 mg/m2/dose')
      assertEquals(aciclovir.schedules.length, 1)
      assertEquals(aciclovir.schedules[0].age_classifier, 'child')
    })

    it('includes schedules without an age classifier for patients of any age', async () => {
      // Sodium Chloride 0.9% "1mL/hr (0.02 mcg/kg/minute)" (T78.2) has two
      // schedules, neither with an age classifier
      const adult_results = await recommended_doses.getRecommendedDosesWithPatientCaseApplied(adult_male(['T78.2']))
      assertEquals(getMedicine(adult_results, 'Sodium Chloride 0.9%', '1mL/hr (0.02 mcg/kg/minute)').schedules.length, 2)

      const infant_results = await recommended_doses.getRecommendedDosesWithPatientCaseApplied(infant_1yo(['T78.2']))
      assertEquals(getMedicine(infant_results, 'Sodium Chloride 0.9%', '1mL/hr (0.02 mcg/kg/minute)').schedules.length, 2)
    })
  })

  describe('applying patient weight', () => {
    it('leaves fixed doses unchanged', async () => {
      // Aciclovir "400mg" (B00.1) is a flat 400mg q8h for adults
      const results = await recommended_doses.getRecommendedDosesWithPatientCaseApplied(adult_male(['B00.1']))
      const aciclovir = getMedicine(results, 'Aciclovir', '400mg')
      const [schedule] = aciclovir.schedules
      assertEquals(schedule.value, 400)
      assertEquals(schedule.units, 'mg')
      assertEquals(schedule.per_kg_display, undefined)
    })

    it('multiplies per-kg doses by the patient weight', async () => {
      // Freeze dried plasma "15ml/kg" (K70.1), adult schedule
      const for_70kg = await recommended_doses.getRecommendedDosesWithPatientCaseApplied(adult_male(['K70.1']))
      const plasma_70kg = getMedicine(for_70kg, 'Freeze dried plasma', '15ml/kg')
      assertEquals(plasma_70kg.schedules.length, 1)
      const [schedule_70kg] = plasma_70kg.schedules
      assertEquals(schedule_70kg.value, 1050) // 15 ml/kg × 70 kg
      assertEquals(schedule_70kg.units, 'ml')
      assertEquals(schedule_70kg.per_kg_display, 15)
      assertEquals(schedule_70kg.per_size, undefined)

      const for_55kg = await recommended_doses.getRecommendedDosesWithPatientCaseApplied(adult_female(['K70.1']))
      const plasma_55kg = getMedicine(for_55kg, 'Freeze dried plasma', '15ml/kg')
      assertEquals(plasma_55kg.schedules[0].value, 825) // 15 ml/kg × 55 kg
    })

    it('divides doses expressed per N kg of body weight', async () => {
      // Loperamide "0.5mg/12.5kg" (F11.23) is parsed with per_size {kg: 12.5},
      // i.e. 0.5mg per 12.5kg of body weight, so a 25kg child gets
      // 0.5 × 25 / 12.5 = 1mg
      const results = await recommended_doses.getRecommendedDosesWithPatientCaseApplied(child_7yo(['F11.23']))
      const loperamide = getMedicine(results, 'Loperamide', '0.5mg/12.5kg')
      const [schedule] = loperamide.schedules
      assertEquals(schedule.value, 1)
      assertEquals(schedule.units, 'mg')
      assertEquals(schedule.per_size, undefined)
    })

    it('applies weight to per-kg doses nested in low/high ranges', async () => {
      // Azathioprine "0.5-1mg/kg" (K75.4), adult schedule with low/high arrays
      const results = await recommended_doses.getRecommendedDosesWithPatientCaseApplied(adult_male(['K75.4']))
      const azathioprine = getMedicine(results, 'Azathioprine', '0.5-1mg/kg')
      const [schedule] = azathioprine.schedules

      const low = schedule.low?.[0] as AppliedDose
      assertExists(low)
      assertEquals(low.value, 35) // 0.5 mg/kg × 70 kg
      assertEquals(low.per_kg_display, 0.5)
      assertEquals(low.per_size, undefined)

      const high = schedule.high?.[0] as AppliedDose
      assertExists(high)
      assertEquals(high.value, 70) // 1 mg/kg × 70 kg
      assertEquals(high.per_kg_display, 1)
      assertEquals(high.per_size, undefined)
    })

    it('applies weight to per-kg doses nested in titration targets', async () => {
      // Captopril "0.5 - 1 mg/kg/24 hours (increased by 0.5 mg/kg/day to
      // 3-5 mg/kg/day)" (I50.9), child schedule with low/high and titrate
      const results = await recommended_doses.getRecommendedDosesWithPatientCaseApplied(child_7yo(['I50.9']))
      const captopril = getMedicine(
        results,
        'Captopril',
        '0.5 - 1 mg/kg/24 hours (increased by 0.5 mg/kg/day to 3-5 mg/kg/day)',
      )
      const [schedule] = captopril.schedules

      assertEquals((schedule.low?.[0] as AppliedDose).value, 12.5) // 0.5 mg/kg × 25 kg
      assertEquals((schedule.high?.[0] as AppliedDose).value, 25) // 1 mg/kg × 25 kg

      assertExists(schedule.titrate)
      const titrate_low = schedule.titrate.low as AppliedDose
      assertExists(titrate_low)
      assertEquals(titrate_low.value, 75) // 3 mg/kg × 25 kg
      assertEquals(titrate_low.per_size, undefined)
      const titrate_high = schedule.titrate.high as AppliedDose
      assertExists(titrate_high)
      assertEquals(titrate_high.value, 125) // 5 mg/kg × 25 kg
      assertEquals(titrate_high.per_size, undefined)
    })

    it('applies weight for small patients without rounding artifacts', async () => {
      // Sodium Chloride 0.9% "1mL/hr (0.02 mcg/kg/minute)" (T78.2), first
      // schedule is 0.02 mcg/kg/minute
      const results = await recommended_doses.getRecommendedDosesWithPatientCaseApplied(infant_1yo(['T78.2']))
      const saline = getMedicine(results, 'Sodium Chloride 0.9%', '1mL/hr (0.02 mcg/kg/minute)')
      const per_kg_schedule = saline.schedules.find((s) => s.per_kg_display !== undefined)
      assertExists(per_kg_schedule)
      assertEquals(per_kg_schedule.value, 0.16) // 0.02 mcg/kg/minute × 8 kg
      assertEquals(per_kg_schedule.per_kg_display, 0.02)

      // The fixed 1 ml/hr schedule is untouched
      const fixed_schedule = saline.schedules.find((s) => s.per_kg_display === undefined)
      assertExists(fixed_schedule)
      assertEquals(fixed_schedule.value, 1)
      assertEquals(fixed_schedule.units, 'ml')
    })

    it('does not apply weight to per-m2 (body surface area) doses', async () => {
      // Aciclovir "250 mg/m2/dose" (B00.1) is dosed by body surface area,
      // which cannot be derived from weight alone
      const results = await recommended_doses.getRecommendedDosesWithPatientCaseApplied(child_7yo(['B00.1']))
      const aciclovir = getMedicine(results, 'Aciclovir', '250 mg/m2/dose')
      const [schedule] = aciclovir.schedules
      assertEquals(schedule.value, 250)
      assertEquals(schedule.per_size, 'm2')
      assertEquals(schedule.per_kg_display, undefined)
    })

    it('leaves minimum/maximum untouched when the dose is not per-kg', async () => {
      // Methylprednisolone acetate "20-80mg" (M16.0) has minimum: 2 and
      // maximum: 3 (dose counts) alongside fixed low/high amounts
      const results = await recommended_doses.getRecommendedDosesWithPatientCaseApplied(adult_female(['M16.0']))
      const methylprednisolone = getMedicine(results, 'Methylprednisolone acetate', '20-80mg')
      const [schedule] = methylprednisolone.schedules
      assertEquals(schedule.minimum, 2)
      assertEquals(schedule.maximum, 3)
      assertEquals(schedule.low?.[0].value, 20)
      assertEquals(schedule.high?.[0].value, 80)
    })
  })

  describe('result shape', () => {
    it('attaches the patient case to each recommended medicine', async () => {
      const patient_case = adult_male(['B00.1'])
      const results = await recommended_doses.getRecommendedDosesWithPatientCaseApplied(patient_case)
      assert(results.length > 0)
      for (const medicine of results) {
        assertEquals(medicine.patient_case, patient_case)
      }
    })
  })
})
