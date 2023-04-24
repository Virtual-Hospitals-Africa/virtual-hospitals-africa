import { assert } from "std/testing/asserts.ts";
import { prettyAppointmentTime, prettyPatientDateOfBirth } from "./date.ts";
import { firstAvailableThirtyMinutes } from "./getDoctorAvailability.ts";
import { makeAppointment } from "./makeAppointment.ts";
import * as appointments from "./models/appointments.ts";
import {
  AppointmentOfferedTime,
  ConversationState,
  ConversationStateHandler,
  ConversationStateHandlerReturn,
  Falsy,
  PatientDemographicInfo,
  ReturnedSqlRow,
  UnhandledPatientMessage,
} from "./types.ts";

function compact<T>(arr: (T | Falsy)[]): T[] {
  const toReturn: T[] = [];
  for (const item of arr) {
    if (item) {
      toReturn.push(item);
    }
  }
  return toReturn;
}

const conversationStates: {
  [state in ConversationState]: ConversationStateHandler;
} = {
  "not_onboarded:welcome": {
    type: "select",
    prompt:
      "Hello! I'm Nonpilo, a robot that can help connect you to various health services. What can I help you with today?",
    options: [
      {
        option: "make_appointment",
        display: "Make appointment",
        aliases: ["appt", "appointment", "doctor", "specialist"],
        onResponse: "not_onboarded:make_appointment:enter_name",
      },
      {
        option: "submit_medical_updates",
        display: "Submit updates",
        aliases: ["submit", "medical", "updates"],
        onResponse: "not_onboarded:submit_medical_updates:check_onboarding",
      },
      {
        option: "services",
        display: "Services",
        aliases: ["services"],
        onResponse: "not_onboarded:services:check_onboarding",
      },
    ],
  },
  "not_onboarded:make_appointment:enter_name": {
    type: "string",
    prompt:
      "Sure, I can help you make an appointment with a doctor.\n\nTo start, what is your name?",
    onResponse(
      patientMessage: UnhandledPatientMessage,
    ): ConversationStateHandlerReturn {
      return {
        nextState: "not_onboarded:make_appointment:enter_gender",
        patientUpdates: {
          name: patientMessage.body,
        },
      };
    },
  },
  "not_onboarded:make_appointment:enter_gender": {
    prompt(patient: PatientDemographicInfo): string {
      return `Thanks ${
        patient.name!.split(" ")[0]
      }, I will remember that.\n\nWhat is your gender?`;
    },
    type: "select",
    options: [
      {
        option: "male",
        display: "Male",
        aliases: ["male", "m"],
        onResponse(
          _patientMessage: UnhandledPatientMessage,
        ): ConversationStateHandlerReturn {
          return {
            nextState: "not_onboarded:make_appointment:enter_date_of_birth",
            patientUpdates: { gender: "male" },
          };
        },
      },
      {
        option: "female",
        display: "Female",
        aliases: ["female", "f"],
        onResponse(
          _patientMessage: UnhandledPatientMessage,
        ): ConversationStateHandlerReturn {
          return {
            nextState: "not_onboarded:make_appointment:enter_date_of_birth",
            patientUpdates: { gender: "female" },
          };
        },
      },
      {
        option: "other",
        display: "Other",
        aliases: ["other", "o"],
        onResponse(
          _patientMessage: UnhandledPatientMessage,
        ): ConversationStateHandlerReturn {
          return {
            nextState: "not_onboarded:make_appointment:enter_date_of_birth",
            patientUpdates: { gender: "other" },
          };
        },
      },
    ],
  },
  "not_onboarded:make_appointment:enter_date_of_birth": {
    type: "date",
    prompt: "Thanks for that information. What is your date of birth?",
    onResponse(
      patientMessage: UnhandledPatientMessage,
    ): ConversationStateHandlerReturn {
      const [day, month, year] = patientMessage.body.split("/");
      console.log(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`);

      return {
        nextState: "not_onboarded:make_appointment:enter_national_id_number",
        patientUpdates: {
          date_of_birth: `${year}-${month.padStart(2, "0")}-${
            day.padStart(2, "0")
          }`,
        },
      };
    },
  },
  "not_onboarded:make_appointment:enter_national_id_number": {
    type: "string",
    prompt(patient: PatientDemographicInfo): string {
      return `Got it, ${
        prettyPatientDateOfBirth(patient)
      }. Please enter your national ID number`;
    },
    onResponse(
      patientMessage: UnhandledPatientMessage,
    ): ConversationStateHandlerReturn {
      return {
        nextState: "onboarded:make_appointment:enter_appointment_reason",
        patientUpdates: {
          national_id_number: patientMessage.body,
        },
      };
    },
  },
  "not_onboarded:submit_medical_updates:check_onboarding": {
    type: "string",
    prompt: "Not implemented",
    onResponse: "other_end_of_demo",
  },
  "not_onboarded:services:check_onboarding": {
    type: "string",
    prompt: "Not implemented",
    onResponse: "other_end_of_demo",
  },
  "onboarded:make_appointment:enter_appointment_reason": {
    type: "string",
    async onEnter(
      patientMessage: UnhandledPatientMessage,
    ): Promise<UnhandledPatientMessage> {
      await appointments.createNew({ patient_id: patientMessage.patient_id });
      return patientMessage;
    },
    prompt(patientMessage: UnhandledPatientMessage): string {
      return `Got it, ${patientMessage.national_id_number}. What is the reason you want to schedule an appointment?`;
    },
    onResponse(
      patientMessage: UnhandledPatientMessage,
    ): ConversationStateHandlerReturn {
      return {
        nextState: "onboarded:make_appointment:confirm_details",
        appointmentUpdates: {
          reason: patientMessage.body,
        },
      };
    },
  },
  "onboarded:make_appointment:confirm_details": {
    type: "select",
    prompt(patientMessage: UnhandledPatientMessage): string {
      return `Got it, ${patientMessage.scheduling_appointment_reason}. In summary, your name is ${patientMessage.name}, you're messaging from ${patientMessage.phone_number}, you are a ${patientMessage.gender} born on ${
        prettyPatientDateOfBirth(patientMessage)
      } with national id number ${patientMessage.national_id_number} and you want to schedule an appointment for ${patientMessage.scheduling_appointment_reason}. Is this correct?`;
    },
    options: [
      {
        option: "confirm",
        display: "Yes",
        aliases: ["yes", "confirm", "correct"],
        onResponse: "onboarded:make_appointment:first_scheduling_option",
      },
      {
        option: "go_back",
        display: "Go back",
        aliases: ["back"],
        onResponse: "other_end_of_demo",
      },
      {
        option: "cancel",
        display: "Cancel",
        aliases: ["cancel"],
        onResponse: "other_end_of_demo",
      },
    ],
  },
  "onboarded:make_appointment:first_scheduling_option": {
    type: "select",
    async onEnter(
      patientMessage: UnhandledPatientMessage,
    ): Promise<UnhandledPatientMessage> {
      const firstAvailable = await firstAvailableThirtyMinutes();

      const offeredTime = await appointments.addOfferedTime({
        appointment_id: patientMessage.scheduling_appointment_id!,
        doctor_id: firstAvailable.doctor.id,
        start: firstAvailable.start,
      });

      const nextOfferedTimes: ReturnedSqlRow<
        AppointmentOfferedTime & { doctor_name: string }
      >[] = [
        offeredTime,
        ...compact(patientMessage.appointment_offered_times),
      ];

      return {
        ...patientMessage,
        appointment_offered_times: nextOfferedTimes,
      };
    },
    prompt(patientMessage: UnhandledPatientMessage): string {
      assert(
        patientMessage.appointment_offered_times[0],
        "onEnter should have added an appointment_offered_time",
      );
      return `Great, the next available appoinment is ${
        prettyAppointmentTime(patientMessage.appointment_offered_times[0].start)
      }. Would you like to schedule this appointment?`;
    },
    options: [
      {
        option: "confirm",
        display: "Yes",
        aliases: ["yes", "confirm", "correct"],
        onResponse: "onboarded:appointment_scheduled",
      },
      {
        option: "other_times",
        display: "No, what are other available times",
        aliases: ["other"],
        onResponse: "onboarded:make_appointment:other_scheduling_options",
      },
      {
        option: "go_back",
        display: "No, I want to start over",
        aliases: ["no", "cancel", "back", "over"],
        onResponse: "other_end_of_demo",
      },
    ],
  },
  // TODO: support other options
  "onboarded:make_appointment:other_scheduling_options": {
    type: "select",
    prompt(_patientMessage: UnhandledPatientMessage): string {
      return "Ok, do you have a prefered time?";
    },
    options: [
      {
        option: "1",
        display: "Sunday, 19 February at 11:00am Harare time",
        onResponse: "onboarded:appointment_scheduled",
      },
      {
        option: "2",
        display: "Sunday, 19 February at 12:00am Harare time",
        onResponse: "onboarded:appointment_scheduled",
      },
      {
        option: "3",
        display: "Monday, 20 February at 11:00am Harare time",
        onResponse: "onboarded:appointment_scheduled",
      },
      {
        option: "4",
        display: "Monday, 20 February at 12:00am Harare time",
        onResponse: "onboarded:appointment_scheduled",
      },
      {
        option: "other_times",
        display: "None of these work, what are other available times",
        aliases: ["other"],
        onResponse: "onboarded:make_appointment:other_scheduling_options",
      },
      {
        option: "go_back",
        display: "No, I want to start over",
        aliases: ["no", "cancel", "back", "over"],
        onResponse: "other_end_of_demo",
      },
    ],
  },
  "onboarded:appointment_scheduled": {
    type: "string",
    onEnter(
      patientMessage: UnhandledPatientMessage,
    ): Promise<UnhandledPatientMessage> {
      return makeAppointment(patientMessage);
    },
    prompt(patientMessage: UnhandledPatientMessage): string {
      assert(patientMessage.appointment_offered_times[0]);
      assert(
        patientMessage.appointment_offered_times[0].scheduled_gcal_event_id,
      );
      return `Thanks ${
        patientMessage.name!.split(" ")[0]
      }, you will receive a call from ${
        patientMessage.appointment_offered_times[0].doctor_name
      }, ${
        prettyAppointmentTime(patientMessage.appointment_offered_times[0].start)
      }. You will receive notifications at 30 minutes and 5 minutes before the appointment. If you need to cancel or reschedule prior to this, please reply with the word "cancel" or "reschedule". [end of demo]`;
    },
    onResponse(): ConversationStateHandlerReturn {
      return {
        nextState: "other_end_of_demo",
      };
    },
  },
  "other_end_of_demo": {
    type: "end_of_demo",
    prompt: "This is the end of the demo. Thank you for participating!",
  },
};

export default conversationStates;
