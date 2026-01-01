import { afterAll, describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../../../../db/db.ts'
import respond from '../../../../../chatbot/respond.ts'
import * as conversations from '../../../../../db/models/conversations.ts'
import * as patients from '../../../../../db/models/patients.ts'
import { getPatientLastConversationState } from '../../../../../db/models/patient_chatbot_users.ts'

import generateUUID from '../../../../../util/uuid.ts'
import randomPhoneNumber from '../../../../../mocks/randomPhoneNumber.ts'
import { mockWhatsApp } from '../../../../chatbot/mockWhatsApp.ts'

describeParallel'patient chatbot', () => {
  afterAll(() => db.destroy())
  itParallel('asks for sex after inquiring name', async () => {
    const phone_number = randomPhoneNumber('ZW')

    const chatbot_user = await conversations.insertChatbotUser(
      db,
      'patient',
      phone_number,
    )
    await conversations.updateChatbotUser(db, chatbot_user, {
      conversation_state: 'not_onboarded:make_appointment:enter_name',
    })

    await conversations.insertMessageReceived(db, {
      chatbot_name: 'patient',
      received_by_phone_number: '263XXXXXX',
      sent_by_phone_number: phone_number,
      has_media: false,
      body: 'Test Patient',
      media_id: null,
      whatsapp_id: `wamid.${generateUUID()}`,
    })

    const whatsapp = mockWhatsApp()

    await respond(whatsapp, 'patient', phone_number)
    assertEquals(whatsapp.sendMessages.calls[0].args, [
      {
        chatbot_name: 'patient',
        messages: {
          message_body: 'What is your sex?',
          type: 'buttons',
          buttonText: 'Menu',
          options: [
            { id: 'male', title: 'Male' },
            { id: 'female', title: 'Female' },
          ],
        },
        phone_number,
      },
    ])

    const { conversation_state, patient_id } =
      await getPatientLastConversationState(
        db,
        {
          phone_number,
        },
      )

    assertEquals(
      conversation_state,
      'not_onboarded:make_appointment:enter_sex',
    )

    const patient = await patients.getById(db, patient_id)
    assertEquals(patient.name, 'Test Patient')
  })
})
