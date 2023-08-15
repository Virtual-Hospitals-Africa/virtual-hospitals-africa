import { afterEach, beforeEach, describe, it } from 'std/testing/bdd.ts'
import { assert, assertEquals } from 'std/testing/asserts.ts'
import sinon from 'npm:sinon'
import { resetInTest } from '../../../db/reset.ts'
import db from '../../../db/db.ts'
import respond from '../../../chatbot/respond.ts'
import * as conversations from '../../../db/models/conversations.ts'
import * as patients from '../../../db/models/patients.ts'
import * as appointments from '../../../db/models/appointments.ts'

describe('patient chatbot', () => {
  beforeEach(resetInTest)
  afterEach(() => db.destroy())
  it('asks for confirming details after inquiring media', async () => {
    await patients.upsert(db, {
      conversation_state: 'onboarded:make_appointment:confirm_details',
      phone_number: '00000000',
      name: 'test',
      gender: 'female',
      date_of_birth: '2023-01-01',
      national_id_number: null,
    })

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

    await conversations.insertMessageReceived(db, {
      patient_phone_number: '00000000',
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
    console.log(fakeWhatsApp.sendMessages.firstCall.args)
    assertEquals(fakeWhatsApp.sendMessages.firstCall.args, [
      {
        messages: {
          messageBody:
            "Would you like to schedule this appointment?"
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
      'onboarded:make_appointment:first_scheduling_option',
    )
  })
})
