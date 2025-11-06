import { assert } from 'std/assert/assert.ts'
import { TrxOrDb } from '../../types.ts'
import { assertFoundEventually } from '../../util/assertEventually.ts'
import * as conversations from './conversations.ts'

export async function getPatientLastConversationState(
  trx: TrxOrDb,
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
}
