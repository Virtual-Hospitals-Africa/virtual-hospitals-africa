import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { afterAll, before } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import db from '../../../db/db.ts'
import { patients } from '../../../db/models/patients.ts'
import { addTestEmployeeWithSession } from '../../_helpers/employees.ts'
import { TEST_ORGANIZATION_UUIDS } from '../../_helpers/organizations.ts'
import { isUUID } from '../../../util/uuid.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import compact from '../../../util/compact.ts'
import waitUntilTestServerUp from '../../_helpers/waitUntilTestServerUp.ts'

describeParallel(
  '/app/organizations/[organization_id]/patients/start-registration',
  () => {
    before(waitUntilTestServerUp)
    afterAll(() => db.destroy())
    itParallel(
      'creates a patient, starting the registration process at the personal page',
      async () => {
        const { fetchOk } = await addTestEmployeeWithSession(db, {
          profession: 'nurse',
          specialty: 'Primary care',
          registration_status: 'approved',
        })

        const response = await fetchOk(
          `/app/organizations/${TEST_ORGANIZATION_UUIDS.ZA.clinic}/patients/start-registration`,
          {
            method: 'POST',
          },
          {
            cancel_response_body: true,
          },
        )

        const path = compact(new URL(response.url).pathname.split('/'))
        const patient_id = path.at(-4)
        assert(isUUID(patient_id))
        assertEquals(path, [
          'app',
          'organizations',
          TEST_ORGANIZATION_UUIDS.ZA.clinic,
          'patients',
          patient_id,
          'open_encounter',
          'registration',
          'personal',
        ])

        const patient = await patients.getById(db, patient_id)
        assertEquals(patient, {
          id: patient.id,
          name: null,
          names: null,
          sex: null,
          gender: null,
          date_of_birth: null,
          dob_formatted: null,
          age_display: null,
          preferred_language_code_iso_639_2_b: null,
          age_years: null,
          age_days: null,
          description: null,
          national_id_number: null,
          completed_registration: false,
          avatar_url: null,
          most_recent_height_cm_measurement: null,
        })
      },
    )
  },
)
