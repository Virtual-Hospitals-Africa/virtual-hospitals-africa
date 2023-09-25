import { afterEach, beforeEach, describe, it } from 'std/testing/bdd.ts'
import { assert, assertEquals } from 'std/testing/asserts.ts'
import sinon from 'npm:sinon'
import { resetInTest } from '../../../../../db/reset.ts'
import db from '../../../../../db/db.ts'
import respond from '../../../../../chatbot/respond.ts'
import * as conversations from '../../../../../db/models/conversations.ts'
import * as patients from '../../../../../db/models/patients.ts'

describe('patient chatbot', () => {
  beforeEach(resetInTest)
  afterEach(() => db.destroy())

  const phone_number = '00000000'
  it('asks for name after welcome message', async () => {
    await patients.upsert(db, {
      conversation_state: 'not_onboarded:welcome',
      phone_number,
      name: null,
      gender: null,
      date_of_birth: null,
      national_id_number: null,
    })

    await conversations.insertMessageReceived(db, {
      patient_phone_number: phone_number,
      has_media: false,
      body: 'make_appointment',
      media_id: null,
      whatsapp_id: 'whatsapp_id',
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
          type: 'string',
          messageBody:
            'Sure, I can help you make an appointment with a health_worker.\n' +
            '\n' +
            'To start, what is your name?',
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
      'not_onboarded:make_appointment:enter_name',
    )
  })
})
