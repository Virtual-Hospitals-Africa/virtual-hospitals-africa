import { assertEquals } from 'std/assert/assert_equals.ts'
import { PreviouslyCompletedProcedures, TrxOrDb } from '../../types.ts'
import generateUUID from '../../util/uuid.ts'
import { blankSelection, success_true } from '../helpers.ts'
import {
  ParsedExpression,
  ParsedFindingExpression,
} from '../../shared/s_expression.ts'
import { satisfyingSExpression } from './s_expression.ts'
import { sql } from 'kysely'

export const CLINICAL_FINDING_SNOMED_CONCEPT_ID = '404684003' // |Clinical finding (finding)|

type WarningSignInsert = {
  patient_id: string
  patient_encounter_id: string
  patient_encounter_employee_id: string
  workflow_snomed_concept_id: string
  workflow_step_snomed_concept_id: string | null
  previously_completed_procedures: PreviouslyCompletedProcedures
  finding: ParsedFindingExpression
}

export const warning_signs = {
  insertOne(
    trx: TrxOrDb,
    {
      patient_id,
      patient_encounter_id,
      patient_encounter_employee_id,
      workflow_snomed_concept_id,
      workflow_step_snomed_concept_id,
      previously_completed_procedures,
      finding,
    }: WarningSignInsert,
  ) {
    const previously_completed_procedure_record_id =
      workflow_step_snomed_concept_id
        ? previously_completed_procedures.workflow_step_record_id
        : previously_completed_procedures.workflow_record_id

    const procedure_id = previously_completed_procedure_record_id ||
      generateUUID()

    const finding_id = generateUUID()

    let query = trx.with(
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
          snomed_concept_id: finding.snomed_concept_id,
        })).with(
        'inserting_patient_finding_values',
        (qb) =>
          finding.value_snomed_concept_id
            ? qb.insertInto('patient_finding_values')
              .values({
                id: finding_id,
                value_snomed_concept_id: finding.value_snomed_concept_id,
              })
            : blankSelection(qb),
      ).with('inserting_findings', (qb) =>
        qb.insertInto('patient_findings')
          .values({
            id: finding_id,
            procedure_id,
            patient_encounter_employee_id,
          }))

    function qualifierCte(
      qb: typeof query,
      qualifier: ParsedExpression,
      qualifies_record_id: string,
    ) {
      if (qualifier.type !== 'qualifier') {
        assertEquals(
          qualifier.type,
          'not',
          'we can omit not expressions upon insert, but not sure what is going on here',
        )
        return qb
      }
      const id = generateUUID()
      const id_token = id.replaceAll('-', '_')

      let next_query = qb.with(
        `inserting_qualifier_record_${id_token}`,
        (qb) =>
          qb.insertInto('patient_records')
            .values({
              id,
              patient_id,
              patient_encounter_id,
              snomed_concept_id: qualifier.snomed_concept_id,
            }),
      ).with(
        `inserting_qualifiers_${id_token}`,
        (qb) =>
          qb.insertInto('patient_record_qualifiers')
            .values({
              id,
              qualifies_record_id,
              value_snomed_concept_id: qualifier.value_snomed_concept_id,
            }),
      ) as unknown as typeof query

      for (const sub_qualifier of qualifier.qualifiers) {
        next_query = qualifierCte(
          next_query,
          sub_qualifier,
          id,
        ) as unknown as typeof query
      }

      return next_query
    }

    for (const qualifier of finding.qualifiers) {
      query = qualifierCte(query, qualifier, finding_id)
    }

    return query
      .selectNoFrom([
        success_true,
        sql<true>`true`.as('inserted_new'),
      ])
      .executeTakeFirstOrThrow()
  },

  async insertOneIfNotAlreadyExistsForThisEncounter(
    trx: TrxOrDb,
    {
      patient_id,
      patient_encounter_id,
      patient_encounter_employee_id,
      workflow_snomed_concept_id,
      workflow_step_snomed_concept_id,
      previously_completed_procedures,
      finding,
    }: WarningSignInsert,
  ) {
    console.log({ finding })
    const already_exists = await satisfyingSExpression(
      trx,
      {
        patient_id,
        patient_encounter_id,
        s_expression: finding,
      },
    )

    console.log({ already_exists })

    if (already_exists.satisfies) {
      return {
        success: true,
        inserted_new: false,
        existing_records: already_exists.record_ids,
      }
    }

    return warning_signs.insertOne(trx, {
      patient_id,
      patient_encounter_id,
      patient_encounter_employee_id,
      workflow_snomed_concept_id,
      workflow_step_snomed_concept_id,
      previously_completed_procedures,
      finding,
    })
  },
}
