import db from "../db/db.ts";
import {
  getUnhandledPatientMessages,
  markChatbotError,
} from "../db/models/conversations.ts";
import { UnhandledPatientMessage } from "../types.ts";
import { determineResponse } from "./determineResponse.ts";
import { insertMessageSent } from "../db/models/conversations.ts";
import { sendMessage } from "../external-clients/whatsapp.ts";

const commitHash = Deno.env.get("HEROKU_SLUG_COMMIT") || "local";

async function respondToPatientMessage(patientMessage: UnhandledPatientMessage) {
  try {
    const responseToSend = await db
      .transaction()
      .execute((trx) => determineResponse(trx, patientMessage));

    const whatsappResponse = await sendMessage({
      message: responseToSend,
      phone_number: patientMessage.phone_number,
    });

    if ("error" in whatsappResponse) {
      console.log("whatsappResponse", JSON.stringify(whatsappResponse));
      throw new Error(whatsappResponse.error.details);
    }

    await insertMessageSent({
      patient_id: patientMessage.patient_id,
      responding_to_id: patientMessage.message_id,
      whatsapp_id: whatsappResponse.messages[0].id,
      body: JSON.stringify(responseToSend),
    });
  
  } catch (err) {

    console.log("Error determining message to send");
    console.error(err);

    await sendMessage({
      message: {
        type: "string",
        messageBody: `An unknown error occured: ${err.message}`,
      },
      phone_number: patientMessage.phone_number,
    });

    await markChatbotError({
      commitHash,
      whatsapp_message_received_id: patientMessage.message_id,
      errorMessage: err.message,
    });
  }
}

export default async function respond() {
  const unhandledMessages = await getUnhandledPatientMessages({ commitHash });
  return await Promise.all(unhandledMessages.map(respondToPatientMessage));
}
