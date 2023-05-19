import { assert } from "std/testing/asserts.ts";
import {
  prettyAppointmentTime,
  prettyPatientDateOfBirth,
} from "../util/date.ts";
import { availableThirtyMinutes } from "./getDoctorAvailability.ts";
import { makeAppointment } from "./makeAppointment.ts";
import { cancelAppointment } from "./cancelAppointment.ts";
import * as appointments from "../models/appointments.ts";
import {
  AppointmentOfferedTime,
  ConversationState,
  ConversationStateHandler,
  ConversationStateHandlerReturn,
  Falsy,
  PatientDemographicInfo,
  ReturnedSqlRow,
  TrxOrDb,
  UnhandledPatientMessage,
} from "../types.ts";

// Is this important??
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
      "Welcome to Virtual Hospitals Africa. What can I help you with today?",
    options: [
      {
        option: "make_appointment",
        display: "Make appointment",
        aliases: ["appt", "appointment", "doctor", "specialist"],
        onResponse: "not_onboarded:make_appointment:enter_name",
      },
    ],
  },
  "not_onboarded:make_appointment:enter_name": {
    type: "string",
    prompt:
      "Sure, I can help you make an appointment with a doctor.\n\nTo start, what is your name?",
    onResponse(
      patientMessage: UnhandledPatientMessage
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
          _patientMessage: UnhandledPatientMessage
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
          _patientMessage: UnhandledPatientMessage
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
          _patientMessage: UnhandledPatientMessage
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
      patientMessage: UnhandledPatientMessage
    ): ConversationStateHandlerReturn {
      const [day, month, year] = patientMessage.body.split("/");
      console.log(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`);

      return {
        nextState: "not_onboarded:make_appointment:enter_national_id_number",
        patientUpdates: {
          date_of_birth: `${year}-${month.padStart(2, "0")}-${day.padStart(
            2,
            "0"
          )}`,
        },
      };
    },
  },
  "not_onboarded:make_appointment:enter_national_id_number": {
    type: "string",
    prompt(patient: PatientDemographicInfo): string {
      return `Got it, ${prettyPatientDateOfBirth(
        patient
      )}. Please enter your national ID number`;
    },
    onResponse(
      patientMessage: UnhandledPatientMessage
    ): ConversationStateHandlerReturn {
      return {
        nextState: "onboarded:make_appointment:enter_appointment_reason",
        patientUpdates: {
          national_id_number: patientMessage.body,
        },
      };
    },
  },
  "onboarded:make_appointment:enter_appointment_reason": {
    type: "string",
    async onEnter(
      trx: TrxOrDb,
      patientMessage: UnhandledPatientMessage
    ): Promise<UnhandledPatientMessage> {
      await appointments.createNew(trx, {
        patient_id: patientMessage.patient_id,
      });
      return patientMessage;
    },
    prompt(patientMessage: UnhandledPatientMessage): string {
      return `Got it, ${patientMessage.national_id_number}. What is the reason you want to schedule an appointment?`;
    },
    onResponse(
      patientMessage: UnhandledPatientMessage
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
      return `Got it, ${
        patientMessage.scheduling_appointment_reason
      }. In summary, your name is ${
        patientMessage.name
      }, you're messaging from ${patientMessage.phone_number}, you are a ${
        patientMessage.gender
      } born on ${prettyPatientDateOfBirth(
        patientMessage
      )} with national id number ${
        patientMessage.national_id_number
      } and you want to schedule an appointment for ${
        patientMessage.scheduling_appointment_reason
      }. Is this correct?`;
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
    ],
  },
  "onboarded:make_appointment:first_scheduling_option": {
    type: "select",
    async onEnter(
      trx: TrxOrDb,
      patientMessage: UnhandledPatientMessage
    ): Promise<UnhandledPatientMessage> {
      console.log("onboarded:make_appointment:first_scheduling_option onEnter");
      const firstAvailable = await availableThirtyMinutes(trx, [], {date:null, timeslots_required:1});

      const offeredTime = await appointments.addOfferedTime(trx, {
        appointment_id: patientMessage.scheduling_appointment_id!,
        doctor_id: firstAvailable[0].doctor.id,
        start: firstAvailable[0].start,
      });

      console.log("past appointments.addOfferedTime");

      const nextOfferedTimes: ReturnedSqlRow<
        AppointmentOfferedTime & { doctor_name: string }
      >[] = [offeredTime, ...compact(patientMessage.appointment_offered_times)];

      return {
        ...patientMessage,
        appointment_offered_times: nextOfferedTimes,
      };
    },
    prompt(patientMessage: UnhandledPatientMessage): string {
      assert(
        patientMessage.appointment_offered_times[0],
        "onEnter should have added an appointment_offered_time"
      );
      return `Great, the next available appoinment is ${prettyAppointmentTime(
        patientMessage.appointment_offered_times[0].start
      )}. Would you like to schedule this appointment?`;
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
        display: "Other times",
        aliases: ["other", "Other times"],
        onResponse: "onboarded:make_appointment:other_scheduling_options",
      },
      {
        option: "go_back",
        display: "Go back",
        aliases: ["back"],
        onResponse: "other_end_of_demo",
      },
    ],
  },
  "onboarded:make_appointment:other_scheduling_options": {
    type: "list",
    async onEnter(
      trx: TrxOrDb,
      patientMessage: UnhandledPatientMessage
    ): Promise<UnhandledPatientMessage> {
      console.log(
        "onboarded:make_appointment:other_scheduling_options onEnter"
      );

      assert(patientMessage.appointment_offered_times[0], "should have times");

      const toDecline = [];
      for (const offeredTime of patientMessage.appointment_offered_times) {
        if (!offeredTime) continue;
        if (!offeredTime.patient_declined) {
          toDecline.push(offeredTime.id);
        }
      }

<<<<<<< HEAD
      // console.log('id', patientMessage.appointment_offered_times?.id)
      // Created new function to update the row in the db, we get the row id by using the patientMessage that was modified in the previous state.
      for (const toDeclineSlot of toDecline){
        console.log('time slot declining in db', toDeclineSlot)
        await appointments.declineOfferedTime(
          trx,
          { id: toDeclineSlot },
        );
=======
      console.log("id", patientMessage.appointment_offered_times[0]?.id);
      // Created new function to update the row in the db, we get the row id by using the patientMessage that was modified in the previous state.

      if (!!toDecline.length) {
        await appointments.declineOfferedTime(trx, { id: toDecline[0] });
>>>>>>> d3747cd (Added the interactive list, still need to make a few bug fixes pull right now)
      }

      const declinedTimes = await appointments.getPatientDeclinedTimes(trx, {
        appointment_id: patientMessage.scheduling_appointment_id!,
      });

      console.log("declined time slot");
      console.log(declinedTimes);
      const filteredAvailableTimes = await availableThirtyMinutes(
        trx,
        declinedTimes, {date: null , timeslots_required: 1}
      );

      const nextOfferedTimes: ReturnedSqlRow<
<<<<<<< HEAD
      AppointmentOfferedTime & { doctor_name: string }
      >[] = []      
      for (const timeslot of filteredAvailableTimes){
        const addedTime = await appointments.addOfferedTime(trx, {
          appointment_id: patientMessage.scheduling_appointment_id!,
          doctor_id: timeslot.doctor.id,
          start: timeslot.start,
        });
        nextOfferedTimes.push(addedTime)
      }

      nextOfferedTimes.push(...compact(patientMessage.appointment_offered_times))
=======
        AppointmentOfferedTime & { doctor_name: string }
      >[] = [offeredTime, ...compact(patientMessage.appointment_offered_times)];
>>>>>>> d3747cd (Added the interactive list, still need to make a few bug fixes pull right now)

      return {
        ...patientMessage,
        appointment_offered_times: nextOfferedTimes,
      };
    },

    prompt(patientMessage: UnhandledPatientMessage): string {
      assert(
        patientMessage.appointment_offered_times[0],
        "onEnter should have added an appointment_offered_time"
      );
      return `Looking for other times, the next available appoinment is ${prettyAppointmentTime(
        patientMessage.appointment_offered_times[0].start
      )}. Would you like to schedule this appointment?`;
    },
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
    onResponse: "onboarded:appointment_scheduled",
  },
  // options: [
  //   {
  //     option: "1",
  //     display: "Go ahead",
  //     onResponse: "onboarded:appointment_scheduled",
  //   },
  //   {
  //     option: "other_times",
  //     display: "Other time",
  //     aliases: ["other"],
  //     onResponse: "onboarded:make_appointment:other_scheduling_options",
  //   },
  //   {
  //     option: "go_back",
  //     display: "Go back",
  //     aliases: ["no", "cancel", "back", "over"],
  //     onResponse: "other_end_of_demo",
  //   },
  // ],
  "onboarded:appointment_scheduled": {
    type: "select",
    onEnter: makeAppointment,
    prompt(patientMessage: UnhandledPatientMessage) {
      const acceptedTimes = []
      for (const offeredTime of patientMessage.appointment_offered_times){
        if (!offeredTime?.patient_declined){
          acceptedTimes.push(offeredTime)
        }
      }
      const acceptedTime = acceptedTimes[0]

      assert(acceptedTime);
      assert(
<<<<<<< HEAD
        acceptedTime.scheduled_gcal_event_id,
      );
      return `Thanks ${patientMessage.name!.split(" ")[0]}, we notified ${
        acceptedTime.doctor_name
      } and will message you shortly upon confirmirmation of your appointment at ${
        prettyAppointmentTime(acceptedTime.start)
      }`;
=======
        patientMessage.appointment_offered_times[0].scheduled_gcal_event_id
      );
      return `Thanks ${patientMessage.name!.split(" ")[0]}, we notified ${
        patientMessage.appointment_offered_times[0].doctor_name
      } and will message you shortly upon confirmirmation of your appointment at ${prettyAppointmentTime(
        patientMessage.appointment_offered_times[0].start
      )}`;
>>>>>>> d3747cd (Added the interactive list, still need to make a few bug fixes pull right now)
    },
    options: [
      {
        option: "cancel",
        display: "Cancel Appointment",
        onResponse: "onboarded:cancel_appointment",
      },
    ],
  },
  "onboarded:cancel_appointment": {
    type: "select",
    prompt:
      "Your appoinment has been cancelled. What can I help you with today?",
    options: [
      {
        option: "make_appointment",
        display: "Make appointment",
        aliases: ["appt", "appointment", "doctor", "specialist"],
        onResponse: "onboarded:make_appointment:enter_appointment_reason",
      },
    ],
    onEnter(
      trx: TrxOrDb,
      patientMessage: UnhandledPatientMessage,
    ): Promise<UnhandledPatientMessage>{
      return cancelAppointment(trx,patientMessage)
    }
  },
  other_end_of_demo: {
    type: "end_of_demo",
    prompt: "This is the end of the demo. Thank you for participating!",
  },
};

export default conversationStates;