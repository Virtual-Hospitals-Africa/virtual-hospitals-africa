import z from 'zod'
import memoize from '../../util/memoize.ts'
import parseJSON from '../../util/parseJSON.ts'
import { patientAgeDetermination } from '../../shared/patient_age_determination.ts'
import type { ICD10Indications, ParsedDose } from '../../backend/recommended_doses/shared.ts'
import { AppliedDose, Medicine, MedicineSchema, ParsedDoseSchema, ParsedPatientCase } from '../../shared/recommended_doses.ts'

function resolvePerKg(per_size: ParsedDose['per_size']): number | null {
  if (per_size === 'kg') return 1
  if (per_size === 'm2') return null
  if (per_size && typeof per_size === 'object' && 'kg' in per_size) return per_size.kg
  return null
}

// deno-lint-ignore no-explicit-any
function applyWeight(dose: any, weight_kg: number): any {
  const kg_factor = resolvePerKg(dose.per_size)
  const result = { ...dose }

  if (kg_factor !== null) {
    const { value, minimum, maximum } = dose
    if (value !== undefined) {
      result.per_kg_display = value
      result.value = +(value * weight_kg * kg_factor).toFixed(2)
    } else if (minimum !== undefined || maximum !== undefined) {
      result.per_kg_display = (minimum !== undefined && maximum !== undefined) ? `${minimum}–${maximum}` : String(minimum ?? maximum)
      if (minimum !== undefined) result.minimum = +(minimum * weight_kg * kg_factor).toFixed(2)
      if (maximum !== undefined) result.maximum = +(maximum * weight_kg * kg_factor).toFixed(2)
    }
    result.per_size = undefined
  }

  // deno-lint-ignore no-explicit-any
  if (result.low) result.low = result.low.map((d: any) => applyWeight(d, weight_kg))
  // deno-lint-ignore no-explicit-any
  if (result.high) result.high = result.high.map((d: any) => applyWeight(d, weight_kg))
  // deno-lint-ignore no-explicit-any
  if (result.min) result.min = result.min.map((d: any) => applyWeight(d, weight_kg))
  // deno-lint-ignore no-explicit-any
  if (result.max) result.max = result.max.map((d: any) => applyWeight(d, weight_kg))
  if (result.titrate) {
    const t = result.titrate
    result.titrate = {
      ...t,
      min: t.min ? applyWeight(t.min, weight_kg) : undefined,
      max: t.max ? applyWeight(t.max, weight_kg) : undefined,
      low: t.low ? applyWeight(t.low, weight_kg) : undefined,
      high: t.high ? applyWeight(t.high, weight_kg) : undefined,
    }
  }

  return result
}

const getAllParsedMedications = memoize(async (): Promise<Medicine[]> => {
  const json = await parseJSON('./backend/recommended_doses/parsed/recommended_doses.json')
  return MedicineSchema.array().parse(json)
})

function extractConditionCodes(conditions: ParsedPatientCase['conditions']): string[] {
  if (!conditions) return []
  const items = Array.isArray(conditions) ? conditions : Object.values(conditions)
  return items.flatMap((item) => {
    if (typeof item === 'string') return [item]
    if (item && typeof item === 'object' && 'id' in item && typeof (item as Record<string, unknown>).id === 'string') {
      return [(item as { id: string }).id]
    }
    return []
  })
}

function codeMatches(indicator_code: string, patient_code: string): boolean {
  if (indicator_code.endsWith('*')) {
    return patient_code.startsWith(indicator_code.slice(0, -1))
  }
  return patient_code.startsWith(indicator_code)
}

function indicationsMatch(indications: ICD10Indications, patient_codes: string[]): boolean {
  if (indications.type === 'codes') {
    if (indications.codes.length === 0) return false
    return indications.codes.some((code) => patient_codes.some((pc) => codeMatches(code, pc)))
  }
  // 'and': every group must have at least one matching code
  return indications.indications.every((group) => group.codes.some((code) => patient_codes.some((pc) => codeMatches(code, pc))))
}

function getAgeInYears(dob: string): number {
  const birth_date = new Date(dob)
  const today = new Date()

  // Difference in milliseconds
  const diff_in_ms = today.getTime() - birth_date.getTime()

  // Convert ms to years: ms -> sec -> min -> hour -> day -> year
  // Using 365.25 to account for leap year averages
  const age_in_years = diff_in_ms / (1000 * 60 * 60 * 24 * 365.25)

  return Math.max(0, age_in_years)
}

function scheduleMatchesAge(schedule: z.infer<typeof ParsedDoseSchema>, patient_is_adult: boolean | undefined): boolean {
  if (!schedule.age_classifier) return true
  const adult_classifiers = new Set(['adult', 'elderly'])
  const child_classifiers = new Set(['child', 'adolescent', 'infant', 'newborn', 'premature baby', 'breastfed infant'])
  if (patient_is_adult === true) return adult_classifiers.has(schedule.age_classifier)
  if (patient_is_adult === false) return child_classifiers.has(schedule.age_classifier)
  return true
}

function findMatchingMedicines(medicines: Medicine[], query: ParsedPatientCase): Medicine[] {
  const codes = extractConditionCodes(query.conditions)
  if (!codes.length) return []

  const age_determination = patientAgeDetermination({
    age_years: getAgeInYears(query.dob),
    most_recent_height_cm_measurement: String(query.height_cm),
  })

  const patient_is_adult = age_determination === 'adult'

  return medicines
    .filter((m) => indicationsMatch(m.icd10_indications, codes))
    .map((m) => {
      if (patient_is_adult === undefined) return m
      const filtered_schedules = m.schedules.filter((s) => scheduleMatchesAge(s, patient_is_adult))
      if (!filtered_schedules.length) return m // keep all if none match age
      return { ...m, schedules: filtered_schedules }
    })
}

function applyPatientCase(medicine: Medicine, patient_case: ParsedPatientCase) {
  return {
    ...medicine,
    patient_case,
    schedules: medicine.schedules.map((s) => applyWeight(s, Number(patient_case.weight_kg)) as AppliedDose),
  }
}

export const recommended_doses = {
  async getRecommendedDosesWithPatientCaseApplied(patient_case: ParsedPatientCase) {
    const medicines = await getAllParsedMedications()

    // TODO route back to create patient case if query params not present
    const matching_medicines = findMatchingMedicines(medicines, patient_case)

    return matching_medicines.map((medicine) => applyPatientCase(medicine, patient_case))
    // const condition_codes = extractConditionCodes(patient_case.conditions)
    // const conditions_items =
  },
}
