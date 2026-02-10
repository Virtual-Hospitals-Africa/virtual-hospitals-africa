import { assert } from 'std/assert/assert.ts'
import { z } from 'zod'
import { FamilyType, MaritalStatus, PatientCohabitation } from '../db.d.ts'
import { GuardianRelationName } from '../types.ts'
import entries from '../util/entries.ts'
import fromEntries from '../util/fromEntries.ts'
import isKeyOf from '../util/isKeyOf.ts'
import { international_phone_number } from '../util/validators.ts'

type UnsexedRelation = [GuardianRelationName, string]
type SexedRelation = [
  GuardianRelationName,
  string,
  [string, string],
  [string, string],
]
type Relation = UnsexedRelation | SexedRelation

const relations: Relation[] = [
  [
    'biological parent',
    'biological child',
    ['biological mother', 'biological father'],
    ['biological daughter', 'biological son'],
  ],
  [
    'grandparent',
    'grandchild',
    ['grandmother', 'grandfather'],
    ['granddaughter', 'grandson'],
  ],
  ['sibling', 'sibling', ['sister', 'brother'], ['sister', 'brother']],
  [
    'sibling of parent',
    'child of sibling',
    ['aunt', 'uncle'],
    ['niece', 'nephew'],
  ],
  ['other guardian', 'other relative'],
  [
    'foster parent',
    'foster child',
    ['foster mother', 'foster father'],
    ['foster daughter', 'foster son'],
  ],
  [
    'adopted parent',
    'adopted child',
    ['adopted mother', 'adopted father'],
    ['adopted daughter', 'adopted son'],
  ],
]

export const GUARDIAN_RELATIONS = relations.map(
  ([guardian, dependent, sexed_guardian, sexed_dependent]) => ({
    guardian,
    dependent,
    female_guardian: sexed_guardian?.[0] ?? null,
    male_guardian: sexed_guardian?.[1] ?? null,
    female_dependent: sexed_dependent?.[0] ?? null,
    male_dependent: sexed_dependent?.[1] ?? null,
  }),
)

export const MARITAL_STATUS: MaritalStatus[] = [
  'Never Married',
  'Married',
  'Single',
  'Divorced',
  'Separated',
  'Co-habiting',
  'Widowed',
]

export const FAMILY_TYPES: FamilyType[] = [
  '2 married parents',
  'Divorced',
  'Extended',
  'Child-headed',
  'Polygamous/Compound',
  'Single Parent',
  'Blended',
  'Grandparent-led',
  'Orphan',
]

export const RELIGIONS: string[] = [
  'Roman Catholic',
  'Pentecostal/Protestant Christianity',
  'Islam',
  'Apostolic Sect',
  'African Traditional Religion',
  'Non-Religious',
]

export const PATIENT_COHABITATIONS: PatientCohabitation[] = [
  'Mother',
  'Father',
  'Grandparent(s)',
  'Sibling',
  'Uncle or Aunt',
  'Other Relative',
  'Foster Parent',
  'Orphanage',
]

export const SEXED_RELATION_SNOMED_CONCEPT_IDS = {
  'aunt': '25211005',
  'uncle': '38048003',
  'foster mother': '38265003',
  'grandchild': '86372007',
  'grandmother': '113157001',
  'grandfather': '34871008',
  'foster son': '12241003',
  'sister': '27733009',
  'foster daughter': '31831004',
  'foster child': '39062003',
  'brother': '70924004',
  'nephew': '83559000',
  'foster father': '8458002',
  'adopted daughter': '393549001',
  'grandparent': '38312007',
  'niece': '34581001',
  'adopted son': '394560000',
  'sibling': '375005',
  'foster parent': '90921004',
  'adopted child': '393547004',
  'grandson': '70578009',
  'granddaughter': '44181008',
} as const

export const SNOMED_CONCEPT_IDS_TO_sexED_RELATIONS = fromEntries(
  entries(
    SEXED_RELATION_SNOMED_CONCEPT_IDS,
  ).map(
    ([relation_sexed, snomed_concept_id]) => [
      snomed_concept_id,
      relation_sexed,
    ],
  ),
)

export type SexedRelationKey = keyof typeof SEXED_RELATION_SNOMED_CONCEPT_IDS

type SexedSnomedId = typeof SEXED_RELATION_SNOMED_CONCEPT_IDS[SexedRelationKey]

function enumFromObjKeys<const O extends Record<string, unknown>>(obj: O) {
  type K = Extract<keyof O, string>
  const keys = Object.keys(obj) as [K, ...K[]]
  return z.enum(keys)
}

export const FamilyMemberSchema = z.object({
  relation_sexed: enumFromObjKeys(SEXED_RELATION_SNOMED_CONCEPT_IDS),
})

export const relation_from_snomed_id = (snomed_id: string) => {
  assert(
    isKeyOf(snomed_id, SNOMED_CONCEPT_IDS_TO_sexED_RELATIONS),
    `No sexed relation for ${snomed_id}`,
  )
  return SNOMED_CONCEPT_IDS_TO_sexED_RELATIONS[snomed_id]
}

export const EMERGENCY_CONTACT_RELATIONSHIPS = [
  'Parent',
  'Sibling',
  'Friend',
  'Spouse',
  'Child',
  'Guardian',
  'Other',
] as const

export type EmergencyContactRelationship = (typeof EMERGENCY_CONTACT_RELATIONSHIPS)[number]

export const EMERGENCY_CONTACT_RELATIONSHIPS_SCHEMA = z.enum(
  EMERGENCY_CONTACT_RELATIONSHIPS,
)

export const EmergencyContactSchema = z.object({
  name: z.string().min(1),
  relationship: EMERGENCY_CONTACT_RELATIONSHIPS_SCHEMA,
  phone_number: international_phone_number.optional(),
})
