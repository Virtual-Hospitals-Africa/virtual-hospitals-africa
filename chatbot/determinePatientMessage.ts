import * as patients from "../models/patients.ts";
import * as appointments from "../models/appointments.ts";
import determineNextPatientState, {
  formatMessageToSend,
} from "./determineNextPatientState.ts";
import conversationStates from "./conversationStates.ts";
import {
  TrxOrDb,
  UnhandledPatientMessage,
  WhatsAppSendable,
} from "../types.ts";

export async function determinePatientMessage(
  trx: TrxOrDb,
  patientMessage: UnhandledPatientMessage,
): Promise<WhatsAppSendable> {
  const next = determineNextPatientState(patientMessage);

  if (next === "invalid_response") {
    const originalMessageSent = formatMessageToSend(patientMessage);
    return typeof originalMessageSent === "string"
      ? `Sorry, I didn't understand that.\n\n${originalMessageSent}`
      : {
        ...originalMessageSent,
        messageBody:
          `Sorry, I didn't understand that.\n\n${originalMessageSent.messageBody}`,
      };
  }

  patientMessage = {
    ...patientMessage,
    ...next.nextPatient,
  };

  if (next.nextPatient) {
    console.log("patients.upsert", JSON.stringify(next.nextPatient));
    await patients.upsert(trx, next.nextPatient);
  }
  if (next.nextAppointment) {
    console.log("appointments.upsert", JSON.stringify(next.nextAppointment));
    await appointments.upsert(trx, next.nextAppointment);
  }

  const nextState = conversationStates[patientMessage.conversation_state!];

  if (nextState.onEnter) {
    patientMessage = await nextState.onEnter(trx, patientMessage, next);
    console.log("after onEnter", JSON.stringify(patientMessage));
  }

  return formatMessageToSend({
    ...patientMessage,
    scheduling_appointment_id: next.nextAppointment &&
      next.nextAppointment.id,
    scheduling_appointment_reason: next.nextAppointment &&
      next.nextAppointment.reason,
  });
}
