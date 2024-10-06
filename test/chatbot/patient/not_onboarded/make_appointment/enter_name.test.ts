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
  it('asks for gender after inquiring name', async () => {
    const phone_number = randomPhoneNumber()

    const chatbot_user = await conversations.insertChatbotUser(
      db,
      'patient',
      phone_number,
    )
    await conversations.updateChatbotUser(db, chatbot_user, {
      conversation_state: 'not_onboarded:make_appointment:enter_name',
    })

    await conversations.insertMessageReceived(db, {
      chatbot_name: 'patient',
      received_by_phone_number: '263XXXXXX',
      sent_by_phone_number: phone_number,
      has_media: false,
      body: 'test',
      media_id: null,
      whatsapp_id: `wamid.${generateUUID()}`,
    })

    const fakeWhatsApp = {
      phone_number: '263XXXXXX',
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
        chatbot_name: 'patient',
        messages: {
          messageBody: 'What is your gender?',
          type: 'buttons',
          buttonText: 'Menu',
          options: [
            { id: 'male', title: 'Male' },
            { id: 'female', title: 'Female' },
            { id: 'other', title: 'Non-binary' },
          ],
        },
        phone_number,
      },
    ])
    const patient = await patients.getLastConversationState(db, {
      phone_number,
    })

    assert(patient)
    assertEquals(
      patient.conversation_state,
      'not_onboarded:make_appointment:enter_gender',
    )
    assertEquals(patient.name, 'test')
  })
})
