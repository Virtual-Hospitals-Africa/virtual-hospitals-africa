import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import {
  ConversationStateHandlerListActionSection,
  ConversationStates,
  Coordinates,
  PatientChatbotUserState,
  PatientConversationState,
  SchedulingAppointmentOfferedTime,
  TrxOrDb,
  WhatsAppSendable,
  WhatsAppSingleSendable,
} from '../../types.ts'
import {
  convertToTimeString,
  formatJohannesburg,
  prettyAppointmentTime,
} from '../../util/date.ts'
import * as appointments from '../../db/models/appointments.ts'
import * as patients from '../../db/models/patients.ts'
import * as conversations from '../../db/models/conversations.ts'
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
import { SERVER_COUNTRY } from '../../db/models/countries.ts'
import { nearestFacilities } from '../../db/models/patient_nearest_facilities.ts'
import {
  scheduledAppointments,
  schedulingAppointmentRequest,
} from '../../db/models/patient_appointments.ts'

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
      const patient = await patients.insert(trx, {
        name: patientState.unhandled_message.trimmed_body!,
        phone_number: patientState.unhandled_message.sent_by_phone_number,
        country: SERVER_COUNTRY,
      })
      await conversations.updateChatbotUser(
        trx,
        patientState.chatbot_user,
        {
          entity_id: patient.id,
        },
      )
      return 'not_onboarded:make_appointment:enter_sex' as const
    },
  },
  'not_onboarded:make_appointment:enter_sex': {
    prompt: 'What is your sex?',
    type: 'select',
    options: [
      {
        id: 'male',
        title: 'Male',
        async onExit(trx, patientState) {
          await patients.update(trx, {
            id: patientState.chatbot_user.entity_id!,
            sex: 'male',
          })
          return 'not_onboarded:make_appointment:enter_date_of_birth' as const
        },
      },
      {
        id: 'female',
        title: 'Female',
        async onExit(trx, patientState) {
          assert(patientState.chatbot_user.entity_id)
          await patients.update(trx, {
            id: patientState.chatbot_user.entity_id,
            sex: 'female',
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
      assert(patientState.chatbot_user.entity_id)
      assert(patientState.unhandled_message.trimmed_body)
      const [day, month, year] = patientState.unhandled_message.trimmed_body
        .split('/')
      const month_str = month.padStart(2, '0')
      const day_str = day.padStart(2, '0')
      const date_of_birth = `${year}-${month_str}-${day_str}`
      await patients.update(trx, {
        id: patientState.chatbot_user.entity_id,
        date_of_birth,
      })
      return 'not_onboarded:make_appointment:enter_national_id_number' as const
    },
  },
  'not_onboarded:make_appointment:enter_national_id_number': {
    type: 'string',
    prompt: 'Please enter your national ID number',
    async onExit(trx, patientState) {
      assert(patientState.chatbot_user.entity_id)
      await patients.update(trx, {
        id: patientState.chatbot_user.entity_id,
        national_id_number: patientState.unhandled_message.trimmed_body,
      })
      await appointments.createNewRequest(trx, {
        patient_id: patientState.chatbot_user.entity_id,
      })
      return 'onboarded:make_appointment:enter_appointment_reason' as const
    },
  },
  'find_nearest_facilities:share_location': {
    type: 'get_location',
    prompt:
      'Sure, we can find your nearest organization. Can you share your location?',
    async onExit(trx, patientState) {
      assert(patientState.chatbot_user.entity_id)
      assert(patientState.unhandled_message.trimmed_body)
      const locationMessage: Coordinates = JSON.parse(
        patientState.unhandled_message.trimmed_body,
      )
      const currentLocation: Coordinates = {
        longitude: locationMessage.longitude,
        latitude: locationMessage.latitude,
      }
      await patients.update(trx, {
        id: patientState.chatbot_user.entity_id,
        location: currentLocation,
      })

      return 'find_nearest_facilities:got_location' as const
    },
  },
  // change the name of got_location to nearest_facilities?
  'find_nearest_facilities:got_location': {
    type: 'action',
    headerText: 'Nearest Facilities',
    prompt: 'Click the button below to see the health facilities closes to you',
    async action(
      trx,
      patientState,
    ) {
      assert(patientState.chatbot_user.entity_id)

      const nearest_facilities = await nearestFacilities(
        trx,
        patientState.chatbot_user.entity_id,
      )
      if (!nearest_facilities?.length) {
        return {
          type: 'select',
          prompt:
            "We're sorry that no organizations were found in your area. Our team has been notified and will follow up with you soon.",
          options: [
            {
              id: 'main_menu',
              title: 'Main Menu',
              onExit() {
                return patientState.chatbot_user.entity_id
                  ? 'onboarded:main_menu' as const
                  : 'not_onboarded:welcome' as const
              },
            },
          ],
        }
      }

      const organizations = nearest_facilities.map((organization) => {
        const distance_in_km = organization.walking_distance ||
          (organization.distance_meters / 1000).toFixed(1) + ' km'
        const description = distance_in_km
          ? `${organization.address} (${distance_in_km})`
          : organization.address

        const organization_name = organization.admins.length
          ? `${organization.name} (VHA)`
          : organization.name
        return {
          section: organization.locality || '[Unknown Location]',
          row: {
            id: organization.id,
            title: capLengthAtWhatsAppTitle(organization_name),
            description: capLengthAtWhatsAppDescription(description),
            onExit:
              'find_nearest_facilities:send_organization_location' as const,
          },
        }
      })

      const section_titles = uniq(
        organizations.map((organization) => organization.section),
      )

      const sections: ConversationStateHandlerListActionSection<
        PatientChatbotUserState
      >[] = [...section_titles].map((title) => ({
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
  'find_nearest_facilities:send_organization_location': {
    prompt: 'I will send you organization location',
    async getMessages(trx, patientState): Promise<WhatsAppSendable> {
      assert(patientState.chatbot_user.entity_id)

      const nearest_facilities = await nearestFacilities(
        trx,
        patientState.chatbot_user.entity_id,
      )

      const selected_organization = nearest_facilities
        ?.find(
          (organization) =>
            organization.id ===
              patientState.unhandled_message.trimmed_body,
        )

      assert(
        selected_organization,
        'selected_organization should be available in the patientState',
      )

      const locationMessage: WhatsAppSingleSendable = {
        type: 'location',
        message_body: selected_organization.name,
        location: {
          longitude: selected_organization.location.longitude,
          latitude: selected_organization.location.latitude,
          name: selected_organization.name,
          address: selected_organization.address,
        },
      }

      const buttonMessage: WhatsAppSingleSendable = {
        type: 'buttons',
        message_body: 'Click below to go back to main menu.',
        buttonText: 'Back to main menu',
        options: [{
          id: 'back_to_menu',
          title: 'Back to Menu',
        }],
      }
      return [locationMessage, buttonMessage]
    },
    type: 'send_location',
    onExit(_trx, patientState): PatientConversationState {
      return patientState.chatbot_user.entity_id
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
      assert(patientState.chatbot_user.entity_id)
      const scheduling_appointment_request = await schedulingAppointmentRequest(
        trx,
        patientState.chatbot_user.entity_id,
      )
      assert(scheduling_appointment_request)
      await appointments.upsertRequest(trx, {
        id: scheduling_appointment_request.patient_appointment_request_id,
        patient_id: patientState.chatbot_user.entity_id,
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
      assert(patientState.chatbot_user.entity_id)
      const patient = await patients.getById(
        trx,
        patientState.chatbot_user.entity_id,
      )
      const scheduling_appointment_request = await schedulingAppointmentRequest(
        trx,
        patientState.chatbot_user.entity_id,
      )
      assert(scheduling_appointment_request)
      assert(scheduling_appointment_request.reason)
      return `Got it, ${scheduling_appointment_request.reason}. In summary, your name is ${patient.name}, you are a ${patient.sex} born on ${patient.dob_formatted} with national id number ${patient.national_id_number} and you want to schedule an appointment for ${scheduling_appointment_request.reason}. Is this correct?`
    },
    options: [
      {
        id: 'confirm',
        title: 'Yes',
        async onExit(trx, patientState) {
          assert(patientState.chatbot_user.entity_id)
          const scheduling_appointment_request =
            await schedulingAppointmentRequest(
              trx,
              patientState.chatbot_user.entity_id,
            )
          assert(scheduling_appointment_request)
          const first_available = await availableSlots(trx, {
            count: 1,
          })

          assert(first_available.length > 0)

          await appointments.addOfferedTime(trx, {
            patient_appointment_request_id:
              scheduling_appointment_request.patient_appointment_request_id,
            provider_id: first_available[0].provider.provider_id,
            start: first_available[0].start,
            end: first_available[0].end,
            duration_minutes: first_available[0].duration_minutes,
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
      assert(patientState.chatbot_user.entity_id)
      const scheduling_appointment_request = await schedulingAppointmentRequest(
        trx,
        patientState.chatbot_user.entity_id,
      )
      assert(scheduling_appointment_request)
      return `Great, the next available appointment is on ${
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
            function insert_event(health_worker, calendar_id, event) {
              const health_worker_google_client = new GoogleClient(
                health_worker,
              )
              return health_worker_google_client.insert_event(
                calendar_id,
                event,
              )
            },
          )
          return 'onboarded:appointment_scheduled' as const
        },
      },
      {
        id: 'other_times',
        title: 'Other times',
        async onExit(trx, patientState) {
          assert(patientState.chatbot_user.entity_id)
          const scheduling_appointment_request =
            await schedulingAppointmentRequest(
              trx,
              patientState.chatbot_user.entity_id,
            )
          assert(scheduling_appointment_request)

          await appointments.declineOfferedTimes(
            trx,
            scheduling_appointment_request.offered_times.map((
              aot,
            ) => aot.id),
          )

          const declined_times = scheduling_appointment_request
            .offered_times.map(
              (aot) => aot.start,
            )

          const today = new Date()
          const tomorrow = new Date(today.getTime() + (24 * 60 * 60 * 1000))
          const after_tomorrow = new Date(
            tomorrow.getTime() + (24 * 60 * 60 * 1000),
          )

          const filtered_available_times = await availableSlots(
            trx,
            {
              declined_times: declined_times.map((time) =>
                formatJohannesburg(time)
              ),
              count: 9,
              dates: [
                formatJohannesburg(today).substring(0, 10),
                formatJohannesburg(tomorrow).substring(0, 10),
                formatJohannesburg(after_tomorrow).substring(0, 10),
              ],
            },
          )

          // TODO: get this to a single DB call
          await Promise.all(filtered_available_times.map(
            (timeslot) =>
              appointments.addOfferedTime(trx, {
                patient_appointment_request_id:
                  scheduling_appointment_request.patient_appointment_request_id,
                provider_id: timeslot.provider.provider_id,
                start: timeslot.start,
                end: timeslot.end,
                duration_minutes: timeslot.duration_minutes,
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
      assert(patientState.chatbot_user.entity_id)
      const scheduling_appointment_request = await schedulingAppointmentRequest(
        trx,
        patientState.chatbot_user.entity_id,
      )
      assert(scheduling_appointment_request)

      const non_declined_times = scheduling_appointment_request
        .offered_times.filter(
          (offered_time) => !offered_time.declined,
        )

      const appointmentsByDate: {
        [date: string]: SchedulingAppointmentOfferedTime[]
      } = non_declined_times.reduce((acc, appointment) => {
        const date = formatJohannesburg(appointment.start).substring(0, 10)
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
          rows: appointmentsByDate[date].map((offered_time) => {
            return {
              id: String(offered_time.id),
              title: convertToTimeString(
                formatJohannesburg(offered_time.start),
              ),
              description: `With Dr. ${offered_time.health_worker_name}`,
              async onExit(trx) {
                const to_decline = scheduling_appointment_request
                  .offered_times
                  .filter((aot) => !aot.declined)
                  .filter((aot) => aot.id !== offered_time.id)
                  .map((aot) => aot.id)

                if (to_decline.length > 0) {
                  await appointments.declineOfferedTimes(trx, to_decline)
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
            assert(patientState.chatbot_user.entity_id)
            const scheduling_appointment_request =
              await schedulingAppointmentRequest(
                trx,
                patientState.chatbot_user.entity_id,
              )
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
      assert(patientState.chatbot_user.entity_id)
      const scheduled_appointments = await scheduledAppointments(
        trx,
        patientState.chatbot_user.entity_id,
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
      {
        id: 'main_menu',
        title: 'Main Menu',
        onExit: 'initial_message',
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
