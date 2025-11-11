import { assert } from 'std/assert/assert.ts'
import { sql } from 'kysely'
import memoize from '../../util/memoize.ts'
import {
  AsPartOfProcedure,
  RenderedFindingQualifierRelativeToHealthWorker,
  RenderedFindingRelativeToHealthWorker,
  RenderedPatientEncounter,
  TrxOrDb,
} from '../../types.ts'
import * as patient_encounters from './patient_encounters.ts'
import { temporaryTable } from '../helpers.ts'
import { positiveFindingsQuery } from './patient_findings.ts'
import uniq from '../../util/uniq.ts'
import { groupByUniq } from '../../util/groupBy.ts'

export const COMMON_CONDITIONS = [
  {
    key: 'pregnancy' as const,
    label: 'Pregnancy',
    snomed_concept_id: '77386006',
    required: true,
  },
  {
    key: 'diabetes' as const,
    label: 'Diabetes',
    snomed_concept_id: '73211009',
    required: true,
  },
  {
    key: 'tuberculosis' as const,
    label: 'Tuberculosis',
    snomed_concept_id: '56717001',
    required: false,
  },
  {
    key: 'hiv' as const,
    label: 'Human Immunodeficiency Virus',
    snomed_concept_id: '86406008',
    required: false,
  },
  {
    key: 'asthma' as const,
    label: 'Asthma',
    snomed_concept_id: '195967001',
    required: false,
  },
  {
    key: 'copd' as const,
    label: 'Chronic Obstructive Pulmonary Disease',
    snomed_concept_id: '13645005',
    required: false,
  },
  {
    key: 'coronavirus' as const,
    label: 'Coronavirus',
    snomed_concept_id: '186747009',
    required: false,
  },
  {
    key: 'heart_disease' as const,
    label: 'Heart Disease',
    snomed_concept_id: '56265001',
    required: false,
  },
  {
    key: 'mental_disorder' as const,
    label: 'Mental Disorder',
    snomed_concept_id: '74732009',
    required: false,
  },
  {
    key: 'epilepsy' as const,
    label: 'Epilepsy',
    snomed_concept_id: '84757009',
    required: false,
  },
  {
    key: 'arthritis' as const,
    label: 'Arthritis',
    snomed_concept_id: '3723001',
    required: false,
  },
  {
    key: 'cancer' as const,
    label: 'Cancer',
    snomed_concept_id: '363346000',
    required: false,
  },
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

type QualifierIntermediate =
  & Omit<RenderedFindingQualifierRelativeToHealthWorker, 'provider'>
  & {
    patient_encounter_employee_id: string
  }

type PositiveFindingRecord = {
  created_at: Date
  record_id: string
  snomed_concept_id: string
  name: string
  patient_encounter_id: string
  patient_encounter_employee_id: string
  pertaining_to_key: CommonConditionKey
  as_part_of_procedure: AsPartOfProcedure
  qualifiers: QualifierIntermediate[]
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
      'common_condition_descendants.key as pertaining_to_key',
    ])
    .execute()
}

export async function renderedPositiveFindings(
  trx: TrxOrDb,
  { patient_id, encounter, health_worker_id }: {
    patient_id: string
    encounter: RenderedPatientEncounter
    health_worker_id: string
  },
): Promise<RenderedFindingRelativeToHealthWorker[]> {
  const positive_findings = await positiveFindings(trx, { patient_id })
  const encounter_ids = uniq(
    positive_findings.flatMap((finding) => [
      finding.patient_encounter_id,
      ...finding.qualifiers.map((qualifier) => qualifier.patient_encounter_id),
    ]),
  )
  const other_encounter_ids = encounter_ids.filter((encounter_id) =>
    encounter_id !== encounter.patient_encounter_id
  )

  const other_encounters: RenderedPatientEncounter[] =
    other_encounter_ids.length
      ? await patient_encounters.getByIds(trx, other_encounter_ids)
      : []

  const encounters = [encounter, ...other_encounters]
  const encounter_id_to_encounter = groupByUniq(
    encounters,
    'patient_encounter_id',
  )

  return positive_findings.map(
    ({ qualifiers, patient_encounter_employee_id, ...finding }) => {
      const matching_encounter = encounter_id_to_encounter.get(
        finding.patient_encounter_id,
      )
      assert(
        matching_encounter,
        `Matching encounter not found ${finding.patient_encounter_id} ${finding.record_id}`,
      )

      const matching_employee = matching_encounter.all_employees_seen.find((
        employee,
      ) =>
        employee.patient_encounter_employee_id ===
          patient_encounter_employee_id
      )
      assert(
        matching_employee,
        `Matching employee not found ${patient_encounter_employee_id} ${finding.record_id}`,
      )

      return {
        ...finding,
        provider: {
          is_me: matching_employee.id === health_worker_id,
          is_same_person_who_made_originally_noted_finding: true,
          ...matching_employee,
        },
        qualifiers: qualifiers.map(
          (
            {
              patient_encounter_employee_id:
                qualifier_patient_encounter_employee_id,
              ...qualifier
            },
          ) => {
            const qualifier_matching_encounter = encounter_id_to_encounter.get(
              qualifier.patient_encounter_id,
            )
            assert(
              qualifier_matching_encounter,
              `Qualifier matching encounter not found ${qualifier.patient_encounter_id} ${qualifier.record_id}`,
            )
            const qualifier_matching_employee = qualifier_matching_encounter
              .all_employees_seen.find((
                employee,
              ) =>
                employee.patient_encounter_employee_id ===
                  qualifier_patient_encounter_employee_id
              )
            assert(
              qualifier_matching_employee,
              `Qualifier matching employee not found ${qualifier_patient_encounter_employee_id} ${qualifier.record_id}`,
            )

            return {
              ...qualifier,
              provider: {
                is_me: qualifier_matching_employee.id ===
                  health_worker_id,
                is_same_person_who_made_originally_noted_finding:
                  qualifier_matching_employee.id ===
                    matching_employee.id,
                ...qualifier_matching_employee,
              },
            }
          },
        ),
      } satisfies RenderedFindingRelativeToHealthWorker
    },
  )
}
