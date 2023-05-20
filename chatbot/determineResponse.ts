import * as patients from "../db/models/patients.ts";
import * as appointments from "../db/models/appointments.ts";
import determineNextPatientState, {
  formatMessageToSend,
} from "./determineNextPatientState.ts";
import conversationStates from "./conversationStates.ts";
import {
  TrxOrDb,
  UnhandledPatientMessage,
  WhatsAppSendable,
} from "../types.ts";

const sorry = (msg: string) => `Sorry, I didn't understand that.\n\n${msg}`;


export async function determineResponse(
  trx: TrxOrDb,
  patientMessage: UnhandledPatientMessage
): Promise<WhatsAppSendable> {

  const next = determineNextPatientState(patientMessage);

  if (next === "invalid_response") {
    // This is returning the type string
    const originalMessageSent = formatMessageToSend(patientMessage);
    return {
      ...originalMessageSent,
      messageBody: sorry(originalMessageSent.messageBody),
    };
  }

  patientMessage = {
    ...patientMessage,
    ...next.nextPatient,
  };

  if (next.nextPatient) {
    await patients.upsert(trx, next.nextPatient);
  }
  if (next.nextAppointment) {
    await appointments.upsert(trx, next.nextAppointment);
  }

  const nextState = conversationStates[patientMessage.conversation_state!];

  if (nextState.onEnter) {
    patientMessage = await nextState.onEnter(trx, patientMessage, next);
    console.log("after onEnter", JSON.stringify(patientMessage));
  }

  return formatMessageToSend({
    ...patientMessage,
    scheduling_appointment_id: next.nextAppointment && next.nextAppointment.id,
    scheduling_appointment_reason:
      next.nextAppointment && next.nextAppointment.reason,
  });
}
