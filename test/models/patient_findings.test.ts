import { afterAll, describe, it } from 'std/testing/bdd.ts'
import db from '../../db/db.ts'
import { parseExpressionExpectingAtom } from '../../shared/s_expression.ts'
import { addTestEmployee } from '../_helpers/employees.ts'
import { insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest } from '../_helpers/workflows.ts'
import {
  CLINICAL_FINDING_SNOMED_CONCEPT_ID,
  patient_findings,
} from '../../db/models/patient_findings.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { WORKFLOW_STEP_SNOMED_CONCEPT_IDS } from '../../shared/workflow.ts'
import { satisfyingSExpression } from '../../db/models/s_expression.ts'
import { assert } from 'std/assert/assert.ts'
import { assertNotEquals } from 'std/assert/assert_not_equals.ts'
import { patient_procedures } from '../../db/models/patient_procedures.ts'

// 368208006 |Left upper arm structure (body structure)|

describe('db/models/patient_findings.ts', () => {
  afterAll(() => db.destroy())

  describe('finding sites', () => {
    it('can be found either by virtue of their SNOMED relationships or by finding sites that were added', async () => {
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

      const procedure = await patient_procedures.insertOneNested(db, {
        patient_id: encounter.patient.id,
        patient_encounter_id: encounter.patient_encounter_id,
        employment_id: nurse.employee_id,
        procedure: parseExpressionExpectingAtom(
          `(procedure ${
            WORKFLOW_STEP_SNOMED_CONCEPT_IDS.triage!.measure_vitals
          })`,
          'procedure',
        ),
      })

      // const left_arm = '368208006' // |Left upper arm structure (body structure)|
      // const burn_of_left_arm = '12105941000119105' // |Burn of left upper arm (disorder)|

      const finding = parseExpressionExpectingAtom(
        `(finding ${CLINICAL_FINDING_SNOMED_CONCEPT_ID} 
            (snomed_concept "Burn" "disorder")
            (attribute (snomed_concept "Finding site") (snomed_concept "Left upper arm structure"))
        )`,
        'finding',
      )

      const { measurement_id } = await patient_findings.insertOneNested(
        db,
        {
          patient_id,
          patient_encounter_id: encounter.patient_encounter_id,
          patient_encounter_employee_id:
            encounter.employee.patient_encounter_employee_id,
          procedure_id: procedure.procedure_id,
          finding,
        },
      )

      const measurement = await patient_findings.getById(db, measurement_id)

      assertEquals(
        measurement.full_display,
        'Hemoglobin saturation with oxygen: 91.3%',
      )

      const records = await satisfyingSExpression(
        db,
        {
          patient_id,
          s_expression: finding,
        },
      )

      assertEquals(records, {
        satisfies: true,
        record_ids: [measurement_id],
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
          record_ids: [measurement_id],
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

      const finding = parseExpressionExpectingAtom(
        `(=
          (measurement 103228002)
          (units 91.3 %)
        )`,
        '=',
      )
      const procedure = await patient_procedures.insertOneNested(db, {
        patient_id: encounter.patient.id,
        patient_encounter_id: encounter.patient_encounter_id,
        employment_id: nurse.employee_id,
        procedure: parseExpressionExpectingAtom(
          `(procedure ${
            WORKFLOW_STEP_SNOMED_CONCEPT_IDS.triage!.measure_vitals
          })`,
          'procedure',
        ),
      })

      const to_insert = {
        patient_id,
        patient_encounter_id: encounter.patient_encounter_id,
        patient_encounter_employee_id:
          encounter.employee.patient_encounter_employee_id,
        procedure_id: procedure.procedure_id,
        finding,
      }

      const first_insert = await patient_findings
        .insertOneIfNotAlreadyExistsForThisEncounter(db, to_insert)
      const second_insert = await patient_findings
        .insertOneIfNotAlreadyExistsForThisEncounter(db, to_insert)

      assert(first_insert.inserted_new)
      assert(!second_insert.inserted_new)
      assertEquals(first_insert.measurement_id, second_insert.measurement_id)
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

      const procedure = await patient_procedures.insertOneNested(db, {
        patient_id: encounter.patient.id,
        patient_encounter_id: encounter.patient_encounter_id,
        employment_id: nurse.employee_id,
        procedure: parseExpressionExpectingAtom(
          `(procedure ${
            WORKFLOW_STEP_SNOMED_CONCEPT_IDS.triage!.measure_vitals
          })`,
          'procedure',
        ),
      })

      const to_insert = {
        patient_id,
        patient_encounter_id: encounter.patient_encounter_id,
        patient_encounter_employee_id:
          encounter.employee.patient_encounter_employee_id,
        procedure_id: procedure.procedure_id,
      }

      const first_insert = await patient_findings
        .insertOneIfNotAlreadyExistsForThisEncounter(db, {
          ...to_insert,
          finding: parseExpressionExpectingAtom(
            `(=
              (measurement 103228002)
              (units 91.2 %)
            )`,
            '=',
          ),
        })

      const second_insert = await patient_findings
        .insertOneIfNotAlreadyExistsForThisEncounter(db, {
          ...to_insert,
          finding: parseExpressionExpectingAtom(
            `(=
              (measurement 103228002)
              (units 91.3 %)
            )`,
            '=',
          ),
        })

      assert(first_insert.inserted_new)
      assert(second_insert.inserted_new)
      assertNotEquals(first_insert.measurement_id, second_insert.measurement_id)
    })
  })
})
