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
import randomDemographics from '../../../../../mocks/randomDemographics.ts'

describeParallel'patient chatbot', () => {
  afterAll(() => db.destroy())
  itParallel('asks for reason after inquiring national ID number', async () => {
    const phone_number = randomPhoneNumber('ZW')
    const { national_id_number, ...demographics } = randomDemographics()
    await patients.insert(db, {
      conversation_state:
        'not_onboarded:make_appointment:enter_national_id_number',
      phone_number,
      ...demographics,
      national_id_number: null,
    })

    await conversations.insertMessageReceived(db, {
      chatbot_name: 'patient',
      received_by_phone_number: '263XXXXXX',
      sent_by_phone_number: phone_number,
      has_media: false,
      body: national_id_number,
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
            'What is the reason you want to schedule an appointment?',
          type: 'string',
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
      'onboarded:make_appointment:enter_appointment_reason',
    )

    const patient = await patients.getById(db, patient_id)
    assertEquals(patient.national_id_number, national_id_number)
  })
})
