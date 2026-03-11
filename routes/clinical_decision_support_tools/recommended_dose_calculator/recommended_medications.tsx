import { Context } from 'fresh'
import z from 'zod'
import { requestAsRecord } from '../../../backend/parseForm.ts'
import HealthWorkerContentsWithSidebarAndDrawer from '../../../components/library/layout/HealthWorkerContentsWithSidebarAndDrawer.tsx'
import { StepsSidebar } from '../../../components/library/Sidebar.tsx'
import { MedicineRecommendation, RecommendedMedication } from '../../../components/RecommendedMedication.tsx'
import memoize from '../../../util/memoize.ts'
import parseJSON from '../../../util/parseJSON.ts'
import { LogoWithFullText } from '../../../components/library/Logo.tsx'
import { patientAgeDetermination } from '../../../shared/patient_age_determination.ts'

type Condition = string | { id: string; name?: string }

type ParsedPatientCase = {
  sex?: string
  dob?: string
  height_cm?: string | number
  weight_kg?: string | number
  conditions?: Condition[] | Record<string, Condition>
}

// --- Placeholder Schemas (Adjust based on your actual types) ---
const TimeSpecificationSchema = z.any()
const PerSizeSchema = z.any()
const PrescriptionFrequencySchema = z.any()
const MaybeSchema = <T extends z.ZodTypeAny>(schema: T) => z.union([schema, z.null(), z.undefined()])

const SimpleParsedDoseSchema = z.object({
  units: z.string().optional(),
  value: z.number().optional(),
  quantity: z.number().optional(),
  ingredient_name: z.string().optional(),
  per_size: PerSizeSchema.optional(),
  per_time: TimeSpecificationSchema.optional(),
  per_dose: z.boolean().optional(),
  frequency: z.union([
    PrescriptionFrequencySchema,
    z.array(PrescriptionFrequencySchema),
    z.object({ every: TimeSpecificationSchema }),
  ]).optional(),
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

type Medicine = z.infer<typeof MedicineSchema>
type ICD10Indications = Medicine['icd10_indications']

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
    age_years: getAgeInYears(query.dob!),
    most_recent_height_cm_measurement: query.height_cm as string,
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

function parseWeight(weight_kg: string | number | undefined): number | undefined {
  if (weight_kg === undefined || weight_kg === null) return undefined
  const n = typeof weight_kg === 'number' ? weight_kg : parseFloat(String(weight_kg))
  return isNaN(n) ? undefined : n
}

export default async function RecommendedMedications(
  ctx: Context<unknown>,
) {
  const medicines = await getAllParsedMedications()
  const query = await requestAsRecord(ctx.req) as ParsedPatientCase

  // TODO route back to create patient case if query params not present

  const matching_medicines = findMatchingMedicines(medicines, query)
  const weight_kg = parseWeight(query.weight_kg)

  const condition_codes = extractConditionCodes(query.conditions)
  const conditions_items = Array.isArray(query.conditions) ? query.conditions : query.conditions ? Object.values(query.conditions) : []

  return (
    <HealthWorkerContentsWithSidebarAndDrawer
      title='Recommended Dose Calculator'
      url={ctx.url}
      sidebar={
        <StepsSidebar
          top={{
            href: '/clinical_decision_support_tools',
            child: <LogoWithFullText variant='indigo' className='w-full' />,
          }}
          url={ctx.url}
          route={ctx.route}
          params={ctx.params}
          nav_links={[
            {
              step: 'Create patient case',
              route: '/clinical_decision_support_tools/recommended_dose_calculator/create_patient_case',
            },
            {
              step: 'Recommended medications',
              route: '/clinical_decision_support_tools/recommended_dose_calculator/recommended_medications',
            },
          ]}
          steps_completed={['Create patient case']}
        />
      }
    >
      <div class='flex flex-col gap-6 py-6  px-4'>
        <section class='flex flex-col gap-2'>
          <h2 class='text-lg font-semibold text-gray-900'>Patient Details</h2>
          <dl class='flex flex-col gap-1'>
            <div class='flex gap-4'>
              <dt class='w-32 text-sm font-medium text-gray-500'>Date of Birth</dt>
              <dd class='text-sm text-gray-900'>{query.dob ?? '—'}</dd>
            </div>
            <div class='flex gap-4'>
              <dt class='w-32 text-sm font-medium text-gray-500'>Sex</dt>
              <dd class='text-sm text-gray-900'>{query.sex ?? '—'}</dd>
            </div>
            <div class='flex gap-4'>
              <dt class='w-32 text-sm font-medium text-gray-500'>Height (cm)</dt>
              <dd class='text-sm text-gray-900'>{query.height_cm ?? '—'}</dd>
            </div>
            <div class='flex gap-4'>
              <dt class='w-32 text-sm font-medium text-gray-500'>Weight (kg)</dt>
              <dd class='text-sm text-gray-900'>{query.weight_kg ?? '—'}</dd>
            </div>
          </dl>
        </section>

        <section class='flex flex-col gap-2'>
          <h2 class='text-lg font-semibold text-gray-900'>Conditions</h2>
          {condition_codes.length > 0
            ? (
              <ul class='flex flex-col gap-1 list-disc list-inside'>
                {conditions_items.map((item, i) => {
                  const label = typeof item === 'string'
                    ? item
                    : item && typeof item === 'object' && 'name' in item
                    ? `${(item as { name?: string; id: string }).name ?? ''} (${(item as { id: string }).id})`
                    : String(item)
                  return <li key={i} class='text-sm text-gray-900'>{label}</li>
                })}
              </ul>
            )
            : <p class='text-sm text-gray-500'>No conditions specified.</p>}
        </section>

        <section class='flex flex-col gap-2'>
          <h2 class='text-lg font-semibold text-gray-900'>
            Recommended Medications
            {matching_medicines.length > 0 && <span class='ml-2 text-sm font-normal text-gray-500'>({matching_medicines.length})</span>}
          </h2>
          {matching_medicines.length > 0
            ? (
              <div class='flex flex-col gap-4'>
                {matching_medicines.map((med, i) => (
                  <RecommendedMedication
                    key={i}
                    medicine={med as unknown as MedicineRecommendation}
                    weight_kg={weight_kg}
                  />
                ))}
              </div>
            )
            : (
              <p class='text-sm text-gray-500'>
                {condition_codes.length === 0 ? 'No conditions specified.' : 'No recommended medications found for the specified conditions.'}
              </p>
            )}
        </section>
      </div>
    </HealthWorkerContentsWithSidebarAndDrawer>
  )
}
