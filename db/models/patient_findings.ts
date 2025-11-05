import { Maybe, PreviouslyCompletedProcedures, TrxOrDb } from '../../types.ts'
import {
  asText,
  blankSelection,
  jsonBuildObject,
  success_true,
} from '../helpers.ts'
import generateUUID from '../../util/uuid.ts'
import { markAltered } from './patient_records.ts'
import { promiseProps } from '../../util/promiseProps.ts'
import { sql } from 'kysely'

export const NO_QUALIFIER_SNOMED_CONCEPT_ID = '373067005' // |No (qualifier value)|

type FindingQualifier = {
  snomed_concept_id: string
  // deno-lint-ignore no-explicit-any
  concrete_value?: any
  snomed_concept_id_value?: Maybe<string>
}

type FindingInsert = {
  patient_id: string
  patient_encounter_id: string
  patient_encounter_employee_id: string
  workflow_snomed_concept_id: string
  workflow_step_snomed_concept_id: string | null
  previously_completed_procedures: PreviouslyCompletedProcedures
  finding_snomed_concept_id: string
  altered_record_id?: Maybe<string>
  qualifiers?: FindingQualifier[]
}

function doInsertOne(
  trx: TrxOrDb,
  {
    patient_id,
    patient_encounter_id,
    patient_encounter_employee_id,
    workflow_snomed_concept_id,
    workflow_step_snomed_concept_id,
    previously_completed_procedures,
    finding_snomed_concept_id,
    qualifiers,
  }: FindingInsert,
) {
  const previously_completed_procedure_record_id =
    workflow_step_snomed_concept_id
      ? previously_completed_procedures.workflow_step_record_id
      : previously_completed_procedures.workflow_record_id

  const procedure_id = previously_completed_procedure_record_id ||
    generateUUID()

  const finding_id = generateUUID()

  const qualifiers_insert = (qualifiers || []).map((qualifier) => ({
    id: generateUUID(),
    ...qualifier,
  }))

  return trx.with(
    'inserting_procedure_record',
    (qb) =>
      !previously_completed_procedure_record_id
        ? qb.insertInto('patient_records')
          .values({
            id: procedure_id,
            patient_id,
            patient_encounter_id,
            snomed_concept_id: workflow_step_snomed_concept_id ||
              workflow_snomed_concept_id,
          })
        : blankSelection(qb),
  ).with(
    'inserting_procedure',
    (qb) =>
      !previously_completed_procedure_record_id
        ? qb.insertInto('patient_procedures')
          .values({
            id: procedure_id,
            patient_encounter_employee_id,
          })
        : blankSelection(qb),
  ).with('inserting_finding_records', (qb) =>
    qb.insertInto('patient_records')
      .values({
        id: finding_id,
        patient_id,
        patient_encounter_id,
        snomed_concept_id: finding_snomed_concept_id,
      })).with('inserting_findings', (qb) =>
      qb.insertInto('patient_findings')
        .values({
          id: finding_id,
          procedure_id,
          patient_encounter_employee_id,
        })).with(
      'inserting_qualifier_records',
      (qb) =>
        qualifiers_insert.length
          ? qb.insertInto('patient_records')
            .values(qualifiers_insert.map((q) => ({
              id: q.id,
              snomed_concept_id: q.snomed_concept_id,
              patient_id,
              patient_encounter_id,
            })))
          : blankSelection(qb),
    ).with(
      'inserting_qualifiers',
      (qb) =>
        qualifiers_insert.length
          ? qb.insertInto('patient_record_qualifiers')
            .values(qualifiers_insert.map((q) => ({
              id: q.id,
              qualifies_record_id: finding_id,
              concrete_value: q.concrete_value,
              snomed_concept_id_value: q.snomed_concept_id_value,
            })))
          : blankSelection(qb),
    )
    .selectNoFrom([
      success_true,
    ])
    .executeTakeFirstOrThrow()
}

function isAltered(to_insert: FindingInsert): to_insert is FindingInsert & {
  altered_record_id: string
} {
  return !!to_insert.altered_record_id
}

export async function insertOne(
  trx: TrxOrDb,
  to_insert: FindingInsert,
) {
  const { inserted_finding_result } = await promiseProps({
    inserted_finding_result: doInsertOne(trx, to_insert),
    altering: isAltered(to_insert)
      ? markAltered(trx, to_insert)
      : Promise.resolve(),
  })

  return inserted_finding_result
}

export function positiveFindingsQuery(
  trx: TrxOrDb,
  { patient_id }: { patient_id: string },
) {
  return trx
    .with(
      'no_qualifier_findings',
      (qb) =>
        qb.selectFrom('patient_record_qualifiers')
          .innerJoin(
            'patient_records',
            'patient_record_qualifiers.id',
            'patient_records.id',
          )
          .where('patient_records.patient_id', '=', patient_id)
          .where(
            'patient_records.snomed_concept_id',
            '=',
            NO_QUALIFIER_SNOMED_CONCEPT_ID,
          )
          .select('qualifies_record_id'),
    )
    .with('patient_positive_findings', (qb) =>
      qb.selectFrom('patient_findings')
        .innerJoin(
          'patient_records',
          'patient_findings.id',
          'patient_records.id',
        )
        .innerJoin(
          'snomed_inferred_canonical_name_and_category',
          'patient_records.snomed_concept_id',
          'snomed_inferred_canonical_name_and_category.id',
        )
        .innerJoin(
          'patient_procedures',
          'patient_findings.procedure_id',
          'patient_procedures.id',
        )
        .innerJoin(
          'patient_records as patient_procedure_records',
          'patient_procedures.id',
          'patient_procedure_records.id',
        )
        .innerJoin(
          'snomed_inferred_canonical_name_and_category as patient_procedure_snomed_inferred_canonical_name_and_category',
          'patient_procedure_records.snomed_concept_id',
          'patient_procedure_snomed_inferred_canonical_name_and_category.id',
        )
        .where('patient_records.patient_id', '=', patient_id)
        .where(
          'patient_findings.id',
          'not in',
          qb.selectFrom('no_qualifier_findings').select('qualifies_record_id'),
        )
        .select((eb) => [
          'patient_records.id as record_id',
          'patient_records.snomed_concept_id',
          'patient_records.patient_encounter_id',
          'patient_findings.patient_encounter_employee_id',
          'snomed_inferred_canonical_name_and_category.name',
          jsonBuildObject({
            record_id: eb.ref('patient_procedure_records.id'),
            snomed_concept_id: sql<string>`${
              eb.ref('patient_procedure_records.snomed_concept_id')
            }::text`,
            name: eb.ref(
              'patient_procedure_snomed_inferred_canonical_name_and_category.name',
            ),
          }).as('as_part_of_procedure'),
        ]))
}

export function negativeFindingsQuery(
  trx: TrxOrDb,
  { patient_id }: { patient_id: string },
) {
  return trx
    .with(
      'no_qualifier_findings',
      (qb) =>
        qb.selectFrom('patient_record_qualifiers')
          .innerJoin(
            'patient_records',
            'patient_record_qualifiers.id',
            'patient_records.id',
          )
          .where('patient_records.patient_id', '=', patient_id)
          .where(
            'patient_records.snomed_concept_id',
            '=',
            NO_QUALIFIER_SNOMED_CONCEPT_ID,
          )
          .select('qualifies_record_id'),
    )
    .with('patient_positive_findings', (qb) =>
      qb.selectFrom('patient_findings')
        .innerJoin(
          'patient_records',
          'patient_findings.id',
          'patient_records.id',
        )
        .innerJoin(
          'snomed_inferred_canonical_name_and_category',
          'patient_records.snomed_concept_id',
          'snomed_inferred_canonical_name_and_category.id',
        )
        .innerJoin(
          'patient_procedures',
          'patient_findings.procedure_id',
          'patient_procedures.id',
        )
        .innerJoin(
          'patient_records as patient_procedure_records',
          'patient_procedures.id',
          'patient_procedure_records.id',
        )
        .innerJoin(
          'snomed_inferred_canonical_name_and_category as patient_procedure_snomed_inferred_canonical_name_and_category',
          'patient_procedure_records.snomed_concept_id',
          'patient_procedure_snomed_inferred_canonical_name_and_category.id',
        )
        .where('patient_records.patient_id', '=', patient_id)
        .where(
          'patient_findings.id',
          'in',
          qb.selectFrom('no_qualifier_findings').select('qualifies_record_id'),
        )
        .select((eb) => [
          'patient_records.id as record_id',
          'patient_records.snomed_concept_id',
          'patient_records.patient_encounter_id',
          'patient_findings.patient_encounter_employee_id',
          'snomed_inferred_canonical_name_and_category.name',
          jsonBuildObject({
            record_id: eb.ref('patient_procedure_records.id'),
            snomed_concept_id: asText(
              eb,
              'patient_procedure_records.snomed_concept_id',
            ),
            name: eb.ref(
              'patient_procedure_snomed_inferred_canonical_name_and_category.name',
            ),
          }).as('as_part_of_procedure'),
        ]))
}
