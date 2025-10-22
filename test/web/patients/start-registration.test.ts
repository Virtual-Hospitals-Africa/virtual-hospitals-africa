import { describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import db from '../../../db/db.ts'
import * as patients from '../../../db/models/patients.ts'
import { addTestEmployeeWithSession } from '../../_helpers/employees.ts'
import { route } from '../../route.ts'
import { TEST_ORGANIZATION_UUIDS } from '../../_helpers/organizations.ts'
import { isUUID } from '../../../util/uuid.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import compact from '../../../util/compact.ts'
import { snapshot } from '../../_helpers/snapshot.ts'

describe('/app/organizations/[organization_id]/patients/start-registration', {
  sanitizeResources: false,
  sanitizeOps: false,
}, () => {
  it('creates a patient, starting the registration process at the personal page', async () => {
    const { fetchOk } = await addTestEmployeeWithSession(db, {
      profession: 'nurse',
      specialty: 'primary care',
      registration_status: 'approved',
    })

    const response = await fetchOk(
      `${route}/app/organizations/${TEST_ORGANIZATION_UUIDS.za.clinic}/patients/start-registration`,
      {
        method: 'POST',
      },
    )

    const path = compact(new URL(response.url).pathname.split('/'))
    const patient_id = path.at(-4)
    assert(isUUID(patient_id))
    assertEquals(path, [
      'app',
      'organizations',
      TEST_ORGANIZATION_UUIDS.za.clinic,
      'patients',
      patient_id,
      'open_encounter',
      'registration',
      'personal',
    ])

    const patient = await patients.getById(db, patient_id)
    assertEquals(patient, {
      'id': patient.id,
      'name': null,
      'phone_number': null,
      'gender': null,
      'ethnicity': null,
      'address': null,
      'date_of_birth': null,
      'dob_formatted': null,
      'age_display': null,
      'preferred_language_code_iso_639_2_b': null,
      'age_years': null,
      'description': null,
      'national_id_number': null,
      'completed_registration': false,
      'avatar_url': null,
      'last_visited': null,
      'location': null,
      'actions': {
        'view': `/app/patients/${patient.id}`,
      },
      'nearest_organization': null,
      'primary_doctor': null,
    })
  })
})
