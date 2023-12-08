import { afterEach, beforeEach, describe, it } from '$std/testing/bdd.ts'
import { assert } from '$std/assert/assert.ts'
import { assertEquals } from '$std/assert/assert_equals.ts'
import sinon from 'npm:sinon'
import { resetInTest } from '../../../../../../../db/reset.ts'
import db from '../../../../../../../db/db.ts'
import respond from '../../../../../../../chatbot/respond.ts'
import * as conversations from '../../../../../../../db/models/conversations.ts'
import * as patients from '../../../../../../../db/models/patients.ts'
import { randomNationalId } from '../../../../../../mocks.ts'

describe('patient chatbot', () => {
  beforeEach(resetInTest)
  afterEach(() => db.destroy())

  const phone_number = '00000000'
  it('asks for the reason the patient wants to schedule an appointment', async () => {
    await patients.upsert(db, {
      conversation_state: 'onboarded:cancel_appointment',
      phone_number,
      name: 'test',
      gender: 'female',
      date_of_birth: '2023-01-01',
      national_id_number: randomNationalId(),
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
          messageBody:
            'What is the reason you want to schedule an appointment?',
          type: 'string',
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
      'onboarded:make_appointment:enter_appointment_reason',
    )
  })
})
