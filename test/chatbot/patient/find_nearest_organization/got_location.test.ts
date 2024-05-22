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

  it('sends a organization link and back_to_main_menu button after selecting a organization', async () => {
    const phone_number = randomPhoneNumber()
    // Step 1: share location
    await patients.upsert(db, {
      conversation_state: 'find_nearest_organization:share_location',
      phone_number,
      name: 'test',
      gender: 'female',
      date_of_birth: '2023-01-01',
      national_id_number: randomNationalId(),
    })

    await conversations.insertMessageReceived(db, {
      patient_phone_number: phone_number,
      has_media: false,
      body: JSON.stringify({
        latitude: -17.832132339478,
        longitude: 31.047979354858,
      }),
      media_id: null,
      whatsapp_id: `wamid.${generateUUID()}`,
    })

    const fakeWhatsAppOne = {
      sendMessage: sinon.stub().throws(),
      sendMessages: sinon.stub().resolves([{
        messages: [{
          id: `wamid.${generateUUID()}`,
        }],
      }]),
    }

    await respond(fakeWhatsAppOne, 'patient')
    const arcadia = organizations.value.find((o) =>
      o.canonicalName === 'Arcadia Clinic'
    )!
    const braeside = organizations.value.find((o) =>
      o.canonicalName === 'Braeside Clinic'
    )!

    assertEquals(
      fakeWhatsAppOne.sendMessages.firstCall.args[0].messages.action.sections[0]
        .rows[0].id,
      arcadia.id,
    )

    // Step 2: select organization id
    await conversations.insertMessageReceived(db, {
      patient_phone_number: phone_number,
      has_media: false,
      body: braeside.id,
      media_id: null,
      whatsapp_id: `wamid.${generateUUID()}`,
    })

    const fakeWhatsAppTwo = {
      sendMessage: sinon.stub().throws(),
      sendMessages: sinon.stub().resolves([{
        messages: [{
          id: `wamid.${generateUUID()}`,
        }],
      }]),
    }

    await respond(fakeWhatsAppTwo, 'patient')
    assertEquals(fakeWhatsAppTwo.sendMessages.firstCall.args, [
      {
        messages: [
          {
            type: 'location',
            messageBody: 'Braeside Clinic',
            location: {
              longitude: 31.0657,
              latitude: -17.8399,
              name: 'Braeside Clinic',
              address: '4 General Booth Rd, Harare, ZW',
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
    const patient = await patients.getByPhoneNumber(db, {
      phone_number,
    })

    assert(patient)
    assertEquals(
      patient.conversation_state,
      'find_nearest_organization:send_organization_location',
    )
  })
})
