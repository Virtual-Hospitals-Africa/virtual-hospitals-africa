import { afterAll, describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../../db/db.ts'
import respond from '../../../chatbot/respond.ts'
import * as conversations from '../../../db/models/conversations.ts'
import generateUUID from '../../../util/uuid.ts'
import randomPhoneNumber from '../../../mocks/randomPhoneNumber.ts'
import { mockWhatsApp } from '../mockWhatsApp.ts'

describe('pharmacist chatbot', () => {
  afterAll(() => db.destroy())
  it('sends the main menu after the initial message', async () => {
    const phone_number = randomPhoneNumber('ZW')
    await conversations.insertMessageReceived(db, {
      chatbot_name: 'pharmacist',
      received_by_phone_number: '263XXXXXX',
      sent_by_phone_number: phone_number,
      has_media: false,
      body: 'body',
      media_id: null,
      whatsapp_id: `wamid.${generateUUID()}`,
    })

    const whatsapp = mockWhatsApp()

    await respond(whatsapp, 'pharmacist', phone_number)
    assertEquals(whatsapp.sendMessages.calls[0].args, [
      {
        chatbot_name: 'pharmacist',
        messages: {
          message_body:
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
