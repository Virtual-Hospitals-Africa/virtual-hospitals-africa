import { afterAll, describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../../../../../../db/db.ts'
import respond from '../../../../../../../chatbot/respond.ts'
import { conversations } from '../../../../../../../db/models/conversations.ts'
import { patients } from '../../../../../../../db/models/patients.ts'
import { patient_chatbot_users } from '../../../../../../../db/models/patient_chatbot_users.ts'

import generateUUID from '../../../../../../../util/uuid.ts'
import randomNationalId from '../../../../../../../mocks/randomNationalId.ts'
import randomPhoneNumber from '../../../../../../../mocks/randomPhoneNumber.ts'
import { mockWhatsApp } from 'test/_helpers/mockWhatsApp.ts'
import randomDemographics from '../../../../../../../mocks/randomDemographics.ts'

describe('patient chatbot', () => {
  afterAll(() => db.destroy())
  it('asks for media after inquiring appointment reason', async () => {
    const phone_number = randomPhoneNumber('ZW')
    const demographics = randomDemographics()
    await patients.insert(db, {
      conversation_state: 'not_onboarded:make_appointment:enter_national_id_number',
      phone_number,
      ...demographics,
    })

    await conversations.insertMessageReceived(db, {
      chatbot_name: 'patient',
      received_by_phone_number: '263XXXXXX',
      sent_by_phone_number: phone_number,
      has_media: false,
      body: randomNationalId(demographics),
      media_id: null,
      whatsapp_id: `wamid.${generateUUID()}`,
    })

    const whatsapp_one = mockWhatsApp()

    await respond(whatsapp_one, 'patient', phone_number)

    await conversations.insertMessageReceived(db, {
      chatbot_name: 'patient',
      received_by_phone_number: '263XXXXXX',
      sent_by_phone_number: phone_number,
      has_media: false,
      body: 'pain',
      media_id: null,
      whatsapp_id: `wamid.${generateUUID()}`,
    })

    const whatsapp_two = mockWhatsApp()

    await respond(whatsapp_two, 'patient')
    assertEquals(whatsapp_two.sendMessages.calls[0].args, [
      {
        chatbot_name: 'patient',
        messages: {
          message_body: 'To assist the doctor with triaging your case, click the + button to send an image, video, or voice note describing your symptoms.',
          type: 'buttons',
          buttonText: 'Menu',
          options: [{ id: 'skip', title: 'Skip' }],
        },
        phone_number,
      },
    ])
    const patient = await patient_chatbot_users.getPatientLastConversationState(
      db,
      {
        phone_number,
      },
    )

    assert(patient)
    assertEquals(
      patient.conversation_state,
      'onboarded:make_appointment:initial_ask_for_media',
    )
  })
})
