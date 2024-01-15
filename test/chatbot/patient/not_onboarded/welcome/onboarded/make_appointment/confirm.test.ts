import { afterEach, beforeEach, describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import sinon from 'npm:sinon'
import db from '../../../../../../../db/db.ts'
import respond from '../../../../../../../chatbot/respond.ts'
import * as google from '../../../../../../../external-clients/google.ts'
import * as conversations from '../../../../../../../db/models/conversations.ts'
import * as patients from '../../../../../../../db/models/patients.ts'
import * as appointments from '../../../../../../../db/models/appointments.ts'
import {
  formatHarare,
  prettyAppointmentTime,
} from '../../../../../../../util/date.ts'
import { randomPhoneNumber } from '../../../../../../mocks.ts'
import generateUUID from '../../../../../../../util/uuid.ts'
import { addTestHealthWorker } from '../../../../../../web/utilities.ts'
import { resetInTest } from '../../../../../../../db/meta.ts'

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
  it('provides with first_scheduling_option details after confirming details', async () => {
    const phone_number = randomPhoneNumber()
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

    const health_worker = await addTestHealthWorker(db)

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
          [health_worker.gcal_appointments_calendar_id]: {
            busy: [
              {
                start: secondDayStart,
                end: secondDayBusyTime,
              },
            ],
          },
          [health_worker.gcal_availability_calendar_id]: {
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

    await respond(fakeWhatsApp, phone_number)
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
