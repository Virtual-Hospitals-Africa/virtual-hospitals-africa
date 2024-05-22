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
import {
  convertToTimeString,
  formatHarare,
} from '../../../../../../../../util/date.ts'
import generateUUID from '../../../../../../../../util/uuid.ts'
import { randomPhoneNumber } from '../../../../../../../mocks.ts'
import { addTestHealthWorker } from '../../../../../../../web/utilities.ts'
import { resetInTest } from '../../../../../../../../db/meta.ts'

describe('patient chatbot', { sanitizeResources: false }, () => {
  beforeEach(resetInTest)
  // deno-lint-ignore no-explicit-any
  let getFreeBusy: any
  beforeEach(() => {
    getFreeBusy = sinon.stub(google.GoogleClient.prototype, 'getFreeBusy')
  })
  afterEach(() => {
    getFreeBusy.restore()
  })

  // deno-lint-ignore no-explicit-any
  let insertEvent: any
  beforeEach(() => {
    insertEvent = sinon.stub(google.GoogleClient.prototype, 'insertEvent')
  })
  afterEach(() => {
    insertEvent.restore()
  })

  it('provides with other_appointment_times after choosing other_time_option', async () => {
    const trx = db

    const phone_number = randomPhoneNumber()
    const patientBefore = await patients.upsert(trx, {
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
      .createNewRequest(trx, {
        patient_id: patientBefore.id,
      })
    await appointments.upsertRequest(trx, {
      id: scheduling_appointment_request.id,
      patient_id: patientBefore.id,
      reason: 'pain',
    })

    const health_worker = await addTestHealthWorker(trx, { scenario: 'doctor' })
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
          [health_worker.calendars!.gcal_appointments_calendar_id]: {
            busy: [
              {
                start: secondDayStart,
                end: secondDayBusyTime,
              },
            ],
          },
          [health_worker.calendars!.gcal_availability_calendar_id]: {
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
    await appointments.addOfferedTime(trx, {
      patient_appointment_request_id: scheduling_appointment_request.id,
      provider_id: health_worker.employee_id!,
      start: start,
    })

    await conversations.insertMessageReceived(trx, {
      patient_phone_number: phone_number,
      has_media: false,
      body: 'other_time',
      media_id: null,
      whatsapp_id: `wamid.${generateUUID()}`,
    })

    const fakeWhatsApp = {
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
      `With Dr. ${health_worker.name}`,
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

    const patient = await patients.getByPhoneNumber(trx, {
      phone_number,
    })

    assert(patient)
    assertEquals(
      patient.conversation_state,
      'onboarded:make_appointment:other_scheduling_options',
    )
  })
})
