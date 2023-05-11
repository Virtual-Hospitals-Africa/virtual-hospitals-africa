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

// const sendMessageWithInteractiveList = (opts: {
//   phone_number: string;
// }): Promise<{
//   messaging_product: "whatsapp";
//   contacts: [{ input: string; wa_id: string }];
//   messages: [{ id: string }];
// }> => {
//   const toPost = {
//     method: "post",
//     headers: { Authorization, "Content-Type": "application/json" },
//     body: JSON.stringify({
//       messaging_product: "whatsapp",
//       to: opts.phone_number,
//       type: "interactive",
//       interactive: {
//         type: "list",
//         header: {
//           type: "text",
//           text: "your-header-content",
//         },
//         body: {
//           text: "your-text-message-content",
//         },
//         footer: {
//           text: "your-footer-content",
//         },
//         action: {
//           button: "cta-button-content",
//           sections: [
//             {
//               title: "title-content1",
//               rows: [
//                 {
//                   id: "unique-row-identifier1",
//                   title: "row-title-content1",
//                   description: "row-description-content1",
//                 },
//               ],
//             },
//             {
//               title: "title-content2",
//               rows: [
//                 {
//                   id: "unique-row-identifier2",
//                   title: "row-title-content2",
//                   description: "row-description-content2",
//                 },
//               ],
//             },
//           ],
//         },
//       },
//     }),
//   };

//   console.log("toPost", JSON.stringify(toPost));

//   const response = await fetch(postMessageRoute, toPost);

//   return response.json();
// };

export async function determinePatientMessage(
  trx: TrxOrDb,
  patientMessage: UnhandledPatientMessage
): Promise<WhatsAppSendable> {
  const next = determineNextPatientState(patientMessage);

  if (next === "invalid_response") {
    const originalMessageSent = formatMessageToSend(patientMessage);
    return typeof originalMessageSent === "string"
      ? sorry(originalMessageSent)
      : {
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
