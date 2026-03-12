import z from 'zod'
import { positive_decimal, positive_integer } from '../../util/validators.ts'
import memoize from '../../util/memoize.ts'
import parseJSON from '../../util/parseJSON.ts'
import { patientAgeDetermination } from '../../shared/patient_age_determination.ts'
import type { ParsedDose } from '../../backend/recommended_doses/shared.ts'


export const PatientCaseSchema = z.object({
  sex: z.enum(['male', 'female']),
  dob: z.string().date(),
  height_cm: positive_decimal,
  weight_kg: positive_decimal,
  conditions: z.object({
    id: z.string(),
    name: z.string(),
  }).array().optional().default([])
})

export type ParsedPatientCase = z.infer<typeof PatientCaseSchema>

const TimeUnitSchema = z.enum([
  'second', 'minute', 'hour', 'day', 'week', 'month', 'year'
])

// --- Placeholder Schemas (Adjust based on your actual types) ---
const TimeSpecificationSchema = z.object({
  value: positive_integer.or(z.tuple([positive_integer, positive_integer])),
  units: TimeUnitSchema
})

const PerSizeSchema = z.literal('kg').or(z.literal('m2')).or(z.object({
  kg: positive_decimal
}))

const PrescriptionFrequencyKeySchema = z.enum([
  'ac',
  'am',
  'nocte',
  'od',
  'pm',
  'q15',
  'q30',
  'q1h',
  'q2h',
  'q4h',
  'q6h',
  'q8h',
  'qd',
  'bd',
  'tds',
  'qid',
  'qod',
  'mane',
  'qmane',
  'qn',
  'q12h',
  'q24h',
  'q30h',
  'q48h',
  'q72h',
  'hs',
  'qhs',
  'qw',
  'bw',
  'tw',
  'qm',
  'bm',
  'tm',
  'qs',
  'stat',
  'prn',
  'at',
])

const PrescriptionFrequencySchema = PrescriptionFrequencyKeySchema.or(
  PrescriptionFrequencyKeySchema.array()
).or(z.object({
  every: TimeSpecificationSchema
}))

const MaybeSchema = <T extends z.ZodTypeAny>(schema: T) => z.union([schema, z.null(), z.undefined()])

const SimpleParsedDoseSchema = z.object({
  units: z.string().optional(),
  value: z.number().optional(),
  quantity: z.number().optional(),
  ingredient_name: z.string().optional(),
  per_size: PerSizeSchema.optional(),
  per_time: TimeSpecificationSchema.optional(),
  per_dose: z.boolean().optional(),
  frequency: PrescriptionFrequencySchema.optional(),
  special_instructions: z.string().optional(),
  kg_limit_min: z.number().optional(),
  kg_limit_max: z.number().optional(),
  slowly: z.boolean().optional(),

  divided_dose_count: z.union([z.number(), z.tuple([z.number(), z.number()])]).optional(),

  per_percent_burn: z.boolean().optional(),
  duration: TimeSpecificationSchema.optional(),
  denominator: z.object({
    value: z.number(),
    units: z.string(),
  }).optional(),

  concentration: z.union([z.number(), z.tuple([z.number(), z.number()])]).optional(),
  concentration_ratio: z.tuple([z.number(), z.number()]).optional(),
}) /*.strict()*/

// --- The Recursive Schema ---
export const BuildingDoseSchema = z.object({
  minimum: z.number().optional(),
  maximum: z.number().optional(),
  units: z.string().optional(),
  value: z.number().optional(),
  quantity: z.number().optional(),
  ingredient_name: z.string().optional(),
  per_size: PerSizeSchema.optional(),
  per_time: TimeSpecificationSchema.optional(),
  per_dose: z.boolean().optional(),
  per_percent_burn: z.boolean().optional(),
  duration: TimeSpecificationSchema.optional(),
  denominator: z.object({
    value: z.number(),
    units: z.string(),
  }).optional(),
  concentration: z.union([z.number(), z.tuple([z.number(), z.number()])]).optional(),
  concentration_ratio: z.tuple([z.number(), z.number()]).optional(),

  // Recursive Arrays
  low: z.array(SimpleParsedDoseSchema.extend({
    diluents: z.array(SimpleParsedDoseSchema).optional(),
  })).optional(),
  high: z.array(SimpleParsedDoseSchema.extend({
    diluents: z.array(SimpleParsedDoseSchema).optional(),
  })).optional(),

  // Union Recursive
  total: z.union([z.literal(true), SimpleParsedDoseSchema]).optional(),

  age_classifier: z.enum([
    'premature baby',
    'breastfed infant',
    'child',
    'adolescent',
    'infant',
    'newborn',
    'adult',
    'elderly',
  ]).optional(),

  age_range: z.object({
    min: MaybeSchema(z.object({ value: z.number(), units: z.enum(['months', 'years']) })).optional(),
    max: MaybeSchema(z.object({ value: z.number(), units: z.enum(['months', 'years']) })).optional(),
  }).optional(),

  sex: z.enum(['all', 'female', 'male']).optional(),

  plus_minus: z.object({
    value: z.number(),
    units: z.string(),
  }).optional(),

  kg_limit_min: z.number().optional(),
  kg_limit_max: z.number().optional(),

  titrate: z.object({
    rate: z.object({
      increment: z.union([
        z.literal('slow'),
        z.object({ value: z.number(), units: z.string() }),
      ]),
      per_time: TimeSpecificationSchema.optional(),
      per_size: PerSizeSchema.optional(),
      per_dose: z.boolean().optional(),
    }).optional(),
    duration: TimeSpecificationSchema.optional(),
    min: SimpleParsedDoseSchema.optional(),
    max: SimpleParsedDoseSchema.optional(),
    low: SimpleParsedDoseSchema.optional(),
    high: SimpleParsedDoseSchema.optional(),
    if_necessary: z.boolean().optional(),
    to_effect: z.boolean().optional(),
  }).optional(),

  total_dose_count: z.number().optional(),
  divided_dose_count: z.union([z.number(), z.tuple([z.number(), z.number()])]).optional(),

  frequency: z.union([
    PrescriptionFrequencySchema,
    z.array(PrescriptionFrequencySchema),
    z.object({ every: TimeSpecificationSchema }),
  ]).optional(),

  special_instructions: z.string().optional(),

  other_schedule: SimpleParsedDoseSchema.optional(),
  multipliers: z.array(z.union([SimpleParsedDoseSchema, z.string()])).optional(),
  equation: z.string().optional(),
  alternate_specification: SimpleParsedDoseSchema.optional(),
  for_condition: z.string().optional(),

  within: z.object({
    time: TimeSpecificationSchema.optional(),
    event: z.string().optional(),
  }).optional(),

  slowly: z.boolean().optional(),

  series: z.union([
    z.object({
      dose_count: z.number(),
      starting_at: TimeSpecificationSchema.optional(),
      time_apart: TimeSpecificationSchema.optional(),
    }),
    z.object({
      doses: z.array(TimeSpecificationSchema),
    }),
  ]).optional(),

  time_apart: TimeSpecificationSchema.optional(),

  after: z.object({
    time: TimeSpecificationSchema.optional(),
    event: z.string().optional(),
  }).optional(),

  before: z.object({
    time: TimeSpecificationSchema.optional(),
    event: z.string().optional(),
  }).optional(),

  as_required: z.boolean().optional(),
})

export const ParsedDoseSchema = BuildingDoseSchema.extend({
  diluents: z.array(BuildingDoseSchema).optional(),
  // Intersections/Extends within Arrays
  active_ingredients: z.array(
    BuildingDoseSchema.and(z.object({ ingredient_name: z.string() })),
  ).optional(),
  min: z.array(BuildingDoseSchema).optional(),
  max: z.array(BuildingDoseSchema).optional(),
  recommended_average_dose: BuildingDoseSchema.optional(),
  equivalency: BuildingDoseSchema.optional(),
})

const Icd10Codes = z.object({
  type: z.literal('codes'),
  codes: z.string().array(),
})

const IngredientSchema = z.object({
  name: z.string(),
  alternate_name: z.string().optional(),
  dosage: z.object({
    value: z.number(),
    units: z.string(),
  }).optional(),
})

export const MedicineSchema = z.object({
  'atc': z.string(),
  'form': z.string(),
  'route': z.string(),
  'aware': z.enum(['Watch', 'Access', 'Reserve']).nullable(),
  'acute_chronic': z.enum(['Acute', 'Chronic']).nullable(),
  'prescriber': z.string().nullable().nullable(),
  'icd10_indications': Icd10Codes.or(z.object({
    type: z.literal('and'),
    indications: Icd10Codes.array(),
  })),
  'medicine': z.object({
    name: z.string(),
    alternate_name: z.string().optional(),
    ingredients: z.array(IngredientSchema),
  }),
  'raw_dose': z.string(),
  'raw_dose_interval': z.string(),
  'raw_duration': z.string().nullable(),
  'publication': z.string(), // "Adult Hospital Level",
  'chapter_name': z.string(), // "Alimentary Tract",
  'chapter_number': z.string(), // "1",
  'adult_children': z.string(), // "Adult",
  'section_number': z.string(), // "1.2",
  'disorder_number': z.string().nullable(), // "1.2.3",
  'disorder': z.string(), // "Portal Hypertension and Cirrhosis - Refactory Ascites"
  schedules: ParsedDoseSchema.array(),
  max: ParsedDoseSchema.nullish(),
})

export type Medicine = z.infer<typeof MedicineSchema>

export type ICD10Indications = Medicine['icd10_indications']

export type AppliedDose = ParsedDose & { per_kg_display?: number | string }

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
      result.per_kg_display = (minimum !== undefined && maximum !== undefined)
        ? `${minimum}–${maximum}`
        : String(minimum ?? maximum)
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

      return matching_medicines.map(medicine => applyPatientCase(medicine, patient_case))
      // const condition_codes = extractConditionCodes(patient_case.conditions)
      // const conditions_items = 
    
  }
}