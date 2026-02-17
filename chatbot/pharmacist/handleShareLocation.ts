import { Coordinates, PharmacistChatbotUserState, TrxOrDb } from '../../types.ts'
import { conversations } from '../../db/models/conversations.ts'
import { pharmacists } from '../../db/models/pharmacists.ts'
import { assert } from 'std/assert/assert.ts'
import { assertIsConversationState } from './conversationStates.ts'

export async function handleShareLocation(
  trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
) {
  const { licence_number, pharmacy_licence_number } = pharmacistState.chatbot_user.data
  assert(typeof licence_number === 'string')
  assert(typeof pharmacy_licence_number === 'string')

  let location: Coordinates
  try {
    assert(pharmacistState.unhandled_message.trimmed_body)
    const location_message: Coordinates = JSON.parse(
      pharmacistState.unhandled_message.trimmed_body,
    )
    location = {
      longitude: location_message.longitude,
      latitude: location_message.latitude,
    }
  } catch (err) {
    console.error(err)
    return 'not_onboarded:reshare_location' as const
  }

  const pharmacist = await pharmacists.getByLicence(trx, licence_number)
  assert(pharmacist, 'Pharmacist not found')

  await conversations.updateChatbotUser(
    trx,
    pharmacistState.chatbot_user,
    {
      entity_id: pharmacist.id,
      data: {
        ...pharmacistState.chatbot_user.data,
        location,
      },
    },
  )

  const { after_onboarding_state } = pharmacistState.chatbot_user.data
  assertIsConversationState(after_onboarding_state)
  return after_onboarding_state
}
