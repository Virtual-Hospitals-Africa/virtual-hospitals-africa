import z from 'zod'
import memoize from '../../util/memoize.ts'
import parseJSON from '../../util/parseJSON.ts'
import { patientAgeDetermination } from '../../shared/patient_age_determination.ts'
import type { ICD10Indications, ParsedDose } from '../../backend/recommended_doses/shared.ts'
import { AppliedDose, Medicine, MedicineSchema, ParsedDoseSchema, ParsedPatientCase } from '../../shared/recommended_doses.ts'
import { assert } from 'std/assert/assert.ts'

function resolvePerKg(per_size: ParsedDose['per_size']): number | null {
  if (per_size === 'kg') return 1
  if (per_size === 'm2') return null
  if (per_size && typeof per_size === 'object' && 'kg' in per_size) return per_size.kg
  return null
}

function realizeValue(dose: ParsedDose, weight_kg: number): AppliedDose {
  const kg_factor = resolvePerKg(dose.per_size)
  const result: AppliedDose = { ...dose }

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

  return result
}

function applyWeight(dose: ParsedDose, weight_kg: number): AppliedDose {
  const realized_value = realizeValue(dose, weight_kg)

  if (realized_value.low) realized_value.low = realized_value.low.map((d) => applyWeight(d, weight_kg))
  if (realized_value.high) realized_value.high = realized_value.high.map((d) => applyWeight(d, weight_kg))
  if (realized_value.min) realized_value.min = realized_value.min.map((d) => applyWeight(d, weight_kg))
  if (realized_value.max) realized_value.max = realized_value.max.map((d) => applyWeight(d, weight_kg))
  if (realized_value.titrate) {
    const t = realized_value.titrate
    realized_value.titrate = {
      ...t,
      min: t.min ? applyWeight(t.min, weight_kg) : undefined,
      max: t.max ? applyWeight(t.max, weight_kg) : undefined,
      low: t.low ? applyWeight(t.low, weight_kg) : undefined,
      high: t.high ? applyWeight(t.high, weight_kg) : undefined,
    }
  }

  return realized_value
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

const vacuously_true = () => true

export const recommended_doses = {
  scheduleMatchesAgeAndWeight(schedule: z.infer<typeof ParsedDoseSchema>, patient_case: ParsedPatientCase): boolean {
    const age_determination = patientAgeDetermination({
      age_years: getAgeInYears(patient_case.dob),
      most_recent_height_cm_measurement: String(patient_case.height_cm),
    })
    assert(age_determination)
    // Consider the presence of all classifiers 'adult', 'elderly' 'child', 'adolescent', 'infant', 'newborn', 'premature baby', 'breastfed infant'])
    const age_classifier_check = schedule.age_classifier
      ? (): boolean => {
          const c = schedule.age_classifier!
          if (c === 'adult' || c === 'elderly' || c === 'adolescent') return age_determination === 'adult'
          if (c === 'child') return age_determination === 'older child' || age_determination === 'younger child'
          // infant, newborn, breastfed infant, premature baby
          return age_determination === 'younger child'
        }
      : vacuously_true
    const age_in_months = getAgeInYears(patient_case.dob) * 12
    const age_range_max_check = schedule.age_range?.max != null
      ? (): boolean => {
          const max = schedule.age_range!.max!
          const max_months = max.units === 'years' ? max.value * 12 : max.value
          return age_in_months <= max_months
        }
      : vacuously_true
    const age_range_min_check = schedule.age_range?.min != null
      ? (): boolean => {
          const min = schedule.age_range!.min!
          const min_months = min.units === 'years' ? min.value * 12 : min.value
          return age_in_months >= min_months
        }
      : vacuously_true
    const kg_max_check = schedule.kg_limit_max != null
      ? (): boolean => Number(patient_case.weight_kg) <= schedule.kg_limit_max!
      : vacuously_true
    const kg_min_check = schedule.kg_limit_min != null
      ? (): boolean => Number(patient_case.weight_kg) >= schedule.kg_limit_min!
      : vacuously_true

    const checks = [
      age_classifier_check,
      age_range_max_check,
      age_range_min_check,
      kg_max_check,
      kg_min_check,
    ]
    const passes_all = checks.every(check => check())
    return passes_all
  },
  findMatchingMedicines(medicines: Medicine[], patient_case: ParsedPatientCase): Medicine[] {
    const codes = extractConditionCodes(patient_case.conditions)
    if (!codes.length) return []


    return medicines
      .filter((m) => indicationsMatch(m.icd10_indications, codes))
      .map((m) => {
        const filtered_schedules = m.schedules.filter((s) => recommended_doses.scheduleMatchesAgeAndWeight(s, patient_case))
        if (!filtered_schedules.length) return m // keep all if none match age
        return { ...m, schedules: filtered_schedules }
      })
  },

  applyPatientCase(medicine: Medicine, patient_case: ParsedPatientCase) {
    return {
      ...medicine,
      patient_case,
      schedules: medicine.schedules.map((s) => applyWeight(s as ParsedDose, Number(patient_case.weight_kg))),
    }
  },
  async getRecommendedDosesWithPatientCaseApplied(patient_case: ParsedPatientCase) {
    const medicines = await getAllParsedMedications()
    const matching_medicines = recommended_doses.findMatchingMedicines(medicines, patient_case)
    return matching_medicines.map((medicine) => recommended_doses.applyPatientCase(medicine, patient_case))
  },
}
