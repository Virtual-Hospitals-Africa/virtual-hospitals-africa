import { describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../../../../../../db/db.ts'
import respond from '../../../../../../../chatbot/respond.ts'
import * as conversations from '../../../../../../../db/models/conversations.ts'
import * as patients from '../../../../../../../db/models/patients.ts'
import { randomNationalId, randomPhoneNumber } from '../../../../../../mocks.ts'
import generateUUID from '../../../../../../../util/uuid.ts'
import { mockWhatsApp } from '../../../../../mocks.ts'

describe('patient chatbot', { sanitizeResources: false }, () => {
  it('asks for media after inquiring appointment reason', async () => {
    const phone_number = randomPhoneNumber()
    await patients.insert(db, {
      conversation_state:
        'not_onboarded:make_appointment:enter_national_id_number',
      phone_number,
      name: 'test',
      gender: 'female',
      date_of_birth: '2023-01-01',
      national_id_number: null,
    })

    await conversations.insertMessageReceived(db, {
      chatbot_name: 'patient',
      received_by_phone_number: '263XXXXXX',
      sent_by_phone_number: phone_number,
      has_media: false,
      body: randomNationalId(),
      media_id: null,
      whatsapp_id: `wamid.${generateUUID()}`,
    })

    const whatsappOne = mockWhatsApp()

    await respond(whatsappOne, 'patient', phone_number)

    await conversations.insertMessageReceived(db, {
      chatbot_name: 'patient',
      received_by_phone_number: '263XXXXXX',
      sent_by_phone_number: phone_number,
      has_media: false,
      body: 'pain',
      media_id: null,
      whatsapp_id: `wamid.${generateUUID()}`,
    })

    const whatsappTwo = mockWhatsApp()

    await respond(whatsappTwo, 'patient')
    assertEquals(whatsappTwo.sendMessages.calls[0].args, [
      {
        chatbot_name: 'patient',
        messages: {
          messageBody:
            'To assist the doctor with triaging your case, click the + button to send an image, video, or voice note describing your symptoms.',
          type: 'buttons',
          buttonText: 'Menu',
          options: [{ id: 'skip', title: 'Skip' }],
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
      'onboarded:make_appointment:initial_ask_for_media',
    )
  })
})
