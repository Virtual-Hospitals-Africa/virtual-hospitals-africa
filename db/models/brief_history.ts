import { assert } from 'std/assert/assert.ts'
import { sql } from 'kysely'
import memoize from '../../util/memoize.ts'
import { TrxOrDb } from '../../types.ts'
import { temporaryTable } from '../helpers.ts'
import { positiveFindingsQuery } from './patient_findings.ts'

export const COMMON_CONDITIONS = [
  {
    key: 'diabetes' as const,
    label: 'Diabetes',
    snomed_concept_id: '73211009',
  },
  {
    key: 'pregnancy' as const,
    label: 'Pregnancy',
    snomed_concept_id: '77386006',
  },
  {
    key: 'tuberculosis' as const,
    label: 'Tuberculosis',
    snomed_concept_id: '56717001',
  },
  {
    key: 'hiv' as const,
    label: 'Human Immunodeficiency Virus',
    snomed_concept_id: '86406008',
  },
  { key: 'asthma' as const, label: 'Asthma', snomed_concept_id: '195967001' },
  {
    key: 'copd' as const,
    label: 'Chronic Obstructive Pulmonary Disease',
    snomed_concept_id: '13645005',
  },
  {
    key: 'coronavirus' as const,
    label: 'Coronavirus',
    snomed_concept_id: '186747009',
  },
  {
    key: 'heart_disease' as const,
    label: 'Heart Disease',
    snomed_concept_id: '56265001',
  },
  {
    key: 'mental_disorder' as const,
    label: 'Mental Disorder',
    snomed_concept_id: '74732009',
  },
  {
    key: 'epilepsy' as const,
    label: 'Epilepsy',
    snomed_concept_id: '84757009',
  },
  {
    key: 'arthritis' as const,
    label: 'Arthritis',
    snomed_concept_id: '3723001',
  },
  { key: 'cancer' as const, label: 'Cancer', snomed_concept_id: '363346000' },
]

export type CommonConditionKey = (typeof COMMON_CONDITIONS)[number]['key']

export const COMMON_CONDITION_KEYS: CommonConditionKey[] = COMMON_CONDITIONS
  .map((c) => c.key)

export const commonConditionSnomedConceptId = memoize(
  (key: CommonConditionKey): string => {
    const condition = COMMON_CONDITIONS.find((c) => c.key === key)
    assert(condition)
    return condition.snomed_concept_id
  },
)

type Procedure = {
  record_id: string
  snomed_concept_id: string
  name: string
  // TODO: support recursive procedures?
  // as_part_of_procedure: Procedure | null
}
type PositiveFindingRecord = {
  record_id: string
  snomed_concept_id: string
  name: string
  patient_encounter_id: string
  patient_encounter_employee_id: string
  common_conditions_key: CommonConditionKey
  as_part_of_procedure: Procedure
}

export function positiveFindings(
  trx: TrxOrDb,
  { patient_id }: { patient_id: string },
): Promise<PositiveFindingRecord[]> {
  return positiveFindingsQuery(trx, { patient_id })
    .with('common_conditions', () => temporaryTable(trx, COMMON_CONDITIONS))
    .with(
      'common_condition_descendants',
      (qb) =>
        qb.selectFrom('common_conditions')
          .crossJoinLateral((eb) =>
            sql<{ descendant_id: string; ancestor_ids: string[] }>`
              active_descendant_snomed_concepts(${
              eb.ref('common_conditions.snomed_concept_id')
            }::bigint)
            `.as('descendants')
          )
          .select([
            'descendants.descendant_id',
            'common_conditions.key',
            'common_conditions.label',
            'common_conditions.snomed_concept_id',
          ]),
    )
    .selectFrom('patient_positive_findings')
    .innerJoin(
      'common_condition_descendants',
      'common_condition_descendants.descendant_id',
      'patient_positive_findings.snomed_concept_id',
    )
    .selectAll('patient_positive_findings')
    .select([
      'common_condition_descendants.key as common_conditions_key',
    ])
    .execute()
}
