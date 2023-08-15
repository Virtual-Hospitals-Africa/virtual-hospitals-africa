import { afterEach, beforeEach, describe, it } from 'std/testing/bdd.ts'
import { assert, assertEquals } from 'std/testing/asserts.ts'
import sinon from 'npm:sinon'
import { resetInTest } from '../../../db/reset.ts'
import db from '../../../db/db.ts'
import respond from '../../../chatbot/respond.ts'
import * as google from '../../../external-clients/google.ts'
import * as conversations from '../../../db/models/conversations.ts'
import * as health_workers from '../../../db/models/health_workers.ts'
import * as patients from '../../../db/models/patients.ts'
import * as appointments from '../../../db/models/appointments.ts'
import { prettyAppointmentTime } from '../../../util/date.ts'

describe('patient chatbot', () => {
  beforeEach(resetInTest)
  afterEach(() => db.destroy())

  it('comes back to main menu after cancelling appointment', async () => {
    await patients.upsert(db, {
      conversation_state: 'onboarded:appointment_scheduled',
      phone_number: '00000000',
      name: 'test',
      gender: 'female',
      date_of_birth: '2023-01-01',
      national_id_number: null,
    })

    // Insert patient_appointment_requests
    const patientBefore = await patients.getByPhoneNumber(db, {
      phone_number: '00000000',
    })

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

    // Insert health worker and offered time
    const expires_at = new Date()
    expires_at.setSeconds(expires_at.getSeconds() + 3600000)

    await health_workers.upsertWithGoogleCredentials(db, {
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

    const health_worker = await health_workers.getByEmail(db, 'test@doctor.com')

    assert(health_worker)

    const time = new Date()
    time.setDate(time.getDate() + 1)
    time.setHours(9, 30, 0, 0)
    const offeredTime = await appointments.addOfferedTime(db, {
      patient_appointment_request_id: scheduling_appointment_request.id,
      health_worker_id: health_worker.id,
      start: time,
    })

    // Insert scheduled appointment
    await appointments.schedule(db, {
      appointment_offered_time_id: offeredTime.id,
      gcal_event_id: 'insertEvent_id',
    })

    await conversations.insertMessageReceived(db, {
      patient_phone_number: '00000000',
      has_media: false,
      body: 'cancel',
      media_id: null,
      whatsapp_id: 'whatsapp_id',
    })

    const fakeWhatsApp = {
      sendMessage: sinon.stub().throws(),
      sendMessages: sinon.stub().resolves([{
        messages: [{
          id: 'wamid.1234',
        }],
      }]),
    }

    await respond(fakeWhatsApp)
    console.log(fakeWhatsApp.sendMessages.firstCall.args)
    assertEquals(fakeWhatsApp.sendMessages.firstCall.args, [
      {
        messages: {
          messageBody:
            'Your appoinment has been cancelled. What can I help you with today?',
          type: 'buttons',
          buttonText: 'Menu',
          options: [
            { id: 'make_appointment', title: 'Make Appointment' },
            { id: 'find_nearest_facility', title: 'Nearest Facility' },
          ],
        },
        phone_number: '00000000',
      },
    ])
    const patient = await patients.getByPhoneNumber(db, {
      phone_number: '00000000',
    })

    assert(patient)
    assertEquals(
      patient.conversation_state,
      'onboarded:cancel_appointment',
    )
  })
})
