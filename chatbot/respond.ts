import db from '../db/db.ts'
import {
  getUnhandledPatientMessages,
  markChatbotError,
} from '../db/models/conversations.ts'
import {
  ConversationStates,
  PatientConversationState,
  PatientState,

  WhatsAppJSONResponse,
  WhatsAppSendable,
  WhatsAppSingleSendable,
} from '../types.ts'
import { determineResponse } from './determineResponse.ts'
import { insertMessageSent } from '../db/models/conversations.ts'
import patientConversationStates from './patient/conversationStates.ts'
import { updatePatientState } from './patient/util.ts'

type WhatsApp = {
  sendMessage(opts: {
    phone_number: string
    message: WhatsAppSingleSendable
  }): Promise<WhatsAppJSONResponse>
  sendMessages(opts: {
    phone_number: string
    messages: WhatsAppSingleSendable | WhatsAppSendable
  }): Promise<WhatsAppJSONResponse[]>
}

const commitHash = Deno.env.get('HEROKU_SLUG_COMMIT') || 'local'


async function respondToPatientMessage(
  whatsapp: WhatsApp,
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

    const whatsappResponses = await whatsapp.sendMessages({
      messages: responseToSend,
      phone_number: patientState.phone_number,
    })

    for (const whatsappResponse of whatsappResponses) {
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
    }
  } catch (err) {
    console.log('Error determining message to send')
    console.error(err)

    await whatsapp.sendMessage({
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

export default async function respond(whatsapp: WhatsApp) {
  const unhandledMessages = await getUnhandledPatientMessages(db, {
    commitHash,
  })
  return Promise.all(
    unhandledMessages.map((msg) =>
      respondToPatientMessage(whatsapp, patientConversationStates, msg)
    ),
  )
}
