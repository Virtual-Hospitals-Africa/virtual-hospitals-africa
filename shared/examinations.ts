import { groupByUniq } from '../util/groupBy.ts'

export const ASSESSMENTS = [
  'Head-to-toe Assessment' as const,
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

export type Assessment = typeof ASSESSMENTS[number]

export type DiagnosticTest = typeof DIAGNOSTIC_TESTS[number]

export type Examination = typeof EXAMINATIONS[number]

export const HEAD_TO_TOE_EXAMINATION_CATEGORIES = [
  {
    'category': 'Hands',
    'subcategories': [
      {
        'subcategory': 'Texture',
        'checklist': [
          {
            'label': 'cold',
            'snomed_code': '703883009',
            'body_sites': [
              '1286100112861001',
              '85151006',
              '78791008',
            ],
          },
          {
            'label': 'hot',
            'snomed_code': '707793005',
            'body_sites': [
              '1286100112861001',
              '85151006',
              '78791008',
            ],
          },
          {
            'label': 'clammy',
            'snomed_code': '102598000',
            'body_sites': [
              '1286100112861001',
              '85151006',
              '78791008',
            ],
          },
        ],
      },
      {
        'subcategory': 'Fingers',
        'checklist': [
          {
            'label': 'cyanosis',
            'snomed_code': '3415004',
            'body_sites': [
              '362779006',
            ],
          },
          {
            'label': 'nicotine stains',
            'snomed_code': '247439004',
            'body_sites': [
              '362779006',
            ],
          },
          {
            'label': 'clubbing',
            'snomed_code': '30760008',
            'body_sites': [
              '362779006',
            ],
          },
        ],
      },
      {
        'subcategory': 'Nails',
        'checklist': [
          {
            'label': 'leukonychia',
            'snomed_code': '111202002',
            'body_sites': [
              '770802007',
            ],
          },
          {
            'label': 'koilonychia',
            'snomed_code': '66270006',
            'body_sites': [
              '770802007',
            ],
          },
          {
            'label': 'splinter hemorrhages',
            'snomed_code': '271770005',
            'body_sites': [
              '770802007',
            ],
          },
          {
            'label': 'pitting',
            'snomed_code': '89704006',
            'body_sites': [
              '770802007',
            ],
          },
          {
            'label': 'onycholysis',
            'snomed_code': '75789001',
            'body_sites': [
              '770802007',
            ],
          },
          {
            'label': 'discolouration',
            'snomed_code': '47415006',
            'body_sites': [
              '770802007',
            ],
          },
        ],
      },
      {
        'subcategory': 'Palms',
        'checklist': [
          {
            'label': 'erythema',
            'snomed_code': '70819003',
            'body_sites': [
              '21547004',
            ],
          },
          {
            'label': "dupuytren's disease",
            'snomed_code': '203045001',
            'body_sites': [
              '21203009',
            ],
          },
          {
            'label': 'pale skin',
            'snomed_code': '403237004',
            'body_sites': [
              '21547004',
            ],
          },
          {
            'label': 'cyanosis',
            'snomed_code': '119419001',
            'body_sites': [
              '21547004',
            ],
          },
          {
            'label': 'jaundice',
            'snomed_code': '18165001',
            'body_sites': [
              '21547004',
            ],
          },
        ],
      },
    ],
    'checklist': [],
  },
]

export const HEAD_TO_TOE_EXAMINATION_CHECKLIST =
  HEAD_TO_TOE_EXAMINATION_CATEGORIES.flatMap(({ checklist, subcategories }) =>
    subcategories.flatMap(({ checklist }) => checklist).concat(checklist)
  )

export const HEAD_TO_TOE_EXAMINATION_CHECKLIST_BY_SNOMED_CODE = groupByUniq(
  HEAD_TO_TOE_EXAMINATION_CHECKLIST,
  (item) => item.snomed_code,
)
