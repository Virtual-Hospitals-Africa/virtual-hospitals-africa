import { afterAll, afterEach, describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../../../../../../../db/db.ts'
import respond from '../../../../../../../../chatbot/respond.ts'
import * as google from '../../../../../../../../external-clients/google.ts'
import * as conversations from '../../../../../../../../db/models/conversations.ts'
import * as patients from '../../../../../../../../db/models/patients.ts'
import * as appointments from '../../../../../../../../db/models/appointments.ts'
import { getPatientLastConversationState } from '../../../../../../../../db/models/patient_chatbot_users.ts'
import { prettyAppointmentTime } from '../../../../../../../../util/date.ts'
import { declineOfferedTimes } from '../../../../../../../../db/models/appointments.ts'

import generateUUID from '../../../../../../../../util/uuid.ts'

import { Stub, stub } from 'std/testing/mock.ts'
import { GCalEvent } from '../../../../../../../../types.ts'
import randomPhoneNumber from '../../../../../../../../mocks/randomPhoneNumber.ts'
import { addTestEmployee } from '../../../../../../../_helpers/employees.ts'
import { mockWhatsApp } from '../../../../../../mockWhatsApp.ts'

describe.skip('patient chatbot', () => {
  afterAll(() => db.destroy())
  let insert_event: Stub
  afterEach(() => {
    if (insert_event) insert_event.restore()
  })

  it('provides with cancel_appointment_option after confirming another appointment', async () => {
    const phone_number = randomPhoneNumber('ZW')
    const patient_before = await patients.insert(db, {
      conversation_state: 'onboarded:make_appointment:other_scheduling_options',
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
    const first_time = new Date()
    first_time.setDate(first_time.getDate() + 1)
    first_time.setHours(9, 30, 0, 0)
    const end = new Date(first_time)
    end.setMinutes(end.getMinutes() + 30)
    const duration_minutes = 30
    const first_offered_time = await appointments.addOfferedTime(db, {
      patient_appointment_request_id: scheduling_appointment_request.id,
      provider_id: health_worker.employee_id,
      start: first_time,
      end,
      duration_minutes,
    })
    await declineOfferedTimes(db, [first_offered_time.id])

    const other_time = new Date(first_time)
    other_time.setHours(10, 0, 0, 0)
    const other_end = new Date(first_time)
    end.setMinutes(end.getMinutes() + 30)
    const other_duration_minutes = 30
    const second_offered_time = await appointments.addOfferedTime(db, {
      patient_appointment_request_id: scheduling_appointment_request.id,
      provider_id: health_worker.employee_id,
      start: other_time,
      end: other_end,
      duration_minutes: other_duration_minutes,
    })

    await conversations.insertMessageReceived(db, {
      chatbot_name: 'patient',
      received_by_phone_number: '263XXXXXX',
      sent_by_phone_number: phone_number,
      has_media: false,
      body: String(second_offered_time.id),
      media_id: null,
      whatsapp_id: `wamid.${generateUUID()}`,
    })

    const whatsapp = mockWhatsApp()

    insert_event = stub(
      google.GoogleClient.prototype,
      'insert_event',
      () =>
        Promise.resolve(
          { id: 'insertEvent_id' } as GCalEvent,
        ),
    )

    await respond(whatsapp, 'patient', phone_number)
    assertEquals(whatsapp.sendMessages.calls[0].args, [
      {
        chatbot_name: 'patient',
        messages: {
          message_body:
            `We notified ${health_worker.name} and will message you shortly upon confirmirmation of your appointment at ` +
            prettyAppointmentTime(other_time),
          type: 'buttons',
          buttonText: 'Menu',
          options: [{ id: 'cancel', title: 'Cancel Appointment' }],
        },
        phone_number,
      },
    ])
    const patient = await getPatientLastConversationState(db, {
      phone_number,
    })

    assert(patient)
    assertEquals(
      patient.conversation_state,
      'onboarded:appointment_scheduled',
    )
  })
})
