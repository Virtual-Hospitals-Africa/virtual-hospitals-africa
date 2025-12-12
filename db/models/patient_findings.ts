import {
  IdSelection,
  Maybe,
  PreviouslyCompletedProcedures,
  TrxOrDb,
} from '../../types.ts'
import {
  asText,
  blankSelection,
  jsonArrayFrom,
  jsonBuildObject,
  // orderByArrayPosition,
  success_true,
} from '../helpers.ts'
import generateUUID from '../../util/uuid.ts'
import {
  markAltered,
  RECORD_NOW_INVALID_CONCEPT_ID,
} from './patient_records.ts'
import { promiseProps } from '../../util/promiseProps.ts'
import { QueryCreator, sql } from 'kysely'
import { base } from './_base.ts'
import { assert } from 'std/assert/assert.ts'
import { DB } from '../../db.d.ts'
// import { ParsedFindingExpression } from './simple_record_language.ts'

export const YES_QUALIFIER_SNOMED_CONCEPT_ID = '373066001' // |Yes (qualifier value)|
export const NO_QUALIFIER_SNOMED_CONCEPT_ID = '373067005' // |No (qualifier value)|
export const UNKNOWN_QUALIFIER_SNOMED_CONCEPT_ID = '261665006' // |Unknown (qualifier value)|
export const NO_KNOWN_QUALIFIER_SNOMED_CONCEPT_ID = '1381510001' // |No known (qualifier value)|
export const ACTIVE_QUALIFIER_SNOMED_CONCEPT_ID = '55561003' // |Active (qualifier value)|
export const STATUS_ATTRIBUTE_SNOMED_CONCEPT_ID = '263490005'
export const SELF_REPORTED_QUALIFIER_SNOMED_CONCEPT_ID = '1156040003' // |Self reported (qualifier value)|

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
  value_snomed_concept_id?: string
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
    value_snomed_concept_id,
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
              patient_encounter_employee_id,
              qualifies_record_id: finding_id,
              concrete_value: q.concrete_value,
              snomed_concept_id_value: q.snomed_concept_id_value,
            })))
          : blankSelection(qb),
    )
    .with(
      'inserting_value_snomed_concept_id',
      (qb) =>
        value_snomed_concept_id
          ? qb.insertInto('patient_finding_values')
            .values({ id: finding_id, value_snomed_concept_id })
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

export function baseQuery(
  trx: TrxOrDb | QueryCreator<DB>,
) {
  return trx.selectFrom('patient_findings')
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
    .leftJoin(
      'patient_finding_values',
      'patient_finding_values.id',
      'patient_findings.id',
    )
    .leftJoin(
      'snomed_inferred_canonical_name_and_category as finding_value_snomed_inferred_canonical_name_and_category',
      'patient_finding_values.value_snomed_concept_id',
      'finding_value_snomed_inferred_canonical_name_and_category.id',
    )
    .select((eb) => [
      'patient_records.id as record_id',
      'patient_records.created_at',
      'patient_records.snomed_concept_id',
      'patient_records.patient_encounter_id',
      'patient_findings.patient_encounter_employee_id',
      'snomed_inferred_canonical_name_and_category.name',

      'patient_finding_values.value_snomed_concept_id',
      'finding_value_snomed_inferred_canonical_name_and_category.name as value_name',

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
      jsonArrayFrom(
        eb.selectFrom('patient_record_qualifiers')
          .innerJoin(
            'patient_records as qualifier_patient_records',
            'patient_record_qualifiers.id',
            'qualifier_patient_records.id',
          )
          .innerJoin(
            'snomed_inferred_canonical_name_and_category as qualifier_snomed_inferred_canonical_name_and_category',
            'qualifier_patient_records.snomed_concept_id',
            'qualifier_snomed_inferred_canonical_name_and_category.id',
          )
          .leftJoin(
            'snomed_inferred_canonical_name_and_category as qualifier_snomed_inferred_canonical_name_and_category_value',
            'patient_record_qualifiers.snomed_concept_id_value',
            'qualifier_snomed_inferred_canonical_name_and_category_value.id',
          )
          .whereRef(
            'patient_record_qualifiers.qualifies_record_id',
            '=',
            'patient_records.id',
          )
          .select((eb_qualifiers) => [
            'qualifier_patient_records.id as record_id',
            'qualifier_patient_records.patient_encounter_id',
            'patient_record_qualifiers.patient_encounter_employee_id',
            asText(
              eb_qualifiers,
              'qualifier_patient_records.snomed_concept_id',
            ).as('snomed_concept_id'),
            'qualifier_snomed_inferred_canonical_name_and_category.name',
            'patient_record_qualifiers.concrete_value',
            sql<string | null>`coalesce(
              patient_record_qualifiers.concrete_value::text,
              qualifier_snomed_inferred_canonical_name_and_category_value.name
            )`.as('attribute_value'),
          ]),
        // .orderBy((eb_qualifier_order) =>
        // {
        //   const x = eb_qualifier_order.ref('qualifier_snomed_inferred_canonical_name_and_category.category')
        //   const y: ExtractTypeFromReferenceExpression<>
        //   orderByArrayPosition(
        //     eb_qualifier_order,
        //     'qualifier_snomed_inferred_canonical_name_and_category.category',
        //     ['qualifier value'] as NonEmptyArray<string>
        //   )
        // }
        //   ,
        //   'desc'
        // )
      ).as('qualifiers'),
    ])
    //
    .where(
      (eb) =>
        eb(
          'patient_records.id',
          'not in',
          eb.selectFrom(
            'patient_records as now_invalid_patient_records',
          ).innerJoin(
            'patient_evaluations as now_invalid_patient_evaluations',
            'now_invalid_patient_evaluations.id',
            'now_invalid_patient_evaluations.id',
          ).where(
            'now_invalid_patient_records.snomed_concept_id',
            'in',
            RECORD_NOW_INVALID_CONCEPT_ID,
          )
            .select('now_invalid_patient_evaluations.evaluates_record_id')
            .distinct(),
        ),
    )
}

export const patient_findings = base({
  top_level_table: 'patient_findings',
  baseQuery,
  formatResult: (x) => x,
  handleSearch(
    qb,
    opts: { search?: string; patient_id: string | IdSelection },
  ) {
    assert(!opts.search, 'TODO support')
    if (opts.search) {
      qb = qb.where(
        'snomed_inferred_canonical_name_and_category.name',
        'ilike',
        `%${opts.search}%`,
      )
    }
    if (opts.patient_id) {
      qb = qb.where(
        'patient_records.patient_id',
        '=',
        opts.patient_id,
      )
    }

    return qb
  },
  async insertOneNested(
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
  },
  STATUS_ATTRIBUTE_SNOMED_CONCEPT_ID,
  SELF_REPORTED_QUALIFIER_SNOMED_CONCEPT_ID,
  QUALIFIERS_BY_EXISTENCE: {
    Yes: YES_QUALIFIER_SNOMED_CONCEPT_ID,
    No: NO_QUALIFIER_SNOMED_CONCEPT_ID,
    Unknown: UNKNOWN_QUALIFIER_SNOMED_CONCEPT_ID,
  },
})
