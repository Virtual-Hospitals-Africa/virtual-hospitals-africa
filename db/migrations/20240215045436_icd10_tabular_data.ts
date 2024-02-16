// deno-lint-ignore-file no-explicit-any
import { Kysely } from 'kysely'
import { XMLParser } from 'fast-xml-parser'
import isObjectLike from '../../util/isObjectLike.ts'
import { assert } from 'std/assert/assert.ts'
import compact from '../../util/compact.ts'
import range from '../../util/range.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import inParallel from '../../util/inParallel.ts'

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
    table: 'icd10_category'
    row: { category: string; section: string; description: string }
  }
  | {
    table: 'icd10_diagnosis'
    row: {
      code: string
      category: string
      description: string
      parent_code: string | null
      includes: string | null
    }
  }
  | { table: 'icd10_diagnosis_exclude'; row: Exclude }

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
  const {
    name: code,
    desc: description,
    includes,
    inclusionTerm,
  } = tree
  if (code) {
    const [category] = code.split('.')
    assert(category.length === 3)
    const includes_col = collapseNotes(includes) || collapseNotes(inclusionTerm)

    const excludes1 = parseExcludes(collapseNotes(tree.excludes1))
    const excludes2 = parseExcludes(collapseNotes(tree.excludes2))

    for (const exclude of excludes1) {
      yield {
        table: 'icd10_diagnosis_exclude' as const,
        row: { code, ...exclude, pure: true },
      }
    }
    for (const exclude of excludes2) {
      yield {
        table: 'icd10_diagnosis_exclude' as const,
        row: { code, ...exclude, pure: false },
      }
    }
    if (!seen_categories.has(category)) {
      seen_categories.add(category)
      yield {
        table: 'icd10_category' as const,
        row: { category, section, description: tree.desc },
      }
    }
    yield {
      table: 'icd10_diagnosis' as const,
      row: {
        code,
        category,
        description,
        parent_code,
        includes: Array.isArray(includes_col)
          ? includes_col.join('\n')
          : includes_col,
      },
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
    yield {
      table: 'icd10_section',
      row: { section: section['@_id'], description: section.desc },
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
    return db.insertInto('icd10_diagnosis_exclude_category')
      .values({ exclude_id, ...row })
      .execute()
  }
  if (row.code_range_start && row.code_range_end) {
    return db.insertInto('icd10_diagnosis_exclude_code_range')
      .values({ exclude_id, ...row })
      .execute()
  }
  if (row.code) {
    if (check_referrant_code_before_insertion) {
      const exists = await db.selectFrom('icd10_diagnosis').select('code')
        .where('code', '=', row.code).executeTakeFirst()
      if (!exists) return
    }
    return db.insertInto('icd10_diagnosis_exclude_code')
      .values({ exclude_id, ...row })
      .execute()
  }
  throw new Error('unexpected row')
}

async function insertExclude(
  db: Kysely<any>,
  { excludes, ...exclude }: Exclude,
) {
  const { id: exclude_id } = await db.insertInto('icd10_diagnosis_exclude')
    .values(exclude)
    .returning('id')
    .executeTakeFirstOrThrow()

  for (const row of excludes) {
    await insertExcludeRow(db, exclude_id, row)
  }
}

export async function up(db: Kysely<any>) {
  const sections = await readICD10TabularSections()

  // Excludes refer to other codes, so we need to insert the codes
  // first so that the foreign key constraints are satisfied
  const insert_excludes: Exclude[] = []
  await inParallel(iterSections(sections), async (to_insert) => {
    console.log(to_insert.row)
    if (to_insert.table === 'icd10_diagnosis_exclude') {
      insert_excludes.push(to_insert.row as any)
      return
    }
    await db.insertInto(to_insert.table)
      .values(to_insert.row)
      .execute()
  })
  await inParallel(insert_excludes, (exclude) => insertExclude(db, exclude))
}

export async function down(db: Kysely<any>) {
  await db.deleteFrom('icd10_section').execute()
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
