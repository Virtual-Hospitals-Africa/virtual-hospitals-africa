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
    const originalMessageSent = formatMessageToSend(
      conversationStates[patientMessage.conversation_state!],
      patientMessage,
    );
    return typeof originalMessageSent === "string"
      ? `Sorry, I didn't understand that.\n\n${originalMessageSent}`
      : {
        ...originalMessageSent,
        messageBody:
          `Sorry, I didn't understand that.\n\n${originalMessageSent.messageBody}`,
      };
  }

  const nextStateKind = next.nextPatient?.conversation_state ||
    patientMessage.conversation_state!;
  const nextState = conversationStates[nextStateKind];
  console.log("nextStateKind", nextStateKind);

  if (nextState.onEnter) {
    console.log("onEnter");
    try {
      patientMessage = await nextState.onEnter(trx, patientMessage, next);
    } catch (err) {
      console.log("WELKWEKLWELKWEKLWE");
      console.error(err);
      throw err;
    }
  }
  if (next.nextPatient) {
    console.log("patients.upsert", JSON.stringify(next.nextPatient));
    await patients.upsert(trx, next.nextPatient);
  }
  if (next.nextAppointment) {
    console.log("appointments.upsert", JSON.stringify(next.nextAppointment));
    await appointments.upsert(trx, next.nextAppointment);
  }

  return formatMessageToSend(nextState, {
    ...patientMessage,
    ...next.nextPatient,
    scheduling_appointment_id: next.nextAppointment &&
      next.nextAppointment.id,
    scheduling_appointment_reason: next.nextAppointment &&
      next.nextAppointment.reason,
  });
}
