import type { ExaminationChecklistDefinition } from '../types.ts'
import { groupBy, groupByUniq } from '../util/groupBy.ts'

export const ASSESSMENTS = [
  'Head-to-toe Assessment (General)' as const,
  'Head-to-toe Assessment (Skin)' as const,
  'Head-to-toe Assessment (Head and Neck)' as const,
  'Head-to-toe Assessment (Cardiovascular)' as const,
  'Head-to-toe Assessment (Respiratory)' as const,
  'Head-to-toe Assessment (Gastrointestinal)' as const,
  'Head-to-toe Assessment (Neuromuscular)' as const,
  "Women's Health Assessment" as const,
  'Maternity Assessment' as const,
  "Men's Health Assessment" as const,
  'Mental Health Assessment' as const,
  'Child Health Assessment' as const,
  'Gastroenterology' as const,
  'Endocrine' as const,
  'Osteopathy' as const,
  'Trauma' as const,
  'Oncology' as const,
  'Dental' as const,
  'Otolaryngology' as const,
  'Immunology' as const,
  'Urology' as const,
  'Gynecological' as const,
  'Neurology' as const,
  'Anesthetic' as const,
  'Obstetric' as const,
  'Ophthalmology' as const,
  'Geriatric' as const,
  'Pulmonology' as const,
  'Haematology' as const,
  'Dermatology' as const,
  'Paediatric' as const,
  'Rheumatology' as const,
  'Vascular' as const,
  'Cardiology' as const,
  'Psychiatry' as const,
  'Maxillofacial' as const,
  'Nephrology' as const,
]

export const DIAGNOSTIC_TESTS = [
  'Urine Analysis' as const,
  'Malaria' as const,
  'HIV' as const,
  'Pregnancy' as const,
  'Cholesterol' as const,
  'Blood Glucose' as const,
  'Hemoglobin' as const,
  'Uric Acid' as const,
  'Covid 19' as const,
  'Diabetes' as const,
  'Inflammation' as const,
  'Cardiac' as const,
  'Hormone' as const,
  'Thyroid' as const,
  'Bone Metabolism' as const,
  'Gastric Function' as const,
  'Anemia' as const,
  'Tumor' as const,
  'Brain Injury' as const,
  'Angiocapy' as const,
  'Immune System' as const,
  'Renal Function' as const,
  'Nervous System' as const,
  'Blood Pressure' as const,
  'Blood Oxygen Saturation' as const,
  'Body Mass Index' as const,
  'Spirometry FVC' as const,
  'Spirometry FEV' as const,
  'Spirometry PEF' as const,
  'Hepatitis C' as const,
  'Tuberculosis' as const,
  'Body Fat' as const,
  'Bone Mass' as const,
  'Water Weight' as const,
  'Muscle Mass' as const,
  'Body Weight' as const,
  'Basal Metabolic Rate' as const,
  'Typhoid' as const,
  'Syphilis' as const,
  'Chlamydia' as const,
  'Gonorrhea' as const,
  'Hepatitis A/B/C' as const,
  'Herpes Simplex Virus 1 & 2' as const,
  'Trichomonas' as const,
  'Cholera' as const,
  'Abdominal Ultrasound' as const,
  'Renal Ultrasound' as const,
  'Breast Ultrasound' as const,
  'Doppler Ultrasound' as const,
  'Pelvic Ultrasound' as const,
  'Transvaginal Ultrasound' as const,
  'Thyroid Ultrasound' as const,
  'Transrectal Ultrasound' as const,
  'Pregnancy Ultrasound' as const,
  'Chest X-ray' as const,
  'Abdominal X-ray' as const,
  'Kidney, Ureter and Bladder X-ray' as const,
  'Neck X-ray' as const,
  'Hand X-ray' as const,
  'Joint X-ray' as const,
  'Skull X-ray' as const,
  'Temperature' as const,
]

export const EXAMINATIONS = [
  ...ASSESSMENTS,
  ...DIAGNOSTIC_TESTS,
]

export function assertIsExamination(
  examination: string,
): asserts examination is Examination {
  if (!EXAMINATIONS.includes(examination as Examination)) {
    throw new Error(`Expected ${examination} to be an examination`)
  }
}

export type Assessment = typeof ASSESSMENTS[number]

export type DiagnosticTest = typeof DIAGNOSTIC_TESTS[number]

export type Examination = typeof EXAMINATIONS[number]

export const HEAD_TO_TOE_ASSESSMENT_TABS = [
  {
    tab: 'General' as const,
    examination_name: 'Head-to-toe Assessment (General)',
    categories: [{
      'category': 'Hands' as const,
      'examination_name': 'Head-to-toe Assessment (Hands)',
      'subcategories': [
        {
          'subcategory': 'Texture',
          'checklist': [
            {
              'label': 'cold',
              'snomed_concept_id': 703883009,
              'snomed_english_term': 'Cold skin',
              'body_sites': [
                {
                  'snomed_concept_id': 12861001,
                  'snomed_english_term': 'Both hands',
                },
                {
                  'snomed_concept_id': 85151006,
                  'snomed_english_term': 'Structure of left hand',
                },
                {
                  'snomed_concept_id': 78791008,
                  'snomed_english_term': 'Structure of right hand',
                },
              ],
            },
            {
              'label': 'hot',
              'snomed_concept_id': 707793005,
              'snomed_english_term': 'Hot skin',
              'body_sites': [
                {
                  'snomed_concept_id': 12861001,
                  'snomed_english_term': 'Both hands',
                },
                {
                  'snomed_concept_id': 85151006,
                  'snomed_english_term': 'Structure of left hand',
                },
                {
                  'snomed_concept_id': 78791008,
                  'snomed_english_term': 'Structure of right hand',
                },
              ],
            },
            {
              'label': 'clammy',
              'snomed_concept_id': 102598000,
              'snomed_english_term': 'Clammy skin',
              'body_sites': [
                {
                  'snomed_concept_id': 12861001,
                  'snomed_english_term': 'Both hands',
                },
                {
                  'snomed_concept_id': 85151006,
                  'snomed_english_term': 'Structure of left hand',
                },
                {
                  'snomed_concept_id': 78791008,
                  'snomed_english_term': 'Structure of right hand',
                },
              ],
            },
          ],
        },
        {
          'subcategory': 'Fingers',
          'checklist': [
            {
              'label': 'cyanosis',
              'snomed_concept_id': 3415004,
              'snomed_english_term': 'Cyanosis',
              'body_sites': [
                {
                  'snomed_concept_id': 362779006,
                  'snomed_english_term': 'All fingers',
                },
                {
                  'snomed_concept_id': 7569003,
                  'snomed_english_term': 'Finger structure',
                },
              ],
            },
            {
              'label': 'nicotine stains',
              'snomed_concept_id': 247439004,
              'snomed_english_term': 'Nicotine staining of finger',
              'body_sites': [
                {
                  'snomed_concept_id': 362779006,
                  'snomed_english_term': 'All fingers',
                },
                {
                  'snomed_concept_id': 7569003,
                  'snomed_english_term': 'Finger structure',
                },
              ],
            },
            {
              'label': 'clubbing',
              'snomed_concept_id': 30760008,
              'snomed_english_term': 'Finger clubbing',
              'body_sites': [
                {
                  'snomed_concept_id': 362779006,
                  'snomed_english_term': 'All fingers',
                },
                {
                  'snomed_concept_id': 7569003,
                  'snomed_english_term': 'Finger structure',
                },
              ],
            },
          ],
        },
        {
          'subcategory': 'Nails',
          'checklist': [
            {
              'label': 'leukonychia',
              'snomed_concept_id': 111202002,
              'snomed_english_term': 'Leukonychia',
              'body_sites': [
                {
                  'snomed_concept_id': 770802007,
                  'snomed_english_term': 'Nail unit structure',
                },
              ],
            },
            {
              'label': 'koilonychia',
              'snomed_concept_id': 66270006,
              'snomed_english_term': 'Koilonychia',
              'body_sites': [
                {
                  'snomed_concept_id': 770802007,
                  'snomed_english_term': 'Nail unit structure',
                },
              ],
            },
            {
              'label': 'splinter hemorrhages',
              'snomed_concept_id': 271770005,
              'snomed_english_term': 'Splinter hemorrhages under nail',
              'body_sites': [
                {
                  'snomed_concept_id': 770802007,
                  'snomed_english_term': 'Nail unit structure',
                },
              ],
            },
            {
              'label': 'pitting',
              'snomed_concept_id': 89704006,
              'snomed_english_term': 'Pitting of nails',
              'body_sites': [
                {
                  'snomed_concept_id': 770802007,
                  'snomed_english_term': 'Nail unit structure',
                },
              ],
            },
            {
              'label': 'onycholysis',
              'snomed_concept_id': 75789001,
              'snomed_english_term': 'Onycholysis',
              'body_sites': [
                {
                  'snomed_concept_id': 770802007,
                  'snomed_english_term': 'Nail unit structure',
                },
              ],
            },
            {
              'label': 'discolouration',
              'snomed_concept_id': 47415006,
              'snomed_english_term': 'Abnormal color',
              'body_sites': [
                {
                  'snomed_concept_id': 770802007,
                  'snomed_english_term': 'Nail unit structure',
                },
              ],
            },
          ],
        },
        {
          'subcategory': 'Palms',
          'checklist': [
            {
              'label': 'erythema',
              'snomed_concept_id': 70819003,
              'snomed_english_term': 'Erythema',
              'body_sites': [
                {
                  'snomed_concept_id': 21547004,
                  'snomed_english_term': 'Palm (region) structure',
                },
              ],
            },
            {
              'label': "dupuytren's disease",
              'snomed_concept_id': 203045001,
              'snomed_english_term': "Dupuytren's disease of palm",
              'body_sites': [
                {
                  'snomed_concept_id': 21203009,
                  'snomed_english_term': 'Palmar aponeurosis structure',
                },
              ],
            },
            {
              'label': 'pale skin',
              'snomed_concept_id': 403237004,
              'snomed_english_term': 'Pale white constitutive skin colour',
              'body_sites': [
                {
                  'snomed_concept_id': 21547004,
                  'snomed_english_term': 'Palm (region) structure',
                },
              ],
            },
            {
              'label': 'cyanosis',
              'snomed_concept_id': 119419001,
              'snomed_english_term': 'Cyanosis of skin',
              'body_sites': [
                {
                  'snomed_concept_id': 21547004,
                  'snomed_english_term': 'Palm (region) structure',
                },
              ],
            },
            {
              'label': 'jaundice',
              'snomed_concept_id': 18165001,
              'snomed_english_term': 'Jaundice',
              'body_sites': [
                {
                  'snomed_concept_id': 21547004,
                  'snomed_english_term': 'Palm (region) structure',
                },
              ],
            },
          ],
        },
      ],
      'checklist': [] as ExaminationChecklistDefinition[],
    }],
  },
  {
    tab: 'Skin' as const,
    examination_name: 'Head-to-toe Assessment (Skin)',
    categories: [],
  },
  {
    tab: 'Head and Neck' as const,
    examination_name: 'Head-to-toe Assessment (Head and Neck)',
    categories: [],
  },
  {
    tab: 'Cardiovascular' as const,
    examination_name: 'Head-to-toe Assessment (Cardiovascular)',
    categories: [],
  },
  {
    tab: 'Respiratory' as const,
    examination_name: 'Head-to-toe Assessment (Respiratory)',
    categories: [],
  },
  {
    tab: 'Gastrointestinal' as const,
    examination_name: 'Head-to-toe Assessment (Gastrointestinal)',
    categories: [],
  },
  {
    tab: 'Neuromuscular' as const,
    examination_name: 'Head-to-toe Assessment (Neuromuscular)',
    categories: [],
  },
]

export const HEAD_TO_TOE_ASSESSMENTS_BY_EXAMINATION_NAME = groupByUniq(
  HEAD_TO_TOE_ASSESSMENT_TABS,
  'examination_name',
)

export type HeadToToeAssessmentTab =
  typeof HEAD_TO_TOE_ASSESSMENT_TABS[number]['tab']

export function isHeadToToeAssessmentTab(
  tab: string,
): tab is HeadToToeAssessmentTab {
  return HEAD_TO_TOE_ASSESSMENT_TABS.some((t) => t.tab === tab)
}

export const HEAD_TO_TOE_ASSESSMENT_CHECKLIST = HEAD_TO_TOE_ASSESSMENT_TABS
  .flatMap(({ tab, examination_name, categories }) =>
    categories.flatMap(({ category, checklist, subcategories }) =>
      subcategories.flatMap(({ checklist, subcategory }) =>
        checklist.map((item) => ({
          ...item,
          category,
          tab,
          examination_name,
          subcategory: subcategory as string | null,
        }))
      ).concat(checklist.map((item) => ({
        ...item,
        category,
        tab,
        examination_name,
        subcategory: null,
      })))
    )
  )

export const HEAD_TO_TOE_ASSESSMENT_CHECKLIST_BY_SNOMED_CODE = groupByUniq(
  HEAD_TO_TOE_ASSESSMENT_CHECKLIST,
  'snomed_concept_id',
)

const CHECKLIST_ITEMS_BY_CATEGORY = groupBy(
  HEAD_TO_TOE_ASSESSMENT_CHECKLIST,
  'category',
)

export function getRelevantSnomedCodes(examination: Examination): number[] {
  if (examination.startsWith('Head-to-toe Assessment')) {
    const category = examination.replace('Head-to-toe Assessment (', '')
      .replace(')', '')
    // deno-lint-ignore no-explicit-any
    const checklist_items = CHECKLIST_ITEMS_BY_CATEGORY.get(category as any) ||
      []
    return checklist_items.map((item) => item.snomed_concept_id)
  }
  return []
}
