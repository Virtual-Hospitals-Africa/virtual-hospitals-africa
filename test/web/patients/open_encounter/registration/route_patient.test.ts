import { z } from 'zod'
import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { afterAll, before } from 'std/testing/bdd.ts'
import db from '../../../../../db/db.ts'
import { TEST_ORGANIZATION_UUIDS } from '../../../../_helpers/organizations.ts'
import randomDemographics from '../../../../../mocks/randomDemographics.ts'
import waitUntilTestServerUp from '../../../../_helpers/waitUntilTestServerUp.ts'
import { setupRegistration } from './_setup.ts'
import randomPhoneNumber from '../../../../../mocks/randomPhoneNumber.ts'
import assertIncludes from '../../../../../util/assertIncludes.ts'
import { getTableDisplay } from 'test/_helpers/table.ts'
import { assertMatches } from '../../../../../util/assertMatches.ts'
import generateUUID from '../../../../../util/uuid.ts'

describeParallel(
  '/app/organizations/[organization_id]/patients/[patient_id]/open_encounters/registration/route_patient',
  () => {
    before(waitUntilTestServerUp)
    afterAll(() => db.destroy())

    itParallel(
      'routes a patient to the waiting room on await_triage',
      async () => {
        const { $ } = await setupRegistration({
          personal: randomDemographics(),
          this_visit: {
            next_workflow: 'continue_with_registration',
          },
          primary_care: {
            nearest_organization_id: TEST_ORGANIZATION_UUIDS.ZA.clinic,
            insurance: {
              has_no_insurance: true,
            },
          },
          contacts: {
            google_maps_place_id: 'TEST GOOGLE MAPS PLACE ' + generateUUID(),
            phone_number: randomPhoneNumber('ZA'),
            emergency_contacts: [{
              ...randomDemographics(),
              phone_number: randomPhoneNumber('ZA'),
              relationship: 'Spouse',
            }],
          },
          confirm_details: {},
          terms_and_conditions: {},
          route_patient: {
            next_workflow: 'await_triage',
          },
        })

        assertIncludes($.url, '/waiting_room')

        const waiting_room_table = getTableDisplay($)
        assertMatches(waiting_room_table, [
          {
            'Patient': z.string(),
            'Reason for visit': 'Seeking Treatment',
            'Location': 'Reception',
            'Status': 'Awaiting Triage',
            'Employees': 'Next Available',
            'Arrived': z.enum(['Just now', '1 minute ago']),
            'Actions': 'Triage',
          },
        ], { strict: true })
      },
    )
  },
)
