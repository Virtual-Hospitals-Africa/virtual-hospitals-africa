import { assert, assertEquals } from 'std/testing/asserts.ts'
import {
  assertAllHarare,
  convertToTimeString,
  prettyAppointmentTime,
  prettyPatientDateOfBirth,
} from '../util/date.ts'
import { availableThirtyMinutes } from './getDoctorAvailability.ts'
import { makeAppointment } from './makeAppointment.ts'
import { cancelAppointment } from './cancelAppointment.ts'
import * as appointments from '../db/models/appointments.ts'
import * as patients from '../db/models/patients.ts'
import {
  AppointmentOfferedTime,
  ConversationState,
  ConversationStateHandler,
  ConversationStateHandlerListAction,
  ConversationStateHandlerListActionSection,
  PatientDemographicInfo,
  PatientState,
  ReturnedSqlRow,
  TrxOrDb,
} from '../types.ts'
import pickPatient from './pickPatient.ts'

const conversationStates: {
  [state in ConversationState]: ConversationStateHandler
} = {
  'initial_message': {
    type: 'initial_message',
    nextState: 'not_onboarded:welcome',
    prompt() {
      throw new Error('Should not prompt for initial message')
    },
  },
  'not_onboarded:welcome': {
    type: 'select',
    prompt:
      'Welcome to Virtual Hospitals Africa. What can I help you with today?',
    options: [
      {
        option: 'make_appointment',
        display: 'Make appointment',
        aliases: ['appt', 'appointment', 'doctor', 'specialist'],
        nextState: 'not_onboarded:make_appointment:enter_name',
      },
    ],
  },
  'not_onboarded:make_appointment:enter_name': {
    type: 'string',
    prompt:
      'Sure, I can help you make an appointment with a doctor.\n\nTo start, what is your name?',
    nextState: 'not_onboarded:make_appointment:enter_gender',
    async onExit(trx, patientState) {
      await patients.upsert(trx, {
        ...pickPatient(patientState),
        name: patientState.body,
      })
      return { ...patientState, name: patientState.body }
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
        nextState: 'not_onboarded:make_appointment:enter_date_of_birth',
        async onExit(trx, patientState) {
          await patients.upsert(trx, {
            ...pickPatient(patientState),
            gender: 'male',
          })
          return { ...patientState, gender: 'male' }
        },
      },
      {
        option: 'female',
        display: 'Female',
        aliases: ['female', 'f'],
        nextState: 'not_onboarded:make_appointment:enter_date_of_birth',
        async onExit(trx, patientState) {
          await patients.upsert(trx, {
            ...pickPatient(patientState),
            gender: 'female',
          })
          return { ...patientState, gender: 'female' }
        },
      },
      {
        option: 'other',
        display: 'Other',
        aliases: ['other', 'o'],
        nextState: 'not_onboarded:make_appointment:enter_date_of_birth',
        async onExit(trx, patientState) {
          await patients.upsert(trx, {
            ...pickPatient(patientState),
            gender: 'other',
          })
          return { ...patientState, gender: 'other' }
        },
      },
    ],
  },
  'not_onboarded:make_appointment:enter_date_of_birth': {
    type: 'date',
    prompt: 'Thanks for that information. What is your date of birth?',
    nextState: 'not_onboarded:make_appointment:enter_national_id_number',
    async onExit(trx, patientState) {
      const [day, month, year] = patientState.body.split('/')
      const monthStr = month.padStart(2, '0')
      const dayStr = day.padStart(2, '0')
      const date_of_birth = `${year}-${monthStr}-${dayStr}`
      await patients.upsert(trx, {
        ...pickPatient(patientState),
        date_of_birth,
      })
      return { ...patientState, date_of_birth }
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
    nextState: 'onboarded:make_appointment:enter_appointment_reason',
    async onExit(trx, patientState) {
      await patients.upsert(trx, {
        ...pickPatient(patientState),
        national_id_number: patientState.body,
      })
      return { ...patientState, national_id_number: patientState.body }
    },
  },
  'onboarded:make_appointment:enter_appointment_reason': {
    type: 'string',
    async onEnter(
      trx: TrxOrDb,
      patientState: PatientState,
    ): Promise<PatientState> {
      await appointments.createNew(trx, {
        patient_id: patientState.patient_id,
      })
      return patientState
    },
    prompt(patientState: PatientState): string {
      return `Got it, ${patientState.national_id_number}. What is the reason you want to schedule an appointment?`
    },
    nextState: 'onboarded:make_appointment:confirm_details',
    async onExit(
      trx,
      patientState,
    ) {
      await appointments.upsert(trx, {
        id: patientState.scheduling_appointment_id!,
        patient_id: patientState.patient_id,
        reason: patientState.body,
        status: patientState.scheduling_appointment_status!,
      })
      return {
        ...patientState,
        scheduling_appointment_reason: patientState.body,
      }
    },
  },
  'onboarded:make_appointment:confirm_details': {
    type: 'select',
    prompt(patientState: PatientState): string {
      return `Got it, ${patientState.scheduling_appointment_reason}. In summary, your name is ${patientState.name}, you're messaging from ${patientState.phone_number}, you are a ${patientState.gender} born on ${
        prettyPatientDateOfBirth(
          patientState,
        )
      } with national id number ${patientState.national_id_number} and you want to schedule an appointment for ${patientState.scheduling_appointment_reason}. Is this correct?`
    },
    options: [
      {
        option: 'confirm',
        display: 'Yes',
        aliases: ['yes', 'confirm', 'correct'],
        nextState: 'onboarded:make_appointment:first_scheduling_option',
      },
      {
        option: 'go_back',
        display: 'Go back',
        aliases: ['back'],
        nextState: 'other_end_of_demo',
      },
    ],
  },
  'onboarded:make_appointment:first_scheduling_option': {
    type: 'select',
    async onEnter(
      trx: TrxOrDb,
      patientState: PatientState,
    ): Promise<PatientState> {
      const firstAvailable = await availableThirtyMinutes(trx, [], {
        date: null,
        timeslotsRequired: 1,
      })

      const offeredTime = await appointments.addOfferedTime(trx, {
        appointment_id: patientState.scheduling_appointment_id!,
        doctor_id: firstAvailable[0].doctor.id,
        start: firstAvailable[0].start,
      })

      const nextOfferedTimes: ReturnedSqlRow<
        AppointmentOfferedTime & { doctor_name: string }
      >[] = [offeredTime, ...patientState.appointment_offered_times]

      return {
        ...patientState,
        appointment_offered_times: nextOfferedTimes,
      }
    },
    prompt(patientState: PatientState): string {
      assert(
        patientState.appointment_offered_times[0],
        'onEnter should have added an appointment_offered_time',
      )
      return `Great, the next available appoinment is ${
        prettyAppointmentTime(
          patientState.appointment_offered_times[0].start,
        )
      }. Would you like to schedule this appointment?`
    },
    options: [
      {
        option: 'confirm',
        display: 'Yes',
        aliases: ['yes', 'confirm', 'correct'],
        nextState: 'onboarded:appointment_scheduled',
      },
      {
        option: 'other_times',
        display: 'Other times',
        aliases: ['other', 'Other times'],
        nextState: 'onboarded:make_appointment:other_scheduling_options',
        async onExit(trx, patientState) {
          await appointments.declineOfferedTimes(
            trx,
            patientState.appointment_offered_times.map((aot) => aot.id),
          )
          return {
            ...patientState,
            appointment_offered_times: patientState.appointment_offered_times
              .map((aot) => ({ ...aot, patient_declined: true })),
          }
        },
      },
      {
        option: 'go_back',
        display: 'Go back',
        aliases: ['back'],
        nextState: 'other_end_of_demo',
      },
    ],
  },
  'onboarded:make_appointment:other_scheduling_options': {
    type: 'list',
    async onEnter(
      trx: TrxOrDb,
      patientState: PatientState,
    ): Promise<PatientState> {
      assert(
        patientState.appointment_offered_times.length,
        'should have times',
      )

      const declinedTimes = patientState.appointment_offered_times.map(
        (aot) => aot.start,
      )
      assertAllHarare(declinedTimes)

      const timeslotsRequired = 5

      const filteredAvailableTimes = await availableThirtyMinutes(
        trx,
        declinedTimes,
        { date: null, timeslotsRequired },
      )

      // TODO: get this down to a single DB call
      const newlyOfferedTimes: ReturnedSqlRow<
        AppointmentOfferedTime & { doctor_name: string }
      >[] = await Promise.all(filteredAvailableTimes.map(
        (timeslot) =>
          appointments.addOfferedTime(trx, {
            appointment_id: patientState.scheduling_appointment_id!,
            doctor_id: timeslot.doctor.id,
            start: timeslot.start,
          }),
      ))

      const nextOfferedTimes = [
        ...newlyOfferedTimes,
        ...patientState.appointment_offered_times.map((aot) => ({
          ...aot,
          patient_declined: true,
        })),
      ]

      assertEquals(
        nextOfferedTimes.length,
        timeslotsRequired + patientState.appointment_offered_times.length,
      )

      return {
        ...patientState,
        appointment_offered_times: nextOfferedTimes,
      }
    },

    prompt(patientState: PatientState): string {
      assert(
        patientState.appointment_offered_times[0],
        'onEnter should have added an appointment_offered_time',
      )
      return `OK here are the other available time, please choose from the list.`
    },

    action(
      patientState: PatientState,
    ): ConversationStateHandlerListAction {
      const nonDeclinedTimes = patientState.appointment_offered_times.filter(
        (offered_time) => !offered_time.patient_declined,
      )

      // TODO: Support more than one day
      const sections: ConversationStateHandlerListActionSection[] = [
        {
          title: nonDeclinedTimes[0].start.split('T')[0],
          rows: nonDeclinedTimes.map((offeredTime) => {
            return {
              id: String(offeredTime.id),
              title: convertToTimeString(offeredTime.start),
              description: `With Dr. ${offeredTime.doctor_name}`,
              nextState: 'onboarded:appointment_scheduled',
              // Decline all other offered times
              async onExit(trx, patientState) {
                const toDecline = patientState.appointment_offered_times
                  .filter((aot) => !aot.patient_declined)
                  .filter((aot) => aot.id !== offeredTime.id)
                  .map((aot) => aot.id)

                if (toDecline.length > 0) {
                  await appointments.declineOfferedTimes(trx, toDecline)
                }

                return {
                  ...patientState,
                  appointment_offered_times: patientState
                    .appointment_offered_times.map((aot) =>
                      toDecline.includes(aot.id)
                        ? { ...aot, patient_declined: true }
                        : aot
                    ),
                }
              },
            }
          }),
        },
        {
          title: 'Other Times',
          rows: [{
            id: 'other_time',
            title: 'Other time slot',
            description: 'Show other times',
            nextState: 'onboarded:make_appointment:other_scheduling_options',
            async onExit(trx, patientState) {
              await appointments.declineOfferedTimes(
                trx,
                patientState.appointment_offered_times.map((aot) => aot.id),
              )
              return {
                ...patientState,
                appointment_offered_times: patientState
                  .appointment_offered_times.map((aot) => ({
                    ...aot,
                    patient_declined: true,
                  })),
              }
            },
          }],
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
    onEnter: makeAppointment,
    prompt(patientState: PatientState) {
      const acceptedTimes = []
      for (const offeredTime of patientState.appointment_offered_times) {
        if (!offeredTime.patient_declined) {
          acceptedTimes.push(offeredTime)
        }
      }
      const acceptedTime = acceptedTimes[0]

      assert(acceptedTime)
      assert(acceptedTime.scheduled_gcal_event_id)
      return `Thanks ${
        patientState.name!.split(' ')[0]
      }, we notified ${acceptedTime.doctor_name} and will message you shortly upon confirmirmation of your appointment at ${
        prettyAppointmentTime(acceptedTime.start)
      }`
    },
    options: [
      {
        option: 'cancel',
        display: 'Cancel Appointment',
        nextState: 'onboarded:cancel_appointment',
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
        nextState: 'onboarded:make_appointment:enter_appointment_reason',
      },
    ],
    onEnter(
      trx: TrxOrDb,
      patientState: PatientState,
    ): Promise<PatientState> {
      return cancelAppointment(trx, patientState)
    },
  },
  other_end_of_demo: {
    type: 'end_of_demo',
    prompt: 'This is the end of the demo. Thank you for participating!',
    nextState: 'other_end_of_demo',
  },
}

export default conversationStates
