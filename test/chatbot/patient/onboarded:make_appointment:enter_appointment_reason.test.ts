import { afterEach, beforeEach, describe, it } from 'std/testing/bdd.ts'
import { assert, assertEquals } from 'std/testing/asserts.ts'
import sinon from 'npm:sinon'
import { resetInTest } from '../../../db/reset.ts'
import db from '../../../db/db.ts'
import respond from '../../../chatbot/respond.ts'
import * as conversations from '../../../db/models/conversations.ts'
import * as patients from '../../../db/models/patients.ts'

describe('patient chatbot', () => {
  beforeEach(resetInTest)
  afterEach(() => db.destroy())
  it('asks for media after inquiring appointment reason', async () => {
    await patients.upsert(db, {
      conversation_state:
        'not_onboarded:make_appointment:enter_national_id_number',
      phone_number: '00000000',
      name: 'test',
      gender: 'female',
      date_of_birth: '2023-01-01',
      national_id_number: null,
    })

    await conversations.insertMessageReceived(db, {
      patient_phone_number: '00000000',
      has_media: false,
      body: '123456',
      media_id: null,
      whatsapp_id: 'whatsapp_id_one',
    })

    const fakeWhatsAppOne = {
      sendMessage: sinon.stub().throws(),
      sendMessages: sinon.stub().resolves([{
        messages: [{
          id: 'wamid.12341',
        }],
      }]),
    }

    await respond(fakeWhatsAppOne)

    await conversations.insertMessageReceived(db, {
      patient_phone_number: '00000000',
      has_media: false,
      body: 'pain',
      media_id: null,
      whatsapp_id: 'whatsapp_id_two',
    })

    const fakeWhatsAppTwo = {
      sendMessage: sinon.stub().throws(),
      sendMessages: sinon.stub().resolves([{
        messages: [{
          id: 'wamid.12342',
        }],
      }]),
    }

    await respond(fakeWhatsAppTwo)
    assertEquals(fakeWhatsAppTwo.sendMessages.firstCall.args, [
      {
        messages: {
          messageBody:
            'To assist the doctor with triaging your case, click the + button to send an image, video, or voice note describing your symptoms.',
          type: 'buttons',
          buttonText: 'Menu',
          options: [{ id: 'skip', title: 'Skip' }],
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
      'onboarded:make_appointment:initial_ask_for_media',
    )
  })
})
