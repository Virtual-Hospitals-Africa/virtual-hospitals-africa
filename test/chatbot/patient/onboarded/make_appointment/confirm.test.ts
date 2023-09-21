import { afterEach, beforeEach, describe, it } from 'std/testing/bdd.ts'
import { assert, assertEquals } from 'std/testing/asserts.ts'
import sinon from 'npm:sinon'
import { resetInTest } from '../../../../../db/reset.ts'
import db from '../../../../../db/db.ts'
import respond from '../../../../../chatbot/respond.ts'
import * as google from '../../../../../external-clients/google.ts'
import * as conversations from '../../../../../db/models/conversations.ts'
import * as health_workers from '../../../../../db/models/health_workers.ts'
import * as patients from '../../../../../db/models/patients.ts'
import * as appointments from '../../../../../db/models/appointments.ts'
import {
  formatHarare,
  prettyAppointmentTime,
} from '../../../../../util/date.ts'

describe('patient chatbot', () => {
  beforeEach(resetInTest)
  afterEach(() => db.destroy())
  // deno-lint-ignore no-explicit-any
  let getFreeBusy: any
  beforeEach(() => {
    getFreeBusy = sinon.stub(google.GoogleClient.prototype, 'getFreeBusy')
  })
  afterEach(() => {
    getFreeBusy.restore()
  })

  const phone_number = '00000000'
  it('provides with first_scheduling_option details after confirming details', async () => {
    const patientBefore = await patients.upsert(db, {
      conversation_state: 'onboarded:make_appointment:confirm_details',
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

    // Insert google calender
    const currentTime = new Date()
    currentTime.setHours(currentTime.getHours() + 2)
    const timeMin = formatHarare(currentTime) // current + 2 hours

    currentTime.setDate(currentTime.getDate() + 7)
    const timeMax = formatHarare(currentTime) // current + 7 days + 2 hours

    currentTime.setDate(currentTime.getDate() - 6)
    currentTime.setHours(currentTime.getHours() + 1)
    currentTime.setMinutes(0)
    const secondDayStart = formatHarare(currentTime) // current + 1 day + 3 hours

    currentTime.setHours(currentTime.getHours())
    currentTime.setMinutes(30)
    const secondDayBusyTime = formatHarare(currentTime) // current + 1 day + 3.5 hours

    currentTime.setHours(currentTime.getHours() + 8)
    currentTime.setMinutes(0)
    const secondDayEnd = formatHarare(currentTime) // current + 1 day + 11 hours ==> secondDayStart + 8 hours

    getFreeBusy.resolves(
      {
        kind: 'calendar#freeBusy',
        timeMin: timeMin,
        timeMax: timeMax,
        calendars: {
          'gcal_appointments_calendar_id': {
            busy: [
              {
                start: secondDayStart,
                end: secondDayBusyTime,
              },
            ],
          },
          'gcal_availability_calendar_id': {
            busy: [
              {
                start: secondDayStart,
                end: secondDayEnd,
              },
            ],
          },
        },
      },
    )

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

    await respond(fakeWhatsApp)
    assertEquals(fakeWhatsApp.sendMessages.firstCall.args, [
      {
        messages: {
          messageBody: 'Great, the next available appoinment is ' +
            prettyAppointmentTime(secondDayBusyTime) +
            '. Would you like to schedule this appointment?',
          type: 'buttons',
          buttonText: 'Menu',
          options: [
            { id: 'confirm', title: 'Yes' },
            { id: 'other_times', title: 'Other times' },
            { id: 'go_back', title: 'Go back' },
          ],
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
      'onboarded:make_appointment:first_scheduling_option',
    )
  })
})
