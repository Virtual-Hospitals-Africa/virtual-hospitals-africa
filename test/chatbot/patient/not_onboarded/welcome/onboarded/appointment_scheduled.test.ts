import { afterAll, describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../../../../../db/db.ts'
import respond from '../../../../../../chatbot/respond.ts'
import { conversations } from '../../../../../../db/models/conversations.ts'
import { patients } from '../../../../../../db/models/patients.ts'
import { appointments } from '../../../../../../db/models/appointments.ts'
import { patient_chatbot_users } from '../../../../../../db/models/patient_chatbot_users.ts'
import generateUUID from '../../../../../../util/uuid.ts'
import randomPhoneNumber from '../../../../../../mocks/randomPhoneNumber.ts'
import { addTestEmployee } from '../../../../../_helpers/employees.ts'
import { mockWhatsApp } from 'test/_helpers/mockWhatsApp.ts'
import { getRequestsToGoogle } from '../../../../../../external-clients/google.ts'

describe('patient chatbot', () => {
  afterAll(() => db.destroy())
  it(
    'comes back to main menu after cancelling appointment',
    async () => {
      const phone_number = randomPhoneNumber('ZW')
      const patient_before = await patients.insert(db, {
        conversation_state: 'onboarded:appointment_scheduled',
        phone_number,
        name: 'Test Patient',
        gender: 'female',
        date_of_birth: '2023-01-01',
        national_id_number: null,
      })

      // Insert patient_appointment_requests
      assert(patient_before)
      const scheduling_appointment_request = await appointments
        .createNewRequest(db, {
          patient_id: patient_before.id,
        })
      await appointments.upsertRequest(db, {
        id: scheduling_appointment_request.id,
        patient_id: patient_before.id,
        reason: 'pain',
      })

      const health_worker = await addTestEmployee(db, { profession: 'doctor' })

      assert(health_worker)

      // Insert offered time
      const start = new Date()
      start.setDate(start.getDate() + 1)
      start.setHours(9, 30, 0, 0)
      const end = new Date(start)
      end.setHours(end.getHours() + 1)
      const duration_minutes = 60

      const offered_time = await appointments.addOfferedTime(db, {
        patient_appointment_request_id: scheduling_appointment_request.id,
        provider_id: health_worker.employee_id,
        start,
        end,
        duration_minutes,
      })

      const gcal_event_id = 'insertEvent_id'

      // Insert scheduled appointment
      const appointment = await appointments.schedule(db, {
        appointment_offered_time_id: offered_time.id,
        gcal_event_id,
      })

      await conversations.insertMessageReceived(db, {
        chatbot_name: 'patient',
        received_by_phone_number: '263XXXXXX',
        sent_by_phone_number: phone_number,
        has_media: false,
        body: 'cancel',
        media_id: null,
        whatsapp_id: `wamid.${generateUUID()}`,
      })

      const whatsapp = mockWhatsApp()

      await respond(whatsapp, 'patient', phone_number)
      assertEquals(whatsapp.sendMessages.calls[0].args, [
        {
          chatbot_name: 'patient',
          messages: {
            message_body:
              'Your appointment has been cancelled. What can I help you with today?',
            type: 'buttons',
            buttonText: 'Menu',
            options: [
              { id: 'make_appointment', title: 'Make Appointment' },
              { id: 'find_nearest_facilities', title: 'Nearest Organization' },
            ],
          },
          phone_number,
        },
      ])
      const patient = await patient_chatbot_users
        .getPatientLastConversationState(db, {
          phone_number,
        })

      assert(patient)
      assertEquals(
        patient.conversation_state,
        'onboarded:appointment_cancelled',
      )

      const appointments_after_cancellation = await appointments
        .getWithPatientInfo(db, {
          id: appointment.id,
          health_worker_id: health_worker.id,
        })
      assertEquals(appointments_after_cancellation.length, 0)
      const requests_to_google = getRequestsToGoogle()
      assertEquals(requests_to_google, [
        [
          `/calendar/v3/calendars/${health_worker.calendars.gcal_appointments_calendar_id}/events/${gcal_event_id}`,
          {
            'method': 'delete',
          },
        ],
      ])
    },
  )
})
