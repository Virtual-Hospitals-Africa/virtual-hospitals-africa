import { afterEach, beforeEach, describe, it } from '$std/testing/bdd.ts'
import { assert } from '$std/assert/assert.ts'
import { assertEquals } from '$std/assert/assert_equals.ts'
import sinon from 'npm:sinon'
import { resetInTest } from '../../../../../../../../db/reset.ts'
import db from '../../../../../../../../db/db.ts'
import respond from '../../../../../../../../chatbot/respond.ts'
import * as google from '../../../../../../../../external-clients/google.ts'
import * as conversations from '../../../../../../../../db/models/conversations.ts'
import * as health_workers from '../../../../../../../../db/models/health_workers.ts'
import * as patients from '../../../../../../../../db/models/patients.ts'
import * as appointments from '../../../../../../../../db/models/appointments.ts'
import { prettyAppointmentTime } from '../../../../../../../../util/date.ts'

describe('patient chatbot', () => {
  beforeEach(resetInTest)
  afterEach(() => db.destroy())
  // deno-lint-ignore no-explicit-any
  let insertEvent: any
  beforeEach(() => {
    insertEvent = sinon.stub(google.GoogleClient.prototype, 'insertEvent')
  })
  afterEach(() => {
    insertEvent.restore()
  })

  const phone_number = '00000000'
  it('provides with cancel_appointment_option after confirmirmation of a appointment', async () => {
    const patientBefore = await patients.upsert(db, {
      conversation_state: 'onboarded:make_appointment:first_scheduling_option',
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

    // Insert health worker
    const expires_at = new Date()
    expires_at.setSeconds(expires_at.getSeconds() + 3600000)

    const health_worker = await health_workers.upsertWithGoogleCredentials(db, {
      name: 'Test Doctor',
      email: 'test@doctor.com',
      avatar_url: 'https://placekitten/200/200',
      phone_number: '129010920192',
      gcal_appointments_calendar_id: 'gcal_appointments_calendar_id',
      gcal_availability_calendar_id: 'gcal_availability_calendar_id',
      access_token: 'test:access_token',
      refresh_token: 'test:refresh_token',
      expires_at,
    })

    assert(health_worker)

    // Insert offered time
    const time = new Date()
    time.setDate(time.getDate() + 1)
    time.setHours(9, 30, 0, 0)
    await appointments.addOfferedTime(db, {
      patient_appointment_request_id: scheduling_appointment_request.id,
      health_worker_id: health_worker.id,
      start: time,
    })

    await conversations.insertMessageReceived(db, {
      patient_phone_number: phone_number,
      has_media: false,
      body: 'confirm',
      media_id: null,
      whatsapp_id: 'whatsapp_id_one',
    })

    const fakeWhatsApp = {
      sendMessage: sinon.stub().throws(),
      sendMessages: sinon.stub().resolves([{
        messages: [{
          id: 'wamid.1234',
        }],
      }]),
    }

    insertEvent.resolves(
      { id: 'insertEvent_id' },
    )

    await respond(fakeWhatsApp)
    assertEquals(fakeWhatsApp.sendMessages.firstCall.args, [
      {
        messages: {
          messageBody:
            'Thanks test, we notified Test Doctor and will message you shortly upon confirmirmation of your appointment at ' +
            prettyAppointmentTime(time),
          type: 'buttons',
          buttonText: 'Menu',
          options: [{ id: 'cancel', title: 'Cancel Appointment' }],
        },
        phone_number,
      },
    ])
    const patient = await patients.getByPhoneNumber(db, {
      phone_number,
    })

    assert(patient)
    assertEquals(
      patient.conversation_state,
      'onboarded:appointment_scheduled',
    )
  })
})
