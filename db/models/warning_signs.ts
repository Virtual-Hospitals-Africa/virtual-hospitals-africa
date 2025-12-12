import { PreviouslyCompletedProcedures, TrxOrDb } from '../../types.ts'
import generateUUID from '../../util/uuid.ts'
import { blankSelection, debugLog, success_true } from '../helpers.ts'
import {
  ParsedExpression,
  ParsedFindingExpression,
} from './simple_record_language.ts'
import { assert } from 'std/assert/assert.ts'

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

export function insertOne(
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
      })).with('inserting_findings', (qb) =>
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
    assert(qualifier.type === 'qualifier')
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
            snomed_concept_id_value: qualifier.snomed_concept_id_value,
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

  debugLog(query
    .selectNoFrom([
      success_true,
    ]))

  return query
    .selectNoFrom([
      success_true,
    ])
    .executeTakeFirstOrThrow()
}
