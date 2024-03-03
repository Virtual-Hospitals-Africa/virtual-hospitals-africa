// deno-lint-ignore-file no-explicit-any
import { Kysely } from 'kysely'
import { XMLParser } from 'fast-xml-parser'
import isObjectLike from '../../util/isObjectLike.ts'
import compact from '../../util/compact.ts'
import range from '../../util/range.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import words from '../../util/words.ts'
import natural from 'natural'
import { assert } from 'std/assert/assert.ts'
// import partition from '../../util/partition.ts'
import { forEach } from '../../util/inParallel.ts'
import { byCodeWithSimilarity } from '../models/icd10.ts'
import { searchFlat } from '../models/icd10.ts'
import { createSeedMigration } from '../seedMigration.ts'

export default createSeedMigration([
  'icd10_sections',
  'icd10_categories',
  'icd10_diagnoses',
  'icd10_diagnoses_includes',
  'icd10_diagnoses_excludes',
  'icd10_diagnoses_excludes_categories',
  'icd10_diagnoses_excludes_code_ranges',
  'icd10_diagnoses_excludes_codes',
], async (db: Kysely<any>) => {
  await loadTabularData(db)
  await loadIndexData(db)
})

type Exclude = {
  note: string
  code: string
  pure: boolean
  excludes: ExcludeRow[]
}

type ExcludeRow = {
  category?: string
  code?: string
  dash?: boolean
  code_range_start?: string
  code_range_end?: string
  code_range_start_dash?: boolean
  code_range_end_dash?: boolean
  check_referrant_code_before_insertion?: boolean
}

// Some codes end in a dash, indicating that the person is supposed to enter a more in-depth code
function parseDash(code: string): [string, boolean] {
  if (code.endsWith('.-')) {
    return [code.slice(0, -2), true]
  }
  if (code.endsWith('-')) {
    return [code.slice(0, -1), true]
  }
  return [code, false]
}

// Something looking like B23, B23.1, B23.1-, B23.11, B23.11-, B23.111, B23.111-
const code_regex = /^[A-Z][A-Z0-9][A-Z0-9]\.?\d?\d?\d?\d?-?$/

function parseCode(code_to_parse: string): ExcludeRow | null {
  code_to_parse = code_to_parse.trim()

  if (code_to_parse.length === 3) {
    if (!code_regex.test(code_to_parse)) {
      console.log('weird code', code_to_parse)
      throw new Error('unexpected code')
    }
    return { category: code_to_parse }
  }

  // Iterate over the string in reverse looking for a code
  let test_chars_from_end = 3
  while (test_chars_from_end <= code_to_parse.length) {
    const test_code = code_to_parse.slice(-test_chars_from_end)
    let remaining = code_to_parse.slice(0, -test_chars_from_end).trim()
    test_chars_from_end++
    if (!code_regex.test(test_code)) continue

    const [end_code, end_dash] = parseDash(test_code)

    // If there's no remaining string, this represents a single code, e.g. B23
    if (!remaining) {
      return { code: end_code, dash: end_dash }
    }

    // If there is something remaining, make sure this has an internal dash
    // and thus represents a code range, e.g. B23.1-B23.11
    assert(remaining.endsWith('-'), code_to_parse)
    remaining = remaining.slice(0, -1).trim()
    if (remaining.endsWith('.')) {
      remaining = remaining.slice(0, -1)
    }
    assert(code_regex.test(remaining), code_to_parse)
    const [start_code, start_dash] = parseDash(remaining)

    return {
      code_range_end: end_code,
      code_range_end_dash: end_dash,
      code_range_start: start_code,
      code_range_start_dash: start_dash,
    }
  }
  return null
}

/* Parse an exclude string like rheumatic fever with heart involvement (I01.0 -I01.9)
   and return {
    note: "rheumatic fever with heart involvement",
    excludes: [
      { code_range_start: "I01.0", code_range_end: "I01.9" }
    ]
  }
*/
function parseExclude(
  exclude: string,
): null | Pick<Exclude, 'note' | 'excludes'> {
  exclude = human_readable(exclude)
  // e.g., dementia as classified in F01-F02
  if (exclude.includes(' as classified in ')) {
    const [note, code] = exclude.split(' as classified in ')
    const parsed = parseCode(code)
    if (!parsed) {
      console.log('TODO handle weird exclude:', exclude)
      return null
    }
    return { note, excludes: [parsed] }
  }

  // e.g., rheumatic fever with heart involvement (I01.0 -I01.9)
  const match = exclude.match(/^(.*) \((.*)\)/)
  if (!match) {
    console.log('TODO handle weird exclude: ' + exclude)
    return null
  }
  const note = match[1].trim()
  const code = match[2].trim()

  // Handle combinatory excludes, e.g., dementia in alcohol and psychoactive substance disorders (F10-F19, with .17, .27, .97)
  // For these we would exclude the codes F10.17, F10.27, F10.97, F11.17, F11.27, F11.97, etc.
  // However, not all of these codes exist, so we need to check if they exist before inserting them
  const [code_start, suffixes] = code.split(/,? with /)
  if (suffixes) {
    if (suffixes.includes('final character')) {
      console.log('TODO support with final characters', exclude)
      return null
    }
    if (suffixes.includes('fifth character')) {
      console.log('TODO support with fifth character', exclude)
      return null
    }
    if (suffixes.includes('sixth character')) {
      console.log('TODO support with sixth character', exclude)
      return null
    }
    if (suffixes.includes('7th character')) {
      console.log('TODO support with 7th character', exclude)
      return null
    }
    const suffix_codes = suffixes.split(/, ?/g)
    if (code_start.includes('-')) {
      assert(code_start.includes('-'), exclude)
      const code_range = parseCode(code_start)
      assert(code_range, exclude)
      assert(code_range.code_range_start, exclude)
      assert(code_range.code_range_end, exclude)
      assertEquals(code_range.code_range_start[0], code_range.code_range_end[0])
      const letter = code_range.code_range_start[0]
      const start = parseInt(code_range.code_range_start.slice(1))
      const end = parseInt(code_range.code_range_end.slice(1))

      const excludes = range(start, end + 1).flatMap((num) =>
        suffix_codes.map((suffix) => ({
          code: `${letter}${num}${suffix}`,
          check_referrant_code_before_insertion: true,
        }))
      )

      return { note, excludes }
    }

    const excludes = code_start.split(/, ?/g).flatMap((code) =>
      suffix_codes.map((suffix) => ({
        code: `${code}${suffix}`,
        check_referrant_code_before_insertion: true,
      }))
    )

    return { note, excludes }
  }

  const codes_to_parse = code_start.split(/, ?/g)
    .flatMap((code) => code.split(/ and /g))

  const parsed_codes = compact(codes_to_parse.map((code) => parseCode(code)))

  parsed_codes.forEach((parsed) => {
    if (parsed.category) {
      assert(code_regex.test(parsed.category))
      return
    }
    if (parsed.code) {
      assert(code_regex.test(parsed.code))
      return
    }
    if (parsed.code_range_start && parsed.code_range_end) {
      assert(code_regex.test(parsed.code_range_start))
      assert(code_regex.test(parsed.code_range_end))
      return
    }
    console.log(parsed)
    throw new Error('unexpected parsed')
  })

  return {
    note,
    excludes: parsed_codes,
  }
}

function parseExcludes(excludes: string[] | string | null) {
  if (!excludes) return []
  if (typeof excludes === 'string') {
    const parsed = parseExclude(excludes)
    return parsed ? [parsed] : []
  }
  assert(Array.isArray(excludes))
  if (excludes[0].trim().endsWith(':')) {
    const prepend_note = excludes[0].trim().slice(0, -1) + ' '
    return compact(
      excludes.slice(1).flatMap((exclude) =>
        parseExclude(prepend_note + exclude)
      ),
    )
  }
  return compact(excludes.flatMap(parseExclude))
}

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

type ToInsert =
  | { table: 'icd10_section'; row: { section: string; description: string } }
  | {
    table: 'icd10_categories'
    row: { category: string; section: string; description: string }
  }
  | {
    table: 'icd10_diagnoses'
    row: {
      code: string
      category: string
      description: string
      parent_code: string | null
      general: boolean
    }
  }
  | {
    table: 'icd10_diagnoses_includes'
    row: {
      code: string
      note: string
      sourced_from_index: boolean
    }
  }
  | { table: 'icd10_diagnoses_excludes'; row: Exclude }

export const human_readable = (str: string) =>
  str.replace(/\bnos\b/gi, 'not otherwise specified')
    .replace(/nec/gi, 'not elsewhere classified')

function* iterTree(
  tree: any,
  seen_categories: Set<string>,
  section: string,
  parent_code: string | null = null,
): Generator<ToInsert> {
  if (Array.isArray(tree)) {
    for (const node of tree) {
      yield* iterTree(node, seen_categories, section, parent_code)
    }
    return
  }
  const code = tree.name
  const description = human_readable(tree.desc)
  if (code) {
    const [category] = code.split('.')
    assert(category.length === 3)
    const includes_col = collapseNotes(tree.includes) ||
      collapseNotes(tree.inclusionTerm)

    const excludes1 = parseExcludes(collapseNotes(tree.excludes1))
    const excludes2 = parseExcludes(collapseNotes(tree.excludes2))

    for (const exclude of excludes1) {
      yield {
        table: 'icd10_diagnoses_excludes' as const,
        row: { code, ...exclude, pure: true },
      }
    }
    for (const exclude of excludes2) {
      yield {
        table: 'icd10_diagnoses_excludes' as const,
        row: { code, ...exclude, pure: false },
      }
    }
    if (!seen_categories.has(category)) {
      seen_categories.add(category)
      yield {
        table: 'icd10_categories' as const,
        row: { category, section, description: tree.desc },
      }
    }
    const includes: string[] = (Array.isArray(includes_col)
      ? includes_col
      : (typeof includes_col === 'string' ? [includes_col] : [])).map(
        human_readable,
      )

    const general_words = new Set([
      'unspecified',
      'not otherwise specified',
      'generalized',
    ])

    const general = !!parent_code &&
      words(description.toLowerCase()).some((word) =>
        general_words.has(word)
      )

    yield {
      table: 'icd10_diagnoses' as const,
      row: {
        code,
        category,
        description,
        parent_code,
        general,
      },
    }
    for (const include of includes) {
      yield {
        table: 'icd10_diagnoses_includes' as const,
        row: { code, note: include, sourced_from_index: false },
      }
    }
  }
  if (tree.diag) {
    yield* iterTree(tree.diag, seen_categories, section, code)
  }
}

function* iterSections(sections: any) {
  const seen_categories = new Set<string>()
  for (const section of sections) {
    if (!section['@_id']) {
      throw new Error('no id in section: ' + section.desc)
    }
    const id = section['@_id']
    assert(section.desc.endsWith(`(${id})`))
    yield {
      table: 'icd10_sections' as const,
      row: { section: id, description: section.desc.replace(` (${id})`, '') },
    }
    yield* iterTree(section, seen_categories, section['@_id'])
  }
}

async function readICD10TabularSections() {
  const chapters = await Deno.readTextFile(
    'db/resources/icd10/icd10cm-tabular-April-2024.xml',
  ).then(
    (data) =>
      new XMLParser({ ignoreAttributes: false }).parse(
        data,
      )['ICD10CM.tabular']['chapter'],
  )
  return chapters.flatMap((chapter: any) =>
    Array.isArray(chapter.section) ? chapter.section : [chapter.section]
  )
}

async function insertExcludeRow(
  db: Kysely<any>,
  exclude_id: number,
  { check_referrant_code_before_insertion, ...row }: ExcludeRow,
) {
  if (row.category) {
    return db.insertInto('icd10_diagnoses_excludes_categories')
      .values({ exclude_id, ...row })
      .execute()
  }
  if (row.code_range_start && row.code_range_end) {
    return db.insertInto('icd10_diagnoses_excludes_code_ranges')
      .values({ exclude_id, ...row })
      .execute()
  }
  if (row.code) {
    if (check_referrant_code_before_insertion) {
      const exists = await db.selectFrom('icd10_diagnoses').select('code')
        .where('code', '=', row.code).executeTakeFirst()
      if (!exists) return
    }
    return db.insertInto('icd10_diagnoses_excludes_codes')
      .values({ exclude_id, ...row })
      .execute()
  }
  throw new Error('unexpected row')
}

async function insertExclude(
  db: Kysely<any>,
  { excludes, ...exclude }: Exclude,
) {
  const { id: exclude_id } = await db.insertInto('icd10_diagnoses_excludes')
    .values(exclude)
    .returning('id')
    .executeTakeFirstOrThrow()

  for (const row of excludes) {
    await insertExcludeRow(db, exclude_id, row)
  }
}

export async function loadTabularData(db: Kysely<any>) {
  const sections = await readICD10TabularSections()

  // Excludes refer to other codes, so we need to insert the codes
  // first so that the foreign key constraints are satisfied
  const insert_excludes: Exclude[] = []
  await forEach(iterSections(sections), async (to_insert) => {
    console.log(to_insert.row)
    if (to_insert.table === 'icd10_diagnoses_excludes') {
      insert_excludes.push(to_insert.row as any)
      return
    }
    await db.insertInto(to_insert.table)
      .values(to_insert.row)
      .execute()
  })
  await forEach(insert_excludes, (exclude) => insertExclude(db, exclude))
}

/*
TODO handle weird exclude: conditions classified to A74.-
TODO handle weird exclude: malignant neoplasms of specified minor salivary glands which are classified according to their anatomical location
TODO handle weird exclude: sites other than skin-code to malignant neoplasm of the site
TODO handle weird exclude: malignant neoplasm of specified multiple sites- code to each site
TODO handle weird exclude: benign neoplasms of specified minor salivary glands which are classified according to their anatomical location
TODO handle weird exclude: confirmed infection - code to infection
TODO handle weird exclude: short stature in specific dysmorphic syndromes - code to syndrome - see Alphabetical Index
TODO handle weird exclude: hyperammonemia-hyperornithinemia-homocitrullinemia syndrome E72.4
TODO support with final characters diabetes with hyperosmolarity (E08, E09, E11, E13 with final characters .00 or .01)
TODO handle weird exclude: diabetic acidosis - see categories E08-E10, E11, E13 with ketoacidosis
TODO handle weird exclude: stealing due to underlying mental condition-code to mental condition
TODO support with final characters fluency disorder (stuttering) following cerebrovascular disease (I69. with final characters -23)
TODO handle weird exclude: normal variation in pattern of selective attachment
TODO support with final characters fluency disorder (stuttering) following cerebrovascular disease (I69. with final characters -23)
TODO support with fifth character infectious mononucleosis complicated by meningitis (B27.- with fifth character 2)
TODO handle weird exclude: current traumatic nerve root and plexus disorders - see nerve injury by body region
TODO handle weird exclude: current traumatic nerve disorder - see nerve injury by body region
TODO handle weird exclude: current traumatic nerve disorder - see nerve injury by body region
TODO support with fifth character polyneuropathy (in) infectious mononucleosis complicated by polyneuropathy (B27.0-B27.9 with fifth character 1)
TODO handle weird exclude: localized pain, unspecified type - code to pain by site, such as:
TODO handle weird exclude: injury to visual cortex S04.04-
TODO handle weird exclude: traumatic otorrhagia - code to injury
TODO handle weird exclude: traumatic - see injury of blood vessel by body region
TODO handle weird exclude: traumatic rupture of artery - see injury of blood vessel by body region
TODO handle weird exclude: gangrene of certain specified sites - see Alphabetical Index
TODO handle weird exclude: newborn atelectasis
TODO handle weird exclude: tuberculum Carabelli, which is regarded as a normal variation and should not be coded
TODO handle weird exclude: asymptomatic craze lines in enamel - omit code
TODO handle weird exclude: neonatal intestinal obstructions classifiable to P76.-
TODO handle weird exclude: nevus - see Alphabetical Index
TODO handle weird exclude: specific infections classified to A00-B99
TODO handle weird exclude: specific infections classified to A00-B99
TODO handle weird exclude: current injury-see Alphabetic Index
TODO handle weird exclude: current injury - see injury of joint by body region
TODO handle weird exclude: current injury - see injury of joints and ligaments by body region
TODO handle weird exclude: current injury - see injury of joint by body region
TODO handle weird exclude: acute traumatic of sites other than lumbosacral- code to Fracture, vertebra, by region
TODO handle weird exclude: current injury - see Injury, of spine, by body region
TODO handle weird exclude: current injury - see Injury of spine, by body region
TODO handle weird exclude: traumatic separation of muscle- see strain of muscle by body region
TODO handle weird exclude: traumatic rupture of muscle - see strain of muscle by body region
TODO handle weird exclude: current injury - see injury of ligament or tendon by body region
TODO handle weird exclude: rupture where an abnormal force is applied to normal tissue - see injury of tendon by body region
TODO handle weird exclude: traumatic fracture of bone-see fracture, by site
TODO handle weird exclude: metabolic disorders classifiable to E70-E88
TODO handle weird exclude: metabolic disorders classifiable to E70-E88
TODO handle weird exclude: frequent urination due to specified bladder condition- code to condition
TODO handle weird exclude: urinary tract infection of specified site, such as:
TODO handle weird exclude: diagnostic findings classified elsewhere - see Alphabetical Index
TODO handle weird exclude: intestinal obstruction classifiable to K56.-
TODO handle weird exclude: conditions classified to Q67.0-Q67.4
TODO handle weird exclude: congenital malformation syndromes classified to Q87.-
TODO handle weird exclude: congenital malformation syndromes classified to Q87.-
TODO handle weird exclude: skull defects associated with congenital anomalies of brain such as:
TODO handle weird exclude: jaw pain R68.84
TODO handle weird exclude: specified type of rash- code to condition
TODO support with final characters ataxia following cerebrovascular disease (I69. with final characters -93)
TODO support with final characters facial weakness following cerebrovascular disease (I69. with final characters -92)
TODO handle weird exclude: torticollis NOS M43.6
TODO handle weird exclude: altered mental status due to known condition - code to condition
TODO support with sixth character hallucinations in drug psychosis (F11-F19 with fifth to sixth characters 51)
TODO support with final characters aphasia following cerebrovascular disease (I69. with final characters -20)
TODO support with final characters dysphasia following cerebrovascular disease (I69. with final characters -21)
TODO support with final characters dysarthria following cerebrovascular disease (I69. with final characters -22)
TODO support with final characters dysarthria following cerebrovascular disease (I69. with final characters -28)
TODO support with final characters fluency disorder (stuttering) following cerebrovascular disease (I69. with final characters -23)
TODO support with final characters apraxia following cerebrovascular disease (I69. with final characters -90)
TODO handle weird exclude: localized pain, unspecified type - code to pain by site, such as:
TODO handle weird exclude: sepsis- code to infection
TODO handle weird exclude: sepsis-code to specified infection
TODO support with 7th character open skull fracture (S02.- with 7th character B)
TODO handle weird exclude: concussion with other intracranial injuries classified in subcategories S06.1- to S06.6-, and S06.81- to S06.89-, code to specified intracranial injury
TODO handle weird exclude: any condition classifiable to S06.4-S06.6
TODO handle weird exclude: conditions classifiable to S06.0- to S06.8-code to specified intracranial injury
TODO support with 7th character open fracture of vertebra (S12.- with 7th character B)
TODO support with fifth character rupture or displacement (nontraumatic) of thoracic intervertebral disc NOS (M51.- with fifth character 4)
TODO support with 7th character open fracture of pelvis (S32.1--S32.9 with 7th character B)
TODO support with fifth character rupture or displacement (nontraumatic) of lumbar intervertebral disc NOS (M51.- with fifth character 6)
TODO support with 7th character open fracture of shoulder and upper arm (S42.- with 7th character B or C)
TODO support with 7th character open fracture of elbow and forearm (S52.- with open fracture 7th character)
TODO support with 7th character open fracture of wrist, hand and finger (S62.- with 7th character B)
TODO support with fifth character burns and corrosion of axilla (T22.- with fifth character 4)
TODO support with fifth character burns and corrosion of scapular region (T22.- with fifth character 6)
TODO support with fifth character burns and corrosion of shoulder (T22.- with fifth character 5)
TODO handle weird exclude: poisoning by, adverse effect of and underdosing of
TODO handle weird exclude: specified effects of drowning- code to effects
TODO handle weird exclude: specified complications classified elsewhere, such as:
TODO support with sixth character poisoning and toxic effects of drugs and chemicals (T36-T65 with fifth or sixth character 1-4)
TODO support with sixth character poisoning and toxic effects of drugs and chemicals (T36-T65 with fifth or sixth character 1-4)
TODO handle weird exclude: specified complications classified elsewhere
TODO support with fifth character scooter (nonmotorized) collision with other land transport vehicle (V01-V09 with fifth character 9)
TODO handle weird exclude: animal being ridden- see transport accidents
TODO handle weird exclude: intentional self-harm by poisoning or contact with toxic substance- See Table of Drugs and Chemicals
TODO handle weird exclude: sports and athletics activities specified in categories Y93.0-Y93.6
TODO handle weird exclude: activities involving cardiorespiratory exercise specified in categories Y93.0-Y93.7
TODO handle weird exclude: activities involving muscle strengthening specified in categories Y93.0-Y93.A
TODO handle weird exclude: encounter for examination of sign or symptom- code to sign or symptom
TODO handle weird exclude: encounter for laboratory, radiologic and imaging examinations for sign(s) and symptom(s) - code to the sign(s) or symptom(s)
TODO handle weird exclude: signs or symptoms under study- code to signs or symptoms
TODO handle weird exclude: encounter for diagnostic examination-code to sign or symptom
TODO handle weird exclude: encounter for diagnostic examination-code to sign or symptom
TODO handle weird exclude: encounter for diagnostic examination-code to sign or symptom
TODO handle weird exclude: personal history of retained foreign body fully removed Z87.821
TODO handle weird exclude: diagnosed current infectious or parasitic disease -see Alphabetic Index
TODO handle weird exclude: asymptomatic human immunodeficiency virus [HIV]
TODO handle weird exclude: pre-cycle diagnosis and testing - code to reason for encounter
TODO handle weird exclude: diagnostic examination- code to sign or symptom
TODO handle weird exclude: suspected fetal condition affecting management of pregnancy - code to condition in Chapter 15
TODO handle weird exclude: care for postpartum complication- see Alphabetic index
TODO handle weird exclude: therapeutic organ removal-code to condition
TODO handle weird exclude: encounter for plastic surgery for treatment of current injury - code to relevent injury
TODO handle weird exclude: malfunction or other complications of device - see Alphabetical Index
TODO handle weird exclude: malfunction or other complications of device - see Alphabetical Index
TODO handle weird exclude: malfunction or other complications of device - see Alphabetical Index
TODO handle weird exclude: aftercare for healing fracture-code to fracture with 7th character D
TODO handle weird exclude: encounter for adjustment of internal fixation device for fracture treatment- code to fracture with appropriate 7th character
TODO handle weird exclude: encounter for removal of external fixation device- code to fracture with 7th character D
TODO handle weird exclude: acquired absence of knee joint following prior explantation of knee prosthesis (Z89.52-
TODO handle weird exclude: encounter for aftercare following injury - code to Injury, by site, with appropriate 7th character for subsequent encounter
TODO handle weird exclude: aftercare for injury- code the injury with 7th character D
TODO handle weird exclude: encounter for chemotherapy and immunotherapy for nonneoplastic condition - code to condition
TODO handle weird exclude: cadaveric donor - omit code
TODO handle weird exclude: physical restraint due to a procedure - omit code
TODO handle weird exclude: leukemia in remission C91.0-C95.9 with 5th character 1
TODO handle weird exclude: sites other than skin - code to personal history of in-situ neoplasm of the site
TODO handle weird exclude: personal history of infectious diseases specific to a body system
TODO handle weird exclude: congenital malformations that have been partially corrected or repaired but which still require medical treatment - code to condition
TODO handle weird exclude: congenital absence - see Alphabetical Index
TODO handle weird exclude: adverse effect of prescribed drug taken as directed- code to adverse effect
TODO handle weird exclude: adverse effect of prescribed drug taken as directed- code to adverse effect
TODO handle weird exclude: complications of transplanted organ or tissue - see Alphabetical Index
TODO handle weird exclude: postprocedural complication - see Alphabetical Index
*/

type ICD10IndexTitle = string | {
  nemod: string
  '#text': string | number
}

type ICD10IndexTerm = {
  title: ICD10IndexTitle
  code?: string
  see?: string
  seeAlso?: string
  term?: ICD10IndexTerm | ICD10IndexTerm[]
}

type ICD10Index = {
  'ICD10CM.index': {
    letter: {
      title: string
      mainTerm: ICD10IndexTerm[]
    }[]
  }
}

type TidiedTerm = {
  title: string
  title_lower_words: string[]
  code?: string
  see?: string
  seeAlso?: string
  term?: TidiedTerm[]
  coding_notes?: string
  nemod?: string
  is_subcat?: boolean
  aliases?: string[]
}

/* Remaining problems to solve:
    - determine if the index term is already in the "includes"
    - for the index terms that don't point to codes, look for the closest match
*/
async function loadIndexData(db: Kysely<any>) {
  const icd10_index = await readICD10Index()
  await forEach(parse(icd10_index), async (parsed) => {
    if (parsed.type === 'code') {
      const diag = await byCodeWithSimilarity(db, parsed.code, parsed.note)
      assert(diag)
      if (diag.best_similarity >= 0.85) return
      return db.insertInto('icd10_diagnoses_includes')
        .values({
          code: parsed.code,
          note: human_readable(parsed.note),
          sourced_from_index: true,
        })
        .execute()
    }
    if (parsed.type === 'see') {
      if (parsed.see.toLowerCase() === 'condition') return
      const [candidate] = await searchFlat(db, { term: parsed.see, limit: 1 })
      if (!candidate) {
        console.log('No match found for see: ', parsed)
        return
      }
      if (candidate.best_similarity < 0.50) {
        console.log('Low similarity for see: ', parsed, candidate)
        return
      }
      return db.insertInto('icd10_diagnoses_includes')
        .values({
          code: candidate.code,
          note: human_readable(parsed.note),
          sourced_from_index: true,
        })
        .execute()
    }
  }, { concurrency: 32 })
}

function* indexableTerms(term: TidiedTerm, prefix?: string): Generator<
  {
    type: 'code'
    code: string
    note: string
  } | {
    type: 'see'
    see: string
    note: string
  }
> {
  const title_words = words(term.title)
  assert(title_words[0])
  const shortest_word = title_words.reduce(
    (shortest, word) => (word.length < shortest.length ? word : shortest),
    title_words[0],
  )
  const shortest_word_lower = shortest_word.toLowerCase()
  const shortest_word_stem = natural.PorterStemmer.stem(shortest_word)
  const all_words_share_stem = title_words.every(
    (word) => {
      if (word.toLowerCase() === shortest_word.toLowerCase()) return true
      const stem = natural.PorterStemmer.stem(word)
      return stem === shortest_word_stem || stem === shortest_word_lower
    },
  )
  const note_continued = all_words_share_stem ? shortest_word : term.title

  const note = prefix ? `${prefix} ${note_continued}` : note_continued
  // TODO: revisit this
  // if (term.nemod) {
  //   note += ` ${term.nemod}`
  // }
  if (term.code) {
    yield {
      type: 'code' as const,
      code: term.code,
      note,
    }
  }
  if (term.see) {
    yield {
      type: 'see' as const,
      see: term.see,
      note,
    }
  }
  if (term.term) {
    for (const subterm of term.term) {
      yield* indexableTerms(subterm, note)
    }
  }
}

function* tidiedTerms(icd10_index: ICD10Index) {
  for (const letter of icd10_index['ICD10CM.index'].letter) {
    for (const mainTerm of letter.mainTerm) {
      yield tidyTerm(mainTerm)
    }
  }
}

export function* parse(icd10_index: ICD10Index) {
  for (const term of tidiedTerms(icd10_index)) {
    yield* indexableTerms(term)
    // if (hasAnyCode(term)) {
    //   yield {
    //     type: 'with_code' as const,
    //     term,
    //   }
    // } else if (term.see?.startsWith('Neoplasm')) {
    //   yield {
    //     type: 'neoplasm' as const,
    //     term,
    //   }
    // } else if (term.see?.startsWith('Table of Drugs')) {
    //   yield {
    //     type: 'drug' as const,
    //     term,
    //   }
    // } else if (term.see?.startsWith('Index to External Causes of Injury')) {
    //   yield {
    //     type: 'injury' as const,
    //     term,
    //   }
    // } else {
    //   yield {
    //     type: 'without_code' as const,
    //     term,
    //   }
    // }
  }

  // const [with_codes, without_codes] = partition(to_export, (x) => hasAnyCode(x))

  // const [neoplasms, other_without_codes_pre2] = partition(
  //   without_codes,
  //   (x) => !!x.see?.startsWith('Neoplasm'),
  // )
  // const [drugs, other_without_codes_pre1] = partition(
  //   other_without_codes_pre2,
  //   (x) => !!x.see?.startsWith('Table of Drugs'),
  // )
  // const [injury, other_without_codes] = partition(
  //   other_without_codes_pre1,
  //   (x) => !!x.see?.startsWith('Index to External Causes of Injury'),
  // )

  // const no_matching_could_be_found = []

  // for (const term of other_without_codes) {
  //   assertAllHaveSeeOrSeeAlsoOrCodingNotes(term)

  //   const see = term.see || term.seeAlso
  //   if (!see) continue

  //   const see_words = lowerWords(see)

  //   const matching_term = findMatchingTerm(see_words, with_codes)
  //   if (!matching_term?.found) {
  //     no_matching_could_be_found.push({
  //       term,
  //       candidates: matching_term?.candidates,
  //     })
  //     continue
  //   }
  //   matching_term.match.aliases = matching_term.match.aliases || []
  //   matching_term.match.aliases.push(term.title)
  // }

  // return {
  //   to_export,
  //   with_codes,
  //   without_codes,
  //   neoplasms,
  //   drugs,
  //   injury,
  //   no_matching_could_be_found,
  // }
}

async function readICD10Index(): Promise<ICD10Index> {
  const file_contents = await Deno.readTextFile(
    'db/resources/icd10/icd10cm-index-April-2024.xml',
  )
  const booleans_coerced = file_contents
    .replace('<title>false</title>', '<title>False</title>')
    .replace('<title>true</title>', '<title>True</title>')
  return new XMLParser().parse(booleans_coerced)
}

function lowerWords(x: string) {
  x = x?.toLowerCase().replace(',', '').replace('(of)', '')
  return Array.from(words(x))
}

function tidyTerm(x: any): TidiedTerm {
  if (!x) return x
  if (typeof x !== 'object') return x
  let { title, term, code, subcat, ...to_return } = x
  const extra: any = {}
  if (title === false) {
    title = 'false'
  } else if (title === true) {
    title = 'true'
  }
  if (!title) {
    console.log(x)
    throw new Error('no title')
  }
  let split_title: string
  let nemod = null
  if (typeof title === 'object' && title['#text']) {
    if (
      typeof title['#text'] !== 'string' && typeof title['#text'] !== 'number'
    ) {
      console.log(x)
      throw new Error('title is not a string')
    }
    assert(typeof title.nemod === 'string', JSON.stringify(title))
    split_title = String(title['#text'])
    nemod = title.nemod
  } else {
    split_title = String(title)
  }
  const [use_title_pre2, coding_notes] = split_title.split(' - code ')
  const [use_title_pre1, see] = use_title_pre2.split(/ --? see? /)
  const [use_title, omit] = use_title_pre1.split(/- omit code/)
  extra.title = use_title.trim()
  extra.title_lower_words = lowerWords(extra.title)
  if (coding_notes) {
    extra.coding_notes = coding_notes
  }
  if (nemod) {
    if (nemod.startsWith('(see ')) {
      assert(!extra.see)
      extra.see = nemod.slice(5, -1)
    } else {
      extra.nemod = nemod
    }
  }
  if (see) {
    assert(!extra.see)
    extra.see = see
  }
  if (typeof omit === 'string') {
    assert(!extra.coding_notes)
    extra.coding_notes = 'omit'
  }

  if (term) {
    if (Array.isArray(term)) {
      extra.term = term.map((t) => tidyTerm(t))
    } else {
      extra.term = [tidyTerm(term)]
    }
  }
  if (code) {
    extra.code = code.endsWith('.-')
      ? code.slice(0, -2)
      : code.endsWith('-')
      ? code.slice(0, -1)
      : code
  }
  if (subcat) {
    extra.code = subcat.endsWith('.-')
      ? subcat.slice(0, -2)
      : subcat.endsWith('-')
      ? subcat.slice(0, -1)
      : subcat
    extra.is_subcat = true
  }
  return { ...extra, ...to_return }
}

// function hasAnyCode(x: TidiedTerm) {
//   if (x.code) return true
//   if (x.term) {
//     for (const term of x.term) {
//       if (hasAnyCode(term)) return true
//     }
//   }
//   return false
// }

// function assertAllHaveSeeOrSeeAlsoOrCodingNotes(x: TidiedTerm) {
//   if (!x.term) {
//     console.log(x)
//     assert(x.see || x.seeAlso || x.coding_notes)
//     return
//   }
//   for (const term of x.term) {
//     assertAllHaveSeeOrSeeAlsoOrCodingNotes(term)
//   }
// }

// const nounInflector = new natural.NounInflector()

// function findMatchingTerm(
//   see_words: string[],
//   candidates: TidiedTerm[],
// ): { found: true; match: TidiedTerm } | {
//   found: false
//   candidates?: TidiedTerm[]
// } {
//   let testLength: number = see_words.length
//   let bestMatch: TidiedTerm | undefined

//   while (testLength) {
//     const test_words = see_words.slice(0, testLength)
//     const matching_candidates = candidates.filter((candidate) => {
//       if (!candidate.title_lower_words) {
//         console.log(candidate)
//         throw new Error('no title_lower_words')
//       }
//       const candidate_words = candidate.title_lower_words.slice(0, testLength)
//       return test_words.every((word, i) => {
//         const candidate_word = candidate_words[i]
//         if (!candidate_word) return false
//         return word === candidate_word ||
//           nounInflector.singularize(word) ===
//             nounInflector.singularize(candidate_word) ||
//           natural.PorterStemmer.stem(word) ===
//             natural.PorterStemmer.stem(candidate_word)
//       })
//     })
//     if (matching_candidates.length === 1) {
//       bestMatch = matching_candidates[0]
//       break
//     }
//     if (matching_candidates.length > 1) {
//       if (testLength > 1) {
//         return { found: false, candidates: matching_candidates }
//       }
//       const candidates_with_one_word = matching_candidates.filter(
//         (candidates) => candidates.title_lower_words.length === 1,
//       )
//       if (candidates_with_one_word.length === 1) {
//         bestMatch = candidates_with_one_word[0]
//         break
//       }
//       if (candidates_with_one_word.length > 1) {
//         const exact_matches = candidates_with_one_word.filter((candidate) => {
//           return candidate.title_lower_words[0] === see_words[0]
//         })
//         if (exact_matches.length === 1) {
//           bestMatch = exact_matches[0]
//           break
//         }
//         if (exact_matches.length > 1) {
//           console.log(see_words)
//           console.log(exact_matches)
//           throw new Error('multiple exact matches')
//         }
//       }
//       return { found: false, candidates: matching_candidates }
//     }

//     testLength--
//   }

//   if (!bestMatch) {
//     return {
//       found: false,
//       candidates: candidates.length > 100 ? undefined : candidates,
//     }
//   }

//   const see_words_remaining = see_words.slice(testLength)
//   if (!see_words_remaining.length) return { found: true, match: bestMatch }
//   if (!bestMatch.term) {
//     console.log('no bestMatch.term', bestMatch)
//     console.log(see_words)
//     console.log(see_words_remaining)

//     if (!bestMatch.nemod) {
//       return { found: false, candidates }
//     }
//     const nemod_words = lowerWords(bestMatch.nemod)
//     assert(nemod_words.length === 1)
//     const nemod_word = nemod_words[0]
//     const title_lower_words_remaining = bestMatch.title_lower_words.slice(
//       testLength,
//     )
//     const with_nemod_in_front = [nemod_word, ...title_lower_words_remaining]
//     if (
//       see_words_remaining.every((word, i) => word === with_nemod_in_front[i])
//     ) {
//       return { found: true, match: bestMatch }
//     }

//     throw new Error('no term')
//   }
//   return findMatchingTerm(see_words_remaining, bestMatch.term!)
// }
