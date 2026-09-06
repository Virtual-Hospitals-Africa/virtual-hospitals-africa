import { afterAll, before } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../../../db/db.ts'
import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import waitUntilTestServerUp from 'test/_helpers/waitUntilTestServerUp.ts'
import { addTestEmployeeWithSession } from 'test/_helpers/employees.ts'
import { createTestOrganization } from 'test/_helpers/organizations.ts'
import { insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest } from 'test/_helpers/workflows.ts'
import { assertMatches } from '../../../../util/assertMatches.ts'
import sortBy from '../../../../util/sortBy.ts'
import { normalForm } from '../../../../shared/s_expression.ts'

async function setup() {
  const clinic = await createTestOrganization(db)
  const nurse = await addTestEmployeeWithSession(db, {
    role: 'nurse',
    organization_id: clinic.id,
  })
  const encounter = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
    db,
    clinic.id,
    { employment_id: nurse.health_worker.employee_id },
  )
  const route = (s_expression: string) =>
    `/app/organizations/${clinic.id}/patients/${encounter.patient_id}/open_encounter/findings_to_check_for?s_expression=${encodeURIComponent(s_expression)}`

  return { clinic, nurse, encounter, route }
}

describeParallel('/app/organizations/[organization_id]/patients/[patient_id]/open_encounter/findings_to_check_for', () => {
  before(waitUntilTestServerUp)
  afterAll(() => db.destroy())

  describeParallel('GET', () => {
    itParallel('responds with the check_for findings due to the hypothetical finding', async () => {
      const { nurse, route } = await setup()

      const response = await nurse.fetchJSON(route('(clinical_finding (snomed_concept "Insect bite - wound" "disorder"))'))

      assert(Array.isArray(response.findings_to_check_for))
      assertMatches(
        sortBy(response.findings_to_check_for, 's_expression').slice(0, 2),
        [
          {
            s_expression: normalForm('(clinical_finding (snomed_concept "Avulsion - injury" "disorder"))'),
            existing_record: null,
          },
          {
            s_expression: normalForm(
              '(clinical_finding (snomed_concept "Bite - wound" "disorder") (finding_site (snomed_concept "Bone structure" "body structure")))',
            ),
            existing_record: null,
          },
        ],
      )
    })

    itParallel('responds with an empty list when nothing is due to the finding', async () => {
      const { nurse, route } = await setup()

      const response = await nurse.fetchJSON(route('(clinical_finding (snomed_concept "Hangnail" "disorder"))'))

      assertEquals(response, { findings_to_check_for: [] })
    })

    itParallel('responds 400 to a malformed s_expression', async () => {
      const { nurse, route } = await setup()

      const response = await nurse.fetch(route('(clinical_finding (snomed_concept "Not a real category" "nonsense"))'), {
        headers: { Accept: 'application/json' },
      })
      await response.body?.cancel()

      assertEquals(response.status, 400)
    })

    itParallel('responds 400 when s_expression is missing', async () => {
      const { nurse, clinic, encounter } = await setup()

      const response = await nurse.fetch(
        `/app/organizations/${clinic.id}/patients/${encounter.patient_id}/open_encounter/findings_to_check_for`,
        { headers: { Accept: 'application/json' } },
      )
      await response.body?.cancel()

      assertEquals(response.status, 400)
    })
  })
})
