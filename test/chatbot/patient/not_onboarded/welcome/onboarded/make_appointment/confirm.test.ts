import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  it,
} from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../../../../../../db/db.ts'
import respond from '../../../../../../../chatbot/respond.ts'
import * as google from '../../../../../../../external-clients/google.ts'
import * as conversations from '../../../../../../../db/models/conversations.ts'
import * as patients from '../../../../../../../db/models/patients.ts'
import * as appointments from '../../../../../../../db/models/appointments.ts'
import { getPatientLastConversationState } from '../../../../../../../db/models/patient_chatbot_users.ts'
import {
  formatJohannesburg,
  prettyAppointmentTime,
} from '../../../../../../../util/date.ts'

import generateUUID from '../../../../../../../util/uuid.ts'

import { resetInTest } from '../../../../../../../db/meta.ts'

import { Stub, stub } from 'std/testing/mock.ts'
import randomPhoneNumber from '../../../../../../../mocks/randomPhoneNumber.ts'
import { addTestEmployee } from '../../../../../../_helpers/employees.ts'
import { mockWhatsApp } from 'test/_helpers/mockWhatsApp.ts'
import randomDemographics from '../../../../../../../mocks/randomDemographics.ts'

describe.skip('patient chatbot', () => {
  afterAll(() => db.destroy())
  let getFreeBusy: Stub
  beforeEach(resetInTest)
  afterEach(() => {
    if (getFreeBusy) getFreeBusy.restore()
  })
  it(
    'provides with first_scheduling_option details after confirming details',
    async () => {
      const phone_number = randomPhoneNumber('ZW')
      const patient_before = await patients.insert(db, {
        conversation_state: 'onboarded:make_appointment:confirm_details',
        phone_number,
        ...randomDemographics(),
      })
      await patients.update(db, {
        id: patient_before.id,
        location: {
          latitude: -19.4554096,
          longitude: 29.7739353,
        },
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

      // Insert google calender
      const current_time = new Date()
      current_time.setHours(current_time.getHours() + 2)
      const time_min = formatJohannesburg(current_time) // current + 2 hours

      current_time.setDate(current_time.getDate() + 7)
      const time_max = formatJohannesburg(current_time) // current + 7 days + 2 hours

      current_time.setDate(current_time.getDate() - 6)
      current_time.setHours(current_time.getHours() + 1)
      current_time.setMinutes(0)
      const second_day_start = formatJohannesburg(current_time) // current + 1 day + 3 hours

      current_time.setHours(current_time.getHours())
      current_time.setMinutes(30)
      const second_day_busy_time = formatJohannesburg(current_time) // current + 1 day + 3.5 hours

      current_time.setHours(current_time.getHours() + 8)
      current_time.setMinutes(0)
      const second_day_end = formatJohannesburg(current_time) // current + 1 day + 11 hours ==> second_day_start + 8 hours

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

      await conversations.insertMessageReceived(db, {
        chatbot_name: 'patient',
        received_by_phone_number: '263XXXXXX',
        sent_by_phone_number: phone_number,
        has_media: false,
        body: 'confirm',
        media_id: null,
        whatsapp_id: `wamid.${generateUUID()}`,
      })

      const whatsapp = mockWhatsApp()

      await respond(whatsapp, 'patient', phone_number)
      assertEquals(whatsapp.sendMessages.calls[0].args, [
        {
          chatbot_name: 'patient',
          messages: {
            message_body: 'Great, the next available appointment is on ' +
              prettyAppointmentTime(second_day_busy_time) +
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
      const patient = await getPatientLastConversationState(db, {
        phone_number,
      })

      assert(patient)
      assertEquals(
        patient.conversation_state,
        'onboarded:make_appointment:first_scheduling_option',
      )
    },
  )
})
