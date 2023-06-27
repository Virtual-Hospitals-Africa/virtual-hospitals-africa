import { assert, assertEquals } from 'std/testing/asserts.ts'
import {
  AppointmentOfferedTime,
  ConversationStateHandlerListAction,
  ConversationStateHandlerListActionSection,
  ConversationStates,
  Facility,
  Location,
  Maybe,
  PatientConversationState,
  PatientDemographicInfo,
  PatientState,
  ReturnedSqlRow,
  TrxOrDb,
} from '../../types.ts'
import {
  assertAllHarare,
  convertToTimeString,
  formatHarare,
  prettyAppointmentTime,
  prettyPatientDateOfBirth,
} from '../../util/date.ts'
import * as appointments from '../../db/models/appointments.ts'
import * as patients from '../../db/models/patients.ts'
import { availableThirtyMinutes } from './getHealthWorkerAvailability.ts'
import { cancelAppointment } from './cancelAppointment.ts'
import { makeAppointment } from './makeAppointment.ts'
import mainMenuOptions from './mainMenuOptions.ts'
import {
  capLengthAtWhatsAppDescription,
  capLengthAtWhatsAppTitle,
} from '../../util/capLengthAt.ts'
import uniq from '../../util/uniq.ts'

const conversationStates: ConversationStates<
  PatientConversationState,
  PatientState
> = {
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
    options: mainMenuOptions,
  },
  'onboarded:main_menu': {
    type: 'select',
    prompt:
      'Welcome to Virtual Hospitals Africa. What can I help you with today?',
    options: mainMenuOptions,
  },
  'not_onboarded:make_appointment:enter_name': {
    type: 'string',
    prompt:
      'Sure, I can help you make an appointment with a health_worker.\n\nTo start, what is your name?',
    nextState: 'not_onboarded:make_appointment:enter_gender',
    async onExit(trx, patientState) {
      await patients.upsert(trx, {
        ...patients.pick(patientState),
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
        id: 'male',
        title: 'Male',
        nextState: 'not_onboarded:make_appointment:enter_date_of_birth',
        async onExit(trx, patientState) {
          await patients.upsert(trx, {
            ...patients.pick(patientState),
            gender: 'male',
          })
          return { ...patientState, gender: 'male' }
        },
      },
      {
        id: 'female',
        title: 'Female',
        nextState: 'not_onboarded:make_appointment:enter_date_of_birth',
        async onExit(trx, patientState) {
          await patients.upsert(trx, {
            ...patients.pick(patientState),
            gender: 'female',
          })
          return { ...patientState, gender: 'female' }
        },
      },
      {
        id: 'other',
        title: 'Other',
        nextState: 'not_onboarded:make_appointment:enter_date_of_birth',
        async onExit(trx, patientState) {
          await patients.upsert(trx, {
            ...patients.pick(patientState),
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
        ...patients.pick(patientState),
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
        ...patients.pick(patientState),
        national_id_number: patientState.body,
      })
      return { ...patientState, national_id_number: patientState.body }
    },
  },
  'find_nearest_facility:share_location': {
    type: 'string',
    nextState: 'find_nearest_facility:got_location',
    prompt:
      'Sure, we can find your nearest facility. Can you share your location?',
    async onExit(trx, patientState) {
      const locationMessage: Location = JSON.parse(patientState.body)
      const currentLocation: Location = {
        longitude: locationMessage.longitude,
        latitude: locationMessage.latitude,
      }
      await patients.upsertLocation(trx, {
        ...patients.pick(patientState),
        location: currentLocation,
      })
      return { ...patientState, location: currentLocation }
    },
  },
  // change the name of got_location to nearest_facilities?
  'find_nearest_facility:got_location': {
    type: 'action',
    headerText: 'Nearest Facilities',
    prompt(): string {
      return `Thank you for sharing your location.\n\nClick the button below to see your nearest health facilities.`
    },
    action(
      patientState: PatientState,
    ) {
      const { nearest_facilities } = patientState
      if (!nearest_facilities?.length) {
        return {
          type: 'select',
          prompt:
            'We\'re sorry that no facilities were found in your area. Our team has been notified and will follow up with you soon.',
          options: [
            {
              id: 'main_menu',
              title: 'Main Menu',
              nextState(patientState: PatientState): PatientConversationState {
                return patients.hasDemographicInfo(patientState)
                  ? 'onboarded:main_menu'
                  : 'not_onboarded:welcome'
              },
            },
          ],
        }
      }

      const facilities = nearest_facilities.map((facility) => {
        const distanceInKM = (facility.distance / 1000).toFixed(1)
        const description = distanceInKM
          ? `${facility.address} (${distanceInKM}km)`
          : facility.address

        return {
          section: 'Town Name Here',
          row: {
            id: `${facility.id}`,
            title: capLengthAtWhatsAppTitle(facility.name),
            description: capLengthAtWhatsAppDescription(description),
            nextState: 'find_nearest_facility:send_facility_location' as const,
            onExit(_trx: TrxOrDb, patientState: PatientState) {
              console.log('onExit')
              console.log(patientState)
              return Promise.resolve(patientState)
            },
          },
        }
      })

      console.log('facilities')
      console.log(facilities)

      const sectionTitles = uniq(facilities.map((facility) => facility.section))

      console.log('sectionTitles', sectionTitles)

      const sections: ConversationStateHandlerListActionSection<
        PatientState
      >[] = [...sectionTitles].map((title) => ({
        title,
        rows: (
          facilities
            .filter((facility) => facility.section === title)
            .map((facility) => facility.row)
        ),
      }))

      console.log('sections', sections)

      return {
        type: 'list',
        button: 'Nearest Facilities',
        sections,
      }
    },
  },
  'find_nearest_facility:send_facility_location': {
    prompt(patientState: PatientState): string {
      const { selectedFacility } = patientState
      assert(
        selectedFacility,
        'selectedFacility should be available in the patientState',
      )
      // TODO Slightly hacky — better would be to give the precise type for the return of prompt for
      // this ConversationStateHandlerType
      return JSON.stringify({
        messageBody: selectedFacility.name,
        location: {
          longitude: selectedFacility.longitude,
          latitude: selectedFacility.latitude,
          name: selectedFacility.name,
          address: selectedFacility.address,
        },
      })
    },
    type: 'location',
    nextState: 'not_onboarded:welcome',
    onEnter(_trx, patientState) {
      const selectedFacility: Maybe<Facility> = patientState.nearest_facilities
        ?.find(
          (facility) => String(facility.id) === patientState.body,
        )
      return Promise.resolve({ ...patientState, selectedFacility })
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
        id: 'confirm',
        title: 'Yes',
        nextState: 'onboarded:make_appointment:first_scheduling_option',
      },
      {
        id: 'go_back',
        title: 'Go back',
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
        health_worker_id: firstAvailable[0].health_worker.id,
        start: firstAvailable[0].start,
      })

      const nextOfferedTimes: ReturnedSqlRow<
        AppointmentOfferedTime & { health_worker_name: string }
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
        id: 'confirm',
        title: 'Yes',
        nextState: 'onboarded:appointment_scheduled',
      },
      {
        id: 'other_times',
        title: 'Other times',
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
        id: 'go_back',
        title: 'Go back',
        nextState: 'other_end_of_demo',
      },
    ],
  },
  'onboarded:make_appointment:other_scheduling_options': {
    type: 'action',
    headerText: 'Other Appointment Times',
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

      const timeslotsRequired = 3

      const today = new Date()
      const tomorrow = new Date()
      tomorrow.setDate(today.getDate() + 1)
      const afterTomorrow = new Date()
      afterTomorrow.setDate(tomorrow.getDate() + 1)

      const filteredAvailableTimes = await availableThirtyMinutes(
        trx,
        declinedTimes,
        {
          date: [
            formatHarare(today).substring(0, 10),
            formatHarare(tomorrow).substring(0, 10),
            formatHarare(afterTomorrow).substring(0, 10),
          ],
          timeslotsRequired,
        },
      )
      // TODO: get this down to a single DB call
      const newlyOfferedTimes: ReturnedSqlRow<
        AppointmentOfferedTime & { health_worker_name: string }
      >[] = await Promise.all(filteredAvailableTimes.map(
        (timeslot) =>
          appointments.addOfferedTime(trx, {
            appointment_id: patientState.scheduling_appointment_id!,
            health_worker_id: timeslot.health_worker.id,
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
        newlyOfferedTimes.length +
          patientState.appointment_offered_times.length,
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
    ): ConversationStateHandlerListAction<PatientState> {
      const nonDeclinedTimes = patientState.appointment_offered_times.filter(
        (offered_time) => !offered_time.patient_declined,
      )

      const appointmentsByDate: {
        [date: string]: ReturnedSqlRow<
          AppointmentOfferedTime & { health_worker_name: string }
        >[]
      } = nonDeclinedTimes.reduce((acc, appointment) => {
        const date = appointment.start.substring(0, 10)
        if (!acc[date]) {
          acc[date] = []
        }
        acc[date].push(appointment)
        return acc
      }, Object.create(null))

      const sections: ConversationStateHandlerListActionSection<
        PatientState
      >[] = []

      for (const date in appointmentsByDate) {
        sections.push({
          title: date,
          rows: appointmentsByDate[date].map((offeredTime) => {
            return {
              id: String(offeredTime.id),
              title: convertToTimeString(offeredTime.start),
              description: `With Dr. ${offeredTime.health_worker_name}`,
              nextState: 'onboarded:appointment_scheduled',
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
        })
      }
      sections.push({
        title: 'Other Times',
        rows: [{
          id: 'other_time',
          title: 'Other time slots',
          description: 'Show other time slots',
          nextState: 'onboarded:make_appointment:other_scheduling_options',
          async onExit(trx, patientState) {
            await appointments.declineOfferedTimes(
              trx,
              patientState.appointment_offered_times.map((aot) => aot.id),
            )
            return {
              ...patientState,
              appointment_offered_times: patientState.appointment_offered_times
                .map((aot) => ({
                  ...aot,
                  patient_declined: true,
                })),
            }
          },
        }],
      })
      return {
        type: 'list',
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
      }, we notified ${acceptedTime.health_worker_name} and will message you shortly upon confirmirmation of your appointment at ${
        prettyAppointmentTime(acceptedTime.start)
      }`
    },
    options: [
      {
        id: 'cancel',
        title: 'Cancel Appointment',
        nextState: 'onboarded:cancel_appointment',
      },
    ],
  },
  'onboarded:cancel_appointment': {
    type: 'select',
    prompt:
      'Your appoinment has been cancelled. What can I help you with today?',
    options: mainMenuOptions,
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
