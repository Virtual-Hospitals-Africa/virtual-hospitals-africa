// deno-lint-ignore-file no-explicit-any
import db from '../db/db.ts'
import parseCsv from '../util/parseCsv.ts'

const original_symptoms_candidates = parseCsv(
  './db/resources/icd10/symptoms_candidates.tsv',
  {
    columnSeparator: '\t',
  },
)

const symptoms_candidates2: AsyncGenerator<any, void, unknown> = parseCsv(
  './db/resources/icd10/jonathan_dr_skhu_symptoms.tsv',
  {
    columnSeparator: '\t',
  },
)

const already_spotted = new Set<string>()
for await (const row of original_symptoms_candidates) {
  already_spotted.add(row.code_range!)
}

const results: any[] = []

// console.log('code_range\tdescription\tjonathan_dr_skhu_category')
for await (const row of symptoms_candidates2) {
  results.push(row)
  const { code_range } = row
  if (code_range.includes('-')) {
    const section = await db.selectFrom('icd10_sections')
      .where('section', '=', code_range)
      .selectAll()
      .executeTakeFirst()

    row.exists_with_that_code = !!section
    row.actual_name_of_code = section?.description
  } else if (code_range.length === 3) {
    const category = await db.selectFrom('icd10_categories')
      .where('category', '=', code_range)
      .selectAll()
      .executeTakeFirst()

    row.exists_with_that_code = !!category
    row.actual_name_of_code = category?.description
  } else {
    const diagnosis = await db.selectFrom('icd10_diagnoses')
      .where('code', '=', code_range)
      .selectAll()
      .executeTakeFirst()

    row.exists_with_that_code = !!diagnosis
    row.actual_name_of_code = diagnosis?.description
  }
}

results.forEach((row) => {
  row.duplicate = results.filter((r) =>
    r.code_range === row.code_range
  ).length > 1
  row.present_in_other_spreadsheet = already_spotted.has(row.code_range)
})

console.log(
  'code_range\tjonathan_dr_skhu_symptom_name\tjonathan_dr_skhu_category\texists_with_that_code\tactual_name_of_code\tis_duplicate\tpresent_in_other_spreadsheet',
)
for (
  const {
    code_range,
    jonathan_dr_skhu_symptom_name,
    jonathan_dr_skhu_category,
    exists_with_that_code,
    actual_name_of_code,
    duplicate,
    present_in_other_spreadsheet,
  } of results
) {
  console.log(
    `${code_range || ''}\t${jonathan_dr_skhu_symptom_name || ''}\t${
      jonathan_dr_skhu_category || ''
    }\t${exists_with_that_code || ''}\t${
      actual_name_of_code || ''
    }\t${duplicate}\t${present_in_other_spreadsheet}`,
  )
}
