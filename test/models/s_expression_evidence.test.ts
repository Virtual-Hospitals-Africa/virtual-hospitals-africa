import { afterAll } from 'std/testing/bdd.ts'
import db from '../../db/db.ts'
import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { s_expression_evidence } from '../../db/models/s_expression_evidence.ts'
import { assert } from 'std/assert/assert.ts'
import { patient_findings } from '../../db/models/patient_findings.ts'
import { WORKFLOW_STEP_SNOMED_CONCEPTS } from '../../shared/workflow.ts'
import { insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest } from 'test/_helpers/workflows.ts'
import { parseWithSchema } from '../../shared/s_expression.ts'
import { active_condition, any_query_evidence, measurement_comparator } from '../../shared/s_expression_schemas.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { SYSTEM_DIAGNOSIS_RULES_PARSED } from '../../shared/system_diagnosis_rules.ts'
import findMatching from '../../util/findMatching.ts'

describeParallel('db/models/s_expression_evidence.ts', () => {
  afterAll(() => db.destroy())

  itParallel(
    'can detect that a due_to for possible anaphylaxis is satisfied for Insect bite + low blood pressure',
    async () => {
      const { employee, patient_id, patient_encounter_id } = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(db)
      const inserted_findings = await patient_findings.insertMany(
        db,
        {
          patient_id,
          patient_encounter_id,
          patient_encounter_employee_id: employee.patient_encounter_employee_id,
          employment_id: employee.employee_id,
          procedure: {
            create_with_specific_snomed_concept_id: WORKFLOW_STEP_SNOMED_CONCEPTS.triage!.warning_signs.snomed_concept_id,
          },
          findings: [
            `(clinical_finding (snomed_concept "Insect bite - wound" "disorder"))`,
          ],
          measurements: [
            parseWithSchema(`(= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 85)`, measurement_comparator),
          ],
        },
      )

      const irrelevant_findings = await patient_findings.insertMany(
        db,
        {
          patient_id,
          patient_encounter_id,
          patient_encounter_employee_id: employee.patient_encounter_employee_id,
          employment_id: employee.employee_id,
          procedure: {
            create_with_specific_snomed_concept_id: WORKFLOW_STEP_SNOMED_CONCEPTS.triage!.warning_signs.snomed_concept_id,
          },
          findings: [
            `(clinical_finding (snomed_concept "Pain of ear" "finding"))`,
          ],
        },
      )
      assert(irrelevant_findings.finding_ids[0])

      const anaphylaxis_possible_rule = findMatching(SYSTEM_DIAGNOSIS_RULES_PARSED, { description: 'Diagnose possible anaphylaxis' })

      const result = await s_expression_evidence.evaluate(db, {
        patient_id,
        patient_encounter_id,
      }, anaphylaxis_possible_rule.due_to)

      assert(result.satisfies)
      assertEquals(
        result.contributing_records.sort(),
        [
          inserted_findings.finding_ids[0],
          inserted_findings.measurement_ids[0],
        ].sort(),
      )
    },
  )

  itParallel(
    'can detect that a due_to for possible anaphylaxis is not satisfied with low blood pressure alone',
    async () => {
      const { employee, patient_id, patient_encounter_id } = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(db)
      await patient_findings.insertMany(
        db,
        {
          patient_id,
          patient_encounter_id,
          patient_encounter_employee_id: employee.patient_encounter_employee_id,
          employment_id: employee.employee_id,
          procedure: {
            create_with_specific_snomed_concept_id: WORKFLOW_STEP_SNOMED_CONCEPTS.triage!.warning_signs.snomed_concept_id,
          },
          findings: [],
          measurements: [
            parseWithSchema(`(= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 85)`, measurement_comparator),
          ],
        },
      )

      const anaphylaxis_possible_rule = findMatching(SYSTEM_DIAGNOSIS_RULES_PARSED, { description: 'Diagnose possible anaphylaxis' })

      const result = await s_expression_evidence.evaluate(db, {
        patient_id,
        patient_encounter_id,
      }, anaphylaxis_possible_rule.due_to)

      assert(!result.satisfies)
    },
  )

  itParallel(
    'can detect that a finding with a finding site matches',
    async () => {
      const { employee, patient_id, patient_encounter_id } = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(db)
      const inserted_findings = await patient_findings.insertMany(
        db,
        {
          patient_id,
          patient_encounter_id,
          patient_encounter_employee_id: employee.patient_encounter_employee_id,
          employment_id: employee.employee_id,
          procedure: {
            create_with_specific_snomed_concept_id: WORKFLOW_STEP_SNOMED_CONCEPTS.triage!.warning_signs.snomed_concept_id,
          },
          findings: [
            `(clinical_finding (snomed_concept "Nasal discharge" "finding"))`,
          ],
        },
      )

      const result = await s_expression_evidence.evaluate(db, {
        patient_id,
        patient_encounter_id,
      }, parseWithSchema(`(clinical_finding (finding_site (snomed_concept "Nasal structure" "body structure")))`, any_query_evidence))

      assert(result.satisfies)
      assertEquals(
        result.contributing_records.sort(),
        [
          inserted_findings.finding_ids[0],
        ].sort(),
      )
    },
  )

  itParallel.only(
    'can detect that a situation with an associated finding matches',
    async () => {
      const { employee, patient_id, patient_encounter_id } = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(db)
      const inserted_findings = await patient_findings.insertMany(
        db,
        {
          patient_id,
          patient_encounter_id,
          patient_encounter_employee_id: employee.patient_encounter_employee_id,
          employment_id: employee.employee_id,
          procedure: {
            create_with_specific_snomed_concept_id: WORKFLOW_STEP_SNOMED_CONCEPTS.triage!.warning_signs.snomed_concept_id,
          },
          findings: [
            `(clinical_finding (snomed_concept "Nasal discharge present" "situation"))`,
          ],
        },
      )

      const result = await s_expression_evidence.evaluate(db, {
        patient_id,
        patient_encounter_id,
      }, parseWithSchema(`(clinical_finding (finding_site (snomed_concept "Nasal structure" "body structure")))`, any_query_evidence))

      assert(result.satisfies)
      assertEquals(
        result.contributing_records.sort(),
        [
          inserted_findings.finding_ids[0],
        ].sort(),
      )
    },
  )
})
