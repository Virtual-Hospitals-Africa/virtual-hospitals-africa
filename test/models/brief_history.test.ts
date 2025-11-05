import { afterAll, describe, it } from 'std/testing/bdd.ts'
import db from '../../db/db.ts'
import { addTestEmployee } from '../_helpers/employees.ts'
import { insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest } from '../_helpers/workflows.ts'
import randomDemographics from '../../mocks/randomDemographics.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'

describe('brief_history', () => {
  afterAll(() => db.destroy())
  describe('positiveFindings', () => {
    it('works', async () => {
      const nurse = await addTestEmployee(db, {
        profession: 'nurse',
      })
      const encounter =
        await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
          db,
          nurse.organization_id,
          {
            patient_demographics: randomDemographics(),
            employment_id: nurse.employee_id,
          },
        )

      console.log(encounter)
    })
  })
})
