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
import { convertToTimeString, formatHarare } from '../../../util/date.ts'

describe('patient chatbot', () => {
  beforeEach(resetInTest)
  afterEach(() => db.destroy())

  let getFreeBusy: any
  beforeEach(() => {
    getFreeBusy = sinon.stub(google.GoogleClient.prototype, 'getFreeBusy')
  })
  afterEach(() => {
    getFreeBusy.restore()
  })

  let insertEvent: any
  beforeEach(() => {
    insertEvent = sinon.stub(google.GoogleClient.prototype, 'insertEvent')
  })
  afterEach(() => {
    insertEvent.restore()
  })

  it('provides with other_appointment_times after choosing other_time_option', async () => {
    await patients.upsert(db, {
      conversation_state: 'onboarded:make_appointment:other_scheduling_options',
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

    const health_worker = await health_workers.getByEmail(db, 'test@doctor.com')

    assert(health_worker)

    //  Insert google calender
    const currentTime = new Date()
    currentTime.setHours(currentTime.getHours() + 2)
    const timeMin = formatHarare(currentTime) // current + 2 hours

    currentTime.setDate(currentTime.getDate() + 7)
    const timeMax = formatHarare(currentTime) // current + 7 days + 2 hours

    currentTime.setDate(currentTime.getDate() - 6)
    currentTime.setHours(currentTime.getHours() + 1)
    currentTime.setMinutes(0)
    currentTime.setSeconds(0)
    currentTime.setMilliseconds(0)
    const secondDayStart = formatHarare(currentTime) // current + 1 day + 3 hours

    currentTime.setHours(currentTime.getHours())
    currentTime.setMinutes(30)
    const secondDayBusyTime = formatHarare(currentTime) // current + 1 day + 3.5 hours

    const firstOtherTime = new Date(currentTime)
    firstOtherTime.setHours(firstOtherTime.getHours() + 1)
    firstOtherTime.setMinutes(0) // current + 1 day + 4.5 hours

    currentTime.setHours(currentTime.getHours() + 8)
    currentTime.setMinutes(0)
    const secondDayEnd = formatHarare(currentTime) // current + 1 day + 11 hours ==> secondDayStart + 8 hour

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

    // Insert previous offered time
    const start = new Date(secondDayBusyTime)
    await appointments.addOfferedTime(db, {
      patient_appointment_request_id: scheduling_appointment_request.id,
      health_worker_id: health_worker.id,
      start: start,
    })

    await conversations.insertMessageReceived(db, {
      patient_phone_number: '00000000',
      has_media: false,
      body: 'other_time',
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

    const message = fakeWhatsApp.sendMessages.firstCall.args[0].messages

    assertEquals(
      message.messageBody,
      'OK here are the other available time, please choose from the list.',
    )
    assertEquals(message.type, 'list')
    assertEquals(message.headerText, 'Other Appointment Times')
    assertEquals(message.action.button, 'More Time Slots')

    const date = formatHarare(firstOtherTime).substring(0, 10)
    assertEquals(message.action.sections[0].title, date)
    const time = convertToTimeString(formatHarare(firstOtherTime))
    assertEquals(message.action.sections[0].rows[0].title, time)

    assertEquals(
      message.action.sections[0].rows[0].description,
      'With Dr. Test Doctor',
    )

    assertEquals(message.action.sections[message.action.sections.length - 1], {
      title: 'Other Times',
      rows: [
        {
          id: 'other_time',
          title: 'Other time slots',
          description: 'Show other time slots',
        },
      ],
    })

    const patient = await patients.getByPhoneNumber(db, {
      phone_number: '00000000',
    })

    assert(patient)
    assertEquals(
      patient.conversation_state,
      'onboarded:make_appointment:other_scheduling_options',
    )
  })
})
