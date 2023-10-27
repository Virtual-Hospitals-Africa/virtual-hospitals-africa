import { afterEach, beforeEach, describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import sinon from 'npm:sinon'
import { resetInTest } from '../../../../db/reset.ts'
import db from '../../../../db/db.ts'
import respond from '../../../../chatbot/respond.ts'
import * as conversations from '../../../../db/models/conversations.ts'
import * as patients from '../../../../db/models/patients.ts'
import { randomNationalId } from '../../../mocks.ts'

describe('patient chatbot', () => {
  beforeEach(resetInTest)
  afterEach(() => db.destroy())

  const phone_number = '00000000'
  it('sends nearest facilities list after invitation', async () => {
    await patients.upsert(db, {
      conversation_state: 'find_nearest_facility:share_location',
      phone_number,
      name: 'test',
      gender: 'female',
      date_of_birth: '2023-01-01',
      national_id_number: randomNationalId(),
    })

    await conversations.insertMessageReceived(db, {
      patient_phone_number: phone_number,
      has_media: false,
      // Somewhere in Harare
      body: JSON.stringify({
        latitude: -17.832132339478,
        longitude: 31.047979354858,
      }),
      media_id: null,
      whatsapp_id: 'whatsapp_id',
    })

    const fakeWhatsApp = {
      sendMessage: sinon.stub().throws(),
      sendMessages: sinon.stub().resolves([{
        messages: [{
          id: 'wamid.1234',
        }],
      }]),
    }

    await respond(fakeWhatsApp)
    const callArgs = fakeWhatsApp.sendMessages.firstCall.args[0]

    assertEquals(callArgs.messages.type, 'list')

    assertEquals(callArgs.messages.headerText, 'Nearest Facilities')

    assertEquals(
      callArgs.messages.messageBody,
      'Thank you for sharing your location.\n' +
        '\n' +
        'Click the button below to see your nearest health facilities.',
    )

    assertEquals(callArgs.messages.action.button, 'Nearest Facilities')

    assertEquals(callArgs.messages.action.sections[0].title, 'Town Name Here')

    assertEquals(callArgs.messages.action.sections[0].rows[0].id, '657')
    assertEquals(
      callArgs.messages.action.sections[0].rows[0].title,
      'Arcadia Clinic',
    )

    assertEquals(callArgs.messages.action.sections[0].rows[1].id, '658')
    assertEquals(
      callArgs.messages.action.sections[0].rows[1].title,
      'Braeside Clinic',
    )

    assertEquals(callArgs.phone_number, phone_number)

    const patient = await patients.getByPhoneNumber(db, {
      phone_number,
    })

    assert(patient)
    assertEquals(
      patient.conversation_state,
      'find_nearest_facility:got_location',
    )
  })
})
