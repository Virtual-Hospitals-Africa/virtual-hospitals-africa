import { sql } from 'kysely'
import db from '../db.ts'
import patientConversationStates from '../../chatbot/patient/conversationStates.ts'
import selectEnumValues from '../selectEnumValues.ts'

const conversationStates = Object.keys(patientConversationStates)

const conversationStatesInDb = await selectEnumValues('conversation_state')

const missingFromDb = conversationStates.filter((state) =>
  !conversationStatesInDb.includes(state)
)

for (const missing of missingFromDb) {
  console.log('adding missing state', missing)
  await sql`ALTER TYPE conversation_state ADD VALUE ${missing}`.execute(db)
}
