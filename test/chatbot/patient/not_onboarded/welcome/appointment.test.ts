import { describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../../../../db/db.ts'
import respond from '../../../../../chatbot/respond.ts'
import * as conversations from '../../../../../db/models/conversations.ts'
import { mockWhatsApp } from '../../../mocks.ts'
import { randomPhoneNumber } from '../../../../mocks.ts'
import generateUUID from '../../../../../util/uuid.ts'

describe('patient chatbot', { sanitizeResources: false }, () => {
  it('asks for name after welcome message', async () => {
    const phone_number = randomPhoneNumber()

    await conversations.insertChatbotUser(db, 'patient', phone_number)

    await conversations.insertMessageReceived(db, {
      chatbot_name: 'patient',
      received_by_phone_number: '263XXXXXX',
      sent_by_phone_number: phone_number,
      has_media: false,
      body: 'make_appointment',
      media_id: null,
      whatsapp_id: `wamid.${generateUUID()}`,
    })

    const whatsapp = mockWhatsApp()

    await respond(whatsapp, 'patient', phone_number)
    assertEquals(whatsapp.sendMessages.calls[0].args, [
      {
        chatbot_name: 'patient',
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
    const user = await conversations.getUser(db, 'patient', {
      phone_number,
    })

    assert(user)
    assertEquals(
      user.conversation_state,
      'not_onboarded:make_appointment:enter_name',
    )
    assertEquals(
      user.entity_id,
      null,
    )
  })
})
