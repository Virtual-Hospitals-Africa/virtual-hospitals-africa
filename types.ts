// deno-lint-ignore-file no-explicit-any
import { ColumnType, Generated, SqlBool, Transaction } from 'kysely'
import { JSX } from 'preact/jsx-runtime'
import { Handlers } from '$fresh/server.ts'
import { Session } from 'fresh_session'
import db from './db/db.ts'

export type Maybe<T> = T | null | undefined

export type NonNull<T> = Exclude<T, null | undefined>

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

export type HasId<T extends Record<string, unknown> = Record<string, unknown>> =
  & T
  & {
    id: number
  }

export type ReturnedSqlRow<T extends Record<string, unknown>> = HasId<T> & {
  created_at: Date
  updated_at: Date
}

export type Location = {
  longitude: number
  latitude: number
}

export type Gender = 'male' | 'female' | 'other'

export type Ethnicity =
  | 'african'
  | 'african_american'
  | 'asian'
  | 'caribbean'
  | 'caucasian'
  | 'hispanic'
  | 'middle_eastern'
  | 'native_american'
  | 'pacific_islander'
  | 'other'

export type UserState<CS> = {
  body?: string
  has_media: boolean
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
  | 'onboarded:make_appointment:initial_ask_for_media'
  | 'onboarded:make_appointment:subsequent_ask_for_media'
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

export type Patient = PatientPersonal & {
  primary_doctor_id: Maybe<number>
  nearest_facility_id: Maybe<number>
  completed_onboarding: boolean
  address_id: Maybe<number>
  unregistered_primary_doctor_name: Maybe<string>
}

export type PatientDemographicInfo = {
  phone_number: Maybe<string>
  name: Maybe<string>
  gender: Maybe<Gender>
  ethnicity: Maybe<Ethnicity>
  date_of_birth: Maybe<string>
  national_id_number: Maybe<string>
}
export type PatientPersonal = {
  conversation_state: PatientConversationState
  avatar_media_id: Maybe<number>
  location: Maybe<Location>
} & PatientDemographicInfo

export type RenderedPatient = ReturnedSqlRow<
  Pick<
    Patient,
    | 'gender'
    | 'ethnicity'
    | 'location'
    | 'national_id_number'
    | 'phone_number'
    | 'name'
    | 'conversation_state'
    | 'completed_onboarding'
  > & {
    dob_formatted: string | null
    // age_formatted: Maybe<string> // TODO: implement
    href: string | null
    avatar_url: string | null
    nearest_facility: string | null
    last_visited: null // TODO: implement
  }
>
export type Condition = {
  key_id: string
  primary_name: string
  term_icd9_code: Maybe<string>
  term_icd9_text: Maybe<string>
  consumer_name: Maybe<string>
  is_procedure: boolean
  info_link_href: Maybe<string>
  info_link_text: Maybe<string>
}

export type PatientCondition = {
  id: number
  patient_id: number
  condition_key_id: string
  start_date: string
  end_date: Maybe<string>
  comorbidity_of_condition_id: Maybe<number>
}

export type PreExistingCondition = {
  id: number
  key_id: string
  primary_name: string
  start_date: string
  comorbidities: {
    id: number
    key_id: string
    primary_name: string
    start_date?: Maybe<string>
  }[]
  medications: {
    id: number
    drug_id: number
    manufactured_medication_id: number | null
    medication_id: number
    strength: number
    dosage: number
    route: string
    special_instructions?: Maybe<string>
    intake_frequency: string
    generic_name: string
    start_date: string
    end_date?: Maybe<string>
  }[]
}

export type PreExistingConditionWithDrugs = {
  id: number
  key_id: string
  primary_name: string
  start_date: string
  comorbidities: {
    id: number
    key_id: string
    primary_name: string
    start_date?: Maybe<string>
  }[]
  medications: {
    id: number
    drug_id: number
    drug: DrugSearchResult
    manufactured_medication_id: number | null
    medication_id: number | null
    strength: number
    route: string
    dosage: number
    intake_frequency: string
    generic_name: string
    start_date: string
    end_date?: Maybe<string>
    special_instructions?: Maybe<string>
  }[]
}

export type PreExistingAllergy = {
  id?: Maybe<number>
  allergy_id: number
  name?: Maybe<string>
}

export type OnboardingPatient =
  & {
    id: number
    avatar_url: Maybe<string>
    nearest_facility_display_name: Maybe<string>
    primary_doctor_name: Maybe<string>
  }
  & Pick<
    Patient,
    | 'name'
    | 'phone_number'
    | 'gender'
    | 'ethnicity'
    | 'date_of_birth'
    | 'national_id_number'
    | 'nearest_facility_id'
    | 'completed_onboarding'
    | 'primary_doctor_id'
    | 'unregistered_primary_doctor_name'
  >
  & {
    street: Maybe<string>
    suburb_id: Maybe<number>
    ward_id: Maybe<number>
    district_id: Maybe<number>
    province_id: Maybe<number>
    country_id: Maybe<number>
  }

export type PatientFamily = {
  marital_status: string
  religion: string
}

// TODO: actually define this
export type PatientMedicalRecord = {
  allergies: string[]
  history: any
}

export type PatientWithMedicalRecord = RenderedPatient & {
  medical_record: PatientMedicalRecord
}

export type PatientAppointmentOfferedTime = {
  patient_appointment_request_id: number
  health_worker_id: number
  start: Date
  declined: boolean
}

export type PatientState = {
  message_id: number
  patient_id: number
  whatsapp_id: string
  body?: string
  has_media: boolean
  media_id?: number
  phone_number: string
  name: Maybe<string>
  gender: Maybe<Gender>
  dob_formatted: Maybe<string>
  national_id_number: Maybe<string>
  conversation_state: PatientConversationState
  location: Maybe<Location>
  scheduling_appointment_request?: {
    id: number
    reason: Maybe<string>
    offered_times: ReturnedSqlRow<
      PatientAppointmentOfferedTime & { health_worker_name: string }
    >[]
  }
  scheduled_appointment?: {
    id: number
    reason: string
    health_worker_id: number
    health_worker_name: string
    gcal_event_id: string
    start: Date
  }
  created_at: Date
  updated_at: Date
  nearest_facilities?: ReturnedSqlRow<Facility>[]
  nearest_facility_display_name?: string
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

export type ConversationStateHandlerGetLocation<US extends UserState<any>> =
  ConversationStateHandlerType<US, {
    type: 'get_location'
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

export type ConversationStateHandlerSendLocation<US extends UserState<any>> =
  ConversationStateHandlerType<US, {
    type: 'send_location'
    getMessages: (
      userState: US,
    ) => WhatsAppSendable
    nextState: ConversationStateHandlerNextState<US>
  }>

export type ConversationStateHandlerExpectMedia<US extends UserState<any>> =
  ConversationStateHandlerType<US, {
    type: 'expect_media'
    nextState: ConversationStateHandlerNextState<US>
    options: [ConversationStateHandlerSelectOption<US>]
  }>

export type ConversationStateHandler<US extends UserState<any>> =
  | ConversationStateHandlerInitialMessage<US>
  | ConversationStateHandlerSelect<US>
  | ConversationStateHandlerString<US>
  | ConversationStateHandlerDate<US>
  | ConversationStateHandlerEndOfDemo<US>
  | ConversationStateHandlerList<US>
  | ConversationStateHandlerGetLocation<US>
  | ConversationStateHandlerSendLocation<US>
  | ConversationStateHandlerExpectMedia<US>

export type ConversationStates<CS extends string, US extends UserState<CS>> = {
  [state in CS]: ConversationStateHandler<US>
}

export type Appointment = {
  patient_id: number
  reason: string
  start: Date
  gcal_event_id: string
}

export type AppointmentWithAllPatientInfo = ReturnedSqlRow<Appointment> & {
  patient: PatientWithMedicalRecord
  media: {
    media_id: number
    mime_type: string
  }[]
}

export type AppointmentHealthWorkerAttendee = {
  appointment_id: number
  health_worker_id: number
  confirmed: boolean
}

export type PatientAppointmentRequest = {
  patient_id: number
  reason?: string
}

export type MatchingState<US extends UserState<any>> = {
  nextState: ConversationStateHandlerNextState<US>
  onExit?: (
    trx: TrxOrDb,
    userState: US,
  ) => Promise<US>
}

export type WhatsAppTextMessage = { type: 'text'; text: { body: string } }

export type WhatsAppListReplyMessage = {
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

export type WhatsAppButtonReplyMessage = {
  type: 'interactive'
  interactive: {
    type: 'button_reply'
    button_reply: {
      id: string
      title: string
    }
  }
}

export type WhatsAppLocationMessage = {
  type: 'location' // TODO: check location message format
  location: {
    address?: string // full address
    latitude: number // floating-point number
    longitude: number
    name: string // first line of address
    url: string
  }
}

export type WhatsAppAudioMessage = {
  type: 'audio'
  audio: {
    id: string
    voice: boolean
    mime_type: 'audio/ogg; codecs=opus'
    sha256: string
  }
}

export type WhatsAppImageMessage = {
  type: 'image'
  image: {
    id: string
    mime_type: 'image/jpeg'
    sha256: string
    caption?: string
  }
}

export type WhatsAppVideoMessage = {
  type: 'video'
  video: {
    id: string
    mime_type: 'video/mp4'
    sha256: string
    caption?: string
  }
}

export type WhatsAppContactsMessage = {
  type: 'contacts'
  contacts: {
    name: {
      first_name: string
      last_name: string
      formatted_name: string
    }
    phones: {
      phone: string // "+1 (203) 253-5603",
      wa_id: string // "12032535603",
      type: 'CELL'
    }[]
    emails: { email: string; type: 'HOME' }[]
  }[]
}

export type WhatsAppDocumentsMessage = {
  type: 'document'
  document: {
    id: string
    sha256: string
    filename: string
    mime_type: string
  }
}

export type WhatsAppMessage =
  & {
    from: string // phone number
    id: string
    timestamp: string // '1673943918'
  }
  & (
    | WhatsAppTextMessage
    | WhatsAppListReplyMessage
    | WhatsAppButtonReplyMessage
    | WhatsAppLocationMessage
    | WhatsAppAudioMessage
    | WhatsAppImageMessage
    | WhatsAppVideoMessage
    | WhatsAppContactsMessage
    | WhatsAppDocumentsMessage
  )

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
            messages?: ReadonlyArray<WhatsAppMessage>
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

export type GoogleTokenInfo = {
  user_id: string
  scope: string
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

export type HealthWorkerInvitee = {
  email: string
  facility_id: integer
  profession: Profession
}

export type Profession =
  | 'admin'
  | 'doctor'
  | 'nurse'

export type NurseSpecialty =
  | 'primary_care_nurse'
  | 'registered_general_nurse'
  | 'midwife'
  | 'intensive_and_coronary_care_nurse'
  | 'renal_nurse'
  | 'neonatal_intensive_care_and_paediatric_nurse'
  | 'psychiatric_mental_health_nurse'
  | 'operating_theatre_nurse'
  | 'community_nurse'
  | 'opthalmic_nurse'
  | 'nurse_administrator'
  | 'nurse_anaesthetist'
  | 'trauma_care_nurse'
  | 'clinical_care_nurse'
  | 'clinical_officer'
  | 'orthopaedic_nurse'
  | 'oncology_and_palliative_care_nurse'
  | 'dental_nurse'

export const NurseSpecialties: NurseSpecialty[] = [
  'primary_care_nurse',
  'clinical_care_nurse',
  'clinical_officer',
  'community_nurse',
  'dental_nurse',
  'intensive_and_coronary_care_nurse',
  'midwife',
  'neonatal_intensive_care_and_paediatric_nurse',
  'nurse_administrator',
  'nurse_anaesthetist',
  'oncology_and_palliative_care_nurse',
  'operating_theatre_nurse',
  'opthalmic_nurse',
  'orthopaedic_nurse',
  'psychiatric_mental_health_nurse',
  'registered_general_nurse',
  'renal_nurse',
  'trauma_care_nurse',
]

export type NurseRegistrationDetails = {
  health_worker_id: number
  gender: Gender
  date_of_birth: string
  national_id_number: string
  date_of_first_practice: string
  ncz_registration_number: string
  mobile_number: string
  national_id_media_id: Maybe<number>
  ncz_registration_card_media_id: Maybe<number>
  face_picture_media_id: Maybe<number>
  nurse_practicing_cert_media_id: Maybe<number>
  approved_by: Maybe<number>
  address_id: Maybe<number>
}

export type Specialties = {
  employee_id: number
  specialty: NurseSpecialty
}

export type HealthWorker = {
  name: string
  email: string
  avatar_url: string
  phone_number?: Maybe<string>
  gcal_appointments_calendar_id: string
  gcal_availability_calendar_id: string
}

export type EmployeeInfo = {
  name: string
  email: string
  gender: Maybe<Gender>
  date_of_birth: Maybe<string>
  national_id_number: Maybe<string>
  ncz_registration_number: Maybe<string>
  mobile_number: Maybe<string>
  health_worker_id: Maybe<number>
  date_of_first_practice: Maybe<string>
  specialty: Maybe<NurseSpecialty>
  avatar_url: Maybe<string>
  registration_completed: SqlBool
  registration_needed: SqlBool
  registration_pending_approval: SqlBool
  address: Maybe<string>
  employment: {
    address: string
    facility_id: number
    facility_display_name: string
    professions: Profession[]
  }[]
  documents: {
    name: string
    href: string
  }[]
}

export type EmployedHealthWorker = ReturnedSqlRow<
  HealthWorker & {
    access_token: Maybe<string>
    refresh_token: Maybe<string>
    expires_at: Maybe<Date | string>
    employment: {
      facility_id: number
      facility_display_name: string
      roles: {
        nurse: {
          employed_as: boolean
          registration_needed: boolean
          registration_completed: boolean
          registration_pending_approval: boolean
        }
        doctor: {
          employed_as: boolean
          registration_needed: boolean
          registration_completed: boolean
          registration_pending_approval: boolean
        }
        admin: {
          employed_as: boolean
          registration_needed: boolean
          registration_completed: boolean
          registration_pending_approval: boolean
        }
      }
    }[]
  }
>

export type EmployedHealthWorkerWithGoogleTokens =
  & EmployedHealthWorker
  & GoogleTokens

export type HealthWorkerGoogleToken = GoogleTokens & {
  health_worker_id: number
}

export type HealthWorkerWithGoogleTokens = ReturnedSqlRow<
  HealthWorker & GoogleTokens
>

export type HealthWorkerWithFacilityRoles = HealthWorkerWithGoogleTokens & {
  facilities: {
    id: number
    roles: {
      nurse: {
        employed_as: boolean
        approved: boolean
      }
      doctor?: boolean
      admin?: boolean
    }
  }[]
}

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

export type WhatsAppMessageContents =
  | { has_media: false; body: string; media_id: null }
  | { has_media: true; body: null; media_id: number }

export type WhatsAppMessageReceived = WhatsAppMessageContents & {
  patient_id: number
  whatsapp_id: string
  conversation_state: PatientConversationState
  started_responding_at: Maybe<ColumnType<Date>>
  error_commit_hash: Maybe<string>
  error_message: Maybe<string>
}

export type WhatsAppMessageSent = {
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

export type WhatsAppSingleSendable =
  | WhatsAppSendableString
  | WhatsAppSendableButtons
  | WhatsAppSendableList
  | WhatsAppSendableLocation

export type WhatsAppSendable = [WhatsAppSingleSendable, WhatsAppSingleSendable]

export type HealthWorkerAppointmentSlot = {
  type: 'slot'
  id: string
  patient?: {
    id: number
    avatar_url: Maybe<string>
    name: Maybe<string>
    phone_number: Maybe<string>
  }
  durationMinutes: number
  start: ParsedDate
  end: ParsedDate
  health_workers: ReturnedSqlRow<HealthWorker>[]
  physicalLocation?: undefined
  virtualLocation?: undefined
}

export type HealthWorkerAppointment = {
  type: 'appointment'
  id: number
  patient: {
    id: number
    avatar_url: Maybe<string>
    name: Maybe<string>
    phone_number: Maybe<string>
  }
  durationMinutes: number
  start: ParsedDate
  end: ParsedDate
  health_workers?: ReturnedSqlRow<HealthWorker>[]
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
  format: 'numeric' | 'twoDigit'
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
  trx: TrxOrDb
  session: Session
  healthWorker: EmployedHealthWorkerWithGoogleTokens
}

export type LoggedInHealthWorkerHandler<
  Props = Record<string, never>,
  Extra = Record<string, never>,
> = Handlers<
  Props,
  LoggedInHealthWorker & Extra
>

export type Facility = Location & {
  name: string
  address: string
  category: string
  distance: number
  vha?: boolean
  url?: string
  phone?: string
  walking_distance?: string | null
  display_name: string
}

export type GoogleAddressComponent = {
  formatted_address: string
  address_components: {
    long_name?: string
    short_name?: string
    types?: string[]
  }[]
}

export type GoogleAddressComponentType =
  | 'locality'
  | 'administrative_area_level_2'
  | 'administrative_area_level_1'
  | 'country'

export type LinkProps = {
  href: string
  title: string
  active: boolean
  Icon: (props: JSX.SVGAttributes<SVGSVGElement>) => JSX.Element
}

export type LinkDef = Omit<LinkProps, 'active'>

export type CalendarPageProps = {
  appointments: HealthWorkerAppointment[]
  day: string
  today: string
  healthWorker: HealthWorker
}

export type LocationDistance = {
  origin: Location
  destination: Location
}

export type Media = {
  mime_type: string
  binary_data: BinaryData
}

export type PatientMedia = Media & {
  id: number
}

export type AppointmentMedia = {
  appointment_id: number
  media_id: number
}

export type PatientAppointmentRequestMedia = {
  patient_appointment_request_id: number
  media_id: number
}

export type Country = { name: string }

export type Province = { name: string; country_id: number }

export type District = { name: string; province_id: number }

export type Ward = { name: string; district_id: number }

export type Suburb = { name: string; ward_id: number }

export type FullCountryInfo = {
  id: number
  name: string
  provinces: {
    id: number
    name: string
    districts: {
      id: number
      name: string
      wards: {
        id: number
        name: string
        suburbs: {
          id: number | null
          name: string | null
        }[]
      }[]
    }[]
  }[]
}[]

export type MailingListRecipient = {
  name: string
  email: string
  entrypoint: string
}

export type Address = {
  street: Maybe<string>
  suburb_id: Maybe<number>
  ward_id: number
  district_id: number
  province_id: number
  country_id: number
}

export type Drug = {
  generic_name: string
}
export type Medication = {
  drug_id: number
  form: string
  routes: string[]
  form_route: string
  strength_numerators: number[]
  strength_numerator_unit: string
  strength_denominator: number
  strength_denominator_unit: string
  strength_denominator_is_units: boolean
}

export type ManufacturedMedication = {
  medication_id: number
  trade_name: string
  applicant_name: string
  manufacturer_name: string
  strength_numerators: number[]
}

export type PatientMedication =
  & {
    patient_condition_id: number
    strength: number
    start_date: string
    schedules: MedicationSchedule[]
    route: string
    special_instructions: string | null
  }
  & (
    | { medication_id: null; manufactured_medication_id: number }
    | { medication_id: number; manufactured_medication_id: null }
  )

export type DurationUnit =
  | 'days'
  | 'weeks'
  | 'months'
  | 'years'
  | 'indefinitely'

export type Duration = {
  duration: number
  duration_unit: DurationUnit
}

export type MedicationSchedule = Duration & {
  dosage: number
  frequency: string
}

export type DrugSearchResultMedication = {
  medication_id: number
  form: string
  form_route: string
  strength_summary: string
  routes: string[]
  strength_numerators: number[]
  strength_numerator_unit: string
  strength_denominator: number
  strength_denominator_unit: string
  strength_denominator_is_units: boolean
  manufacturers: {
    manufactured_medication_id: number
    strength_numerators: number[]
    manufacturer_name: string
    trade_name: string
  }[]
}

export type DrugSearchResult = {
  drug_id: number
  drug_generic_name: string
  distinct_trade_names: string[]
  medications: DrugSearchResultMedication[]
}

export type GuardianRelationName =
  | 'biological parent'
  | 'grandparent'
  | 'sibling'
  | 'sibling of parent'
  | 'other guardian'
  | 'foster parent'
  | 'adopted parent'

export type GuardianRelation = {
  guardian: GuardianRelationName
  dependent: string
  female_guardian?: Maybe<string>
  male_guardian?: Maybe<string>
  female_dependent?: Maybe<string>
  male_dependent?: Maybe<string>
}

export type PatientGuardian = {
  guardian_relation: GuardianRelationName
  guardian_patient_id: number
  dependent_patient_id: number
}

export type Allergy = {
  name: string
}

export type PatientAllergies = {
  patient_id: number
  allergy_id: number
}

export type PatientEncounterReason =
  | 'seeking treatment'
  | 'appointment'
  | 'follow up'
  | 'referral'
  | 'checkup'
  | 'emergency'
  | 'other'

export type PatientEncounter = {
  patient_id: number
  reason: PatientEncounterReason
  closed_at: null | Date
  appointment_id: null | number
  notes: null | string
}

export type PatientEncounterProvider = {
  patient_encounter_id: number
  provider_id: number
  seen_at: null | Date
}

export type WaitingRoom = {
  facility_id: number
  patient_encounter_id: number
}

export type RenderedWaitingRoom = {
  patient: {
    id: number
    name: string
    href: string
    avatar_url: string | null
  }
  reason: PatientEncounterReason
  appointment: null | {
    id: number
    start: Date
    health_workers: {
      id: number
      name: string
    }[]
  }
  providers: {
    health_worker_id: number
    employee_id: number
    name: string
    profession: string
    seen_at: Date | null
  }[]
}

export type DatabaseSchema = {
  appointments: SqlRow<Appointment>
  patient_appointment_offered_times: SqlRow<PatientAppointmentOfferedTime>
  patient_appointment_requests: SqlRow<PatientAppointmentRequest>
  appointment_health_worker_attendees: SqlRow<AppointmentHealthWorkerAttendee>
  health_workers: SqlRow<HealthWorker>
  health_worker_google_tokens: SqlRow<HealthWorkerGoogleToken>
  patients: SqlRow<Patient>
  employment: SqlRow<Employee>
  whatsapp_messages_received: SqlRow<WhatsAppMessageReceived>
  whatsapp_messages_sent: SqlRow<WhatsAppMessageSent>
  facilities: SqlRow<Facility>
  patient_nearest_facilities: {
    patient_id: number
    nearest_facilities: ReturnedSqlRow<Facility>[]
  }
  health_worker_invitees: SqlRow<HealthWorkerInvitee>
  media: SqlRow<PatientMedia>
  nurse_registration_details: SqlRow<NurseRegistrationDetails>
  nurse_specialties: SqlRow<Specialties>
  appointment_media: SqlRow<AppointmentMedia>
  patient_appointment_request_media: SqlRow<PatientAppointmentRequestMedia>
  countries: SqlRow<Country>
  provinces: SqlRow<Province>
  districts: SqlRow<District>
  wards: SqlRow<Ward>
  suburbs: SqlRow<Suburb>
  mailing_list: SqlRow<MailingListRecipient>
  address: SqlRow<Address>
  conditions: Condition
  patient_conditions: SqlRow<PatientCondition>
  drugs: SqlRow<Drug>
  medications: SqlRow<Medication>
  manufactured_medications: SqlRow<ManufacturedMedication>
  patient_condition_medications: SqlRow<PatientMedication>
  guardian_relations: GuardianRelation
  patient_guardians: SqlRow<PatientGuardian>
  allergies: SqlRow<Allergy>
  patient_allergies: SqlRow<PatientAllergies>
  patient_encounters: SqlRow<PatientEncounter>
  patient_encounter_providers: SqlRow<PatientEncounterProvider>
  waiting_room: SqlRow<WaitingRoom>
}
