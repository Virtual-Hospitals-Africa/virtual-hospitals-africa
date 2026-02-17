import { assert } from 'std/assert/assert.ts'
import { TrxOrDbOrQueryCreator } from '../../types.ts'
import { assertFoundEventually } from '../../util/assertEventually.ts'
import { conversations } from './conversations.ts'

export const patient_chatbot_users = {
  async getPatientLastConversationState(
    trx: TrxOrDbOrQueryCreator,
    query: { phone_number: string },
  ) {
    const user = await assertFoundEventually(conversations.getUser(
      trx,
      'patient',
      {
        phone_number: query.phone_number,
      },
    ))
    assert(user.entity_id)
    return {
      patient_id: user.entity_id,
      chatbot_user_id: user.id,
      conversation_state: user.conversation_state,
    }
  },
}
