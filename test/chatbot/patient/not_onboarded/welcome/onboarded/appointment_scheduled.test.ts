import { describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import sinon from 'sinon'
import db from '../../../../../../db/db.ts'
import respond from '../../../../../../chatbot/respond.ts'
import * as conversations from '../../../../../../db/models/conversations.ts'
import * as patients from '../../../../../../db/models/patients.ts'
import * as appointments from '../../../../../../db/models/appointments.ts'
import { randomPhoneNumber } from '../../../../../mocks.ts'
import generateUUID from '../../../../../../util/uuid.ts'
import { addTestHealthWorker } from '../../../../../web/utilities.ts'

describe('patient chatbot', { sanitizeResources: false }, () => {
  it('comes back to main menu after cancelling appointment', async () => {
    const phone_number = randomPhoneNumber()
    const patientBefore = await patients.upsert(db, {
      conversation_state: 'onboarded:appointment_scheduled',
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

    const health_worker = await addTestHealthWorker(db, { scenario: 'doctor' })

    assert(health_worker)

    // Insert offered time
    const time = new Date()
    time.setDate(time.getDate() + 1)
    time.setHours(9, 30, 0, 0)
    const offeredTime = await appointments.addOfferedTime(db, {
      patient_appointment_request_id: scheduling_appointment_request.id,
      provider_id: health_worker.employee_id!,
      start: time,
    })

    // Insert scheduled appointment
    const appointment = await appointments.schedule(db, {
      appointment_offered_time_id: offeredTime.id,
      gcal_event_id: 'insertEvent_id',
    })

    await conversations.insertMessageReceived(db, {
      patient_phone_number: phone_number,
      has_media: false,
      body: 'cancel',
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

    await respond(fakeWhatsApp, 'patient', phone_number)
    assertEquals(fakeWhatsApp.sendMessages.firstCall.args, [
      {
        messages: {
          messageBody:
            'Your appoinment has been cancelled. What can I help you with today?',
          type: 'buttons',
          buttonText: 'Menu',
          options: [
            { id: 'make_appointment', title: 'Make Appointment' },
            { id: 'find_nearest_organization', title: 'Nearest Organization' },
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
      'onboarded:cancel_appointment',
    )

    const cancelledAppointmet = await appointments.getWithPatientInfo(db, {
      id: appointment.id,
    })
    assertEquals(cancelledAppointmet.length, 0)
  })
})
