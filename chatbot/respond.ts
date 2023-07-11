import db from '../db/db.ts'
import {
  getUnhandledPatientMessages,
  markChatbotError,
} from '../db/models/conversations.ts'
import {
  ConversationStates,
  PatientConversationState,
  PatientState,
  TrxOrDb,
} from '../types.ts'
import { determineResponse } from './determineResponse.ts'
import { insertMessageSent } from '../db/models/conversations.ts'
import * as patients from '../db/models/patients.ts'
import { sendMessage } from '../external-clients/whatsapp.ts'
import patientConversationStates from './patient/conversationStates.ts'

const commitHash = Deno.env.get('HEROKU_SLUG_COMMIT') || 'local'

const updatePatientState = (trx: TrxOrDb, patientState: PatientState) =>
  patients.upsert(trx, patients.pick(patientState))

async function respondToPatientMessage(
  patientConversationStates: ConversationStates<
    PatientConversationState,
    PatientState
  >,
  patientState: PatientState,
) {
  try {
    const responseToSend = await db
      .transaction()
      .execute((trx) =>
        determineResponse(
          trx,
          patientConversationStates,
          patientState,
          updatePatientState,
        )
      )

    const whatsappResponse = await sendMessage({
      message: responseToSend,
      phone_number: patientState.phone_number,
    })

    if ('error' in whatsappResponse) {
      console.log('responseToSend', JSON.stringify(responseToSend))
      console.log('whatsappResponse', JSON.stringify(whatsappResponse))
      throw new Error(whatsappResponse.error.details)
    }

    await insertMessageSent(db, {
      patient_id: patientState.patient_id,
      responding_to_id: patientState.message_id,
      whatsapp_id: whatsappResponse.messages[0].id,
      body: JSON.stringify(responseToSend),
    })
  } catch (err) {
    console.log('Error determining message to send')
    console.error(err)

    await sendMessage({
      message: {
        type: 'string',
        messageBody: `An unknown error occured: ${err.message}`,
      },
      phone_number: patientState.phone_number,
    })

    await markChatbotError(db, {
      commitHash,
      whatsapp_message_received_id: patientState.message_id,
      errorMessage: err.message,
    })
  }
}

export default async function respond() {
  const unhandledMessages = await getUnhandledPatientMessages(db, {
    commitHash,
  })
  return await Promise.all(
    unhandledMessages.map((msg) =>
      respondToPatientMessage(patientConversationStates, msg)
    ),
  )
}
