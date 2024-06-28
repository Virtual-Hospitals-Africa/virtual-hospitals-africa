import { afterEach, beforeEach, describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import sinon from 'sinon'
import db from '../../../../../../../../db/db.ts'
import respond from '../../../../../../../../chatbot/respond.ts'
import * as google from '../../../../../../../../external-clients/google.ts'
import * as conversations from '../../../../../../../../db/models/conversations.ts'
import * as patients from '../../../../../../../../db/models/patients.ts'
import * as appointments from '../../../../../../../../db/models/appointments.ts'
import { prettyAppointmentTime } from '../../../../../../../../util/date.ts'
import { declineOfferedTimes } from '../../../../../../../../db/models/appointments.ts'
import { randomPhoneNumber } from '../../../../../../../mocks.ts'
import generateUUID from '../../../../../../../../util/uuid.ts'
import { addTestHealthWorker } from '../../../../../../../web/utilities.ts'

describe('patient chatbot', { sanitizeResources: false }, () => {
  // deno-lint-ignore no-explicit-any
  let insertEvent: any
  beforeEach(() => {
    insertEvent = sinon.stub(google.GoogleClient.prototype, 'insertEvent')
  })
  afterEach(() => {
    insertEvent.restore()
  })

  it('provides with cancel_appointment_option after confirming another appointment', async () => {
    const phone_number = randomPhoneNumber()
    const patientBefore = await patients.upsert(db, {
      conversation_state: 'onboarded:make_appointment:other_scheduling_options',
      phone_number,
      name: 'test',
      gender: 'female',
      date_of_birth: '2023-01-01',
      national_id_number: null,
    })

    // Insert patient_appointment_requests
    assert(patientBefore)
    const scheduling_appointment_request = await appointments
      .createNewRequest(db, {
        patient_id: patientBefore.id,
      })
    await appointments.upsertRequest(db, {
      id: scheduling_appointment_request.id,
      patient_id: patientBefore.id,
      reason: 'pain',
    })

    const health_worker = await addTestHealthWorker(db, { scenario: 'doctor' })

    assert(health_worker)

    // Insert offered time
    const firstTime = new Date()
    firstTime.setDate(firstTime.getDate() + 1)
    firstTime.setHours(9, 30, 0, 0)
    const firstOfferedTime = await appointments.addOfferedTime(db, {
      patient_appointment_request_id: scheduling_appointment_request.id,
      provider_id: health_worker.employee_id!,
      start: firstTime,
    })
    await declineOfferedTimes(db, [firstOfferedTime.id])

    const otherTime = new Date(firstTime)
    otherTime.setHours(10, 0, 0, 0)
    const secondOfferedTime = await appointments.addOfferedTime(db, {
      patient_appointment_request_id: scheduling_appointment_request.id,
      provider_id: health_worker.employee_id!,
      start: otherTime,
    })

    await conversations.insertMessageReceived(db, {
      chatbot_name: 'patient',
      received_by_phone_number: '263XXXXXX',
      sent_by_phone_number: phone_number,
      has_media: false,
      body: String(secondOfferedTime.id),
      media_id: null,
      whatsapp_id: `wamid.${generateUUID()}`,
    })

    const fakeWhatsApp = {
      phone_number: '263XXXXXX',
      sendMessage: sinon.stub().throws(),
      sendMessages: sinon.stub().resolves([{
        messages: [{
          id: `wamid.${generateUUID()}`,
        }],
      }]),
    }

    insertEvent.resolves(
      { id: 'insertEvent_id' },
    )

    await respond(fakeWhatsApp, 'patient', phone_number)
    assertEquals(fakeWhatsApp.sendMessages.firstCall.args, [
      {
        messages: {
          messageBody:
            `Thanks test, we notified ${health_worker.name} and will message you shortly upon confirmirmation of your appointment at ` +
            prettyAppointmentTime(otherTime),
          type: 'buttons',
          buttonText: 'Menu',
          options: [{ id: 'cancel', title: 'Cancel Appointment' }],
        },
        phone_number,
      },
    ])
    const patient = await patients.getLastConversationState(db, {
      phone_number,
    })

    assert(patient)
    assertEquals(
      patient.conversation_state,
      'onboarded:appointment_scheduled',
    )
  })
})
