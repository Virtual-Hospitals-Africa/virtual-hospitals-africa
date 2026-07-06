import z from 'zod'
import memoize from '../../util/memoize.ts'
import parseJSON from '../../util/parseJSON.ts'
import { patientAgeDetermination } from '../../shared/patient_age_determination.ts'
import type { ICD10Indications, ParsedDose } from '../../backend/recommended_doses/shared.ts'
import { AppliedDose, Medicine, MedicineSchema, ParsedDoseSchema, ParsedPatientCase } from '../../shared/recommended_doses.ts'
import compactMap from '../../util/compactMap.ts'
import { assertUnreachable } from '../../util/assertUnreachable.ts'

function resolvePerKg(per_size: ParsedDose['per_size']): number | null {
  if (per_size === 'kg') return 1
  if (per_size === 'm2') return null
  // { kg: N } means the dose is expressed per N kg of body weight
  if (per_size && typeof per_size === 'object' && 'kg' in per_size) return 1 / per_size.kg
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

// A set of ICD-10 codes along with the thing (a positive finding/diagnosis, or
// anything else the caller wants back) that put those codes into play. Matched
// medicines report which sources contributed as their `due_to`.
export type ConditionSource<T> = {
  due_to: T
  codes: string[]
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
  if (indications.indications.length === 0) return false
  return indications.indications.every((group) => group.codes.some((code) => patient_codes.some((pc) => codeMatches(code, pc))))
}

// Whether any of this source's codes match any of the medicine's indicator
// codes, i.e. whether the source played a part in the medicine matching.
function sourceContributes(indications: ICD10Indications, source_codes: string[]): boolean {
  const indicator_codes = indications.type === 'codes' ? indications.codes : indications.indications.flatMap((group) => group.codes)
  return indicator_codes.some((code) => source_codes.some((pc) => codeMatches(code, pc)))
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

function scheduleMatchesAgeClassifier(
  schedule: z.infer<typeof ParsedDoseSchema>,
  patient_is_adult: boolean | undefined,
  dob: string,
): boolean {
  if (!schedule.age_classifier) return true
  switch (schedule.age_classifier) {
    case 'adult':
      return patient_is_adult === true
    case 'child':
      return patient_is_adult === false
    case 'elderly':
      return scheduleMatchesAgeRange({ age_range: { min: { value: 65, units: 'years', inclusive: true } } }, dob)
    case 'adolescent':
      return scheduleMatchesAgeRange({
        age_range: { min: { value: 10, units: 'years', inclusive: true }, max: { value: 19, units: 'years', inclusive: true } },
      }, dob)
    case 'infant':
      return scheduleMatchesAgeRange({
        age_range: { min: { value: 1, units: 'months', inclusive: true }, max: { value: 12, units: 'months', inclusive: true } },
      }, dob)
    case 'newborn':
      return scheduleMatchesAgeRange({ age_range: { max: { value: 1, units: 'months', inclusive: true } } }, dob)

    // TODO feed in history to make this determination
    case 'premature baby':
      // Prematurity isn't derivable from dob, so match any neonate and let the clinician decide
      return scheduleMatchesAgeRange({ age_range: { max: { value: 1, units: 'months', inclusive: true } } }, dob)

    // TODO feed in history to make this determination
    case 'breastfed infant':
      // Breastfeeding status isn't derivable from dob, so match any infant and let the clinician decide
      return scheduleMatchesAgeRange({ age_range: { max: { value: 12, units: 'months', inclusive: true } } }, dob)
    default:
      assertUnreachable(schedule.age_classifier)
  }
}

type AgeBound = { value: number; units: 'months' | 'years'; inclusive: boolean }

function ageInUnits(age_in_years: number, units: 'months' | 'years'): number {
  return units === 'years' ? age_in_years : age_in_years * 12
}

function meetsMin(bound: AgeBound | null | undefined, age_in_years: number): boolean {
  if (!bound) return true
  const age = ageInUnits(age_in_years, bound.units)
  return bound.inclusive ? age >= bound.value : age > bound.value
}

function meetsMax(bound: AgeBound | null | undefined, age_in_years: number): boolean {
  if (!bound) return true
  const age = ageInUnits(age_in_years, bound.units)
  // An inclusive max covers the entire final unit: a max of 19 years still
  // matches a 19.6-year-old, who remains 19 until their 20th birthday
  return bound.inclusive ? age < bound.value + 1 : age < bound.value
}

function scheduleMatchesAgeRange(schedule: z.infer<typeof ParsedDoseSchema>, dob: string): boolean {
  if (!schedule.age_range) return true

  const age_in_years = getAgeInYears(dob)

  return meetsMin(schedule.age_range.min, age_in_years) &&
    meetsMax(schedule.age_range.max, age_in_years)
}

function findMatchingMedicines<T>(
  medicines: Medicine[],
  query: ParsedPatientCase,
  sources: ConditionSource<T>[],
): Array<Medicine & { due_to: T[] }> {
  const codes = sources.flatMap((source) => source.codes)
  if (!codes.length) return []

  const age_determination = patientAgeDetermination({
    age_years: getAgeInYears(query.dob),
    most_recent_height: { cm: String(query.height_cm) },
  })

  const patient_is_adult = age_determination === 'adult'

  return compactMap(medicines, (m) => {
    if (!indicationsMatch(m.icd10_indications, codes)) return
    const due_to = sources.filter((source) => sourceContributes(m.icd10_indications, source.codes)).map((source) => source.due_to)
    if (patient_is_adult === undefined) return { ...m, due_to }
    const filtered_schedules = m.schedules.filter((s) =>
      scheduleMatchesAgeClassifier(s, patient_is_adult, query.dob) &&
      scheduleMatchesAgeRange(s, query.dob)
    )
    if (!filtered_schedules.length) return
    return { ...m, due_to, schedules: filtered_schedules }
  })
}

function applyPatientCase<M extends Medicine>(
  medicine: M,
  patient_case: ParsedPatientCase,
): Omit<M, 'schedules'> & { patient_case: ParsedPatientCase; schedules: AppliedDose[] } {
  return {
    ...medicine,
    patient_case,
    schedules: medicine.schedules.map((s) => applyWeight(s, Number(patient_case.weight_kg)) as AppliedDose),
  }
}

export const recommended_doses = {
  async getRecommendedDosesWithPatientCaseApplied<T>(
    patient_case: ParsedPatientCase,
    sources: ConditionSource<T>[],
  ) {
    const medicines = await getAllParsedMedications()
    const matching_medicines = findMatchingMedicines(medicines, patient_case, sources)
    return matching_medicines.map((medicine) => applyPatientCase(medicine, patient_case))
  },
}
