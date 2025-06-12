import { afterAll, describe, it } from 'std/testing/bdd.ts'
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

describe('patient chatbot', () => {
  afterAll(() => db.destroy())
  const organizations = readSeedDump('organizations')

  it('sends nearest organizations list after invitation', async () => {
    const phone_number = randomPhoneNumber()
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
      // Somewhere in Harare
      body: JSON.stringify({
        latitude: -17.832132339478,
        longitude: 31.047979354858,
      }),
      media_id: null,
      whatsapp_id: `wamid.${generateUUID()}`,
    })

    const whatsapp = mockWhatsApp()

    await respond(whatsapp, 'patient', phone_number)

    const firstCallArgs = whatsapp.sendMessages.calls[0].args[0]
    const message = firstCallArgs.messages
    assert(!Array.isArray(message))
    assert(message.type === 'list')

    assertEquals(message.headerText, 'Nearest Facilities')

    assertEquals(
      message.messageBody,
      'Click the button below to see the health facilities closes to you',
    )

    assertEquals(message.action.button, 'Nearest Facilities')

    assertEquals(message.action.sections[0].title, 'Town Name Here')

    const arcadia = organizations.value.find((o) =>
      o.name === 'Arcadia Clinic'
    )!
    const braeside = organizations.value.find((o) =>
      o.name === 'Braeside Clinic'
    )!

    assertEquals(
      message.action.sections[0].rows[0].id,
      arcadia.id,
    )
    assertEquals(
      message.action.sections[0].rows[0].title,
      'Arcadia Clinic',
    )

    assertEquals(
      message.action.sections[0].rows[1].id,
      braeside.id,
    )
    assertEquals(
      message.action.sections[0].rows[1].title,
      'Braeside Clinic',
    )

    assertEquals(firstCallArgs.phone_number, phone_number)

    const patient = await patients.getLastConversationState(db, {
      phone_number,
    })

    assert(patient)
    assertEquals(
      patient.conversation_state,
      'find_nearest_facilities:got_location',
    )
  })
})
