import { afterAll, describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../../../db/db.ts'
import respond from '../../../../chatbot/respond.ts'
import * as conversations from '../../../../db/models/conversations.ts'
import * as patients from '../../../../db/models/patients.ts'
import generateUUID from '../../../../util/uuid.ts'

import randomNationalId from '../../../../mocks/randomNationalId.ts'
import randomPhoneNumber from '../../../../mocks/randomPhoneNumber.ts'
import { readSeedDump } from '../../../_helpers/readSeedDump.ts'
import { mockWhatsApp } from '../../../chatbot/mockWhatsApp.ts'

describe('patient chatbot', () => {
  afterAll(() => db.destroy())
  const organizations = readSeedDump('organizations')

  it('sends nearest organizations list after invitation', async () => {
    const phone_number = randomPhoneNumber()
    const p = await patients.insert(db, {
      conversation_state: 'find_nearest_facilities:share_location',
      phone_number,
      name: 'test',
      gender: 'female',
      date_of_birth: '2023-01-01',
      national_id_number: randomNationalId(),
    })
    console.log(p)

    await conversations.insertMessageReceived(db, {
      chatbot_name: 'patient',
      received_by_phone_number: '263XXXXXX',
      sent_by_phone_number: phone_number,
      has_media: false,
      body: JSON.stringify({
        latitude: -33.3946,
        longitude: 25.5463,
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

    assertEquals(message.action.sections[0].title, 'Nqweba')

    const addo = organizations.value.find((o) =>
      o.name === 'Addo Enon Satellite Clinic'
    )!
    const moses = organizations.value.find((o) =>
      o.name === 'Moses Mabida Clinic'
    )!

    assertEquals(
      message.action.sections[0].rows[0].id,
      addo.id,
    )
    assertEquals(
      message.action.sections[0].rows[0].title,
      'Addo Enon Satellite C...',
    )

    assertEquals(
      message.action.sections[0].rows[1].id,
      moses.id,
    )
    assertEquals(
      message.action.sections[0].rows[1].title,
      'Moses Mabida Clinic',
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
