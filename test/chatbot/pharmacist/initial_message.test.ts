import { describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../../db/db.ts'
import respond from '../../../chatbot/respond.ts'
import * as conversations from '../../../db/models/conversations.ts'
import { randomPhoneNumber } from '../../mocks.ts'
import { spy } from 'std/testing/mock.ts'
import generateUUID from '../../../util/uuid.ts'
import { WhatsAppJSONResponseSuccess } from '../../../types.ts'

describe('pharmacist chatbot', { sanitizeResources: false }, () => {
  it('sends the main menu after the initial message', async () => {
    const phone_number = randomPhoneNumber()
    await conversations.insertMessageReceived(db, {
      chatbot_name: 'pharmacist',
      received_by_phone_number: '263XXXXXX',
      sent_by_phone_number: phone_number,
      has_media: false,
      body: 'body',
      media_id: null,
      whatsapp_id: `wamid.${generateUUID()}`,
    })

    const fakeWhatsApp = {
      phone_number: '263XXXXXX',
      sendMessage: () => {
        throw new Error('sendMessage should not be called')
      },
      sendMessages: spy(() =>
        Promise.resolve([
          {
            messaging_product: 'whatsapp' as const,
            contacts: [{ input: 'whatever', wa_id: `wamid.${generateUUID()}` }],
            messages: [{
              id: `wamid.${generateUUID()}`,
            }],
          } satisfies WhatsAppJSONResponseSuccess,
        ])
      ),
    }

    await respond(fakeWhatsApp, 'pharmacist', phone_number)
    assertEquals(fakeWhatsApp.sendMessages.calls[0].args, [
      {
        chatbot_name: 'pharmacist',
        messages: {
          messageBody:
            'Welcome to the Pharmacist Chatbot! This is a demo to showcase the capabilities of the chatbot. Please follow the prompts to complete the demo.\n' +
            '\n' + 'To start, select the items from the following menu',
          type: 'buttons',
          buttonText: 'Menu',
          options: [
            { id: 'fill_prescription', title: 'Fill Prescription' },
            { id: 'view_inventory', title: 'View Inventory' },
          ],
        },
        phone_number,
      },
    ])
    const pharmacist = await conversations.getLastConversationState(
      db,
      'pharmacist',
      {
        phone_number,
      },
    )

    assert(pharmacist)
    assertEquals(pharmacist.conversation_state, 'initial_message')
  })
})
