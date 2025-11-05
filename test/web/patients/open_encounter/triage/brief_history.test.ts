import { afterAll, describe, it } from 'std/testing/bdd.ts'
import db from '../../../../../db/db.ts'
import { addTestEmployeeWithSession } from '../../../../_helpers/employees.ts'
import { insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest } from '../../../../_helpers/workflows.ts'
import randomDemographics from '../../../../../mocks/randomDemographics.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { TEST_ORGANIZATION_UUIDS } from '../../../../_helpers/organizations.ts'
import { positiveFindings } from '../../../../../db/models/brief_history.ts'
import { route } from '../../../../route.ts'
import asFormData from '../../../../../util/asFormData.ts'

describe('brief_history', () => {
  afterAll(() => db.destroy())
  describe('POST', () => {
    it('inserts positive & negative findings, redirecting to the warning signs page', async () => {
      const { health_worker: nurse, fetchOk } =
        await addTestEmployeeWithSession(db, {
          profession: 'nurse',
          registration_status: 'approved',
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

      const response = await fetchOk(
        `/app/organizations/${TEST_ORGANIZATION_UUIDS.ZA.clinic}/patients/${encounter.patient.id}/open_encounter/triage/brief_history`,
        {
          method: 'POST',
          body: asFormData({
            diabetes: {
              presence: 'yes',
            },
            pregnancy: {
              presence: 'no',
            },
          }),
        },
        {
          cancel_response_body: true,
        },
      )

      assertEquals(
        response.url,
        `${route}/app/organizations/${TEST_ORGANIZATION_UUIDS.ZA.clinic}/patients/${encounter.patient.id}/open_encounter/triage/warning_signs`,
      )

      const positive_findings = await positiveFindings(db, {
        patient_id: encounter.patient.id,
      })

      assertEquals(positive_findings.length, 1)
      const [diabetes_finding] = positive_findings
      assertEquals(diabetes_finding, {
        'record_id': diabetes_finding.record_id,
        'snomed_concept_id': '73211009',
        'patient_encounter_id': encounter.patient_encounter_id,
        'patient_encounter_employee_id':
          encounter.employee.patient_encounter_employee_id,
        'name': 'Diabetes mellitus',
        'as_part_of_procedure': {
          'record_id': diabetes_finding.as_part_of_procedure.record_id,
          'snomed_concept_id': '203421005',
          'name': 'History taking, limited',
        },
        'common_conditions_key': 'diabetes',
      })
    })
  })
})
