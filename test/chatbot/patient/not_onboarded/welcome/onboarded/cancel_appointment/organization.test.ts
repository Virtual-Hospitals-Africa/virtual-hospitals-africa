import { afterAll, describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../../../../../../db/db.ts'
import respond from '../../../../../../../chatbot/respond.ts'
import { conversations } from '../../../../../../../db/models/conversations.ts'
import { patients } from '../../../../../../../db/models/patients.ts'
import { getPatientLastConversationState } from '../../../../../../../db/models/patient_chatbot_users.ts'

import generateUUID from '../../../../../../../util/uuid.ts'
import randomPhoneNumber from '../../../../../../../mocks/randomPhoneNumber.ts'
import { mockWhatsApp } from 'test/_helpers/mockWhatsApp.ts'
import randomDemographics from '../../../../../../../mocks/randomDemographics.ts'

describe('patient chatbot', () => {
  afterAll(() => db.destroy())
  it(
    'sends invitation to share location after canceling appointent',
    async () => {
      const phone_number = randomPhoneNumber('ZW')
      const demographics = randomDemographics()
      await patients.insert(db, {
        conversation_state: 'onboarded:appointment_cancelled',
        phone_number,
        ...demographics,
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
    },
  )
})
