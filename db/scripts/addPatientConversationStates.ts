import { sql } from 'kysely'
import patientConversationStates from '../../chatbot/patient/conversationStates.ts'
import selectEnumValues from '../selectEnumValues.ts'
import db from '../db.ts'

const conversationStates = Object.keys(patientConversationStates)

const conversationStatesInDb = await selectEnumValues('conversation_state')

const missingFromDb = conversationStates.filter((state) =>
  !conversationStatesInDb.includes(state)
)

for (const missing of missingFromDb) {
  await sql`ALTER TYPE conversation_state ADD VALUE ${missing}`.execute(db)
}
