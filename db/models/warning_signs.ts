import { assertEquals } from 'std/assert/assert_equals.ts'
import { PreviouslyCompletedProcedures, TrxOrDb } from '../../types.ts'
import generateUUID from '../../util/uuid.ts'
import { blankSelection, success_true } from '../helpers.ts'
import {
  ParsedFindingExpression,
  ParsedQualifierExpression,
} from './simple_record_language.ts'
import { assert } from 'std/assert/assert.ts'

export const CLINICAL_FINDING_SNOMED_CONCEPT_ID = '404684003' // |Clinical finding (finding)|

type QualifierInsert = {
  id: string
  snomed_concept_id: string
  snomed_concept_id_value?: string
}

function qualifersForInsertion(
  qualifiers: ParsedQualifierExpression[],
): QualifierInsert[] {
  const result: QualifierInsert[] = []

  for (const qualifier of qualifiers) {
    if (qualifier.type !== 'qualifier') {
      assertEquals(
        qualifier.type,
        'not',
        `Unsupported qualifier type: ${qualifier.type}`,
      )
      continue
    }

    result.push({
      id: generateUUID(),
      snomed_concept_id: qualifier.snomed_concept_id,
      snomed_concept_id_value: qualifier.snomed_concept_id_value,
    })

    assert(!qualifier.qualifiers.length, 'Unsupported nested qualifiers')
  }

  return result
}

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

  // Flatten any nested qualifiers from the s_expression (excluding 'not' expressions)
  const qualifiers = qualifersForInsertion(
    finding.qualifiers.filter(
      (q): q is ParsedQualifierExpression => q.type === 'qualifier',
    ),
  )

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
        snomed_concept_id: finding.snomed_concept_id,
      })).with('inserting_findings', (qb) =>
      qb.insertInto('patient_findings')
        .values({
          id: finding_id,
          procedure_id,
          patient_encounter_employee_id,
        })).with(
      'inserting_qualifier_records',
      (qb) =>
        qb.insertInto('patient_records')
          .values(qualifiers.map((q) => ({
            id: q.id,
            snomed_concept_id: q.snomed_concept_id,
            patient_id,
            patient_encounter_id,
          }))),
    ).with(
      'inserting_qualifiers',
      (qb) =>
        qb.insertInto('patient_record_qualifiers')
          .values(qualifiers.map((q) => ({
            id: q.id,
            qualifies_record_id: finding_id,
            snomed_concept_id_value: q.snomed_concept_id_value,
          }))),
    )
    .selectNoFrom([
      success_true,
    ])
    .executeTakeFirstOrThrow()
}
