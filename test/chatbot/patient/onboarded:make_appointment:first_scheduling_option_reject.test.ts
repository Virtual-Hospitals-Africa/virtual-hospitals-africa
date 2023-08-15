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
import {
  convertToTimeString,
  formatHarare,
  prettyAppointmentTime,
} from '../../../util/date.ts'

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

  it('provides with other_appointment_times after rejecting first_option', async () => {
    await patients.upsert(db, {
      conversation_state: 'onboarded:make_appointment:first_scheduling_option',
      phone_number: '00000000',
      name: 'test',
      gender: 'female',
      date_of_birth: '2023-01-01',
      national_id_number: null,
    })

    // insert patient_appointment_requests
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

    // insert health worker and offered time
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

    const timeMin = new Date()
    console.log(timeMin)
    timeMin.setHours(timeMin.getHours() + 2)

    const timeMax = new Date(timeMin)
    timeMax.setDate(timeMin.getDate() + 7)

    const secondDay9AM = new Date(timeMin)
    secondDay9AM.setDate(timeMin.getDate() + 1)
    secondDay9AM.setHours(9, 0, 0, 0)

    const secondDay5PM = new Date(timeMin)
    secondDay5PM.setDate(timeMin.getDate() + 1)
    secondDay5PM.setHours(17, 0, 0, 0)

    const secondDayBusyTime = new Date(timeMin)
    secondDayBusyTime.setDate(timeMin.getDate() + 1)
    secondDayBusyTime.setHours(9, 30, 0, 0)

    console.log(timeMin)
    console.log(secondDay9AM)
    console.log(secondDay5PM)
    console.log(secondDayBusyTime)
    getFreeBusy.resolves(
      {
        kind: 'calendar#freeBusy',
        timeMin: timeMin,
        timeMax: timeMax,
        calendars: {
          'gcal_appointments_calendar_id': {
            busy: [
              {
                start: secondDay9AM,
                end: secondDayBusyTime,
              },
            ],
          },
          'gcal_availability_calendar_id': {
            busy: [
              {
                start: secondDay9AM,
                end: secondDay5PM,
              },
            ],
          },
        },
      },
    )

    await appointments.addOfferedTime(db, {
      patient_appointment_request_id: scheduling_appointment_request.id,
      health_worker_id: health_worker.id,
      start: secondDayBusyTime,
    })

    await conversations.insertMessageReceived(db, {
      patient_phone_number: '00000000',
      has_media: false,
      body: 'other_times',
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

    const date = formatHarare(secondDayBusyTime).substring(0, 10)
    const time = convertToTimeString(formatHarare(secondDayBusyTime))
    assertEquals(message.action.sections[0].title, date)
    //assertEquals(message.action.sections[0].rows[0].title, time)
    assertEquals(
      message.action.sections[0].rows[0].description,
      'With Dr. Test Doctor',
    )

    assertEquals(message.action.sections[1], {
      title: 'Other Times',
      rows: [
        {
          id: 'other_time',
          title: 'Other time slots',
          description: 'Show other time slots',
        },
      ],
    })

    console.log(fakeWhatsApp.sendMessages.firstCall.args)
    /*
    assertEquals(fakeWhatsApp.sendMessages.firstCall.args, [
      {
        messages: {
          messageBody: "OK here are the other available time, please choose from the list.",
          type: "list",
          headerText: "Other Appointment Times",
          action: {
            button: "More Time Slots",
            sections: [
              {
                title: "2023-08-17",
                rows: [
                  {
                    id: "34",
                    title: "11:00 am",
                    description: "With Dr. Test Doctor"
                  },
                  {
                    id: "35",
                    title: "11:30 am",
                    description: "With Dr. Test Doctor"
                  },
                  {
                    id: "36",
                    title: "12:00 pm",
                    description: "With Dr. Test Doctor"
                  }
                ]
              },
              {
                title: "Other Times",
                rows: [
                  {
                    id: "other_time",
                    title: "Other time slots",
                    description: "Show other time slots"
                  }
                ]
              }
            ]
          }
        },
        phone_number: '00000000',
      },
    ]) */
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
