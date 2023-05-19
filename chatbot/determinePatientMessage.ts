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

const sorry = (msg: string) => `Sorry, I didn't understand that.\n\n${msg}`;

export function sendMessageWithInteractiveList(opts: { phone_number: string }) {
  const toPost = {
    method: "post",

    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: opts.phone_number,
      type: "interactive",

      interactive: {
        type: "list",
        header: {
          type: "text",
          text: "Select Other Appointment",
        },
        action: {
          button: "cta-button-content",
          sections: [
            {
              title: "Time 6pm",
              rows: [
                {
                  id: "message_id_1",
                  title: "Time 6pm",
                  description: "With Doctor Aryan",
                },
              ],
            },
            {
              title: "Time 6:30pm",
              rows: [
                {
                  id: "message_id_1",
                  title: "message_id_2",
                  description: "With doctor chun",
                },
              ],
            },
          ],
        },
      },
    }),
  };

  return toPost.headers;
}

export async function determinePatientMessage(
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
    scheduling_appointment_id: next.nextAppointment && next.nextAppointment.id,
    scheduling_appointment_reason:
      next.nextAppointment && next.nextAppointment.reason,
  });
}
