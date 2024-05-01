import { describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import sinon from 'sinon'
import db from '../../../../../db/db.ts'
import respond from '../../../../../chatbot/respond.ts'
import * as conversations from '../../../../../db/models/conversations.ts'
import * as patients from '../../../../../db/models/patients.ts'
import { randomPhoneNumber } from '../../../../mocks.ts'
import generateUUID from '../../../../../util/uuid.ts'

describe('patient chatbot', { sanitizeResources: false }, () => {
  it('asks for birthday after inquiring gender', async () => {
    const phone_number = randomPhoneNumber()
    await patients.upsert(db, {
      conversation_state: 'not_onboarded:make_appointment:enter_gender',
      phone_number,
      name: 'test',
      gender: null,
      date_of_birth: null,
      national_id_number: null,
    })

    await conversations.insertMessageReceived(db, {
      patient_phone_number: phone_number,
      has_media: false,
      body: 'non-binary',
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
          messageBody:
            'Thanks for that information. What is your date of birth? Please enter the date in the format DD/MM/YYYY',
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
      'not_onboarded:make_appointment:enter_date_of_birth',
    )
    assertEquals(patient.gender, 'non-binary')
  })
})
