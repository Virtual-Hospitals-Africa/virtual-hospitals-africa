import { describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../../../../db/db.ts'
import respond from '../../../../../chatbot/respond.ts'
import * as conversations from '../../../../../db/models/conversations.ts'
import * as patients from '../../../../../db/models/patients.ts'
import { randomPhoneNumber } from '../../../../mocks.ts'
import generateUUID from '../../../../../util/uuid.ts'
import { mockWhatsApp } from '../../../mocks.ts'

describe('patient chatbot', { sanitizeResources: false }, () => {
  it('asks for birthday after inquiring gender', async () => {
    const phone_number = randomPhoneNumber()
    await patients.insert(db, {
      conversation_state: 'not_onboarded:make_appointment:enter_gender',
      phone_number,
      name: 'test',
      gender: null,
      date_of_birth: null,
      national_id_number: null,
    })

    await conversations.insertMessageReceived(db, {
      chatbot_name: 'patient',
      received_by_phone_number: '263XXXXXX',
      sent_by_phone_number: phone_number,
      has_media: false,
      body: 'non-binary',
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
            'What is your date of birth? Please enter the date in the format DD/MM/YYYY',
          type: 'string',
        },
        phone_number,
      },
    ])
    const { conversation_state, id } =
      (await patients.getLastConversationState(db, {
        phone_number,
      }))!

    assertEquals(
      conversation_state,
      'not_onboarded:make_appointment:enter_date_of_birth',
    )

    const patient = await patients.getByID(db, { id })
    assertEquals(patient.gender, 'non-binary')
  })
})
