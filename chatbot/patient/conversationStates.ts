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
import { convertToTimeString, formatJohannesburg, prettyAppointmentTime } from '../../util/date.ts'
import { appointments } from '../../db/models/appointments.ts'
import { patients } from '../../db/models/patients.ts'
import { conversations } from '../../db/models/conversations.ts'
import { employees } from '../../db/models/employees.ts'

import { availableSlots } from '../../backend/scheduling/getProviderAvailability.ts'
import { cancelAppointment } from '../../backend/scheduling/cancelAppointment.ts'
import { makeAppointmentChatbot } from '../../backend/scheduling/makeAppointment.ts'
import mainMenuOptions from './mainMenuOptions.ts'
import { capLengthAtWhatsAppDescription, capLengthAtWhatsAppTitle } from '../../util/capLengthAt.ts'
import uniq from '../../util/uniq.ts'
import { GoogleClient } from '../../external-clients/google.ts'
import { receiveMedia } from './receiveMedia.ts'
import { SERVER_COUNTRY } from '../../db/models/countries.ts'
import { patient_nearest_facilities } from '../../db/models/patient_nearest_facilities.ts'
import { patient_appointments } from '../../db/models/patient_appointments.ts'

const conversation_states: ConversationStates<
  PatientChatbotUserState
> = {
  'initial_message': {
    type: 'select',
    prompt: 'Welcome to Virtual Hospitals Africa. What can I help you with today?',
    options: mainMenuOptions,
  },
  'not_onboarded:welcome': {
    type: 'select',
    prompt: 'Welcome to Virtual Hospitals Africa. What can I help you with today?',
    options: mainMenuOptions,
  },
  'onboarded:main_menu': {
    type: 'select',
    prompt: 'Welcome to Virtual Hospitals Africa. What can I help you with today?',
    options: mainMenuOptions,
  },
  'not_onboarded:make_appointment:enter_name': {
    type: 'string',
    prompt: 'Sure, I can help you make an appointment with a health_worker.\n\nTo start, what is your name?',
    async onExit(trx, patient_state) {
      const patient = await patients.insert(trx, {
        name: patient_state.unhandled_message.trimmed_body!,
        phone_number: patient_state.unhandled_message.sent_by_phone_number,
        country: SERVER_COUNTRY,
      })
      await conversations.updateChatbotUser(
        trx,
        patient_state.chatbot_user,
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
        async onExit(trx, patient_state) {
          await patients.update(trx, {
            id: patient_state.chatbot_user.entity_id!,
            sex: 'male',
          })
          return 'not_onboarded:make_appointment:enter_date_of_birth' as const
        },
      },
      {
        id: 'female',
        title: 'Female',
        async onExit(trx, patient_state) {
          assert(patient_state.chatbot_user.entity_id)
          await patients.update(trx, {
            id: patient_state.chatbot_user.entity_id,
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
    async onExit(trx, patient_state) {
      assert(patient_state.chatbot_user.entity_id)
      assert(patient_state.unhandled_message.trimmed_body)
      const [day, month, year] = patient_state.unhandled_message.trimmed_body
        .split('/')
      const month_str = month.padStart(2, '0')
      const day_str = day.padStart(2, '0')
      const date_of_birth = `${year}-${month_str}-${day_str}`
      await patients.update(trx, {
        id: patient_state.chatbot_user.entity_id,
        date_of_birth,
      })
      return 'not_onboarded:make_appointment:enter_national_id_number' as const
    },
  },
  'not_onboarded:make_appointment:enter_national_id_number': {
    type: 'string',
    prompt: 'Please enter your national ID number',
    async onExit(trx, patient_state) {
      assert(patient_state.chatbot_user.entity_id)
      await patients.update(trx, {
        id: patient_state.chatbot_user.entity_id,
        national_id_number: patient_state.unhandled_message.trimmed_body,
      })
      await appointments.createNewRequest(trx, {
        patient_id: patient_state.chatbot_user.entity_id,
      })
      return 'onboarded:make_appointment:enter_appointment_reason' as const
    },
  },
  'find_nearest_facilities:share_location': {
    type: 'get_location',
    prompt: 'Sure, we can find your nearest organization. Can you share your location?',
    async onExit(trx, patient_state) {
      assert(patient_state.chatbot_user.entity_id)
      assert(patient_state.unhandled_message.trimmed_body)
      const location_message: Coordinates = JSON.parse(
        patient_state.unhandled_message.trimmed_body,
      )
      const current_location: Coordinates = {
        longitude: location_message.longitude,
        latitude: location_message.latitude,
      }
      await patients.update(trx, {
        id: patient_state.chatbot_user.entity_id,
        location: current_location,
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
      patient_state,
    ) {
      assert(patient_state.chatbot_user.entity_id)

      const nearest_facilities = await patient_nearest_facilities
        .nearestFacilities(
          trx,
          patient_state.chatbot_user.entity_id,
        )
      if (!nearest_facilities?.length) {
        return {
          type: 'select',
          prompt: "We're sorry that no organizations were found in your area. Our team has been notified and will follow up with you soon.",
          options: [
            {
              id: 'main_menu',
              title: 'Main Menu',
              onExit() {
                return patient_state.chatbot_user.entity_id ? 'onboarded:main_menu' as const : 'not_onboarded:welcome' as const
              },
            },
          ],
        }
      }

      const organizations = nearest_facilities.map((organization) => {
        const distance_in_km = organization.walking_distance ||
          (organization.distance_meters / 1000).toFixed(1) + ' km'
        const description = distance_in_km ? `${organization.address} (${distance_in_km})` : organization.address

        const organization_name = organization.admins.length ? `${organization.name} (VHA)` : organization.name
        return {
          section: organization.locality || '[Unknown Location]',
          row: {
            id: organization.id,
            title: capLengthAtWhatsAppTitle(organization_name),
            description: capLengthAtWhatsAppDescription(description),
            onExit: 'find_nearest_facilities:send_organization_location' as const,
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
        rows: organizations
          .filter((organization) => organization.section === title)
          .map((organization) => organization.row),
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
    async getMessages(trx, patient_state): Promise<WhatsAppSendable> {
      assert(patient_state.chatbot_user.entity_id)

      const nearest_facilities = await patient_nearest_facilities
        .nearestFacilities(
          trx,
          patient_state.chatbot_user.entity_id,
        )

      const selected_organization = nearest_facilities
        ?.find(
          (organization) =>
            organization.id ===
              patient_state.unhandled_message.trimmed_body,
        )

      assert(
        selected_organization,
        'selected_organization should be available in the patient_state',
      )

      const location_message: WhatsAppSingleSendable = {
        type: 'location',
        message_body: selected_organization.name,
        location: {
          longitude: selected_organization.location.longitude,
          latitude: selected_organization.location.latitude,
          name: selected_organization.name,
          address: selected_organization.address,
        },
      }

      const button_message: WhatsAppSingleSendable = {
        type: 'buttons',
        message_body: 'Click below to go back to main menu.',
        buttonText: 'Back to main menu',
        options: [{
          id: 'back_to_menu',
          title: 'Back to Menu',
        }],
      }
      return [location_message, button_message]
    },
    type: 'send_location',
    onExit(_trx, patient_state): PatientConversationState {
      return patient_state.chatbot_user.entity_id ? 'onboarded:main_menu' : 'not_onboarded:welcome'
    },
  },
  'onboarded:make_appointment:enter_appointment_reason': {
    type: 'string',
    prompt: 'What is the reason you want to schedule an appointment?',
    async onExit(
      trx,
      patient_state,
    ) {
      assert(patient_state.chatbot_user.entity_id)
      const scheduling_appointment_request = await patient_appointments
        .schedulingAppointmentRequest(
          trx,
          patient_state.chatbot_user.entity_id,
        )
      assert(scheduling_appointment_request)
      await appointments.upsertRequest(trx, {
        id: scheduling_appointment_request.patient_appointment_request_id,
        patient_id: patient_state.chatbot_user.entity_id,
        reason: patient_state.unhandled_message.trimmed_body,
      })
      return 'onboarded:make_appointment:initial_ask_for_media' as const
    },
  },
  'onboarded:make_appointment:initial_ask_for_media': {
    type: 'expect_media',
    prompt: 'To assist the doctor with triaging your case, click the + button to send an image, video, or voice note describing your symptoms.',
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
    prompt: 'Thanks for sending that. To send another image, video, or voice note, click the + button. Otherwise, click Done.',
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
    async prompt(trx, patient_state) {
      assert(patient_state.chatbot_user.entity_id)
      const patient = await patients.getById(
        trx,
        patient_state.chatbot_user.entity_id,
        { include_incomplete_registration: true },
      )
      const scheduling_appointment_request = await patient_appointments
        .schedulingAppointmentRequest(
          trx,
          patient_state.chatbot_user.entity_id,
        )
      assert(scheduling_appointment_request)
      assert(scheduling_appointment_request.reason)
      return `Got it, ${scheduling_appointment_request.reason}. In summary, your name is ${patient.name}, you are a ${patient.sex} born on ${patient.dob_formatted} with national id number ${patient.national_id_number} and you want to schedule an appointment for ${scheduling_appointment_request.reason}. Is this correct?`
    },
    options: [
      {
        id: 'confirm',
        title: 'Yes',
        async onExit(trx, patient_state) {
          assert(patient_state.chatbot_user.entity_id)
          const scheduling_appointment_request = await patient_appointments
            .schedulingAppointmentRequest(
              trx,
              patient_state.chatbot_user.entity_id,
            )
          assert(scheduling_appointment_request)

          // TODO this is getting closer to the truth, but still isn't quite right
          const nearest_facilities = await patient_nearest_facilities
            .nearestFacilities(
              trx,
              patient_state.chatbot_user.entity_id,
            )

          const doctors = await employees.distinctIds(trx, {
            roles: ['doctor'],
            organization_id: nearest_facilities.map((o) => o.id),
          }).execute()
          const employment_ids = doctors.map((doctor) => doctor.id)

          const first_available = await availableSlots(trx, {
            count: 1,
            employment_ids,
          })

          assert(
            first_available.length > 0,
            'TODO handle no appointments available',
          )

          await appointments.addOfferedTime(trx, {
            patient_appointment_request_id: scheduling_appointment_request.patient_appointment_request_id,
            employee_id: first_available[0].provider.employee_id,
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
    async prompt(trx, patient_state) {
      assert(patient_state.chatbot_user.entity_id)
      const scheduling_appointment_request = await patient_appointments
        .schedulingAppointmentRequest(
          trx,
          patient_state.chatbot_user.entity_id,
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
        async onExit(trx, patient_state) {
          await makeAppointmentChatbot(
            trx,
            patient_state,
            function insertEvent(health_worker, calendar_id, event) {
              const health_worker_google_client = new GoogleClient(
                health_worker,
              )
              return health_worker_google_client.insertEvent(
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
        async onExit(trx, patient_state) {
          assert(patient_state.chatbot_user.entity_id)
          const scheduling_appointment_request = await patient_appointments
            .schedulingAppointmentRequest(
              trx,
              patient_state.chatbot_user.entity_id,
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

          const nearest_facilities = await patient_nearest_facilities
            .nearestFacilities(
              trx,
              patient_state.chatbot_user.entity_id,
            )
          const doctors = await employees.distinctIds(trx, {
            roles: ['doctor'],
            organization_id: nearest_facilities.map((o) => o.id),
          }).execute()
          const employment_ids = doctors.map((doctor) => doctor.id)

          const filtered_available_times = await availableSlots(
            trx,
            {
              employment_ids,
              declined_times: declined_times.map((time) => formatJohannesburg(time)),
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
                patient_appointment_request_id: scheduling_appointment_request.patient_appointment_request_id,
                employee_id: timeslot.provider.employee_id,
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
    prompt: 'OK here are the other available time, please choose from the list.',
    async action(
      trx,
      patient_state,
    ) {
      assert(patient_state.chatbot_user.entity_id)
      const scheduling_appointment_request = await patient_appointments
        .schedulingAppointmentRequest(
          trx,
          patient_state.chatbot_user.entity_id,
        )
      assert(scheduling_appointment_request)

      const non_declined_times = scheduling_appointment_request
        .offered_times.filter(
          (offered_time) => !offered_time.declined,
        )

      const appointments_by_date: {
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

      for (const date in appointments_by_date) {
        sections.push({
          title: date,
          rows: appointments_by_date[date].map((offered_time) => {
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
          async onExit(trx, patient_state) {
            assert(patient_state.chatbot_user.entity_id)
            const scheduling_appointment_request = await patient_appointments
              .schedulingAppointmentRequest(
                trx,
                patient_state.chatbot_user.entity_id,
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
    async prompt(trx, patient_state) {
      assert(patient_state.chatbot_user.entity_id)
      const scheduled_appointments = await patient_appointments
        .scheduledAppointments(
          trx,
          patient_state.chatbot_user.entity_id,
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
        async onExit(trx: TrxOrDb, patient_state) {
          await cancelAppointment(trx, patient_state)
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
    prompt: 'Your appointment has been cancelled. What can I help you with today?',
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

export default conversation_states
