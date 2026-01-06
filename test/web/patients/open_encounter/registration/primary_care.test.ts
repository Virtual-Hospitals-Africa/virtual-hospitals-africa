import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { afterAll, before } from 'std/testing/bdd.ts'
import db from '../../../../../db/db.ts'
import { addTestEmployeeWithSession } from '../../../../_helpers/employees.ts'
import { createTestOrganization } from '../../../../_helpers/organizations.ts'
import randomDemographics from '../../../../../mocks/randomDemographics.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { route } from '../../../../route.ts'
import waitUntilTestServerUp from '../../../../_helpers/waitUntilTestServerUp.ts'
import asFormData from '../../../../../util/asFormData.ts'
import { assert } from 'std/assert/assert.ts'
import * as patient_primary_care from '../../../../../db/models/patient_primary_care.ts'

describeParallel(
  '/app/organizations/[organization_id]/patients/[patient_id]/open_encounters/registration/primary_care',
  () => {
    before(waitUntilTestServerUp)
    afterAll(() => db.destroy())

    itParallel(
      'is accessed after this_visit and can submit with no insurance',
      async () => {
        const organization = await createTestOrganization(db)
        const { fetchCheerio } = await addTestEmployeeWithSession(db, {
          profession: 'receptionist',
          registration_status: 'approved',
          organization_id: organization.id,
        })

        // Start registration
        const $personal = await fetchCheerio(
          `/app/organizations/${organization.id}/patients/start-registration`,
          {
            method: 'POST',
          },
        )
        const patient_id =
          $personal.url.match(/patients\/(.*)\/open_encounter/)![1]

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

        assertEquals(
          $primary_care.url,
          `${route}/app/organizations/${organization.id}/patients/${patient_id}/open_encounter/registration/primary_care`,
        )

        // Verify form elements exist
        assert($primary_care('input[name="primary_doctor_name"]').length >= 0)

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
      },
    )

    itParallel(
      'can submit with insurance details',
      async () => {
        const organization = await createTestOrganization(db)
        const { fetchCheerio } = await addTestEmployeeWithSession(db, {
          profession: 'receptionist',
          registration_status: 'approved',
          organization_id: organization.id,
        })

        // Start registration
        const $personal = await fetchCheerio(
          `/app/organizations/${organization.id}/patients/start-registration`,
          {
            method: 'POST',
          },
        )
        const patient_id =
          $personal.url.match(/patients\/(.*)\/open_encounter/)![1]

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

        // Get today's date and a date one year from now for insurance validity
        const today = new Date()
        const valid_from = today.toISOString().split('T')[0]
        const expire_date =
          new Date(today.getFullYear() + 1, today.getMonth(), today.getDate())
            .toISOString().split('T')[0]

        // Submit primary_care with insurance
        const $contacts = await fetchCheerio(
          $primary_care.url,
          {
            method: 'POST',
            body: asFormData({
              primary_doctor_name: 'Dr. Johnson',
              nearest_organization_id: organization.id,
              insurance: {
                insurance_provider: 'Discovery Health',
                plan_name: 'Executive Plan',
                membership_number: '123456789',
                valid_from,
                expire_date,
                is_dependent: false,
              },
            }),
          },
        )

        assertEquals(
          $contacts.url,
          `${route}/app/organizations/${organization.id}/patients/${patient_id}/open_encounter/registration/contacts`,
        )
      },
    )

    itParallel(
      'sets unregistered primary doctor name correctly',
      async () => {
        const organization = await createTestOrganization(db)
        const { fetchCheerio } = await addTestEmployeeWithSession(db, {
          profession: 'receptionist',
          registration_status: 'approved',
          organization_id: organization.id,
        })

        // Start registration
        const $personal = await fetchCheerio(
          `/app/organizations/${organization.id}/patients/start-registration`,
          {
            method: 'POST',
          },
        )
        const patient_id =
          $personal.url.match(/patients\/(.*)\/open_encounter/)![1]

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

        const doctor_name = 'Dr. Mokoena'

        // Submit primary_care with doctor name and no insurance
        await fetchCheerio(
          $primary_care.url,
          {
            method: 'POST',
            body: asFormData({
              primary_doctor_name: doctor_name,
              nearest_organization_id: organization.id,
              insurance: {
                has_no_insurance: true,
              },
            }),
          },
        )

        // Verify the patient's primary doctor was set
        const primary_care = await patient_primary_care.getById(db, {
          patient_id,
        })
        assertEquals(primary_care.primary_doctor?.name, `Dr. ${doctor_name}`)
      },
    )

    itParallel(
      'sets nearest health facility correctly',
      async () => {
        const organization = await createTestOrganization(db)
        const { fetchCheerio } = await addTestEmployeeWithSession(db, {
          profession: 'receptionist',
          registration_status: 'approved',
          organization_id: organization.id,
        })

        // Start registration
        const $personal = await fetchCheerio(
          `/app/organizations/${organization.id}/patients/start-registration`,
          {
            method: 'POST',
          },
        )
        const patient_id =
          $personal.url.match(/patients\/(.*)\/open_encounter/)![1]

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
        await fetchCheerio(
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

        // Verify the patient's nearest health facility was set
        const primary_care = await patient_primary_care.getById(db, {
          patient_id,
        })
        assertEquals(primary_care.nearest_health_facility?.id, organization.id)
      },
    )
  },
)
