import { describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import sinon from 'sinon'
import db from '../../../../db/db.ts'
import respond from '../../../../chatbot/respond.ts'
import * as conversations from '../../../../db/models/conversations.ts'
import * as patients from '../../../../db/models/patients.ts'
import { randomNationalId, randomPhoneNumber } from '../../../mocks.ts'
import generateUUID from '../../../../util/uuid.ts'
import { readSeedDump } from '../../../web/utilities.ts'

describe('patient chatbot', { sanitizeResources: false }, () => {
  const organizations = readSeedDump('Organization')

  it('sends nearest organizations list after invitation', async () => {
    const phone_number = randomPhoneNumber()
    await patients.upsert(db, {
      conversation_state: 'find_nearest_organization:share_location',
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

    const callArgs = fakeWhatsApp.sendMessages.firstCall.args[0]

    assertEquals(callArgs.messages.type, 'list')

    assertEquals(callArgs.messages.headerText, 'Nearest Facilities')

    assertEquals(
      callArgs.messages.messageBody,
      'Thank you for sharing your location.\n' +
        '\n' +
        'Click the button below to see your nearest health organizations.',
    )

    assertEquals(callArgs.messages.action.button, 'Nearest Facilities')

    assertEquals(callArgs.messages.action.sections[0].title, 'Town Name Here')

    const arcadia = organizations.value.find((o) =>
      o.canonicalName === 'Arcadia Clinic'
    )!
    const braeside = organizations.value.find((o) =>
      o.canonicalName === 'Braeside Clinic'
    )!

    assertEquals(
      callArgs.messages.action.sections[0].rows[0].id,
      arcadia.id,
    )
    assertEquals(
      callArgs.messages.action.sections[0].rows[0].title,
      'Arcadia Clinic',
    )

    assertEquals(
      callArgs.messages.action.sections[0].rows[1].id,
      braeside.id,
    )
    assertEquals(
      callArgs.messages.action.sections[0].rows[1].title,
      'Braeside Clinic',
    )

    assertEquals(callArgs.phone_number, phone_number)

    const patient = await patients.getLastConversationState(db, {
      phone_number,
    })

    assert(patient)
    assertEquals(
      patient.conversation_state,
      'find_nearest_organization:got_location',
    )
  })
})
