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
import { satisfyingSExpression } from '../../db/models/s_expression.ts'
import { assert } from 'std/assert/assert.ts'
import { assertNotEquals } from 'std/assert/assert_not_equals.ts'

describe('db/models/patient_measurements.ts', () => {
  afterAll(() => db.destroy())

  describe('insertOneNested', () => {
    it('can insert a measurement by equality and then find that measurement using comparator s expressions', async () => {
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
      const patient_id = encounter.patient.id

      const measurement_equality = parseExpressionExpectingType(
        `(=
          (measurement 103228002)
          (units 91.3 %)
        )`,
        '=',
      )

      const { record_id } = await patient_measurements.insertOneNested(db, {
        patient_id,
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
        measurement_equality,
      })

      const measurement = await patient_measurements.getById(db, record_id)

      assertEquals(
        measurement.value_display,
        'Hemoglobin saturation with oxygen Measurement finding: 91.3%',
      )

      const records = await satisfyingSExpression(
        db,
        {
          patient_id,
          s_expression: measurement_equality,
        },
      )

      assertEquals(records, {
        satisfies: true,
        record_ids: [record_id],
      })

      const records_slightly_off = await satisfyingSExpression(
        db,
        {
          patient_id,
          s_expression: `(= (measurement 103228002) (units 91.2 %))`,
        },
      )

      assertEquals(records_slightly_off, {
        satisfies: false,
        record_ids: [],
      })

      assertEquals(
        await satisfyingSExpression(
          db,
          {
            patient_id,
            s_expression: `(> (measurement 103228002) (units 91.2 %))`,
          },
        ),
        {
          satisfies: true,
          record_ids: [record_id],
        },
      )
    })
  })

  describe('insertOneIfNotAlreadyExistsForThisEncounter', () => {
    it('only inserts a measurement once if the value did not change', async () => {
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
      const patient_id = encounter.patient.id

      const measurement_equality = parseExpressionExpectingType(
        `(=
          (measurement 103228002)
          (units 91.3 %)
        )`,
        '=',
      )

      const to_insert = {
        patient_id,
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
        measurement_equality,
      }

      const first_insert = await patient_measurements
        .insertOneIfNotAlreadyExistsForThisEncounter(db, to_insert)
      const second_insert = await patient_measurements
        .insertOneIfNotAlreadyExistsForThisEncounter(db, to_insert)

      assert(first_insert.inserted_new)
      assert(!second_insert.inserted_new)
      assertEquals(first_insert.record_id, second_insert.record_id)
    })

    it('inserts a new measurement once if the value did change', async () => {
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
      const patient_id = encounter.patient.id

      const to_insert = {
        patient_id,
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
      }

      const first_insert = await patient_measurements
        .insertOneIfNotAlreadyExistsForThisEncounter(db, {
          ...to_insert,
          measurement_equality: parseExpressionExpectingType(
            `(=
              (measurement 103228002)
              (units 91.2 %)
            )`,
            '=',
          ),
        })

      const second_insert = await patient_measurements
        .insertOneIfNotAlreadyExistsForThisEncounter(db, {
          ...to_insert,
          measurement_equality: parseExpressionExpectingType(
            `(=
              (measurement 103228002)
              (units 91.3 %)
            )`,
            '=',
          ),
        })

      assert(first_insert.inserted_new)
      assert(second_insert.inserted_new)
      assertNotEquals(first_insert.record_id, second_insert.record_id)
    })
  })
})
