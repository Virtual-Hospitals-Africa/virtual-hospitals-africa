import { assert, assertEquals } from 'std/testing/asserts.ts'
import {
  assertAllHarare,
  convertToTime,
  prettyAppointmentTime,
  prettyPatientDateOfBirth,
} from '../util/date.ts'
import { availableThirtyMinutes } from './getDoctorAvailability.ts'
import { makeAppointment } from './makeAppointment.ts'
import { cancelAppointment } from './cancelAppointment.ts'
import * as appointments from '../db/models/appointments.ts'
import {
  AppointmentOfferedTime,
  ConversationState,
  ConversationStateHandler,
  ConversationStateHandlerListAction,
  ConversationStateHandlerListActionSection,
  ConversationStateHandlerReturn,
  Falsy,
  PatientDemographicInfo,
  ReturnedSqlRow,
  TrxOrDb,
  UnhandledPatientMessage,
} from '../types.ts'

// Is this important??
function compact<T>(arr: (T | Falsy)[]): T[] {
  const toReturn: T[] = []
  for (const item of arr) {
    if (item) {
      toReturn.push(item)
    }
  }
  return toReturn
}

const conversationStates: {
  [state in ConversationState]: ConversationStateHandler
} = {
  'not_onboarded:welcome': {
    type: 'select',
    prompt:
      'Welcome to Virtual Hospitals Africa. What can I help you with today?',
    options: [
      {
        option: 'make_appointment',
        display: 'Make appointment',
        aliases: ['appt', 'appointment', 'doctor', 'specialist'],
        onResponse: 'not_onboarded:make_appointment:enter_name',
      },
    ],
  },
  'not_onboarded:make_appointment:enter_name': {
    type: 'string',
    prompt:
      'Sure, I can help you make an appointment with a doctor.\n\nTo start, what is your name?',
    onResponse(
      patientMessage: UnhandledPatientMessage,
    ): ConversationStateHandlerReturn {
      return {
        nextState: 'not_onboarded:make_appointment:enter_gender',
        patientUpdates: {
          name: patientMessage.body,
        },
      }
    },
  },
  'not_onboarded:make_appointment:enter_gender': {
    prompt(patient: PatientDemographicInfo): string {
      return `Thanks ${
        patient.name!.split(' ')[0]
      }, I will remember that.\n\nWhat is your gender?`
    },
    type: 'select',
    options: [
      {
        option: 'male',
        display: 'Male',
        aliases: ['male', 'm'],
        onResponse(
          _patientMessage: UnhandledPatientMessage,
        ): ConversationStateHandlerReturn {
          return {
            nextState: 'not_onboarded:make_appointment:enter_date_of_birth',
            patientUpdates: { gender: 'male' },
          }
        },
      },
      {
        option: 'female',
        display: 'Female',
        aliases: ['female', 'f'],
        onResponse(
          _patientMessage: UnhandledPatientMessage,
        ): ConversationStateHandlerReturn {
          return {
            nextState: 'not_onboarded:make_appointment:enter_date_of_birth',
            patientUpdates: { gender: 'female' },
          }
        },
      },
      {
        option: 'other',
        display: 'Other',
        aliases: ['other', 'o'],
        onResponse(
          _patientMessage: UnhandledPatientMessage,
        ): ConversationStateHandlerReturn {
          return {
            nextState: 'not_onboarded:make_appointment:enter_date_of_birth',
            patientUpdates: { gender: 'other' },
          }
        },
      },
    ],
  },
  'not_onboarded:make_appointment:enter_date_of_birth': {
    type: 'date',
    prompt: 'Thanks for that information. What is your date of birth?',
    onResponse(
      patientMessage: UnhandledPatientMessage,
    ): ConversationStateHandlerReturn {
      const [day, month, year] = patientMessage.body.split('/')
      console.log(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)

      return {
        nextState: 'not_onboarded:make_appointment:enter_national_id_number',
        patientUpdates: {
          date_of_birth: `${year}-${month.padStart(2, '0')}-${
            day.padStart(
              2,
              '0',
            )
          }`,
        },
      }
    },
  },
  'not_onboarded:make_appointment:enter_national_id_number': {
    type: 'string',
    prompt(patient: PatientDemographicInfo): string {
      return `Got it, ${
        prettyPatientDateOfBirth(
          patient,
        )
      }. Please enter your national ID number`
    },
    onResponse(
      patientMessage: UnhandledPatientMessage,
    ): ConversationStateHandlerReturn {
      return {
        nextState: 'onboarded:make_appointment:enter_appointment_reason',
        patientUpdates: {
          national_id_number: patientMessage.body,
        },
      }
    },
  },
  'onboarded:make_appointment:enter_appointment_reason': {
    type: 'string',
    async onEnter(
      trx: TrxOrDb,
      patientMessage: UnhandledPatientMessage,
    ): Promise<UnhandledPatientMessage> {
      await appointments.createNew(trx, {
        patient_id: patientMessage.patient_id,
      })
      return patientMessage
    },
    prompt(patientMessage: UnhandledPatientMessage): string {
      return `Got it, ${patientMessage.national_id_number}. What is the reason you want to schedule an appointment?`
    },
    onResponse(
      patientMessage: UnhandledPatientMessage,
    ): ConversationStateHandlerReturn {
      return {
        nextState: 'onboarded:make_appointment:confirm_details',
        appointmentUpdates: {
          reason: patientMessage.body,
        },
      }
    },
  },
  'onboarded:make_appointment:confirm_details': {
    type: 'select',
    prompt(patientMessage: UnhandledPatientMessage): string {
      return `Got it, ${patientMessage.scheduling_appointment_reason}. In summary, your name is ${patientMessage.name}, you're messaging from ${patientMessage.phone_number}, you are a ${patientMessage.gender} born on ${
        prettyPatientDateOfBirth(
          patientMessage,
        )
      } with national id number ${patientMessage.national_id_number} and you want to schedule an appointment for ${patientMessage.scheduling_appointment_reason}. Is this correct?`
    },
    options: [
      {
        option: 'confirm',
        display: 'Yes',
        aliases: ['yes', 'confirm', 'correct'],
        onResponse: 'onboarded:make_appointment:first_scheduling_option',
      },
      {
        option: 'go_back',
        display: 'Go back',
        aliases: ['back'],
        onResponse: 'other_end_of_demo',
      },
    ],
  },
  'onboarded:make_appointment:first_scheduling_option': {
    type: 'select',
    async onEnter(
      trx: TrxOrDb,
      patientMessage: UnhandledPatientMessage,
    ): Promise<UnhandledPatientMessage> {
      console.log('onboarded:make_appointment:first_scheduling_option onEnter')
      const firstAvailable = await availableThirtyMinutes(trx, [], {
        date: null,
        timeslotsRequired: 1,
      })

      const offeredTime = await appointments.addOfferedTime(trx, {
        appointment_id: patientMessage.scheduling_appointment_id!,
        doctor_id: firstAvailable[0].doctor.id,
        start: firstAvailable[0].start,
      })

      console.log('past appointments.addOfferedTime')

      const nextOfferedTimes: ReturnedSqlRow<
        AppointmentOfferedTime & { doctor_name: string }
      >[] = [offeredTime, ...compact(patientMessage.appointment_offered_times)]

      return {
        ...patientMessage,
        appointment_offered_times: nextOfferedTimes,
      }
    },
    prompt(patientMessage: UnhandledPatientMessage): string {
      assert(
        patientMessage.appointment_offered_times[0],
        'onEnter should have added an appointment_offered_time',
      )
      return `Great, the next available appoinment is ${
        prettyAppointmentTime(
          patientMessage.appointment_offered_times[0].start,
        )
      }. Would you like to schedule this appointment?`
    },
    options: [
      {
        option: 'confirm',
        display: 'Yes',
        aliases: ['yes', 'confirm', 'correct'],
        onResponse: 'onboarded:appointment_scheduled',
      },
      {
        option: 'other_times',
        display: 'Other times',
        aliases: ['other', 'Other times'],
        onResponse: 'onboarded:make_appointment:other_scheduling_options',
      },
      {
        option: 'go_back',
        display: 'Go back',
        aliases: ['back'],
        onResponse: 'other_end_of_demo',
      },
    ],
  },
  'onboarded:make_appointment:other_scheduling_options': {
    type: 'list',
    async onEnter(
      trx: TrxOrDb,
      patientMessage: UnhandledPatientMessage,
    ): Promise<UnhandledPatientMessage> {
      console.log(
        'onboarded:make_appointment:other_scheduling_options onEnter',
      )

      assert(patientMessage.appointment_offered_times[0], 'should have times')

      // Mark all previously offered times as declined
      const toDecline = patientMessage.appointment_offered_times
        .filter((aot) => !aot.patient_declined)

      await appointments.declineOfferedTimes(
        trx,
        toDecline.map((aot) => aot.id),
      )

      const declinedTimes = patientMessage.appointment_offered_times.map(
        (aot) => aot.start,
      )
      assertAllHarare(declinedTimes)

      const timeslotsRequired = 5

      const filteredAvailableTimes = await availableThirtyMinutes(
        trx,
        declinedTimes,
        { date: null, timeslotsRequired },
      )

      const newlyOfferedTimes: ReturnedSqlRow<
        AppointmentOfferedTime & { doctor_name: string }
      >[] = await Promise.all(filteredAvailableTimes.map(
        (timeslot) =>
          appointments.addOfferedTime(trx, {
            appointment_id: patientMessage.scheduling_appointment_id!,
            doctor_id: timeslot.doctor.id,
            start: timeslot.start,
          }),
      ))

      const nextOfferedTimes = [
        ...newlyOfferedTimes,
        ...patientMessage.appointment_offered_times.map((aot) => ({
          ...aot,
          patient_declined: true,
        })),
      ]

      assertEquals(
        nextOfferedTimes.length,
        timeslotsRequired + patientMessage.appointment_offered_times.length,
      )

      return {
        ...patientMessage,
        appointment_offered_times: nextOfferedTimes,
      }
    },

    prompt(patientMessage: UnhandledPatientMessage): string {
      assert(
        patientMessage.appointment_offered_times[0],
        'onEnter should have added an appointment_offered_time',
      )
      return `OK here are the other available time, please choose from the list.`
    },

    action(
      patientMessage: UnhandledPatientMessage,
    ): ConversationStateHandlerListAction {
      const offeredTimes = patientMessage.appointment_offered_times.filter(
        (offered_time) => !offered_time.patient_declined,
      )

      const sections: ConversationStateHandlerListActionSection[] = [
        {
          title: offeredTimes[0].start.split('T')[0],
          rows: offeredTimes.map((offeredTime) => {
            return {
              id: offeredTime.start.split('+')[0],
              title: `${convertToTime(offeredTime.start).hour}:${
                convertToTime(offeredTime.start).minute.toString().padStart(
                  2,
                  '0',
                )
              } ${convertToTime(offeredTime.start).amPm}`,
              description: `With Dr. ${offeredTime.doctor_name}`,
            }
          }),
          onResponse: 'onboarded:appointment_scheduled',
        },
        {
          title: 'Other Times',
          rows: [{
            id: 'other_time',
            title: 'Other time slot',
            description: 'Show other times',
          }],
          onResponse: 'onboarded:make_appointment:other_scheduling_options',
        },
      ]
      return {
        button: 'More Time Slots',
        sections: sections,
      }
    },
  },

  'onboarded:appointment_scheduled': {
    type: 'select',
    async onEnter(trx: TrxOrDb, patientMessage: UnhandledPatientMessage) {
      // Decline all other offered times
      const toDecline = patientMessage.appointment_offered_times
        .filter((aot) => !aot.patient_declined)
        .filter((aot) => !aot.start.includes(patientMessage.body))
        .map((aot) => aot.id)

      await appointments.declineOfferedTimes(trx, toDecline)

      return makeAppointment(trx, {
        ...patientMessage,
        appointment_offered_times: patientMessage.appointment_offered_times.map(
          (aot) =>
            toDecline.includes(aot.id)
              ? { ...aot, patient_declined: true }
              : aot,
        ),
      })
    },
    prompt(patientMessage: UnhandledPatientMessage) {
      const acceptedTimes = []
      for (const offeredTime of patientMessage.appointment_offered_times) {
        if (!offeredTime?.patient_declined) {
          acceptedTimes.push(offeredTime)
        }
      }
      const acceptedTime = acceptedTimes[0]

      assert(acceptedTime)
      assert(acceptedTime.scheduled_gcal_event_id)
      return `Thanks ${
        patientMessage.name!.split(' ')[0]
      }, we notified ${acceptedTime.doctor_name} and will message you shortly upon confirmirmation of your appointment at ${
        prettyAppointmentTime(acceptedTime.start)
      }`
    },
    options: [
      {
        option: 'cancel',
        display: 'Cancel Appointment',
        onResponse: 'onboarded:cancel_appointment',
      },
    ],
  },
  'onboarded:cancel_appointment': {
    type: 'select',
    prompt:
      'Your appoinment has been cancelled. What can I help you with today?',
    options: [
      {
        option: 'make_appointment',
        display: 'Make appointment',
        aliases: ['appt', 'appointment', 'doctor', 'specialist'],
        onResponse: 'onboarded:make_appointment:enter_appointment_reason',
      },
    ],
    onEnter(
      trx: TrxOrDb,
      patientMessage: UnhandledPatientMessage,
    ): Promise<UnhandledPatientMessage> {
      return cancelAppointment(trx, patientMessage)
    },
  },
  other_end_of_demo: {
    type: 'end_of_demo',
    prompt: 'This is the end of the demo. Thank you for participating!',
    onResponse: 'other_end_of_demo',
  },
}

export default conversationStates
