import * as patients from "../models/patients.ts";
import * as appointments from "../models/appointments.ts";
import * as whatsapp from "../external-clients/whatsapp.ts";
import determineNextPatientState, {
  formatMessageToSend,
} from "./determineNextPatientState.ts";
import {
  getUnhandledPatientMessages,
  insertMessageSent,
} from "../models/conversations.ts";
import conversationStates from "./conversationStates.ts";
import { MessageOption, UnhandledPatientMessage } from "../types.ts";

export async function handlePatientMessage(
  patientMessage: UnhandledPatientMessage,
): Promise<any> {
  const next = determineNextPatientState(patientMessage);

  let messageToSend: string | {
    messageBody: string;
    buttonText: string;
    options: MessageOption[];
  };

  if (next === "invalid_response") {
    messageToSend = `Sorry, I didn't understand that.\n\n${
      formatMessageToSend(
        conversationStates[patientMessage.conversation_state!],
        patientMessage,
      )
    }`;
  } else {
    const nextStateKind = next.nextPatient?.conversation_state ||
      patientMessage.conversation_state!;
    const nextState = conversationStates[nextStateKind];
    console.log("nextStateKind", nextStateKind);

    if (nextState.onEnter) {
      console.log("onEnter");
      patientMessage = await nextState.onEnter(patientMessage, next);
    }
    if (next.nextPatient) {
      console.log("patients.upsert", JSON.stringify(next.nextPatient));
      await patients.upsert(next.nextPatient);
    }
    if (next.nextAppointment) {
      console.log("appointments.upsert", JSON.stringify(next.nextAppointment));
      await appointments.upsert(next.nextAppointment);
    }

    messageToSend = formatMessageToSend(nextState, {
      ...patientMessage,
      ...next.nextPatient,
      scheduling_appointment_id: next.nextAppointment &&
        next.nextAppointment.id,
      scheduling_appointment_reason: next.nextAppointment &&
        next.nextAppointment.reason,
    });
  }

  console.log("messageToSend", JSON.stringify(messageToSend));

  const response = typeof messageToSend === "string"
    ? await whatsapp.sendMessage({
      phone_number: patientMessage.phone_number,
      messageBody: messageToSend,
    })
    : await whatsapp.sendMessageWithInteractiveButtons({
      phone_number: patientMessage.phone_number,
      messageBody: messageToSend.messageBody,
      options: messageToSend.options,
    });

  console.log("response", JSON.stringify(response));

  const insertedMessageSent = await insertMessageSent({
    patient_id: patientMessage.patient_id,
    responding_to_id: patientMessage.message_id,
    whatsapp_id: response.messages[0].id,
    body: JSON.stringify(messageToSend),
  });

  console.log("insertedMessageSent", JSON.stringify(insertedMessageSent));

  return response;
}

export type Responder = { start(): void; exit(): void };

export function createResponder(): Responder {
  let timer: number;

  // TODO: handle receiving more than one message in a row from same patient
  async function respond(): Promise<void> {
    const unhandledMessages = await getUnhandledPatientMessages();
    await Promise.all(unhandledMessages.map(handlePatientMessage));
    timer = setTimeout(respond, 10);
  }

  return {
    start: respond,
    exit(): void {
      console.log("Exiting responder");
      clearTimeout(timer);
    },
  };
}

createResponder().start();
