// import { map } from "bluebird";
// import * as patients from "./models/patients";
// import * as appointments from "./models/appointments";
// import * as whatsapp from "./whatsapp";
// import determineNextPatientState, {
//   formatMessageToSend,
// } from "./determineNextPatientState";
// import {
//   getUnhandledPatientMessages,
//   insertMessageSent,
// } from "./models/conversations";
// import conversationStates from "./conversationStates";

// export async function handlePatientMessage(
//   patientMessage: UnhandledPatientMessage,
// ): Promise<any> {
//   const next = determineNextPatientState(patientMessage);

//   let messageBody: string;

//   if (next === "invalid_response") {
//     messageBody = `Sorry, I didn't understand that.\n\n${
//       formatMessageToSend(
//         conversationStates[patientMessage.conversation_state!],
//         patientMessage,
//       )
//     }`;
//   } else {
//     const nextStateKind = next.nextPatient?.conversation_state ||
//       patientMessage.conversation_state!;
//     const nextState = conversationStates[nextStateKind];
//     console.log("nextStateKind", nextStateKind);

//     if (nextState.onEnter) {
//       console.log("onEnter");
//       patientMessage = await nextState.onEnter(patientMessage, next);
//     }
//     if (next.nextPatient) {
//       console.log("patients.upsert", JSON.stringify(next.nextPatient));
//       await patients.upsert(next.nextPatient);
//     }
//     if (next.nextAppointment) {
//       console.log("appointments.upsert", JSON.stringify(next.nextAppointment));
//       await appointments.upsert(next.nextAppointment);
//     }

//     messageBody = formatMessageToSend(nextState, {
//       ...patientMessage,
//       ...next.nextPatient,
//       scheduling_appointment_id: next.nextAppointment &&
//         next.nextAppointment.id,
//       scheduling_appointment_reason: next.nextAppointment &&
//         next.nextAppointment.reason,
//     });
//   }

//   console.log("messageBody", JSON.stringify(messageBody));

//   const response = await whatsapp.sendMessage({
//     phone_number: patientMessage.phone_number,
//     messageBody,
//   });

//   const insertedMessageSent = await insertMessageSent({
//     patient_id: patientMessage.patient_id,
//     responding_to_id: patientMessage.message_id,
//     whatsapp_id: response.data.messages[0].id,
//     body: messageBody,
//   });

//   console.log("insertedMessageSent", JSON.stringify(insertedMessageSent));

//   return response;
// }

// export type Responder = { start(): void; exit(): void };

// export function createResponder(): Responder {
//   let timer: number;

//   async function respond(): Promise<void> {
//     const unhandledMessages = await getUnhandledPatientMessages();
//     // TODO: handle receiving more than one message in a row from same patient
//     await map(unhandledMessages, handlePatientMessage, { concurrency: 6 });
//     timer = setTimeout(respond, 10);
//   }

//   return {
//     start: respond,
//     exit(): void {
//       console.log("Exiting responder");
//       clearTimeout(timer);
//     },
//   };
// }
