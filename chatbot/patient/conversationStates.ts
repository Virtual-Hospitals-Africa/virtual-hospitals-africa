import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import {
  ConversationStateHandlerListActionSection,
  ConversationStates,
  Location,
  PatientChatbotUserState,
  PatientConversationState,
  SchedulingAppointmentOfferedTime,
  TrxOrDb,
  WhatsAppSendable,
  WhatsAppSingleSendable,
} from '../../types.ts'
import {
  convertToTimeString,
  formatHarare,
  prettyAppointmentTime,
} from '../../util/date.ts'
import * as appointments from '../../db/models/appointments.ts'
import * as patients from '../../db/models/patients.ts'
import { availableSlots } from '../../shared/scheduling/getProviderAvailability.ts'
import { cancelAppointment } from '../../shared/scheduling/cancelAppointment.ts'
import { makeAppointmentChatbot } from '../../shared/scheduling/makeAppointment.ts'
import mainMenuOptions from './mainMenuOptions.ts'
import {
  capLengthAtWhatsAppDescription,
  capLengthAtWhatsAppTitle,
} from '../../util/capLengthAt.ts'
import uniq from '../../util/uniq.ts'
import { GoogleClient } from '../../external-clients/google.ts'
import { receiveMedia } from './receiveMedia.ts'

const conversationStates: ConversationStates<
  PatientChatbotUserState
> = {
  'initial_message': {
    type: 'select',
    prompt:
      'Welcome to Virtual Hospitals Africa. What can I help you with today?',
    options: mainMenuOptions,
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
    async onExit(trx, patientState) {
      assert(patientState.entity_id)
      await patients.upsertIntake(trx, {
        id: patientState.entity_id,
        name: patientState.unhandled_message.trimmed_body,
      })
      return 'not_onboarded:make_appointment:enter_gender' as const
    },
  },
  'not_onboarded:make_appointment:enter_gender': {
    prompt: 'What is your gender?',
    type: 'select',
    options: [
      {
        id: 'male',
        title: 'Male',
        async onExit(trx, patientState) {
          await patients.upsertIntake(trx, {
            id: patientState.entity_id!,
            gender: 'male',
          })
          return 'not_onboarded:make_appointment:enter_date_of_birth' as const
        },
      },
      {
        id: 'female',
        title: 'Female',
        async onExit(trx, patientState) {
          assert(patientState.entity_id)
          await patients.upsertIntake(trx, {
            id: patientState.entity_id,
            gender: 'female',
          })
          return 'not_onboarded:make_appointment:enter_date_of_birth' as const
        },
      },
      {
        id: 'non-binary',
        title: 'Non-binary',
        async onExit(trx, patientState) {
          assert(patientState.entity_id)
          await patients.upsertIntake(trx, {
            id: patientState.entity_id,
            gender: 'non-binary',
          })
          return 'not_onboarded:make_appointment:enter_date_of_birth' as const
        },
      },
    ],
  },
  'not_onboarded:make_appointment:enter_date_of_birth': {
    type: 'date',
    prompt: 'What is your date of birth?',
    async onExit(trx, patientState) {
      assert(patientState.entity_id)
      assert(patientState.unhandled_message.trimmed_body)
      const [day, month, year] = patientState.unhandled_message.trimmed_body
        .split('/')
      const monthStr = month.padStart(2, '0')
      const dayStr = day.padStart(2, '0')
      const date_of_birth = `${year}-${monthStr}-${dayStr}`
      await patients.upsertIntake(trx, {
        id: patientState.entity_id,
        date_of_birth,
      })
      return 'not_onboarded:make_appointment:enter_national_id_number' as const
    },
  },
  'not_onboarded:make_appointment:enter_national_id_number': {
    type: 'string',
    prompt: 'Please enter your national ID number',
    async onExit(trx, patientState) {
      assert(patientState.entity_id)
      await patients.upsertIntake(trx, {
        id: patientState.entity_id,
        national_id_number: patientState.unhandled_message.trimmed_body,
      })
      await appointments.createNewRequest(trx, {
        patient_id: patientState.entity_id,
      })
      return 'onboarded:make_appointment:enter_appointment_reason' as const
    },
  },
  'find_nearest_organization:share_location': {
    type: 'get_location',
    prompt:
      'Sure, we can find your nearest organization. Can you share your location?',
    async onExit(trx, patientState) {
      assert(patientState.entity_id)
      assert(patientState.unhandled_message.trimmed_body)
      const locationMessage: Location = JSON.parse(
        patientState.unhandled_message.trimmed_body,
      )
      const currentLocation: Location = {
        longitude: locationMessage.longitude,
        latitude: locationMessage.latitude,
      }
      await patients.upsertIntake(trx, {
        id: patientState.entity_id,
        location: currentLocation,
      })

      return 'find_nearest_organization:got_location' as const
    },
  },
  // change the name of got_location to nearest_organizations?
  'find_nearest_organization:got_location': {
    type: 'action',
    headerText: 'Nearest Facilities',
    prompt: 'Click the button below to see your nearest health organizations',
    async action(
      trx,
      patientState,
    ) {
      assert(patientState.entity_id)
      const patient = await patients.getByID(trx, {
        id: patientState.entity_id,
      })
      assert(patient.location)
      assert(patient.location.latitude)
      assert(patient.location.longitude)

      const nearest_organizations = await patients.nearestFacilities(
        trx,
        patientState.entity_id,
        patient.location as Location,
      )
      if (!nearest_organizations?.length) {
        return {
          type: 'select',
          prompt:
            "We're sorry that no organizations were found in your area. Our team has been notified and will follow up with you soon.",
          options: [
            {
              id: 'main_menu',
              title: 'Main Menu',
              onExit() {
                return patients.hasDemographicInfo(patient)
                  ? 'onboarded:main_menu' as const
                  : 'not_onboarded:welcome' as const
              },
            },
          ],
        }
      }

      const organizations = nearest_organizations.map((organization) => {
        const distanceInKM = organization.walking_distance ||
          (organization.distance / 1000).toFixed(1) + ' km'
        const description = distanceInKM
          ? `${organization.address} (${distanceInKM})`
          : organization.address

        const organizationName = organization.vha
          ? `${organization.organization_name} (VHA)`
          : organization.organization_name
        return {
          section: 'Town Name Here',
          row: {
            id: organization.organization_id,
            title: capLengthAtWhatsAppTitle(organizationName),
            description: capLengthAtWhatsAppDescription(description),
            onExit:
              'find_nearest_organization:send_organization_location' as const,
          },
        }
      })

      const sectionTitles = uniq(
        organizations.map((organization) => organization.section),
      )

      const sections: ConversationStateHandlerListActionSection<
        PatientChatbotUserState
      >[] = [...sectionTitles].map((title) => ({
        title,
        rows: (
          organizations
            .filter((organization) => organization.section === title)
            .map((organization) => organization.row)
        ),
      }))

      return {
        type: 'list',
        button: 'Nearest Facilities',
        sections,
      }
    },
  },
  'find_nearest_organization:send_organization_location': {
    prompt: 'I will send you organization location',
    async getMessages(trx, patientState): Promise<WhatsAppSendable> {
      assert(patientState.entity_id)
      const patient = await patients.getByID(trx, {
        id: patientState.entity_id,
      })
      assert(patient.location)
      assert(patient.location.latitude)
      assert(patient.location.longitude)

      const nearest_organizations = await patients.nearestFacilities(
        trx,
        patientState.entity_id,
        patient.location as Location,
      )

      const selected_organization = nearest_organizations
        ?.find(
          (organization) =>
            organization.organization_id ===
              patientState.unhandled_message.trimmed_body,
        )

      assert(
        selected_organization,
        'selected_organization should be available in the patientState',
      )

      const locationMessage: WhatsAppSingleSendable = {
        type: 'location',
        messageBody: selected_organization.organization_name,
        location: {
          longitude: selected_organization.longitude,
          latitude: selected_organization.latitude,
          name: selected_organization.organization_name,
          address: selected_organization.address,
        },
      }

      const buttonMessage: WhatsAppSingleSendable = {
        type: 'buttons',
        messageBody: 'Click below to go back to main menu.',
        buttonText: 'Back to main menu',
        options: [{
          id: 'back_to_menu',
          title: 'Back to Menu',
        }],
      }
      return [locationMessage, buttonMessage]
    },
    type: 'send_location',
    onExit(patientState): PatientConversationState {
      return patients.hasDemographicInfo(patientState)
        ? 'onboarded:main_menu'
        : 'not_onboarded:welcome'
    },
  },
  'onboarded:make_appointment:enter_appointment_reason': {
    type: 'string',
    prompt: 'What is the reason you want to schedule an appointment?',
    async onExit(
      trx,
      patientState,
    ) {
      assert(patientState.entity_id)
      const scheduling_appointment_request = await patients
        .schedulingAppointmentRequest(trx, patientState.entity_id)
      assert(scheduling_appointment_request)
      await appointments.upsertRequest(trx, {
        id: scheduling_appointment_request.patient_appointment_request_id,
        patient_id: patientState.entity_id,
        reason: patientState.unhandled_message.trimmed_body,
      })
      return 'onboarded:make_appointment:initial_ask_for_media' as const
    },
  },
  'onboarded:make_appointment:initial_ask_for_media': {
    type: 'expect_media',
    prompt:
      'To assist the doctor with triaging your case, click the + button to send an image, video, or voice note describing your symptoms.',
    onExit: receiveMedia,
    options: [
      {
        id: 'skip',
        title: 'Skip',
        onExit: 'onboarded:make_appointment:confirm_details',
      },
    ],
  },
  'onboarded:make_appointment:subsequent_ask_for_media': {
    type: 'expect_media',
    prompt:
      'Thanks for sending that. To send another image, video, or voice note, click the + button. Otherwise, click Done.',
    onExit: receiveMedia,
    options: [
      {
        id: 'done',
        title: 'Done',
        onExit: 'onboarded:make_appointment:confirm_details',
      },
    ],
  },
  'onboarded:make_appointment:confirm_details': {
    type: 'select',
    async prompt(trx, patientState) {
      assert(patientState.entity_id)
      const patient = await patients.getByID(trx, {
        id: patientState.entity_id,
      })
      const scheduling_appointment_request = await patients
        .schedulingAppointmentRequest(trx, patientState.entity_id)
      assert(scheduling_appointment_request)
      assert(scheduling_appointment_request.reason)
      return `Got it, ${scheduling_appointment_request.reason}. In summary, your name is ${patient.name}, you're messaging from ${patient.phone_number}, you are a ${patient.gender} born on ${patient.dob_formatted} with national id number ${patient.national_id_number} and you want to schedule an appointment for ${scheduling_appointment_request.reason}. Is this correct?`
    },
    options: [
      {
        id: 'confirm',
        title: 'Yes',
        async onExit(trx, patientState) {
          assert(patientState.entity_id)
          const scheduling_appointment_request = await patients
            .schedulingAppointmentRequest(trx, patientState.entity_id)
          assert(scheduling_appointment_request)
          const firstAvailable = await availableSlots(trx, {
            count: 1,
          })

          assert(firstAvailable.length > 0)

          await appointments.addOfferedTime(trx, {
            patient_appointment_request_id:
              scheduling_appointment_request.patient_appointment_request_id,
            provider_id: firstAvailable[0].provider.provider_id,
            start: firstAvailable[0].start,
          })
          return 'onboarded:make_appointment:first_scheduling_option' as const
        },
      },
      {
        id: 'go_back',
        title: 'Go back',
        onExit: 'end_of_demo',
      },
    ],
  },
  'onboarded:make_appointment:first_scheduling_option': {
    type: 'select',
    async prompt(trx, patientState) {
      assert(patientState.entity_id)
      const scheduling_appointment_request = await patients
        .schedulingAppointmentRequest(trx, patientState.entity_id)
      assert(scheduling_appointment_request)
      return `Great, the next available appoinment is ${
        prettyAppointmentTime(
          scheduling_appointment_request.offered_times[0].start,
        )
      }. Would you like to schedule this appointment?`
    },
    options: [
      {
        id: 'confirm',
        title: 'Yes',
        async onExit(trx, patientState) {
          await makeAppointmentChatbot(
            trx,
            patientState,
            function insertEvent(health_worker, calendar_id, event) {
              const healthWorkerGoogleClient = new GoogleClient(health_worker)
              return healthWorkerGoogleClient.insertEvent(calendar_id, event)
            },
          )
          return 'onboarded:appointment_scheduled' as const
        },
      },
      {
        id: 'other_times',
        title: 'Other times',
        async onExit(trx, patientState) {
          assert(patientState.entity_id)
          const scheduling_appointment_request = await patients
            .schedulingAppointmentRequest(trx, patientState.entity_id)
          assert(scheduling_appointment_request)

          await appointments.declineOfferedTimes(
            trx,
            scheduling_appointment_request.offered_times.map((
              aot,
            ) => aot.id),
          )

          const declinedTimes = scheduling_appointment_request
            .offered_times.map(
              (aot) => aot.start,
            )

          const today = new Date()
          const tomorrow = new Date(today.getTime() + (24 * 60 * 60 * 1000))
          const afterTomorrow = new Date(
            tomorrow.getTime() + (24 * 60 * 60 * 1000),
          )

          const filteredAvailableTimes = await availableSlots(
            trx,
            {
              declinedTimes: declinedTimes.map((time) => formatHarare(time)),
              count: 9,
              dates: [
                formatHarare(today).substring(0, 10),
                formatHarare(tomorrow).substring(0, 10),
                formatHarare(afterTomorrow).substring(0, 10),
              ],
            },
          )

          // TODO: get this to a single DB call
          await Promise.all(filteredAvailableTimes.map(
            (timeslot) =>
              appointments.addOfferedTime(trx, {
                patient_appointment_request_id:
                  scheduling_appointment_request.patient_appointment_request_id,
                provider_id: timeslot.provider.provider_id,
                start: timeslot.start,
              }),
          ))

          return 'onboarded:make_appointment:other_scheduling_options' as const
        },
      },
      {
        id: 'go_back',
        title: 'Go back',
        onExit: 'end_of_demo',
      },
    ],
  },
  'onboarded:make_appointment:other_scheduling_options': {
    type: 'action',
    headerText: 'Other Appointment Times',
    prompt:
      'OK here are the other available time, please choose from the list.',
    async action(
      trx,
      patientState,
    ) {
      assert(patientState.entity_id)
      const scheduling_appointment_request = await patients
        .schedulingAppointmentRequest(trx, patientState.entity_id)
      assert(scheduling_appointment_request)

      const nonDeclinedTimes = scheduling_appointment_request
        .offered_times.filter(
          (offered_time) => !offered_time.declined,
        )

      const appointmentsByDate: {
        [date: string]: SchedulingAppointmentOfferedTime[]
      } = nonDeclinedTimes.reduce((acc, appointment) => {
        const date = formatHarare(appointment.start).substring(0, 10)
        if (!acc[date]) {
          acc[date] = []
        }
        acc[date].push(appointment)
        return acc
      }, Object.create(null))

      const sections: ConversationStateHandlerListActionSection<
        PatientChatbotUserState
      >[] = []

      for (const date in appointmentsByDate) {
        sections.push({
          title: date,
          rows: appointmentsByDate[date].map((offeredTime) => {
            return {
              id: String(offeredTime.id),
              title: convertToTimeString(formatHarare(offeredTime.start)),
              description: `With Dr. ${offeredTime.health_worker_name}`,
              async onExit(trx) {
                const toDecline = scheduling_appointment_request
                  .offered_times
                  .filter((aot) => !aot.declined)
                  .filter((aot) => aot.id !== offeredTime.id)
                  .map((aot) => aot.id)

                if (toDecline.length > 0) {
                  await appointments.declineOfferedTimes(trx, toDecline)
                }

                return 'onboarded:appointment_scheduled' as const
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
          async onExit(trx, patientState) {
            assert(patientState.entity_id)
            const scheduling_appointment_request = await patients
              .schedulingAppointmentRequest(trx, patientState.entity_id)
            assert(scheduling_appointment_request)
            await appointments.declineOfferedTimes(
              trx,
              scheduling_appointment_request.offered_times.map((
                aot,
              ) => aot.id),
            )
            return 'onboarded:make_appointment:other_scheduling_options' as const
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
    async prompt(trx, patientState) {
      assert(patientState.entity_id)
      const scheduled_appointments = await patients.scheduledAppointments(
        trx,
        patientState.entity_id,
      )
      assertEquals(scheduled_appointments.length, 1)
      const [scheduled_appointment] = scheduled_appointments
      assert(scheduled_appointment.gcal_event_id)
      return `We notified ${scheduled_appointment.health_worker_name} and will message you shortly upon confirmirmation of your appointment at ${
        prettyAppointmentTime(scheduled_appointment.start)
      }`
    },
    options: [
      {
        id: 'cancel',
        title: 'Cancel Appointment',
        async onExit(trx: TrxOrDb, patientState) {
          await cancelAppointment(trx, patientState)
          return 'onboarded:appointment_cancelled' as const
        },
      },
    ],
  },
  'onboarded:appointment_cancelled': {
    type: 'select',
    prompt:
      'Your appointment has been cancelled. What can I help you with today?',
    options: mainMenuOptions,
  },
  end_of_demo: {
    type: 'select',
    prompt: 'This is the end of the demo. Thank you for participating!',
    options: [
      {
        id: 'main_menu',
        title: 'Main Menu',
        onExit: 'initial_message',
      },
    ],
  },
  error: {
    type: 'select',
    prompt: 'An error occurred. Please try again.',
    options: [
      {
        id: 'main_menu',
        title: 'Main Menu',
        onExit: 'initial_message',
      },
    ],
  },
}

export default conversationStates
