import { describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import sinon from 'sinon'
import db from '../../../../../../../db/db.ts'
import respond from '../../../../../../../chatbot/respond.ts'
import * as conversations from '../../../../../../../db/models/conversations.ts'
import * as patients from '../../../../../../../db/models/patients.ts'
import { randomPhoneNumber } from '../../../../../../mocks.ts'
import generateUUID from '../../../../../../../util/uuid.ts'

describe('patient chatbot', { sanitizeResources: false }, () => {
  it('ends after not confirming details', async () => {
    const phone_number = randomPhoneNumber()
    await patients.upsert(db, {
      conversation_state: 'onboarded:make_appointment:confirm_details',
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
      body: 'go_back',
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
    assertEquals(fakeWhatsApp.sendMessages.firstCall.args, [
      {
        messages: {
          type: 'string',
          messageBody:
            'This is the end of the demo. Thank you for participating!',
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
      'end_of_demo',
    )
  })
})
