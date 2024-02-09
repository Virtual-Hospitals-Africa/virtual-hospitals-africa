// deno-lint-ignore-file no-explicit-any
import { Kysely } from "kysely";
import { XMLParser } from 'fast-xml-parser'
import { assert } from 'std/assert/assert.ts'
import isObjectLike from '../../util/isObjectLike.ts'


function collapseNotes(term: unknown): string | null {
  if (!term) return null
  if (typeof term === 'string') return term
  if (Array.isArray(term)) {
    return term.map(collapseNotes).join('\n')
  }
  if (isObjectLike(term) && 'note' in term) {
    return collapseNotes(term.note)
  }
  throw new Error('unexpected term')
}

export async function up(db: Kysely<any>) {
  await db.schema.createTable('icd10_symptoms')
    .addColumn('code', 'varchar(7)', (col) => col.primaryKey())
    .addColumn('desc', 'varchar(255)', (col) => col.notNull())
    .addColumn('excludes1', 'text')
    .addColumn('excludes2', 'text')
    .addColumn('includes', 'text')
    .addColumn('parent_code', 'varchar(6)', (col) => col.references('icd10_symptoms.code'))
    .execute()

  const chapters = await Deno.readTextFile(
    'db/resources/icd10/icd10cm-tabular-April-2024.xml',
  ).then(
    (data) => new XMLParser().parse(data)["ICD10CM.tabular"]['chapter'],
  )

  const symptoms_chapter = chapters.find((chapter: any) => String(chapter.name) === '18')

  assert(symptoms_chapter)
  console.log(Object.keys(symptoms_chapter))

  async function iterTree(tree: any, parent_code: string | null = null) {
    console.log(tree)
    if (Array.isArray(tree)) {
      for (const node of tree) {
        await iterTree(node, parent_code)
      }
      return
    }
    const { name: code, desc, excludes1, excludes2, includes, inclusionTerm } = tree
    if (code) {
      console.log({
        code,
        desc,
        excludes1: collapseNotes(excludes1),
        excludes2: collapseNotes(excludes2),
        includes: collapseNotes(includes) || collapseNotes(inclusionTerm),
        parent_code,
      })
      await db.insertInto('icd10_symptoms')
        .values({
          code,
          desc,
          excludes1: collapseNotes(excludes1),
          excludes2: collapseNotes(excludes2),
          includes: collapseNotes(includes) || collapseNotes(inclusionTerm),
          parent_code,
        })
        .execute()
    }
    if (tree.diag) {
      await iterTree(tree.diag, code)
    }
  }

  await iterTree(symptoms_chapter.section)
}

export function down(db: Kysely<unknown>) {
  return db.schema.dropTable('icd10_symptoms').execute()
}
