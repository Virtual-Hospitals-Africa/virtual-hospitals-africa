import { describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../../../../../db/db.ts'
import respond from '../../../../../../chatbot/respond.ts'
import * as conversations from '../../../../../../db/models/conversations.ts'
import * as patients from '../../../../../../db/models/patients.ts'
import { randomNationalId, randomPhoneNumber } from '../../../../../mocks.ts'
import generateUUID from '../../../../../../util/uuid.ts'
import { mockWhatsApp } from '../../../../mocks.ts'

describe('patient chatbot', { sanitizeResources: false }, () => {
  it('asks for reason after welcome message', async () => {
    const phone_number = randomPhoneNumber()
    const national_id_number = randomNationalId()
    await patients.insert(db, {
      conversation_state: 'onboarded:main_menu',
      phone_number,
      name: 'test',
      gender: 'female',
      date_of_birth: '2023-01-01',
      national_id_number,
    })

    await conversations.insertMessageReceived(db, {
      chatbot_name: 'patient',
      received_by_phone_number: '263XXXXXX',
      sent_by_phone_number: phone_number,
      has_media: false,
      body: 'make_appointment',
      media_id: null,
      whatsapp_id: `wamid.${generateUUID()}`,
    })

    const whatsapp = mockWhatsApp()

    await respond(whatsapp, 'patient', phone_number)
    assertEquals(whatsapp.sendMessages.calls[0].args, [
      {
        chatbot_name: 'patient',
        messages: {
          messageBody:
            `What is the reason you want to schedule an appointment?`,
          type: 'string',
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
      'onboarded:make_appointment:enter_appointment_reason',
    )
  })
})
