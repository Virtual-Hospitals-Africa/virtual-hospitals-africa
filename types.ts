// deno-lint-ignore-file no-explicit-any
import { ColumnType, Generated, Transaction } from 'kysely'
import { Handlers } from '$fresh/server.ts'
import { Session } from 'fresh_session/session'
import db, { DatabaseSchema } from './db/db.ts'

export type Maybe<T> = T | null | undefined

export type Falsy = false | 0 | '' | null | undefined

export type DeepPartial<T> = T extends Record<string, unknown> ? {
    [P in keyof T]?: DeepPartial<T[P]>
  }
  : T

export type SqlRow<T> = {
  id: Generated<number>
  created_at: ColumnType<Date, undefined, never>
  updated_at: ColumnType<Date, undefined, never>
} & T

export type ReturnedSqlRow<T> = {
  id: number
  created_at: Date
  updated_at: Date
} & T

export type Location = {
  longitude: number
  latitude: number
}

export type Gender = 'male' | 'female' | 'other'

export type UserState<CS> = {
  body: string
  conversation_state: CS
}
export type PatientConversationState =
  | 'initial_message'
  | 'not_onboarded:welcome'
  | 'not_onboarded:make_appointment:enter_name'
  | 'not_onboarded:make_appointment:enter_gender'
  | 'not_onboarded:make_appointment:enter_date_of_birth'
  | 'not_onboarded:make_appointment:enter_national_id_number'
  | 'onboarded:make_appointment:enter_appointment_reason'
  | 'onboarded:make_appointment:confirm_details'
  | 'onboarded:make_appointment:first_scheduling_option'
  | 'onboarded:make_appointment:other_scheduling_options'
  | 'onboarded:appointment_scheduled'
  | 'onboarded:cancel_appointment'
  | 'onboarded:main_menu'
  | 'find_nearest_facility:share_location'
  | 'find_nearest_facility:got_location'
  | 'find_nearest_facility:send_facility_location'
  | 'other_end_of_demo'

export type Patient = {
  conversation_state: PatientConversationState
} & PatientDemographicInfo

export type PatientDemographicInfo = {
  phone_number: string
  name: Maybe<string>
  gender: Maybe<Gender>
  date_of_birth: Maybe<string>
  national_id_number: Maybe<string>
}

export type AppointmentOfferedTime = {
  appointment_id: number
  health_worker_id: number
  start: string
  patient_declined: boolean
  scheduled_gcal_event_id: string
  id: number
}

export type PatientState = {
  message_id: number
  patient_id: number
  whatsapp_id: string
  body: string
  phone_number: string
  name: Maybe<string>
  gender: Maybe<Gender>
  date_of_birth: Maybe<string>
  national_id_number: Maybe<string>
  conversation_state: PatientConversationState
  scheduling_appointment_id?: number
  scheduling_appointment_reason?: Maybe<string>
  scheduling_appointment_status?: Maybe<AppointmentStatus>
  appointment_offered_times: ReturnedSqlRow<
    AppointmentOfferedTime & { health_worker_name: string }
  >[]
  created_at: Date
  updated_at: Date
  nearest_facilities?: ReturnedSqlRow<Facility>[]
  nearest_facility_name?: string
  selectedFacility?: Facility
}

export type ConversationStateHandlerType<US extends UserState<any>, T> = T & {
  prompt: string | ((userState: US) => string)
  onEnter?: (
    trx: TrxOrDb,
    userState: US,
  ) => Promise<US>
  onExit?: (
    trx: TrxOrDb,
    userState: US,
  ) => Promise<US>
}

export type ConversationStateHandlerNextState<US extends UserState<any>> =
  | US['conversation_state']
  | ((
    userState: US,
  ) => US['conversation_state'])

export type ConversationStateHandlerSelectOption<US extends UserState<any>> = {
  id: string
  title: string
  nextState: ConversationStateHandlerNextState<US>
  onExit?: (
    trx: TrxOrDb,
    userState: US,
  ) => Promise<US>
}

export type ConversationStateHandlerListActionRow<US extends UserState<any>> = {
  id: string
  title: string
  description: string
  nextState: ConversationStateHandlerNextState<US>
  onExit?: (
    trx: TrxOrDb,
    userState: US,
  ) => Promise<US>
}
export type ConversationStateHandlerListActionSection<
  US extends UserState<any>,
> = {
  title: string
  rows: ConversationStateHandlerListActionRow<US>[]
}

export type ConversationStateHandlerListAction<US extends UserState<any>> = {
  type: 'list'
  button: string
  sections: ConversationStateHandlerListActionSection<US>[]
}

export type ConversationStateHandlerList<US extends UserState<any>> =
  ConversationStateHandlerType<US, {
    type: 'action'
    headerText: string
    action: (
      userState: US,
    ) =>
      | ConversationStateHandlerSelect<US>
      | ConversationStateHandlerListAction<US>
  }>

export type ConversationStateHandlerSelect<US extends UserState<any>> =
  ConversationStateHandlerType<US, {
    type: 'select'
    options: ConversationStateHandlerSelectOption<US>[]
  }>

export type ConversationStateHandlerString<US extends UserState<any>> =
  ConversationStateHandlerType<US, {
    type: 'string'
    validation?: (value: string) => boolean
    nextState: ConversationStateHandlerNextState<US>
  }>

export type ConversationStateHandlerEndOfDemo<US extends UserState<any>> =
  ConversationStateHandlerType<US, {
    type: 'end_of_demo'
    nextState: ConversationStateHandlerNextState<US>
  }>

export type ConversationStateHandlerDate<US extends UserState<any>> =
  ConversationStateHandlerType<US, {
    type: 'date'
    nextState: ConversationStateHandlerNextState<US>
  }>

export type ConversationStateHandlerInitialMessage<US extends UserState<any>> =
  ConversationStateHandlerType<US, {
    type: 'initial_message'
    nextState: ConversationStateHandlerNextState<US>
  }>

export type ConversationStateHandlerLocation<US extends UserState<any>> =
  ConversationStateHandlerType<US, {
    type: 'location'
    nextState: ConversationStateHandlerNextState<US>
  }>

export type ConversationStateHandler<US extends UserState<any>> =
  | ConversationStateHandlerInitialMessage<US>
  | ConversationStateHandlerSelect<US>
  | ConversationStateHandlerString<US>
  | ConversationStateHandlerDate<US>
  | ConversationStateHandlerEndOfDemo<US>
  | ConversationStateHandlerList<US>
  | ConversationStateHandlerLocation<US>

export type ConversationStates<CS extends string, US extends UserState<CS>> = {
  [state in CS]: ConversationStateHandler<US>
}

type AppointmentStatus = 'pending' | 'confirmed' | 'denied'

export type Appointment = {
  patient_id: number
  reason: Maybe<string>
  status: AppointmentStatus
}

export type MatchingState<US extends UserState<any>> = {
  nextState: ConversationStateHandlerNextState<US>
  onExit?: (
    trx: TrxOrDb,
    userState: US,
  ) => Promise<US>
}
export type WhatsAppIncomingMessage = {
  object: 'whatsapp_business_account'
  entry: [
    {
      id: string
      changes: [
        {
          value: {
            messaging_product: 'whatsapp'
            metadata: {
              display_phone_number: string
              phone_number_id: string
            }
            contacts?: ReadonlyArray<{
              profile: {
                name: string
              }
              wa_id: string
            }>
            statuses?: ReadonlyArray<{
              id: string
              status: 'delivered'
              timestamp: string // '1673944826'
              recipient_id: string // '12032535603'
              conversation: {
                id: string
                origin: {
                  type: 'business_initiated'
                }
              }
              pricing: {
                billable: true
                pricing_model: 'CBP'
                category: 'business_initiated'
              }
            }>
            messages?: ReadonlyArray<
              & {
                from: string // phone number
                id: string
                timestamp: string // '1673943918'
              }
              & (
                | { type: 'text'; text: { body: string } }
                | {
                  type: 'interactive'
                  interactive: {
                    type: 'list_reply'
                    list_reply: {
                      id: string
                      title: string
                      description: string
                    }
                  }
                }
                | {
                  type: 'interactive'
                  interactive: {
                    type: 'button_reply'
                    button_reply: {
                      id: string
                      title: string
                    }
                  }
                }
                | {
                  type: 'location' // TODO: check location message format
                  location: {
                    address?: string // full address
                    latitude: number // floating-point number
                    longitude: number
                    name: string // first line of address
                    url: string
                  }
                }
              )
            >
          }
          field: 'messages'
        },
      ]
    },
  ]
}

export type WhatsAppJSONResponseSuccess = {
  messaging_product: 'whatsapp'
  contacts: [{ input: string; wa_id: string }]
  messages: [{ id: string }]
}

export type WhatsAppJSONResponseError = {
  error: {
    message: string
    type: string
    code: number
    error_data: {
      messaging_product: 'whatsapp'
    }
    details: string
  }
  error_subcode: number
  fbtrace_id: string
}

export type WhatsAppJSONResponse =
  | WhatsAppJSONResponseSuccess
  | WhatsAppJSONResponseError

export type etag = string
export type date = string
export type datetime = string
export type integer = number

export type GoogleTokens = {
  access_token: string
  refresh_token: string
  expires_at: Date | string
}

export type GCalEvent = {
  kind: 'calendar#event'
  etag: etag
  id: string
  status: string
  htmlLink: string
  created: datetime
  updated: datetime
  summary: string
  description: string
  location: string
  colorId: string
  creator: {
    id: string
    email: string
    displayName: string
    self: boolean
  }
  organizer: {
    id: string
    email: string
    displayName: string
    self: boolean
  }
  start: {
    date: date
    dateTime: datetime // "2016-02-03T19:30:00-05:00"
    timeZone: string
  }
  end: {
    date: date
    dateTime: datetime // "2016-02-03T20:30:00-05:00"
    timeZone: string
  }
  endTimeUnspecified: boolean
  recurrence: [string]
  recurringEventId: string
  originalStartTime: {
    date: date
    dateTime: datetime
    timeZone: string
  }
  transparency: string
  visibility: string
  iCalUID: string
  sequence: integer
  attendees: [
    {
      id: string
      email: string
      displayName: string
      organizer: boolean
      self: boolean
      resource: boolean
      optional: boolean
      responseStatus: 'needsAction' | 'declined' | 'tentative' | 'accepted'
      comment: string
      additionalGuests: integer
    },
  ]
  attendeesOmitted: boolean
  extendedProperties: Record<string, unknown>
  hangoutLink: string
  conferenceDataVersion: number
  conferenceData: {
    createRequest: {
      requestId: string
      conferenceSolutionKey: {
        type: string
      }
      status: {
        statusCode: string
      }
    }
    entryPoints: [
      {
        entryPointType: string
        uri: string
        label: string
        pin: string
        accessCode: string
        meetingCode: string
        passcode: string
        password: string
      },
    ]
    conferenceSolution: {
      key: {
        type: string
      }
      name: string
      iconUri: string
    }
    conferenceId: string
    signature: string
    notes: string
  }
  gadget: {
    type: string
    title: string
    link: string
    iconLink: string
    width: integer
    height: integer
    display: string
    preferences: unknown
  }
  anyoneCanAddSelf: boolean
  guestsCanInviteOthers: boolean
  guestsCanModify: boolean
  guestsCanSeeOtherGuests: boolean
  privateCopy: boolean
  locked: boolean
  reminders: {
    useDefault: boolean
    overrides: [
      {
        method: string
        minutes: integer
      },
    ]
  }
  source: {
    url: string
    title: string
  }
  attachments: [
    {
      fileUrl: string
      title: string
      mimeType: string
      iconLink: string
      fileId: string
    },
  ]
  eventType: string
}

export type GCalEventsResponse = {
  kind: 'calendar#events'
  etag: string
  summary: string // user's email address
  updated: string // "2023-03-07T23:01:55.798Z"
  timeZone: string // "America/New_York"
  accessRole: string // "owner"
  defaultReminders: {
    method: 'email' | 'popup' | 'sms' | 'alert'
    minutes: number
  }[]
  nextPageToken: string
  items: GCalEvent[]
}

export type GCalCalendarListEntry = {
  kind: 'calendar#calendarListEntry'
  etag: etag
  id: string
  summary: string
  description: string
  location: string
  timeZone: string
  summaryOverride: string
  colorId: string
  backgroundColor: string
  foregroundColor: string
  hidden: boolean
  selected: boolean
  accessRole: string
  defaultReminders: [
    {
      method: string
      minutes: integer
    },
  ]
  notificationSettings: {
    notifications: [
      {
        type: string
        method: string
      },
    ]
  }
  primary: boolean
  deleted: boolean
  conferenceProperties: {
    allowedConferenceSolutionTypes: [string]
  }
}

export type GCalCalendarList = {
  kind: 'calendar#calendarList'
  etag: string
  nextSyncToken: string
  items: GCalCalendarListEntry[]
}

export type GCalFreeBusy = {
  kind: 'calendar#freeBusy'
  timeMin: string
  timeMax: string
  calendars: {
    [calendarId: string]: {
      busy: { start: string; end: string }[]
    }
  }
}

export type GoogleProfile = {
  sub: string
  name: string
  given_name: string
  family_name: string
  picture: string
  email: string
  email_verified: boolean
  locale: string
}

export type Employee = {
  health_worker_id: integer
  profession: Profession
  facility_id: integer
}

export type Profession = 
  | 'admin' 
  | 'doctor' 
  | 'nurse'


export type HealthWorker = {
  name: string
  email: string
  gcal_appointments_calendar_id: string
  gcal_availability_calendar_id: string
}

export type HealthWorkerGoogleToken = GoogleTokens & {
  health_worker_id: number
}

export type HealthWorkerWithGoogleTokens = ReturnedSqlRow<
  HealthWorker & GoogleTokens
>

export type Availability = {
  start: string
  end: string
}[]

export type TimeRange = {
  timeMin: Date
  timeMax: Date
}

export type HealthWorkerAvailability = {
  health_worker: HealthWorkerWithGoogleTokens
  availability: Availability
}

export type ScheduledAppointment = {
  appointment_offered_time_id: number
  gcal_event_id: string
}

export type FullScheduledAppointment = {
  id: number
  reason: string
}

export type WhatsappMessageReceived = {
  patient_id: number
  whatsapp_id: string
  body: string
  conversation_state: PatientConversationState
  started_responding_at: Maybe<ColumnType<Date>>
  error_commit_hash: Maybe<string>
  error_message: Maybe<string>
}

export type WhatsappMessageSent = {
  patient_id: number
  whatsapp_id: string
  body: string
  responding_to_id: number
  read_status: string
}

export type MonthNum = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

export type Time = {
  hour: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  minute: 0 | 5 | 10 | 15 | 20 | 25 | 30 | 35 | 40 | 45 | 50 | 55
  amPm: 'am' | 'pm'
}

export type TimeWindow = {
  start: Time
  end: Time
}

export type AvailabilityJSON = {
  Sunday: TimeWindow[]
  Monday: TimeWindow[]
  Tuesday: TimeWindow[]
  Wednesday: TimeWindow[]
  Thursday: TimeWindow[]
  Friday: TimeWindow[]
  Saturday: TimeWindow[]
}

export type DayOfWeek = keyof AvailabilityJSON

export type WhatsAppMessageOption = {
  id: string
  title: string
}

export type TrxOrDb = Transaction<DatabaseSchema> | typeof db

export type WhatsAppSendable =
  | WhatsAppSendableString
  | WhatsAppSendableButtons
  | WhatsAppSendableList
  | WhatsAppSendableLocation

export type HealthWorkerAppointment = {
  id: number
  patient: {
    id: number
    image_url?: string
    name: string
    age: number
    phone_number?: string
  }
  durationMinutes: number
  status?: string | null
  start: ParsedDate
  end: ParsedDate
  physicalLocation?: {
    facility: ReturnedSqlRow<Facility>
  }
  virtualLocation?: {
    href: string
  }
}

export type ParsedDate = {
  weekday: string
  day: string
  month: string
  year: string
  hour: string
  minute: string
  second: string
}

export type WhatsAppSendableString = {
  type: 'string'
  messageBody: string
}

export type WhatsAppSendableList = {
  type: 'list'
  headerText: string
  messageBody: string
  action: WhatsAppMessageAction
}

export type WhatsAppSendableLocation = {
  type: 'location'
  messageBody: string
  location: WhatsAppLocation
}

export type WhatsAppLocation = Location & {
  name: string
  address?: string
  url?: string
}

export type WhatsAppMessageAction = {
  button: string
  sections: {
    title: string
    rows: {
      id: string
      title: string
      description: string
    }[]
  }[]
}

export type WhatsAppSendableButtons = {
  type: 'buttons'
  messageBody: string
  buttonText: string
  options: WhatsAppMessageOption[]
}

export type LoggedInHealthWorker = {
  session: Session & {
    data: HealthWorkerWithGoogleTokens
  }
  trx: TrxOrDb
}

export type LoggedInHealthWorkerHandler<Props = Record<string, never>> =
  Handlers<
    Props,
    LoggedInHealthWorker
  >

export type Facility = Location & {
  name: string
  address: string
  distance: number
  vha?: boolean
  url?: string
  phone?: string
}

export type CalendarPageProps = {
  appointments: HealthWorkerAppointment[]
  day: string
  today: string
}
