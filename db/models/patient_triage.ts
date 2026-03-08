import { sql } from 'kysely'
import { IdSelection, Maybe, RenderedPatientEncounter, TrxOrDb, TrxOrDbOrQueryCreator } from '../../types.ts'
import generateUUID from '../../util/uuid.ts'
import { success_true } from '../helpers.ts'
import { PRIORITY_SNOMED_CODES, TARGET_TIME_TO_TREATMENT_MINUTES, TriageLevel } from '../../shared/priorities.ts'
import { base, identity } from './_base.ts'
import { patient_evaluations } from './patient_evaluations.ts'
import { DUE_TO, EVALUATION_ACTION, PRIORITY, RELATIONSHIP } from '../../shared/snomed_concepts.ts'

function insertLevel(
  trx: TrxOrDbOrQueryCreator,
  {
    patient_id,
    patient_encounter_id,
    employment_id,
    by_system = false,
    procedure_id,
    evaluates_record_ids,
    triage_level,
  }: {
    patient_id: string
    patient_encounter_id: string
    employment_id?: string
    by_system?: boolean
    procedure_id?: Maybe<string>
    evaluates_record_ids: string[]
    triage_level: TriageLevel
  },
) {
  const triage_level_evaluation_id = generateUUID()
  const value_snomed_concept_id = PRIORITY_SNOMED_CODES[triage_level]
  const target_treatment_minutes = TARGET_TIME_TO_TREATMENT_MINUTES[triage_level]

  const relations = evaluates_record_ids.map((record_id) => ({
    id: generateUUID(),
    source_id: triage_level_evaluation_id,
    destination_id: record_id,
  }))

  return trx.with(
    'inserting_evaluation_records',
    (qb) =>
      qb.insertInto('patient_records')
        .values({
          id: triage_level_evaluation_id,
          patient_id,
          patient_encounter_id,
          root_snomed_concept_id: EVALUATION_ACTION.id,
          specific_snomed_concept_id: PRIORITY.id,
          value_snomed_concept_id,
        }),
  ).with('inserting_evaluations', (qb) =>
    qb.insertInto('patient_evaluations')
      .values({
        id: triage_level_evaluation_id,
        employment_id,
        by_system,
        procedure_id,
      })
      .returning('id'))
    .with(
      'inserting_triage_level',
      (qb) =>
        qb.insertInto('patient_triage_level')
          .values({
            id: triage_level_evaluation_id,
            target_treatment_time: sql`now() + interval '${sql.raw(target_treatment_minutes.toString())} minutes'`,
          })
          .returningAll(),
    )
    .with(
      'inserting_relation_patient_records',
      (qb) =>
        qb.insertInto('patient_records').values(relations.map(({ id }) => ({
          id,
          patient_id,
          patient_encounter_id,
          root_snomed_concept_id: RELATIONSHIP.id,
          specific_snomed_concept_id: DUE_TO.id,
        }))),
    )
    .with(
      'inserting_relations',
      (qb) => qb.insertInto('patient_record_relations').values(relations),
    )
    .selectFrom('inserting_triage_level')
    .selectAll('inserting_triage_level')
    .select([
      success_true,
    ])
    .executeTakeFirstOrThrow()
}

export function baseQuery(
  trx: TrxOrDbOrQueryCreator,
  opts: PatientEvaluationTriageSearch,
) {
  return patient_evaluations.baseQuery(trx, opts).innerJoin(
    'patient_triage_level',
    'patient_evaluations.id',
    'patient_triage_level.id',
  )
    .select([
      'patient_triage_level.target_treatment_time',
    ])
}

type PatientEvaluationTriageSearch = {
  patient_id: string | IdSelection
  patient_encounter_id?: string | IdSelection
  s_expression?: string
  search?: string
}

export const patient_triage = base({
  top_level_table: 'patient_triage_level',
  baseQuery,
  insertLevel,
  formatResult: identity,
  associatedFindings(trx: TrxOrDb, priority: NonNullable<RenderedPatientEncounter['priority']>) {
    return trx.selectFrom('patient_triage_level')
      .innerJoin(
        'patient_records as triage_patient_records',
        'patient_triage_level.id',
        'triage_patient_records.id',
      )
      .innerJoin('patient_records_still_valid as triage_valid', 'triage_valid.id', 'triage_patient_records.id')
      .innerJoin(
        'patient_record_relations as triage_relations',
        'triage_relations.source_id',
        'patient_triage_level.id',
      )
      .innerJoin('patient_records_aggregated', 'triage_relations.destination_id',
        'patient_records_aggregated.id',)
      .innerJoin(
        'snomed_inferred_canonical_name_and_category as triage_snomed_inferred_canonical_name_and_category',
        'triage_patient_records.value_snomed_concept_id',
        'triage_snomed_inferred_canonical_name_and_category.id',
      )
      .selectAll('patient_records_aggregated')
      .where('patient_triage_level.id', 'in', priority.record_ids)
      .execute()
  }
})
