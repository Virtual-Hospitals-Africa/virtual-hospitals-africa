import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { afterAll, before } from 'std/testing/bdd.ts'
import db from '../../../../../db/db.ts'
import { addTestEmployeeWithSession } from '../../../../_helpers/employees.ts'
import { createTestOrganization } from '../../../../_helpers/organizations.ts'
import randomDemographics from '../../../../../mocks/randomDemographics.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { route } from '../../../../_route.ts'
import waitUntilTestServerUp from '../../../../_helpers/waitUntilTestServerUp.ts'
import asFormData from '../../../../../util/asFormData.ts'
import { assert } from 'std/assert/assert.ts'
import generateUUID from '../../../../../util/uuid.ts'

describeParallel(
  '/app/organizations/[organization_id]/patients/[patient_id]/open_encounters/registration/contacts',
  () => {
    before(waitUntilTestServerUp)
    afterAll(() => db.destroy())

    itParallel(
      'is accessed after primary_care and can submit with emergency contact',
      async () => {
        const organization = await createTestOrganization(db)
        const { fetchCheerio } = await addTestEmployeeWithSession(db, {
          profession: 'receptionist',

          organization_id: organization.id,
        })

        // Start registration
        const $personal = await fetchCheerio(
          `/app/organizations/${organization.id}/patients/start-registration`,
          {
            method: 'POST',
          },
        )
        const patient_id = $personal.url.match(/patients\/(.*)\/open_encounter/)![1]

        // Submit personal info
        const $this_visit = await fetchCheerio(
          $personal.url,
          {
            method: 'POST',
            body: asFormData(randomDemographics('ZA')),
          },
        )

        // Submit this_visit with continue_with_registration
        const $primary_care = await fetchCheerio(
          $this_visit.url,
          {
            method: 'POST',
            body: asFormData({
              next_workflow: 'continue_with_registration',
            }),
          },
        )

        // Submit primary_care with no insurance
        const $contacts = await fetchCheerio(
          $primary_care.url,
          {
            method: 'POST',
            body: asFormData({
              primary_doctor_name: 'Dr. Smith',
              nearest_organization_id: organization.id,
              insurance: {
                has_no_insurance: true,
              },
            }),
          },
        )

        assertEquals(
          $contacts.url,
          `${route}/app/organizations/${organization.id}/patients/${patient_id}/open_encounter/registration/contacts`,
        )

        // Verify form elements exist
        assert($contacts('form#contacts').length === 1)

        // Submit contacts with emergency contact
        const $confirm_details = await fetchCheerio(
          $contacts.url,
          {
            method: 'POST',
            body: asFormData({
              google_maps_place_id: 'TEST GOOGLE MAPS PLACE ' + generateUUID(),
              emergency_contacts: [
                {
                  name: 'Jane Doe',
                  relationship: 'Spouse',
                  phone_number: '+27821234567',
                },
              ],
            }),
          },
        )

        assertEquals(
          $confirm_details.url,
          `${route}/app/organizations/${organization.id}/patients/${patient_id}/open_encounter/registration/confirm_details`,
        )
      },
    )

    itParallel(
      'can submit with multiple emergency contacts',
      async () => {
        const organization = await createTestOrganization(db)
        const { fetchCheerio } = await addTestEmployeeWithSession(db, {
          profession: 'receptionist',

          organization_id: organization.id,
        })

        // Start registration
        const $personal = await fetchCheerio(
          `/app/organizations/${organization.id}/patients/start-registration`,
          {
            method: 'POST',
          },
        )
        const patient_id = $personal.url.match(/patients\/(.*)\/open_encounter/)![1]

        // Submit personal info
        const $this_visit = await fetchCheerio(
          $personal.url,
          {
            method: 'POST',
            body: asFormData(randomDemographics('ZA')),
          },
        )

        // Submit this_visit with continue_with_registration
        const $primary_care = await fetchCheerio(
          $this_visit.url,
          {
            method: 'POST',
            body: asFormData({
              next_workflow: 'continue_with_registration',
            }),
          },
        )

        // Submit primary_care with no insurance
        const $contacts = await fetchCheerio(
          $primary_care.url,
          {
            method: 'POST',
            body: asFormData({
              primary_doctor_name: 'Dr. Smith',
              nearest_organization_id: organization.id,
              insurance: {
                has_no_insurance: true,
              },
            }),
          },
        )

        // Submit contacts with multiple emergency contacts
        const $confirm_details = await fetchCheerio(
          $contacts.url,
          {
            method: 'POST',
            body: asFormData({
              google_maps_place_id: 'TEST GOOGLE MAPS PLACE ' + generateUUID(),
              emergency_contacts: [
                {
                  name: 'John Smith',
                  relationship: 'Parent',
                  phone_number: '+27829876543',
                },
                {
                  name: 'Mary Smith',
                  relationship: 'Parent',
                  phone_number: '+27821112222',
                },
              ],
            }),
          },
        )

        assertEquals(
          $confirm_details.url,
          `${route}/app/organizations/${organization.id}/patients/${patient_id}/open_encounter/registration/confirm_details`,
        )
      },
    )
  },
)
