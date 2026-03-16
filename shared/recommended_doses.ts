import z from 'zod'
import { ParsedDose } from '../backend/recommended_doses/shared.ts'
import { positive_decimal, positive_integer } from '../util/validators.ts'
import { PrescriptionFrequencies } from './prescription.ts'
import keys from '../util/keys.ts'

export const PatientCaseSchema = z.object({
  sex: z.enum(['male', 'female']),
  dob: z.string().date(),
  height_cm: positive_decimal,
  weight_kg: positive_decimal,
  conditions: z.string().array().optional().default([]),
})

export type ParsedPatientCase = z.infer<typeof PatientCaseSchema>

const TimeUnitSchema = z.enum([
  'second',
  'minute',
  'hour',
  'day',
  'week',
  'month',
  'year',
])

// --- Placeholder Schemas (Adjust based on your actual types) ---
const TimeSpecificationSchema = z.object({
  value: positive_integer.or(z.tuple([positive_integer, positive_integer])),
  units: TimeUnitSchema,
})

const PerSizeSchema = z.literal('kg').or(z.literal('m2')).or(z.object({
  kg: positive_decimal,
}))

const PrescriptionFrequencyKeySchema = z.enum(keys(PrescriptionFrequencies))

const PrescriptionFrequencySchema = PrescriptionFrequencyKeySchema.or(
  PrescriptionFrequencyKeySchema.array(),
).or(z.object({
  every: TimeSpecificationSchema,
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
