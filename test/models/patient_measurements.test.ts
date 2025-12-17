import { afterAll, describe, it } from 'std/testing/bdd.ts'
import db from '../../db/db.ts'
import { parseExpressionExpectingType } from '../../shared/s_expression.ts'
import { addTestEmployee } from '../_helpers/employees.ts'
import { insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest } from '../_helpers/workflows.ts'
import { patient_measurements } from '../../db/models/patient_measurements.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import {
  WORKFLOW_SNOMED_CONCEPT_IDS,
  WORKFLOW_STEP_SNOMED_CONCEPT_IDS,
} from '../../shared/workflow.ts'

describe('db/models/patient_measurements.ts', () => {
  afterAll(() => db.destroy())

  describe('insertOne', () => {
    it('can insert an action representing excessive garment removal', async () => {
      const nurse = await addTestEmployee(db, {
        profession: 'nurse',
        registration_status: 'approved',
      })

      const encounter =
        await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
          db,
          nurse.organization_id,
          {
            employment_id: nurse.employee_id,
          },
        )

      const { record_id } = await patient_measurements.insertOneNested(db, {
        patient_id: encounter.patient.id,
        patient_encounter_id: encounter.patient_encounter_id,
        patient_encounter_employee_id:
          encounter.employee.patient_encounter_employee_id,
        employment_id: encounter.employee.employee_id,
        workflow_snomed_concept_id: WORKFLOW_SNOMED_CONCEPT_IDS.triage,
        workflow_step_snomed_concept_id:
          WORKFLOW_STEP_SNOMED_CONCEPT_IDS.triage!.measure_vitals,
        previously_completed_procedures: {
          workflow_record_id: null,
          workflow_step_record_id: null,
        },
        measurement_equality: parseExpressionExpectingType(
          `(=
            (measurement 103228002)
            (units 91.3 %)
          )`,
          '=',
        ),
      })

      const measurement = await patient_measurements.getById(db, record_id)

      assertEquals(
        measurement.value_display,
        'Hemoglobin saturation with oxygen Measurement finding: 91.3%',
      )
    })
  })
})
