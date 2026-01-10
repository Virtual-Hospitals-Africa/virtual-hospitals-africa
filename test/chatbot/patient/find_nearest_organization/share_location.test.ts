import { afterAll, describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../../../db/db.ts'
import respond from '../../../../chatbot/respond.ts'
import { conversations } from '../../../../db/models/conversations.ts'
import { patients } from '../../../../db/models/patients.ts'
import { patient_chatbot_users } from '../../../../db/models/patient_chatbot_users.ts'
import generateUUID from '../../../../util/uuid.ts'
import randomPhoneNumber from '../../../../mocks/randomPhoneNumber.ts'
import { readSeedDump } from '../../../_helpers/readSeedDump.ts'
import { mockWhatsApp } from 'test/_helpers/mockWhatsApp.ts'
import randomDemographics from '../../../../mocks/randomDemographics.ts'

describe('patient chatbot', () => {
  afterAll(() => db.destroy())
  const organizations = readSeedDump('organizations')

  it('sends nearest organizations list after invitation', async () => {
    const phone_number = randomPhoneNumber('ZW')
    await patients.insert(db, {
      conversation_state: 'find_nearest_facilities:share_location',
      phone_number,
      ...randomDemographics(),
    })

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

    const first_call_args = whatsapp.sendMessages.calls[0].args[0]
    const message = first_call_args.messages
    assert(!Array.isArray(message))
    assert(message.type === 'list')

    assertEquals(message.headerText, 'Nearest Facilities')

    assertEquals(
      message.message_body,
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

    assertEquals(first_call_args.phone_number, phone_number)

    const patient = await patient_chatbot_users.getPatientLastConversationState(
      db,
      {
        phone_number,
      },
    )

    assert(patient)
    assertEquals(
      patient.conversation_state,
      'find_nearest_facilities:got_location',
    )
  })
})
