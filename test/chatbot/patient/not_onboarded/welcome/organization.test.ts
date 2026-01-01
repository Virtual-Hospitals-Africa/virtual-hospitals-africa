import { afterAll, describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../../../../db/db.ts'
import respond from '../../../../../chatbot/respond.ts'
import * as conversations from '../../../../../db/models/conversations.ts'
import * as patients from '../../../../../db/models/patients.ts'
import { getPatientLastConversationState } from '../../../../../db/models/patient_chatbot_users.ts'
import generateUUID from '../../../../../util/uuid.ts'
import randomNationalId from '../../../../../mocks/randomNationalId.ts'
import randomPhoneNumber from '../../../../../mocks/randomPhoneNumber.ts'
import { mockWhatsApp } from '../../../mockWhatsApp.ts'
import { Sex } from '../../../../../types.ts'

describeParallel'patient chatbot', () => {
  afterAll(() => db.destroy())
  itParallel('sends invitation to share location after welcome message', async () => {
    const phone_number = randomPhoneNumber('ZW')
    const sex: Sex = 'female'
    const date_of_birth = '2023-01-01'
    await patients.insert(db, {
      conversation_state: 'not_onboarded:welcome',
      phone_number,
      name: 'Test Patient',
      sex,
      gender: 'Woman',
      date_of_birth: '2023-01-01',
      national_id_number: randomNationalId({
        country: 'ZA',
        sex,
        date_of_birth,
      }),
    })

    await conversations.insertMessageReceived(db, {
      chatbot_name: 'patient',
      received_by_phone_number: '263XXXXXX',
      sent_by_phone_number: phone_number,
      has_media: false,
      body: 'find_nearest_facilities',
      media_id: null,
      whatsapp_id: `wamid.${generateUUID()}`,
    })

    const whatsapp = mockWhatsApp()

    await respond(whatsapp, 'patient', phone_number)
    assertEquals(whatsapp.sendMessages.calls[0].args, [
      {
        chatbot_name: 'patient',
        messages: {
          type: 'string',
          message_body:
            'Sure, we can find your nearest organization. Can you share your location?',
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
      'find_nearest_facilities:share_location',
    )
  })
})
