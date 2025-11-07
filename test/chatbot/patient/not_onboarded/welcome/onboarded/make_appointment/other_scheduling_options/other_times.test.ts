import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  it,
} from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../../../../../../../db/db.ts'
import respond from '../../../../../../../../chatbot/respond.ts'
import * as google from '../../../../../../../../external-clients/google.ts'
import * as conversations from '../../../../../../../../db/models/conversations.ts'
import * as patients from '../../../../../../../../db/models/patients.ts'
import * as appointments from '../../../../../../../../db/models/appointments.ts'
import { getPatientLastConversationState } from '../../../../../../../../db/models/patient_chatbot_users.ts'
import {
  convertToTimeString,
  formatJohannesburg,
} from '../../../../../../../../util/date.ts'
import generateUUID from '../../../../../../../../util/uuid.ts'

import { resetInTest } from '../../../../../../../../db/meta.ts'

import { Stub, stub } from 'std/testing/mock.ts'
import { GCalEvent } from '../../../../../../../../types.ts'
import randomPhoneNumber from '../../../../../../../../mocks/randomPhoneNumber.ts'
import { addTestEmployee } from '../../../../../../../_helpers/employees.ts'
import { mockWhatsApp } from '../../../../../../mockWhatsApp.ts'

describe.skip('patient chatbot', () => {
  afterAll(() => db.destroy())
  beforeEach(resetInTest)
  let getFreeBusy: Stub
  let insertEvent: Stub
  afterEach(() => {
    if (getFreeBusy) getFreeBusy.restore()
    if (insertEvent) insertEvent.restore()
  })

  it('provides with other_appointment_times after choosing other_time_option', async () => {
    const trx = db

    const phone_number = randomPhoneNumber('ZW')
    const patient_before = await patients.insert(trx, {
      conversation_state: 'onboarded:make_appointment:other_scheduling_options',
      phone_number,
      name: 'Test Patient',
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

    const health_worker = await addTestEmployee(trx, { profession: 'doctor' })
    assert(health_worker)

    //  Insert google calender
    const current_time = new Date()
    currentTime.setHours(currentTime.getHours() + 2)
    const time_min = formatJohannesburg(currentTime) // current + 2 hours

    currentTime.setDate(currentTime.getDate() + 7)
    const time_max = formatJohannesburg(currentTime) // current + 7 days + 2 hours

    currentTime.setDate(currentTime.getDate() - 6)
    currentTime.setHours(currentTime.getHours() + 1)
    currentTime.setMinutes(0)
    currentTime.setSeconds(0)
    currentTime.setMilliseconds(0)
    const second_day_start = formatJohannesburg(currentTime) // current + 1 day + 3 hours

    currentTime.setHours(currentTime.getHours())
    currentTime.setMinutes(30)
    const second_day_busy_time = formatJohannesburg(currentTime) // current + 1 day + 3.5 hours

    const first_other_time = new Date(currentTime)
    firstOtherTime.setHours(firstOtherTime.getHours() + 1)
    firstOtherTime.setMinutes(0) // current + 1 day + 4.5 hours

    currentTime.setHours(currentTime.getHours() + 8)
    currentTime.setMinutes(0)
    const second_day_end = formatJohannesburg(currentTime) // current + 1 day + 11 hours ==> secondDayStart + 8 hour

    getFreeBusy = stub(
      google.GoogleClient.prototype,
      'getFreeBusy',
      () =>
        Promise.resolve(
          {
            kind: 'calendar#freeBusy' as const,
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
        ),
    )

    // Insert previous offered time
    const start = new Date(secondDayBusyTime)
    const end = new Date()
    end.setHours(start.getHours() + 1)
    const duration_minutes = 60

    await appointments.addOfferedTime(trx, {
      patient_appointment_request_id: scheduling_appointment_request.id,
      provider_id: health_worker.employee_id,
      start,
      end,
      duration_minutes,
    })

    await conversations.insertMessageReceived(trx, {
      chatbot_name: 'patient',
      received_by_phone_number: '263XXXXXX',
      sent_by_phone_number: phone_number,
      has_media: false,
      body: 'other_time',
      media_id: null,
      whatsapp_id: `wamid.${generateUUID()}`,
    })

    const whatsapp = mockWhatsApp()

    insertEvent = stub(
      google.GoogleClient.prototype,
      'insertEvent',
      () =>
        Promise.resolve(
          { id: 'insertEvent_id' } as GCalEvent,
        ),
    )

    await respond(whatsapp, 'patient', phone_number)

    const message = whatsapp.sendMessages.calls[0].args[0].messages

    assert(!Array.isArray(message))
    assertEquals(
      message.messageBody,
      'OK here are the other available time, please choose from the list.',
    )
    assert(message.type === 'list')
    assertEquals(message.headerText, 'Other Appointment Times')
    assertEquals(message.action.button, 'More Time Slots')

    const date = formatJohannesburg(firstOtherTime).substring(0, 10)

    assertEquals(message.action.sections[0].title, date)
    const time = convertToTimeString(formatJohannesburg(firstOtherTime))
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

    const patient = await getPatientLastConversationState(trx, {
      phone_number,
    })

    assert(patient)
    assertEquals(
      patient.conversation_state,
      'onboarded:make_appointment:other_scheduling_options',
    )
  })
})
