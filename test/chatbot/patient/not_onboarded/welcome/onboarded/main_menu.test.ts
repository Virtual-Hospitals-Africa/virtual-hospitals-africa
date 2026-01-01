import { afterAll, describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../../../../../db/db.ts'
import respond from '../../../../../../chatbot/respond.ts'
import * as conversations from '../../../../../../db/models/conversations.ts'
import * as patients from '../../../../../../db/models/patients.ts'
import { getPatientLastConversationState } from '../../../../../../db/models/patient_chatbot_users.ts'

import generateUUID from '../../../../../../util/uuid.ts'
import randomPhoneNumber from '../../../../../../mocks/randomPhoneNumber.ts'
import { mockWhatsApp } from '../../../../mockWhatsApp.ts'
import randomDemographics from '../../../../../../mocks/randomDemographics.ts'

describe('patient chatbot', () => {
  afterAll(() => db.destroy())
  it('asks for reason after welcome message', async () => {
    const phone_number = randomPhoneNumber('ZW')
    const demographics = randomDemographics()
    await patients.insert(db, {
      conversation_state: 'onboarded:main_menu',
      phone_number,
      ...demographics,
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
          message_body:
            `What is the reason you want to schedule an appointment?`,
          type: 'string',
        },
        phone_number,
      },
    ])
    const patient = await getPatientLastConversationState(db, {
      phone_number,
    })

    assert(patient)
    assertEquals(
      patient.conversation_state,
      'onboarded:make_appointment:enter_appointment_reason',
    )
  })
})
