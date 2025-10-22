import { assert } from 'std/assert/assert.ts'
import { z } from 'zod'
import { FamilyType, MaritalStatus, PatientCohabitation } from '../db.d.ts'
import { GuardianRelationName } from '../types.ts'
import entries from '../util/entries.ts'
import fromEntries from '../util/fromEntries.ts'
import isKeyOf from '../util/isKeyOf.ts'

type UngenderedRelation = [GuardianRelationName, string]
type GenderedRelation = [
  GuardianRelationName,
  string,
  [string, string],
  [string, string],
]
type Relation = UngenderedRelation | GenderedRelation

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
  ([guardian, dependent, gendered_guardian, gendered_dependent]) => ({
    guardian,
    dependent,
    female_guardian: gendered_guardian?.[0] ?? null,
    male_guardian: gendered_guardian?.[1] ?? null,
    female_dependent: gendered_dependent?.[0] ?? null,
    male_dependent: gendered_dependent?.[1] ?? null,
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

export const GENDERED_RELATION_SNOMED_CONCEPT_IDS = {
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

export const SNOMED_CONCEPT_IDS_TO_GENDERED_RELATIONS = fromEntries(
  entries(
    GENDERED_RELATION_SNOMED_CONCEPT_IDS,
  ).map(
    ([relation_gendered, snomed_concept_id]) => [
      snomed_concept_id,
      relation_gendered,
    ],
  ),
)

export type GenderedRelationKey =
  keyof typeof GENDERED_RELATION_SNOMED_CONCEPT_IDS

type GenderedSnomedId =
  typeof GENDERED_RELATION_SNOMED_CONCEPT_IDS[GenderedRelationKey]

function enumFromObjKeys<const O extends Record<string, unknown>>(obj: O) {
  type K = Extract<keyof O, string>
  const keys = Object.keys(obj) as [K, ...K[]]
  return z.enum(keys)
}

export const FamilyMemberSchema = z.object({
  relation_gendered: enumFromObjKeys(GENDERED_RELATION_SNOMED_CONCEPT_IDS),
})

export const relation_from_snomed_id = (snomed_id: string) => {
  assert(
    isKeyOf(snomed_id, SNOMED_CONCEPT_IDS_TO_GENDERED_RELATIONS),
    `No gendered relation for ${snomed_id}`,
  )
  return SNOMED_CONCEPT_IDS_TO_GENDERED_RELATIONS[snomed_id]
}
