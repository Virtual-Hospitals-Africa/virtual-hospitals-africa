import { describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import db from '../../../db/db.ts'
import { addTestEmployeeWithSession } from '../../_helpers/employees.ts'
import { route } from '../../route.ts'
import { TEST_ORGANIZATION_UUIDS } from '../../_helpers/organizations.ts'

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
    )

    console.log(response.url)
  })
})
