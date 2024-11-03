import { z } from 'zod'
import { parseTsv } from '../util/parseCsv.ts'
import { groupBy, groupByUniq } from '../util/groupBy.ts'
import partition from '../util/partition.ts'
import * as snowstorm from '../external-clients/snowstorm.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import uniq from '../util/uniq.ts'

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

const finding_codes = hands_examinations.map((e) => e.snomed_finding_code!)

const findings = await Promise.all(
  finding_codes.map(async (code) => {
    assert(code)
    const { data } = await snowstorm.findConcept(code)
    assert(data)
    assert(data.active, 'Concept is not active')
    assert(data.fsn, 'Concept has no fsn')
    assertEquals(data.fsn.lang, 'en')
    assert(data.fsn.term, 'Concept has no fsn.term')
    assert(
      data.fsn.term.endsWith('(finding)') ||
        data.fsn.term.endsWith('(disorder)') ||
        data.fsn.term.endsWith('(morphologic abnormality)'),
      'Concept fsn does not end with (finding) or (disorder) or (morphologic abnormality)',
    )
    assert(data.pt, 'Concept has no pt')
    assert(data.pt.term, 'Concept has no pt.term')
    assertEquals(data.pt.lang, 'en')
    assert(
      data.definitionStatus === 'PRIMITIVE' ||
        data.definitionStatus === 'FULLY_DEFINED',
    )
    assertEquals(data.conceptId, code)
    return {
      code,
      english_term: data.pt.term,
    }
  }),
)

const findings_by_code = groupByUniq(findings, 'code')

const snomed_body_structure_codes = uniq(
  hands_examinations.flatMap((e) => e.snomed_body_structure_codes ?? []),
)

const snomed_body_structures = await Promise.all(
  snomed_body_structure_codes.map(async (code) => {
    const { data } = await snowstorm.findConcept(code)
    assert(data)
    assert(data.active, 'Concept is not active')
    assert(data.fsn, 'Concept has no fsn')
    assertEquals(data.fsn.lang, 'en')
    assert(data.fsn.term, 'Concept has no fsn.term')
    assert(
      data.fsn.term.endsWith('(body structure)'),
      'Concept fsn does not end with (body structure)',
    )
    assert(data.pt, 'Concept has no pt')
    assert(data.pt.term, 'Concept has no pt.term')
    assertEquals(data.pt.lang, 'en')
    assert(
      data.definitionStatus === 'PRIMITIVE' ||
        data.definitionStatus === 'FULLY_DEFINED',
    )
    assertEquals(data.conceptId, code)
    return {
      code,
      english_term: data.pt.term,
    }
  }),
)

const snomed_body_structures_by_code = groupByUniq(
  snomed_body_structures,
  'code',
)

function toChecklist(exs: ExaminationSchema[]) {
  return exs.map((e) => (
    assert(e.snomed_finding_code), {
      checklist_label: e.finding_name,
      code: e.snomed_finding_code,
      english_term: findings_by_code.get(e.snomed_finding_code!)!.english_term,
      body_sites: e.snomed_body_structure_codes?.map((code) => {
        const body_structure = snomed_body_structures_by_code.get(code)
        assert(body_structure)
        return {
          code,
          english_term: body_structure.english_term,
        }
      }),
    }
  ))
}

const HEAD_TO_TOE_EXAMINATION = groupBy(hands_examinations, (e) => e.category)
  .entries().map(
    ([category, exs]) => {
      const [has_subcategory, no_subcategories] = partition(exs, hasSubcategory)

      const checklist = toChecklist(no_subcategories)

      const subcategories = groupBy(has_subcategory, (e) => e.subcategory)
        .entries().map(
          ([subcategory, exs]) => ({
            subcategory,
            checklist: toChecklist(exs),
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
//   // const results = await snowstorm.findConcepts({
//   //   // termActive: true,
//   //   term: term,
//   //   language: ['en'],
//   // })
//   // console.log(term, results.data.items?.[0])

//   // const x = await snowstorm.findConcept('koilonychia')
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

// //   snowstorm.findConcepts({
// //     termActive: true,
// //     term:
// //   })

// // }
