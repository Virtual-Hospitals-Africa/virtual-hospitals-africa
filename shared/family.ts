import {
  FamilyType,
  MaritalStatus,
  PatientCohabitation,
  Religion,
} from '../db.d.ts'
import { GuardianRelationName } from '../types.ts'

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
]

export const FAMILY_TYPES: FamilyType[] = [
  '2 married parents',
  'Divorced',
  'Extended',
  'Child-headed',
  'Polygamous/Compound',
  'Single Parent',
  'Same-sex marriage',
  'Blended',
  'Grandparent-led',
  'Orphan',
]

export const RELIGIONS: Religion[] = [
  'Roman Catholic',
  'Pentecostal/Protestant Christianity',
  'Islam',
  'Apostolic Sect',
  'African Traditional Religion',
  'Non-Religious',
  'Other',
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
