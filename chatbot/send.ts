import { sendMessage } from "../external-clients/whatsapp.ts";
import { insertMessageSent } from "../models/conversations.ts";
import { UnhandledPatientMessage, WhatsAppSendable } from "../types.ts";

export async function send(
  message: WhatsAppSendable,
  patientMessage: UnhandledPatientMessage
) {
  const whatsappResponse = await sendMessage({
    message,
    phone_number: patientMessage.phone_number,
  });

  if ("error" in whatsappResponse) {
    console.log("whatsappResponse", JSON.stringify(whatsappResponse));
    throw new Error(whatsappResponse.error.details);
  }

  const insertedMessageSent = await insertMessageSent({
    // instert the message in the database
    patient_id: patientMessage.patient_id,
    responding_to_id: patientMessage.message_id,
    whatsapp_id: whatsappResponse.messages[0].id,
    body: JSON.stringify(message),
  });

  return { whatsappResponse, insertedMessageSent };
}
