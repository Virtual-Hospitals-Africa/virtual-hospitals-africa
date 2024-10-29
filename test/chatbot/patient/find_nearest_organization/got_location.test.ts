import { describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../../../db/db.ts'
import respond from '../../../../chatbot/respond.ts'
import * as conversations from '../../../../db/models/conversations.ts'
import * as patients from '../../../../db/models/patients.ts'
import { randomNationalId, randomPhoneNumber } from '../../../mocks.ts'
import generateUUID from '../../../../util/uuid.ts'
import { readSeedDump } from '../../../web/utilities.ts'
import { mockWhatsApp } from '../../mocks.ts'

describe('patient chatbot', { sanitizeResources: false }, () => {
  const organizations = readSeedDump('organizations')

  it('sends a organization link and back_to_main_menu button after selecting a organization', async () => {
    const phone_number = randomPhoneNumber()
    // Step 1: share location
    await patients.insert(db, {
      conversation_state: 'find_nearest_facilities:share_location',
      phone_number,
      name: 'test',
      gender: 'female',
      date_of_birth: '2023-01-01',
      national_id_number: randomNationalId(),
    })

    await conversations.insertMessageReceived(db, {
      chatbot_name: 'patient',
      received_by_phone_number: '263XXXXXX',
      sent_by_phone_number: phone_number,
      has_media: false,
      body: JSON.stringify({
        latitude: -17.832132339478,
        longitude: 31.047979354858,
      }),
      media_id: null,
      whatsapp_id: `wamid.${generateUUID()}`,
    })

    const whatsappOne = mockWhatsApp()

    await respond(whatsappOne, 'patient')
    const arcadia = organizations.value.find((o) =>
      o.name === 'Arcadia Clinic'
    )!
    const braeside = organizations.value.find((o) =>
      o.name === 'Braeside Clinic'
    )!

    const message = whatsappOne.sendMessages.calls[0].args[0].messages
    assert(!Array.isArray(message))
    assert(message.type === 'list')
    assertEquals(
      message.action.sections[0].rows[0].id,
      arcadia.id,
    )

    // Step 2: select organization id
    await conversations.insertMessageReceived(db, {
      chatbot_name: 'patient',
      received_by_phone_number: '263XXXXXX',
      sent_by_phone_number: phone_number,
      has_media: false,
      body: braeside.id,
      media_id: null,
      whatsapp_id: `wamid.${generateUUID()}`,
    })

    const whatsappTwo = mockWhatsApp()

    await respond(whatsappTwo, 'patient')
    assertEquals(whatsappTwo.sendMessages.calls[0].args, [
      {
        chatbot_name: 'patient',
        messages: [
          {
            type: 'location',
            messageBody: 'Braeside Clinic',
            location: {
              longitude: 31.0657,
              latitude: -17.8399,
              name: 'Braeside Clinic',
              address: 'Malta Road, Harare, Harare Province, Zimbabwe',
            },
          },
          {
            type: 'buttons',
            messageBody: 'Click below to go back to main menu.',
            buttonText: 'Back to main menu',
            options: [{
              id: 'back_to_menu',
              title: 'Back to Menu',
            }],
          },
        ],
        phone_number,
      },
    ])
    const patient = await patients.getLastConversationState(db, {
      phone_number,
    })

    assert(patient)
    assertEquals(
      patient.conversation_state,
      'find_nearest_facilities:send_organization_location',
    )
  })
})
