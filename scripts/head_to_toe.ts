import { z } from 'zod'
import { parseTsv } from '../util/parseCsv.ts'
import { groupBy } from '../util/groupBy.ts'
import partition from '../util/partition.ts'

const ExaminationSchema = z.object({
  examination_name: z.string(),
  category: z.string(),
  subcategory: z.string().nullable(),
  finding_name: z.string().nullable(),
  notes: z.string().nullable(),
  snomed_finding_code: z.string().nullable(),
  snomed_body_structure_codes: z.string().nullable().transform((x) =>
    x?.split(',')
  ),
  snomed_additional_relationships: z.string().nullable(),
})

type ExaminationSchema = z.infer<typeof ExaminationSchema>
const hands_examinations: z.infer<typeof ExaminationSchema>[] = []

type WithSubcategory = {
  subcategory: string
}

function hasSubcategory(
  examination: ExaminationSchema,
): examination is WithSubcategory & ExaminationSchema {
  return examination.subcategory !== null
}

for await (const row of parseTsv('db/resources/head_to_toe.tsv')) {
  const examination_finding = ExaminationSchema.parse(row)
  if (examination_finding.category !== 'Hands') continue
  hands_examinations.push(examination_finding)
}

const HEAD_TO_TOE_EXAMINATION = groupBy(hands_examinations, (e) => e.category)
  .entries().map(
    ([category, x]) => {
      const [has_subcategory, no_subcategories] = partition(x, hasSubcategory)

      const checklist = no_subcategories.map((e) => ({
        label: e.finding_name,
        snomed_code: e.snomed_finding_code,
        body_sites: e.snomed_body_structure_codes,
      }))

      const subcategories = groupBy(has_subcategory, (e) => e.subcategory)
        .entries().map(
          ([subcategory, exs]) => ({
            subcategory,
            checklist: exs.map((e) => ({
              label: e.finding_name,
              snomed_code: e.snomed_finding_code,
              body_sites: e.snomed_body_structure_codes,
            })),
          }),
        ).toArray()

      return {
        category,
        subcategories,
        checklist,
      }
    },
  ).toArray()

console.log(JSON.stringify(HEAD_TO_TOE_EXAMINATION, null, 2))

// import snowstorm from '../external-clients/snowstorm.ts'

// // const to_search = [
// //   'koilonychia',
// //   'splinter hemorrhages',
// //   'pitting',
// //   'onycholysis',
// //   'discolouration',
// //   'erythema',
// //   'dupuytren’s contracture',
// //   'pale skin',
// //   'cyanosis',
// //   'jaundice',
// // ]

// for (const term of to_search) {
//   // const results = await snowstorm.findConcepts('MAIN', {
//   //   // termActive: true,
//   //   term: term,
//   //   language: ['en'],
//   // })
//   // console.log(term, results.data.items?.[0])

//   // const x = await snowstorm.findConcept('MAIN', 'koilonychia')
//   // x.data
//   // const z = await x.json()

//   // const response = await fetch(
//   //   'https://vha-snowstorm-4f74c4e2acf8.herokuapp.com/MAIN/concepts?term=koilonychia',
//   //   {
//   //     headers: {
//   //       'Accept': 'application/json',
//   //       'Accept-Language': 'en',
//   //     },
//   //   },
//   // )
//   // const json = await response.json()
//   // console.log('json', json)
// }

// // for await (const row of parseTsv('db/resources/head_to_toe.tsv')) {

// //   const snomed_body_structure_codes = row.snomed_body_structure_codes?.split(',')

// //   snowstorm.findConcepts('MAIN', {
// //     termActive: true,
// //     term:
// //   })

// // }
