import { Kysely } from 'kysely'
import { create } from '../create.ts'
import uniq from '../../../util/uniq.ts'
import { groupBy } from '../../../util/groupBy.ts'
import { DIAGNOSTIC_TESTS, EXAMINATIONS } from '../../../shared/examinations.ts'

export default create(
  [
    'examinations',
    'diagnostic_tests',
    'examination_categories',
    'examination_findings',
  ],
  addSeedData,
)

const head_to_toe_assessment = [
  { 'finding_name': 'ill', 'category': 'Patient state' },
  { 'finding_name': 'unalert', 'category': 'Patient state' },
  { 'finding_name': 'confused', 'category': 'Patient state' },
  { 'finding_name': 'drowsy', 'category': 'Patient state' },
  { 'finding_name': 'febrile', 'category': 'Patient state' },
  { 'finding_name': 'dehydrated', 'category': 'Patient state' },
  { 'finding_name': 'uncooperative', 'category': 'Patient state' },
  { 'finding_name': 'sad', 'category': 'Patient state' },
  { 'finding_name': 'resentful', 'category': 'Patient state' },
  { 'finding_name': 'fat', 'category': 'Patient state' },
  { 'finding_name': 'wasted', 'category': 'Patient state' },
  { 'finding_name': 'in pain', 'category': 'Patient state' },
  { 'finding_name': 'in distress', 'category': 'Patient state' },
  { 'finding_name': 'cold hands', 'category': 'Hands' },
  { 'finding_name': 'sweaty', 'category': 'Hands' },
  { 'finding_name': 'clammy', 'category': 'Hands' },
  { 'finding_name': 'peripheral cyanosis', 'category': 'Hands' },
  { 'finding_name': 'nicotine stains', 'category': 'Hands' },
  { 'finding_name': 'leukonychia', 'category': 'Nails' },
  { 'finding_name': 'koilonychia', 'category': 'Nails' },
  { 'finding_name': 'clubbing', 'category': 'Nails' },
  { 'finding_name': 'splinter hemorrhages', 'category': 'Nails' },
  { 'finding_name': 'pitting', 'category': 'Nails' },
  { 'finding_name': 'onycholysis', 'category': 'Nails' },
  { 'finding_name': 'erythema', 'category': 'Palms' },
  { 'finding_name': 'Dupuytren’s contracture', 'category': 'Palms' },
  { 'finding_name': 'Joints', 'category': 'Palms' },
  {
    'finding_name': 'skin swelling',
    'category': 'Palms',
  },
  { 'finding_name': 'jaundice', 'category': 'Colour' },
  { 'finding_name': 'pale', 'category': 'Colour' },
  { 'finding_name': 'thin', 'category': 'Texture' },
  { 'finding_name': 'thick', 'category': 'Texture' },
  { 'finding_name': 'dry', 'category': 'Texture' },
  { 'finding_name': 'rash', 'category': 'Texture' },
  { 'finding_name': 'hands and feet', 'category': 'Distribution' },
  { 'finding_name': 'extensor surfaces', 'category': 'Distribution' },
  { 'finding_name': 'flexural surfaces', 'category': 'Distribution' },
  { 'finding_name': 'truncal', 'category': 'Distribution' },
  {
    'finding_name': 'exposed sites',
    'category': 'Distribution',
  },
  { 'finding_name': 'asymmetrical', 'category': 'Distribution' },
  { 'finding_name': 'discrete', 'category': 'Distribution' },
  { 'finding_name': 'confluent', 'category': 'Distribution' },
  { 'finding_name': 'linear', 'category': 'Pattern' },
  { 'finding_name': 'annular/ring-like', 'category': 'Pattern' },
  { 'finding_name': 'serpiginous/snake-like', 'category': 'Pattern' },
  { 'finding_name': 'reticular/net-like', 'category': 'Pattern' },
  { 'finding_name': 'star shaped', 'category': 'Pattern' },
  { 'finding_name': 'flat macular', 'category': 'Pattern' },
  { 'finding_name': 'raised papular', 'category': 'Pattern' },
  { 'finding_name': 'localized plaque', 'category': 'Pattern' },
  { 'finding_name': 'wheal', 'category': 'Pattern' },
  { 'finding_name': 'blisters', 'category': 'Pattern' },
  { 'finding_name': 'bullae', 'category': 'Pattern' },
  { 'finding_name': 'large vesicles', 'category': 'Pattern' },
  { 'finding_name': 'nodules', 'category': 'Pattern' },
  { 'finding_name': 'purpura', 'category': 'Pattern' },
  { 'finding_name': 'scaly', 'category': 'Surface' },
  { 'finding_name': 'shiny', 'category': 'Surface' },
  { 'finding_name': 'well demarcated edges', 'category': 'Surface' },
  {
    'finding_name': 'red pigment',
    'category': 'Surface',
  },
  {
    'finding_name': 'white pigment',
    'category': 'Surface',
  },
  {
    'finding_name': 'blue pigment',
    'category': 'Surface',
  },
  {
    'finding_name': 'brown pigment',
    'category': 'Surface',
  },
  {
    'finding_name': 'black pigment',
    'category': 'Surface',
  },
  { 'finding_name': 'cold', 'category': 'Character' },
  { 'finding_name': 'tender', 'category': 'Character' },
  { 'finding_name': 'blanching', 'category': 'Character' },
  { 'finding_name': 'purpura character', 'category': 'Character' },
  { 'finding_name': 'central cyanosis', 'category': 'Tongue' },
  { 'finding_name': 'moist', 'category': 'Tongue' },
  { 'finding_name': 'dry tongue', 'category': 'Tongue' },
  { 'finding_name': 'caries', 'category': 'Teeth' },
  { 'finding_name': 'poor hygiene', 'category': 'Teeth' },
  { 'finding_name': 'false teeth', 'category': 'Teeth' },
  { 'finding_name': 'bleeding', 'category': 'Gums' },
  { 'finding_name': 'swollen', 'category': 'Gums' },
  { 'finding_name': 'swelling', 'category': 'Tonsils' },
  { 'finding_name': 'redness tonsils', 'category': 'Tonsils' },
  { 'finding_name': 'ulceration', 'category': 'Tonsils' },
  { 'finding_name': 'swelling pharynx', 'category': 'Pharynx' },
  { 'finding_name': 'redness pharynx', 'category': 'Pharynx' },
  { 'finding_name': 'ulceration pharynx', 'category': 'Pharynx' },
  { 'finding_name': 'ketosis', 'category': 'Breath' },
  { 'finding_name': 'alcohol', 'category': 'Breath' },
  { 'finding_name': 'fetor', 'category': 'Breath' },
  { 'finding_name': 'musty', 'category': 'Breath' },
  { 'finding_name': 'icterus', 'category': 'Sclera' },
  { 'finding_name': 'pale conjunctiva', 'category': 'Conjunctiva' },
  { 'finding_name': 'redness conjunctiva', 'category': 'Conjunctiva' },
  { 'finding_name': 'swelling conjunctiva', 'category': 'Conjunctiva' },
]

// deno-lint-ignore no-explicit-any
async function addSeedData(db: Kysely<any>) {
  await db.insertInto('examinations').values(
    EXAMINATIONS.map((name, index) => ({ name, order: index + 1 })),
  ).execute()

  await db.insertInto('diagnostic_tests').values(
    DIAGNOSTIC_TESTS.map((name) => ({ name })),
  ).execute()

  const categories = uniq(head_to_toe_assessment.map((d) => d.category)).map((
    category,
    index,
  ) => ({
    examination_name: 'Head-to-toe Assessment',
    category,
    order: index + 1,
  }))

  const inserted_categories = await db
    .insertInto('examination_categories')
    .values(categories)
    .returningAll()
    .execute()

  const category_map = new Map(
    inserted_categories.map((c) => [c.category, c.id]),
  )

  const by_category = groupBy(head_to_toe_assessment, (d) => d.category)

  const to_insert = []
  for (const [category, findings] of by_category.entries()) {
    for (const [index, finding] of findings.entries()) {
      to_insert.push({
        examination_category_id: category_map.get(category),
        name: finding.finding_name,
        label: finding.finding_name,
        type: 'boolean',
        required: false,
        order: index + 1,
      })
    }
  }

  await db
    .insertInto('examination_findings')
    .values(to_insert)
    .execute()
}
