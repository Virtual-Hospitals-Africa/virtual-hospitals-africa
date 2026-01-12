import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { afterAll, before } from 'std/testing/bdd.ts'
import db from '../../../../../db/db.ts'
import { employees } from '../../../../../db/models/employees.ts'
import { patients } from '../../../../../db/models/patients.ts'
// import { patient_encounters } from '../../../../../db/models/patient_encounters.ts'
import { addTestEmployeeWithSession } from '../../../../_helpers/employees.ts'
import { createTestOrganization, TEST_ORGANIZATION_UUIDS } from '../../../../_helpers/organizations.ts'
import randomDemographics from '../../../../../mocks/randomDemographics.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { route /*, wss_route */ } from '../../../../_route.ts'
import waitUntilTestServerUp from '../../../../_helpers/waitUntilTestServerUp.ts'
import asFormData from '../../../../../util/asFormData.ts'
import { employeeOrganizationDepartmentNames } from '../../../../../shared/departments.ts'
// import { employeeDisplay } from '../../../../../util/healthWorkerDisplay.ts'

describeParallel(
  '/app/organizations/[organization_id]/patients/[patient_id]/open_encounters/registration/this_visit',
  () => {
    before(waitUntilTestServerUp)
    afterAll(() => db.destroy())

    itParallel(
      'is accessed immediately after the personal page and can continue with registration',
      async () => {
        const { fetchCheerio } = await addTestEmployeeWithSession(db, {
          profession: 'receptionist',
          registration_status: 'approved',
        })

        const $personal = await fetchCheerio(
          `/app/organizations/${TEST_ORGANIZATION_UUIDS.ZA.clinic}/patients/start-registration`,
          {
            method: 'POST',
          },
        )
        const patient_id = $personal.url.match(/patients\/(.*)\/open_encounter/)![1]

        const $this_visit = await fetchCheerio(
          $personal.url,
          {
            method: 'POST',
            body: asFormData(randomDemographics('ZA')),
          },
        )

        assertEquals(
          $this_visit.url,
          `${route}/app/organizations/${TEST_ORGANIZATION_UUIDS.ZA.clinic}/patients/${patient_id}/open_encounter/registration/this_visit`,
        )

        const values = $this_visit('[name=next_workflow]')
          .map((_i, el) => $this_visit(el).attr('value'))
          .get()

        assertEquals(values, [
          'continue_with_registration',
          'immediate_triage',
          'call_for_help',
        ])

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
          `${route}/app/organizations/${TEST_ORGANIZATION_UUIDS.ZA.clinic}/patients/${patient_id}/open_encounter/registration/primary_care`,
        )
      },
    )

    itParallel(
      'can route immediately to triage as a receptionist, notifying the senior health care worker',
      async () => {
        const organization = await createTestOrganization(db)
        const receptionist = await addTestEmployeeWithSession(
          db,
          {
            profession: 'receptionist',
            registration_status: 'approved',
            organization_id: organization.id,
          },
        )
        // TODO turn back on websocket test
        // const nurse = await addTestEmployeeWithSession(
        //   db,
        //   {
        //     profession: 'nurse',
        //     registration_status: 'approved',
        //     organization_id: organization.id,
        //   },
        // )

        // const received_notification = Promise.withResolvers<MessageEvent>()

        // const nurse_notifications_websocket = new WebSocket(
        //   `${wss_route}/app/notifications-websocket?session_id=${nurse.session_id}`,
        // )

        // nurse_notifications_websocket.onmessage = function (e) {
        //   received_notification.resolve(e)
        // }

        // nurse_notifications_websocket.onerror = function (e) {
        //   received_notification.reject(e)
        // }

        const receptionist_employee = await employees.getById(
          db,
          receptionist.health_worker.employee_id,
        )

        const receptionist_departments = employeeOrganizationDepartmentNames(
          receptionist_employee,
        )
        assertEquals(receptionist_departments, ['Reception'])

        const $personal = await receptionist.fetchCheerio(
          `/app/organizations/${organization.id}/patients/start-registration`,
          {
            method: 'POST',
          },
        )
        const patient_id = $personal.url.match(/patients\/(.*)\/open_encounter/)![1]

        const $this_visit = await receptionist.fetchCheerio(
          $personal.url,
          {
            method: 'POST',
            body: asFormData(randomDemographics('ZA')),
          },
        )

        assertEquals(
          $this_visit.url,
          `${route}/app/organizations/${organization.id}/patients/${patient_id}/open_encounter/registration/this_visit`,
        )

        const values = $this_visit('[name=next_workflow]')
          .map((_i, el) => $this_visit(el).attr('value'))
          .get()

        assertEquals(values, [
          'continue_with_registration',
          'immediate_triage',
          'call_for_help',
        ])

        const $waiting_room = await receptionist.fetchCheerio(
          $this_visit.url,
          {
            method: 'POST',
            body: asFormData({
              next_workflow: 'immediate_triage',
            }),
          },
        )

        const waiting_room_url = new URL($waiting_room.url)
        assertEquals(
          waiting_room_url.pathname,
          `/app/organizations/${organization.id}/waiting_room`,
        )

        assertEquals(
          Array.from(waiting_room_url.searchParams.keys()),
          ['success'],
        )

        const patient = await patients.getById(db, patient_id)

        const hardcoded_senior_health_care_professional_name = 'Nomsa Moyo'
        assertEquals(
          waiting_room_url.searchParams.get('success'),
          `Please move ${patient.names!.preferred_name} to Triage room 1. ${hardcoded_senior_health_care_professional_name} has been notified.`,
        )

        // const notification = await received_notification.promise

        // nurse_notifications_websocket.close()

        // const notification_data = JSON.parse(notification.data)
        // assertEquals(notification_data, {
        //   'created_at': notification_data.created_at,
        //   'updated_at': notification_data.updated_at,
        //   'health_worker_id': nurse.health_worker.id,
        //   'notification_type': 'patient_encounter_immediate_triage',
        //   'title': 'Immediate Triage Requested',
        //   'description': `${
        //     employeeDisplay(receptionist_employee).display_name
        //   } has requested immediate triage for a patient`,
        //   'avatar_url': '/images/heroicons/24/solid/exclamation-triangle.svg',
        //   'seen_at': null,
        //   'notification_id': notification_data.notification_id,
        //   'row_id': notification_data.row_id,
        //   'table_name': 'patient_encounters',
        //   'time_display': 'Just now',
        //   'action': {
        //     'title': 'View patient case',
        //     'href':
        //       `/app/organizations/${organization.id}/patients/${patient_id}/open_encounter/respond-to-immediate-triage-request`,
        //   },
        // })

        // const encounter = await patient_encounters.getById(
        //   db,
        //   notification_data.row_id,
        // )
        // assertEquals(encounter.patient.id, patient_id)
      },
    )

    itParallel(
      'can route immediately to triage as a receptionist, keeping track of when all the rooms are filled',
      async () => {
        const organization = await createTestOrganization(db)
        const receptionist = await addTestEmployeeWithSession(
          db,
          {
            profession: 'receptionist',
            registration_status: 'approved',
            organization_id: organization.id,
          },
        )

        const hardcoded_senior_health_care_professional_name = 'Nomsa Moyo'

        const receptionist_employee = await employees.getById(
          db,
          receptionist.health_worker.employee_id,
        )

        const receptionist_departments = employeeOrganizationDepartmentNames(
          receptionist_employee,
        )
        assertEquals(receptionist_departments, ['Reception'])

        const $personal1 = await receptionist.fetchCheerio(
          `/app/organizations/${organization.id}/patients/start-registration`,
          {
            method: 'POST',
          },
        )
        const patient_id1 = $personal1.url.match(/patients\/(.*)\/open_encounter/)![1]

        const $this_visit1 = await receptionist.fetchCheerio(
          $personal1.url,
          {
            method: 'POST',
            body: asFormData(randomDemographics('ZA')),
          },
        )

        const $waiting_room1 = await receptionist.fetchCheerio(
          $this_visit1.url,
          {
            method: 'POST',
            body: asFormData({
              next_workflow: 'immediate_triage',
            }),
          },
        )

        const patient1 = await patients.getById(db, patient_id1)

        assertEquals(
          new URL($waiting_room1.url).searchParams.get('success'),
          `Please move ${patient1.names!.preferred_name} to Triage room 1. ${hardcoded_senior_health_care_professional_name} has been notified.`,
        )

        const $personal2 = await receptionist.fetchCheerio(
          `/app/organizations/${organization.id}/patients/start-registration`,
          {
            method: 'POST',
          },
        )
        const patient_id2 = $personal2.url.match(/patients\/(.*)\/open_encounter/)![1]

        const $this_visit2 = await receptionist.fetchCheerio(
          $personal2.url,
          {
            method: 'POST',
            body: asFormData(randomDemographics('ZA')),
          },
        )

        const $waiting_room2 = await receptionist.fetchCheerio(
          $this_visit2.url,
          {
            method: 'POST',
            body: asFormData({
              next_workflow: 'immediate_triage',
            }),
          },
        )

        const patient2 = await patients.getById(db, patient_id2)

        assertEquals(
          new URL($waiting_room2.url).searchParams.get('success'),
          `Please move ${patient2.names!.preferred_name} to Triage room 2. ${hardcoded_senior_health_care_professional_name} has been notified.`,
        )

        const $personal3 = await receptionist.fetchCheerio(
          `/app/organizations/${organization.id}/patients/start-registration`,
          {
            method: 'POST',
          },
        )
        const patient_id3 = $personal3.url.match(/patients\/(.*)\/open_encounter/)![1]

        const $this_visit3 = await receptionist.fetchCheerio(
          $personal3.url,
          {
            method: 'POST',
            body: asFormData(randomDemographics('ZA')),
          },
        )

        const $waiting_room3 = await receptionist.fetchCheerio(
          $this_visit3.url,
          {
            method: 'POST',
            body: asFormData({
              next_workflow: 'immediate_triage',
            }),
          },
        )

        const patient3 = await patients.getById(db, patient_id3)

        assertEquals(
          new URL($waiting_room3.url).searchParams.get('success'),
          `No rooms yet available for triage. Please stay with ${
            patient3.names!.preferred_name
          }. ${hardcoded_senior_health_care_professional_name} has been notified to come as soon as possible.`,
        )
      },
    )

    itParallel('can route immediately to triage as a nurse', async () => {
      const organization = await createTestOrganization(db)
      const { fetchCheerio, health_worker } = await addTestEmployeeWithSession(
        db,
        {
          profession: 'nurse',
          registration_status: 'approved',
          organization_id: organization.id,
        },
      )

      const nurse = await employees.getById(
        db,
        health_worker.employee_id,
      )
      const departments = employeeOrganizationDepartmentNames(nurse)
      assertEquals(departments, ['Primary care', 'Reception', 'Triage'])

      const $personal = await fetchCheerio(
        `/app/organizations/${organization.id}/patients/start-registration`,
        {
          method: 'POST',
        },
      )
      const patient_id = $personal.url.match(/patients\/(.*)\/open_encounter/)![1]

      const $this_visit = await fetchCheerio(
        $personal.url,
        {
          method: 'POST',
          body: asFormData(randomDemographics('ZA')),
        },
      )

      const $triage_warning_signs = await fetchCheerio(
        $this_visit.url,
        {
          method: 'POST',
          body: asFormData({
            next_workflow: 'immediate_triage',
          }),
        },
      )

      const triage_warning_signs_url = new URL($triage_warning_signs.url)
      assertEquals(
        triage_warning_signs_url.pathname,
        `/app/organizations/${organization.id}/patients/${patient_id}/open_encounter/triage/warning_signs`,
      )
    })
  },
)
