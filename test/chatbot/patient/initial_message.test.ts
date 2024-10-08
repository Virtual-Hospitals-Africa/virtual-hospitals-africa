import { describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../../db/db.ts'
import respond from '../../../chatbot/respond.ts'
import * as conversations from '../../../db/models/conversations.ts'
import * as patients from '../../../db/models/patients.ts'
import { randomPhoneNumber } from '../../mocks.ts'
import generateUUID from '../../../util/uuid.ts'
import { mockWhatsApp } from '../mocks.ts'

describe('patient chatbot', { sanitizeResources: false }, () => {
  it('sends the main menu after the initial message', async () => {
    const phone_number = randomPhoneNumber()
    await conversations.insertMessageReceived(db, {
      chatbot_name: 'patient',
      received_by_phone_number: '263XXXXXX',
      sent_by_phone_number: phone_number,
      has_media: false,
      body: 'body',
      media_id: null,
      whatsapp_id: `wamid.${generateUUID()}`,
    })

    const whatsapp = mockWhatsApp()

    await respond(whatsapp, 'patient', phone_number)
    assertEquals(whatsapp.sendMessages.calls[0].args, [
      {
        chatbot_name: 'patient',
        messages: {
          messageBody:
            'Welcome to Virtual Hospitals Africa. What can I help you with today?',
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
    const patient = await patients.getLastConversationState(db, {
      phone_number,
    })

    assert(patient)
    assertEquals(patient.conversation_state, 'initial_message')
  })
})
