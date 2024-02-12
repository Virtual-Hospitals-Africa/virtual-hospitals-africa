// deno-lint-ignore-file no-explicit-any
import { Kysely, sql } from 'kysely'
import { XMLParser } from 'fast-xml-parser'
import isObjectLike from '../../util/isObjectLike.ts'
import { assert } from 'std/assert/assert.ts'
import compact from '../../util/compact.ts'

function collapseNotes(term: unknown): string[] | string | null {
  if (!term) return null
  if (typeof term === 'string') return term
  if (Array.isArray(term)) {
    return compact(term.flatMap(collapseNotes))
  }
  if (isObjectLike(term) && 'note' in term) {
    return collapseNotes(term.note)
  }
  throw new Error('unexpected term')
}

export async function up(db: Kysely<any>) {
  await db.schema.createTable('icd10_tabular')
    .addColumn('code', 'varchar(8)', (col) => col.primaryKey())
    .addColumn('category', 'varchar(3)', (col) => col.notNull())
    .addColumn('description', 'varchar(255)', (col) => col.notNull())
    .addColumn('includes', 'text')
    .addColumn(
      'parent_code',
      'varchar(7)',
      (col) => col.references('icd10_tabular.code'),
    )
    .execute()

  await db.schema.createTable('icd10_tabular_exclude1_note')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('code', 'varchar(8)', (col) => col.references('icd10_tabular.code'))
    .addColumn('note', 'varchar(255)', (col) => col.notNull())
    .execute()

  await db.schema.createTable('icd10_tabular_exclude1_excludes')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('exclude1_note_id', 'integer', (col) => col.references('icd10_tabular_exclude1_note.id'))
    .addColumn('exclude_code', 'varchar(8)', (col) => col.references('icd10_tabular.code'))
    .addColumn('dash', 'boolean', (col) => col.notNull())
    .execute()

  await db.schema.createTable('icd10_tabular_exclude2_note')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('code', 'varchar(8)', (col) => col.references('icd10_tabular.code'))
    .addColumn('note', 'varchar(255)', (col) => col.notNull())
    .execute()

  await db.schema.createTable('icd10_tabular_exclude2_excludes')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('exclude2_note_id', 'integer', (col) => col.references('icd10_tabular_exclude2_note.id'))
    .addColumn('exclude_code', 'varchar(8)', (col) => col.references('icd10_tabular.code'))
    .addColumn('dash', 'boolean', (col) => col.notNull())
    .execute()

  await sql`
    CREATE INDEX trgm_icd10_tabular_desc ON icd10_tabular USING GIN ("description" gin_trgm_ops);
    CREATE INDEX trgm_icd10_tabular_includes ON icd10_tabular USING GIN ("includes" gin_trgm_ops);
  `.execute(db)

  const chapters = await Deno.readTextFile(
    'db/resources/icd10/icd10cm-tabular-April-2024.xml',
  ).then(
    (data) => new XMLParser().parse(data)['ICD10CM.tabular']['chapter'],
  )

  const sections = chapters.flatMap((chapter: any) => Array.isArray(chapter.section) ? chapter.section : [chapter.section])

  async function iterTree(tree: any, parent_code: string | null = null) {
    if (Array.isArray(tree)) {
      for (const node of tree) {
        await iterTree(node, parent_code)
      }
      return
    }
    const {
      name: code,
      desc: description,
      excludes1,
      excludes2,
      includes,
      inclusionTerm,
    } = tree
    if (code) {
      const [category] = code.split('.')
      assert(category.length === 3)
      const includes_col = collapseNotes(includes) || collapseNotes(inclusionTerm)
      assert(includes_col === null || typeof includes_col === 'string' || (Array.isArray(includes_col) && includes_col.length === 1))

      await db.insertInto('icd10_tabular')
        .values({
          code,
          category,
          description,
          excludes1: collapseNotes(excludes1),
          excludes2: collapseNotes(excludes2),
          includes: Array.isArray(includes_col) ? includes_col[0] : includes_col,
          parent_code,
        })
        .execute()
    }
    if (tree.diag) {
      await iterTree(tree.diag, code)
    }
  }

  await iterTree(sections)
}

export function down(db: Kysely<unknown>) {
  return db.schema.dropTable('icd10_tabular').execute()
}
