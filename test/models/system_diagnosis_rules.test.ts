import { afterAll } from 'std/testing/bdd.ts'
import db from '../../db/db.ts'
import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { system_diagnosis_rules } from '../../db/models/system_diagnosis_rules.ts'
import { assert } from 'std/assert/assert.ts'
import { patient_findings } from '../../db/models/patient_findings.ts'
import { WORKFLOW_STEP_SNOMED_CONCEPTS } from '../../shared/workflow.ts'
import { insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest } from 'test/_helpers/workflows.ts'
import { parseWithSchema } from '../../shared/s_expression.ts'
import { measurement_comparator } from '../../shared/s_expression_schemas.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { patient_evaluations } from '../../db/models/patient_evaluations.ts'

describeParallel('db/models/system_diagnosis_rules.ts', () => {
  afterAll(() => db.destroy())

  itParallel(
    'yields a possible anaphylaxis diagnosis for an insect bite + low blood pressure',
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

      assert(inserted_findings.finding_ids[0])
      const diagnoses_result = await system_diagnosis_rules.insertSystemDiagnosesIfNotAlreadyIdentified(db, {
        listener_id: 'test',
        listener_name: 'test',
        patient_id,
        patient_encounter_id,
        patient_age_determination: 'adult',
        procedure_id: inserted_findings.procedure_id,
        records: [
          { id: inserted_findings.finding_ids[0], existence: 'Yes' },
          { id: inserted_findings.measurement_ids[0], existence: 'Yes' },
        ],
      })
      assertEquals(diagnoses_result, 'Inserted 1 diagnosis(es): possible Anaphylaxis')
      const evaluation = await patient_evaluations.findOne(db, { patient_id })
      console.log({ evaluation })
    },
  )

  itParallel(
    'low blood pressure alone is not enough for a possible anaphylaxis diagnosis',
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
          findings: [],
          measurements: [
            parseWithSchema(`(= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 85)`, measurement_comparator),
            parseWithSchema(`(= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 55)`, measurement_comparator),
          ],
        },
      )

      assert(inserted_findings.measurement_ids[0])
      assert(inserted_findings.measurement_ids[1])

      const diagnoses_result = await system_diagnosis_rules.insertSystemDiagnosesIfNotAlreadyIdentified(db, {
        listener_id: 'test',
        listener_name: 'test',
        patient_id,
        patient_encounter_id,
        patient_age_determination: 'adult',
        procedure_id: inserted_findings.procedure_id,
        records: [
          { id: inserted_findings.measurement_ids[0], existence: 'Yes' },
          { id: inserted_findings.measurement_ids[1], existence: 'Yes' },
        ],
      })

      assertEquals(diagnoses_result, 'success — no diagnoses to insert')
    },
  )
})
