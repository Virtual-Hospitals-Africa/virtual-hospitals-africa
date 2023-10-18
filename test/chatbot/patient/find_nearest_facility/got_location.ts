import { afterEach, beforeEach, describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import sinon from 'npm:sinon'
import { resetInTest } from '../../../../db/reset.ts'
import db from '../../../../db/db.ts'
import respond from '../../../../chatbot/respond.ts'
import * as conversations from '../../../../db/models/conversations.ts'
import * as patients from '../../../../db/models/patients.ts'

describe('patient chatbot', () => {
  beforeEach(resetInTest)
  afterEach(() => db.destroy())

  const phone_number = '00000000'
  it('sends a facility link and back_to_main_menu button after selecting a facility', async () => {
    // Step 1: share location
    await patients.upsert(db, {
      conversation_state: 'find_nearest_facility:share_location',
      phone_number,
      name: 'test',
      gender: 'female',
      date_of_birth: '2023-01-01',
      national_id_number: '1238',
    })

    await conversations.insertMessageReceived(db, {
      patient_phone_number: phone_number,
      has_media: false,
      body: JSON.stringify({
        latitude: -17.832132339478,
        longitude: 31.047979354858,
      }),
      media_id: null,
      whatsapp_id: 'whatsapp_id',
    })

    const fakeWhatsAppOne = {
      sendMessage: sinon.stub().throws(),
      sendMessages: sinon.stub().resolves([{
        messages: [{
          id: 'wamid.1234',
        }],
      }]),
    }

    await respond(fakeWhatsAppOne)

    // Step 2: select facility id
    await conversations.insertMessageReceived(db, {
      patient_phone_number: phone_number,
      has_media: false,
      body: '657',
      media_id: null,
      whatsapp_id: 'whatsapp_id123',
    })

    const fakeWhatsAppTwo = {
      sendMessage: sinon.stub().throws(),
      sendMessages: sinon.stub().resolves([{
        messages: [{
          id: 'wamid.5678',
        }],
      }]),
    }

    await respond(fakeWhatsAppTwo)
    assertEquals(fakeWhatsAppTwo.sendMessages.firstCall.args, [
      {
        messages: [
          {
            type: 'location',
            messageBody: 'Arcadia',
            location: {
              longitude: 31.0546,
              latitude: -17.8468,
              name: 'Arcadia',
              address: 'Harare, Harare Province, ZW',
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
      'find_nearest_facility:send_facility_location',
    )
  })
})
