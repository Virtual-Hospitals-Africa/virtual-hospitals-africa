import { afterAll, describe, it } from 'std/testing/bdd.ts'
import db from '../../db/db.ts'
import { addTestEmployee } from '../_helpers/employees.ts'
import { insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest } from '../_helpers/workflows.ts'
import { patient_procedures } from '../../db/models/patient_procedures.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { parseExpressionExpectingAtom } from '../../shared/s_expression.ts'

describeParallel'db/models/patient_procedures.ts', () => {
  afterAll(() => db.destroy())

  describeParallel'insertOne', () => {
    itParallel('can insert an action representing excessive garment removal', async () => {
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

      const { procedure_id } = await patient_procedures.insertOneNested(db, {
        patient_id: encounter.patient.id,
        patient_encounter_id: encounter.patient_encounter_id,
        employment_id: encounter.employee.employee_id,
        procedure: parseExpressionExpectingAtom(
          `(procedure 118292001 (qualifier 272180002 (qualifier 260378005)))`,
          'procedure',
        ),
      })

      const procedure = await patient_procedures.getById(db, procedure_id)

      assertEquals(procedure.full_display, 'Excessive Garment Removal')
    })
  })
})
