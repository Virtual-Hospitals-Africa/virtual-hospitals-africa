import type { ExaminationChecklistDefinition } from '../types.ts'
import { groupByUniq } from '../util/groupBy.ts'

export const HEAD_TO_TOE_ASSESSMENTS = [
  {
    examination_identifier: 'head_to_toe_assessment_general',
    query_slug: 'general',
    categories: [{
      'category': 'Hands' as const,
      'examination_identifier': 'head_to_toe_assessment_hands',
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
    examination_identifier: 'head_to_toe_assessment_skin',
    query_slug: 'skin',
    categories: [],
  },
  {
    examination_identifier: 'head_to_toe_assessment_head_and_neck',
    query_slug: 'head_and_neck',
    categories: [],
  },
  {
    examination_identifier: 'head_to_toe_assessment_cardiovascular',
    query_slug: 'cardiovascular',
    categories: [],
  },
  {
    examination_identifier: 'head_to_toe_assessment_respiratory',
    query_slug: 'respiratory',
    categories: [],
  },
  {
    examination_identifier: 'head_to_toe_assessment_gastrointestinal',
    query_slug: 'gastrointestinal',
    categories: [],
  },
  {
    examination_identifier: 'head_to_toe_assessment_neuromuscular',
    query_slug: 'neuromuscular',
    categories: [],
  },
]

export const HEAD_TO_TOE_ASSESSMENTS_BY_IDENTIFIER = groupByUniq(
  HEAD_TO_TOE_ASSESSMENTS,
  'examination_identifier',
)

// export const HEAD_TO_TOE_ASSESSMENT_CHECKLIST = HEAD_TO_TOE_ASSESSMENTS
//   .flatMap(({ exam, examination_identifier, categories }) =>
//     categories.flatMap(({ category, checklist, subcategories }) =>
//       subcategories.flatMap(({ checklist, subcategory }) =>
//         checklist.map((item) => ({
//           ...item,
//           category,
//           tab,
//           examination_identifier,
//           subcategory: subcategory as string | null,
//         }))
//       ).concat(checklist.map((item) => ({
//         ...item,
//         category,
//         tab,
//         examination_identifier,
//         subcategory: null,
//       })))
//     )
//   )

// export const HEAD_TO_TOE_ASSESSMENT_CHECKLIST_BY_SNOMED_CODE = groupByUniq(
//   HEAD_TO_TOE_ASSESSMENT_CHECKLIST,
//   'snomed_concept_id',
// )
