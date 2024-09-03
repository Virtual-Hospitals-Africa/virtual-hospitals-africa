import { Location, PharmacistChatbotUserState, TrxOrDb } from '../../types.ts'
import * as conversations from '../../db/models/conversations.ts'
import { assert } from 'std/assert/assert.ts'

export async function handleShareLocation(
  trx: TrxOrDb,
  pharmacistState: PharmacistChatbotUserState,
) {
  try {
    assert(pharmacistState.chatbot_user.entity_id)
    assert(pharmacistState.unhandled_message.trimmed_body)
    const locationMessage: Location = JSON.parse(
      pharmacistState.unhandled_message.trimmed_body,
    )
    const currentLocation: Location = {
      longitude: locationMessage.longitude,
      latitude: locationMessage.latitude,
    }

    //try to save it as data first and see if it works
    await conversations.updateChatbotUser(
      trx,
      pharmacistState.chatbot_user,
      {
        data: {
          ...pharmacistState.chatbot_user.data,
          currentLocation,
        },
      },
    )
    return 'onboarded:fill_prescription:enter_code' as const
  } catch (err) {
    console.error(err)
    return 'not_onboarded:reshare_location' as const
  }
}
