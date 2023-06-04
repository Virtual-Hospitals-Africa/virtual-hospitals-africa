// import { faker } from "faker";
// import { PatientState } from "../types.ts";

// function incrementingIds() {
//   let id = 0;
//   return {
//     next: () => ++id
//   }
// }

// const messageIds = incrementingIds();
// const patientIds = incrementingIds();

// export function makePatientMessage(): PatientState {
//   return {
//     message_id: messageIds.next(),
//     patient_id: patientIds.next(),
//     whatsapp_id: string;
//     body: string;
//     phone_number: string;
//     name: Maybe<string>;
//     gender: Maybe<Gender>;
//     date_of_birth: Maybe<string>;
//     national_id_number: Maybe<string>;
//     conversation_state: Maybe<ConversationState>;
//     scheduling_appointment_id?: number;
//     scheduling_appointment_reason?: Maybe<string>;
//     appointment_offered_times: [null] | ReturnedSqlRow<
//       AppointmentOfferedTime & { doctor_name: string }
//     >[];
//     created_at: Date;
//     updated_at: Date;
//   };
// }
