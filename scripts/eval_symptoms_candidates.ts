import db from '../db/db.ts'
import * as icd10 from '../db/models/icd10.ts'
import parseCsv from '../util/parseCsv.ts'

const symptoms_candidates = parseCsv(
  './db/resources/icd10/symptoms_candidates.tsv',
  {
    columnSeparator: '\t',
  },
)

// deno-lint-ignore no-explicit-any
const results: any[] = []

for await (const { code_range } of symptoms_candidates) {
  if (code_range.includes('-')) {
    const section = await db.selectFrom('icd10_sections')
      .where('section', '=', code_range)
      .selectAll()
      .executeTakeFirst()

    if (!section) {
      console.log('section not found:', code_range)
      continue
    }
    results.push({
      code_range,
      description: section.description,
    })
  } else if (code_range.length === 3) {
    const category = await db.selectFrom('icd10_categories')
      .where('category', '=', code_range)
      .selectAll()
      .executeTakeFirst()

    if (!category) {
      console.log('category not found:', code_range)
      continue
    }
    results.push({
      code_range,
      description: category.description,
    })
  } else {
    const diagnosis = await db.selectFrom('icd10_diagnoses')
      .where('code', '=', code_range)
      .selectAll()
      .executeTakeFirst()

    if (!diagnosis) {
      console.log('diagnosis not found:', code_range)
      continue
    }

    results.push({
      code_range,
      description: diagnosis.description,
    })
  }
}

const pains = await icd10.searchTree(db, {
  term: 'pain',
  limit: 99999999999,
})

for (const pain of pains) {
  if (!results.some((result) => result.code_range === pain.code)) {
    results.push({
      code_range: pain.code,
      description: pain.description,
    })
  }
}

console.log('code_range\tdescription')
for (const { code_range, description } of results) {
  console.log(`${code_range}\t${description}`)
}
