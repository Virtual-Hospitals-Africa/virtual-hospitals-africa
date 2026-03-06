import z from 'zod'
import { PrescriptionFrequency } from '../../shared/prescription.ts'
import { Maybe } from '../../types.ts'

export const MedicineRowSchema = z.object({
  'PUBLICATION': z.string(),
  'LEVEL OF CARE': z.string(),
  'CHAPTER NUMBER': z.string(),
  'CHAPTER NAME': z.string(),
  'SECTION NUMBER': z.string(),
  'STG/DISORDER GROUP': z.string(),
  'DISORDER NUMBER': z.string().nullable(),
  'DISORDER': z.string(),
  'ICD10 CODE': z.string(),
  'MEDICINE NAME (International Nonproprietary Name)': z.string(),
  'DOSAGE FORM': z.string(),
  'DOSE': z.string(),
  'DOSING INTERVAL': z.string(),
  'DURATION OF TREATMENT': z.string().nullable(),
  'ROUTE OF ADMINISTRATION': z.string(),
  'DDD': z.string(),
  'ATC': z.string(), //.nullable(),
  'AWaRe categorisation of antibiotics': z.string(), //.nullable(),
  'VEN': z.literal(null),
  'ACUTE/CHRONIC': z.string().nullable(),
  'ADULT/ CHILDREN': z.string().nullable(),
  'PRESCRIBER': z.string().nullable(),
})

export type MedicineRow = z.infer<typeof MedicineRowSchema>

export type PerSize = 'kg' | 'm2' | { kg: number }

export type TimeUnit = 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year'

export type PerTime = {
  value: number | number[]
  units: TimeUnit
}

export type ParsedDose = {
  minimum?: number
  maximum?: number
  units?: string
  value?: number
  quantity?: number
  ingredient_name?: string
  per_size?: PerSize
  per_time?: PerTime
  per_dose?: boolean
  per_percent_burn?: boolean
  duration?: PerTime
  denominator?: {
    value: number
    units: string
  }
  concentration?: number | [number, number]
  concentration_ratio?: [number, number]
  min?: ParsedDose[]
  max?: ParsedDose[]
  low?: ParsedDose[]
  high?: ParsedDose[]
  total?: true | ParsedDose
  age_range?: 'premature babies' | 'breastfed infants' | {
    min?: Maybe<{ value: number; units: 'months' | 'years' }>
    max?: Maybe<{ value: number; units: 'months' | 'years' }>
  }
  plus_minus?: {
    value: number
    units: string
  }
  kg_limit_min?: number
  kg_limit_max?: number
  titrate?: {
    rate?: {
      increment: 'slow' | {
        value: number
        units: string
      }
      per_time?: PerTime
      per_size?: PerSize
      per_dose?: boolean
    }
    duration?: PerTime
    min?: ParsedDose
    max?: ParsedDose
    low?: ParsedDose
    high?: ParsedDose
    if_necessary?: boolean
    to_effect?: boolean
  }
  divided_dose_count?: number | [number, number]
  recommended_average_dose?: ParsedDose
  frequency?: PrescriptionFrequency | PrescriptionFrequency[] | { every: PerTime }
  special_instructions?: string
  active_ingredients?: Array<
    ParsedDose & {
      ingredient_name: string
    }
  >
  diluents?: Array<ParsedDose>
  other_schedule?: ParsedDose
  multipliers?: Array<ParsedDose | string>
  equation?: string
  alternate_specification?: ParsedDose
  for_condition?: string
  within?: { time?: PerTime; event?: string }
  slowly?: boolean
  series?: {
    dose_count: number
    time_apart?: PerTime
  }
  time_apart?: PerTime
  after?: {
    time?: PerTime
    event?: string
  }
  before?: {
    time?: PerTime
    event?: string
  }
  as_required?: boolean
}

export type ParsedMedicine = {
  name: string
  alternate_name?: string
  ingredients: {
    name: string
    alternate_name?: string
    dosage?: { value: number; units: string }
  }[]
}

export type Prescriber =
  | 'Dentist'
  | 'Dentist, Dental therapist'
  | 'Doctor'
  | 'Doctor prescribed'
  | 'Doctor/Nurse'
  | 'N/A'
  | 'Nurse'
  | 'Specialist'
  | 'Specialist advice'
  | 'Specialist consultation'
  | 'Specialist initiated'
  | 'Specialist prescribed'
  | 'Specialist supervision'
  | 'Specialist/subspecialist supervision'
  | 'Subspecialist initiated'
  | 'Subspecialist supervision'

export type ICD10IndicationsCodes = { type: 'codes'; codes: string[] }
export type ICD10Indications =
  | ICD10IndicationsCodes
  | { type: 'and'; indications: ICD10IndicationsCodes[] }

export type ParsedMedicineRecommendedDose = {
  atc: string
  form: string
  route: string
  aware: null | 'Watch' | 'Access' | 'Reserve'
  acute_chronic: null | 'Acute' | 'Chronic'
  prescriber: Prescriber | null
  icd10_indications: ICD10Indications
  medicine: ParsedMedicine
  schedules: ParsedDose[]
}
