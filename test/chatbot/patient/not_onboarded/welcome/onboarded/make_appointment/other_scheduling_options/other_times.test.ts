import { afterAll, afterEach, beforeEach, describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../../../../../../../db/db.ts'
import respond from '../../../../../../../../chatbot/respond.ts'
import * as google from '../../../../../../../../external-clients/google.ts'
import { conversations } from '../../../../../../../../db/models/conversations.ts'
import { patients } from '../../../../../../../../db/models/patients.ts'
import { appointments } from '../../../../../../../../db/models/appointments.ts'
import { patient_chatbot_users } from '../../../../../../../../db/models/patient_chatbot_users.ts'
import { convertToTimeString, formatJohannesburg } from '../../../../../../../../util/date.ts'
import generateUUID from '../../../../../../../../util/uuid.ts'

import { resetInTest } from '../../../../../../../../db/meta.ts'

import { Stub, stub } from 'std/testing/mock.ts'
import { GCalEvent } from '../../../../../../../../types.ts'
import randomPhoneNumber from '../../../../../../../../mocks/randomPhoneNumber.ts'
import { addTestEmployee } from '../../../../../../../_helpers/employees.ts'
import { mockWhatsApp } from 'test/_helpers/mockWhatsApp.ts'

describe.skip('patient chatbot', () => {
  afterAll(() => db.destroy())
  beforeEach(resetInTest)
  let getFreeBusy: Stub
  let insertEvent: Stub
  afterEach(() => {
    if (getFreeBusy) getFreeBusy.restore()
    if (insertEvent) insertEvent.restore()
  })

  it(
    'provides with other_appointment_times after choosing other_time_option',
    async () => {
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

      await patients.update(db, {
        id: patient_before.id,
        location: {
          latitude: -19.4554096,
          longitude: 29.7739353,
        },
      })

      const scheduling_appointment_request = await appointments
        .createNewRequest(trx, {
          patient_id: patient_before.id,
        })

      await appointments.upsertRequest(trx, {
        id: scheduling_appointment_request.id,
        patient_id: patient_before.id,
        reason: 'pain',
      })

      const health_worker = await addTestEmployee(trx, { role: 'doctor' })
      assert(health_worker)

      //  Insert google calender
      const current_time = new Date()
      current_time.setHours(current_time.getHours() + 2)
      const time_min = formatJohannesburg(current_time) // current + 2 hours

      current_time.setDate(current_time.getDate() + 7)
      const time_max = formatJohannesburg(current_time) // current + 7 days + 2 hours

      current_time.setDate(current_time.getDate() - 6)
      current_time.setHours(current_time.getHours() + 1)
      current_time.setMinutes(0)
      current_time.setSeconds(0)
      current_time.setMilliseconds(0)
      const second_day_start = formatJohannesburg(current_time) // current + 1 day + 3 hours

      current_time.setHours(current_time.getHours())
      current_time.setMinutes(30)
      const second_day_busy_time = formatJohannesburg(current_time) // current + 1 day + 3.5 hours

      const first_other_time = new Date(current_time)
      first_other_time.setHours(first_other_time.getHours() + 1)
      first_other_time.setMinutes(0) // current + 1 day + 4.5 hours

      current_time.setHours(current_time.getHours() + 8)
      current_time.setMinutes(0)
      const second_day_end = formatJohannesburg(current_time) // current + 1 day + 11 hours ==> second_day_start + 8 hour

      getFreeBusy = stub(
        google.GoogleClient.prototype,
        'getFreeBusy',
        () =>
          Promise.resolve(
            {
              kind: 'calendar#free_busy' as const,
              time_min: time_min,
              time_max: time_max,
              calendars: {
                [health_worker.calendars!.gcal_appointments_calendar_id]: {
                  busy: [
                    {
                      start: second_day_start,
                      end: second_day_busy_time,
                    },
                  ],
                },
                [health_worker.calendars!.gcal_availability_calendar_id]: {
                  busy: [
                    {
                      start: second_day_start,
                      end: second_day_end,
                    },
                  ],
                },
              },
            },
          ),
      )

      // Insert previous offered time
      const start = new Date(second_day_busy_time)
      const end = new Date()
      end.setHours(start.getHours() + 1)
      const duration_minutes = 60

      await appointments.addOfferedTime(trx, {
        patient_appointment_request_id: scheduling_appointment_request.id,
        employee_id: health_worker.employee_id,
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
        message.message_body,
        'OK here are the other available time, please choose from the list.',
      )
      assert(message.type === 'list')
      assertEquals(message.headerText, 'Other Appointment Times')
      assertEquals(message.action.button, 'More Time Slots')

      const date = formatJohannesburg(first_other_time).substring(0, 10)

      assertEquals(message.action.sections[0].title, date)
      const time = convertToTimeString(formatJohannesburg(first_other_time))
      assertEquals(message.action.sections[0].rows[0].title, time)

      assertEquals(
        message.action.sections[0].rows[0].description,
        `With Dr. ${health_worker.name}`,
      )

      assertEquals(
        message.action.sections[message.action.sections.length - 1],
        {
          title: 'Other Times',
          rows: [
            {
              id: 'other_time',
              title: 'Other time slots',
              description: 'Show other time slots',
            },
          ],
        },
      )

      const patient = await patient_chatbot_users
        .getPatientLastConversationState(trx, {
          phone_number,
        })

      assert(patient)
      assertEquals(
        patient.conversation_state,
        'onboarded:make_appointment:other_scheduling_options',
      )
    },
  )
})
