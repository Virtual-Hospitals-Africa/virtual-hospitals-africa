// deno-lint-ignore-file no-explicit-any
import db from './db/db.ts'
import type { Context } from 'fresh'
import type { ColumnType, Generated, InsertObject, QueryCreator, RawBuilder, SelectQueryBuilder, SqlBool, Transaction, ValueExpression } from 'kysely'
import type { JSX } from 'preact'
import type { AgeUnit, DB, EncounterReason, FamilyType, MaritalStatus, MessagePriority, PatientCohabitation, SnomedCategory, Workflow } from './db.d.ts'
import type { Department } from './shared/departments.ts'
import type { Priority } from './shared/priorities.ts'
import type { MessageTargetCategory } from './shared/message_targets.ts'
import type { CommonConditionKey } from './shared/brief_history.ts'
import type { VitalAssessment, VitalMeasurement } from './shared/vitals.ts'
import type { WarningSignKey } from './shared/warning_signs.ts'
import type { Decimal } from './util/decimal.ts'
import type { Lang } from './shared/s_expression_schemas.ts'
import type { PrescriptionFrequency } from './shared/prescription.ts'
import { SEXED_RELATION_SNOMED_CONCEPT_IDS } from './shared/family.ts'
export { type Department } from './shared/departments.ts'
export { type DietFrequency } from './shared/diet.ts'
export { type Priority } from './shared/priorities.ts'
export { type MessageTargetCategory } from './shared/message_targets.ts'
export { type CommonConditionKey } from './shared/brief_history.ts'
export { type SnomedConceptSearchResult } from './db/models/snomed.ts'
export { type WarningSignKey } from './shared/warning_signs.ts'

export type Maybe<T> = T | null | undefined

export type NonNull<T> = Exclude<T, null | undefined>

export type Falsy = false | 0 | '' | null | undefined

export type BlankRecord = Record<string, never>

export type AnyRecord = Record<string, unknown>

export type Values<R> = R extends Record<any, infer V> ? V : never

export type NonNullableProperty<R, K extends keyof R> =
  & R
  & { [P in K]: NonNullable<R[P]> }

export type DeepPartial<T> = T extends Record<string, unknown> ? {
    [P in keyof T]?: DeepPartial<T[P]>
  }
  : T extends Array<infer U> ? Array<DeepPartial<U>>
  : T

export type DeepMaybe<T> = T extends Record<string, unknown> ? {
    [P in keyof T]?: DeepMaybe<T[P]>
  }
  : Maybe<T>

export type NonEmptyArray<T> = [T, ...T[]]

export type DigitChar = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'

export type NumberIndexable<T> = {
  [index: number]: T
  length: number
}

export type JsonSerializable =
  | string
  | number
  | boolean
  | null
  | undefined
  | JsonSerializable[]
  | { [key: string]: JsonSerializable }

export type MostlyJsonSerializable =
  | Date // eh, dates are fine
  | Decimal
  | JsonSerializable
  | MostlyJsonSerializable[]
  | { [key: string]: MostlyJsonSerializable }

export type OptionalUndefinedFields<T> =
  & {
    [K in keyof T as undefined extends T[K] ? never : K]: T[K]
  }
  & {
    [K in keyof T as undefined extends T[K] ? K : never]?: T[K]
  }

export type OptionalMaybeFields<T> =
  & {
    [
      K in keyof T as null extends T[K] ? never
        : undefined extends T[K] ? never
        : K
    ]: T[K]
  }
  & {
    [
      K in keyof T as null extends T[K] ? K : undefined extends T[K] ? K : never
    ]?: T[K]
  }

export type RequiredFields<T> = {
  [
    K in keyof T as null extends T[K] ? K
      : undefined extends T[K] ? K
      : never
  ]: NonNull<T[K]>
}

export type Success<T> = { success: true; value: T }

export type Failure = {
  success: false
  error: Error
}

export type Result<T> = Success<T> | Failure

export type SqlRow<T> = {
  id: Generated<number>
  created_at: ColumnType<Date, undefined, never>
  updated_at: ColumnType<Date, undefined, never>
} & T

export type SelectShape<T> = {
  [K in keyof T]: T[K] extends ColumnType<infer S, any, any> ? S
    : T[K]
}

type ExtractValueType<T> = T extends ValueExpression<any, any, infer V> ? V
  : never

export type InsertShapeLiteral<T extends InsertObject<DB, any>> = OptionalMaybeFields<
  {
    [K in keyof T]: ExtractValueType<T[K]>
  }
>

export type InsertRows<Table extends keyof DB> = InsertObject<DB, Table>[]

export type UpdateShape<T> = OptionalMaybeFields<
  {
    [K in keyof T]?: T[K] extends ColumnType<any, any, infer U> ? U
      : T[K] extends null | ColumnType<any, any, infer NullableU> ? null | NullableU
      : T[K] | RawBuilder<T[K]>
  }
>

export type IdSelection = SelectQueryBuilder<DB, any, { id: string }>

export type Selecting<QB> = QB extends SelectQueryBuilder<any, any, infer S> ? S
  : never

export type HasStringId<
  T extends Record<string, unknown> = Record<string, unknown>,
> =
  & T
  & {
    id: string
  }

export type Coordinates = {
  longitude: number
  latitude: number
}

export type Sex = 'male' | 'female' | 'other' | 'prefer not to say'

export type Prefix = 'Mr' | 'Mrs' | 'Ms' | 'Dr' | 'Miss' | 'Sr'

export const PREFIXES: Prefix[] = ['Mr', 'Mrs', 'Ms', 'Dr', 'Miss', 'Sr']

export type PharmacistType =
  | 'Dispensing Medical Practitioner'
  | 'Ind Clinic Nurse'
  | 'Pharmacist'
  | 'Pharmacy Technician'

export const PHARMACIST_TYPES: PharmacistType[] = [
  'Dispensing Medical Practitioner',
  'Ind Clinic Nurse',
  'Pharmacist',
  'Pharmacy Technician',
]

export type PharmacyType =
  | 'Clinics: Class A'
  | 'Clinics: Class B'
  | 'Clinics: Class C'
  | 'Clinics: Class D'
  | 'Dispensing medical practice'
  | 'Hospital pharmacies'
  | 'Pharmacies: Research'
  | 'Pharmacies: Restricted'
  | 'Pharmacy in any other location'
  | 'Pharmacy in rural area'
  | 'Pharmacy located in the CBD'
  | 'Wholesalers'

export const PHARMACY_TYPES: PharmacyType[] = [
  'Clinics: Class A',
  'Clinics: Class B',
  'Clinics: Class C',
  'Clinics: Class D',
  'Dispensing medical practice',
  'Hospital pharmacies',
  'Pharmacies: Research',
  'Pharmacies: Restricted',
  'Pharmacy in any other location',
  'Pharmacy in rural area',
  'Pharmacy located in the CBD',
  'Wholesalers',
]

export type ChatbotUser =
  & {
    id: string
    entity_id: string | null
    data: Record<string, unknown>
  }
  & (
    {
      chatbot_name: 'patient'
      conversation_state: PatientConversationState
    } | {
      chatbot_name: 'pharmacist'
      conversation_state: PharmacistConversationState
    }
  )

export type ChatbotUserState = {
  chatbot_user: ChatbotUser
  unhandled_message: UnhandledMessage
}

export type PharmacistChatbotUserState = ChatbotUserState & {
  chatbot_user: {
    chatbot_name: 'pharmacist'
  }
  unhandled_message: {
    chatbot_name: 'pharmacist'
  }
}

export type PatientChatbotUserState = ChatbotUserState & {
  chatbot_user: {
    chatbot_name: 'patient'
  }
  unhandled_message: {
    chatbot_name: 'patient'
  }
}

export type PatientConversationState =
  | 'initial_message'
  | 'not_onboarded:welcome'
  | 'not_onboarded:make_appointment:enter_name'
  | 'not_onboarded:make_appointment:enter_sex'
  | 'not_onboarded:make_appointment:enter_date_of_birth'
  | 'not_onboarded:make_appointment:enter_national_id_number'
  | 'onboarded:make_appointment:enter_appointment_reason'
  | 'onboarded:make_appointment:initial_ask_for_media'
  | 'onboarded:make_appointment:subsequent_ask_for_media'
  | 'onboarded:make_appointment:confirm_details'
  | 'onboarded:make_appointment:first_scheduling_option'
  | 'onboarded:make_appointment:other_scheduling_options'
  | 'onboarded:appointment_scheduled'
  | 'onboarded:appointment_cancelled'
  | 'onboarded:main_menu'
  | 'find_nearest_facilities:share_location'
  | 'find_nearest_facilities:got_location'
  | 'find_nearest_facilities:send_organization_location'
  | 'end_of_demo'
  | 'error'

export type Patient = {
  primary_doctor_id: Maybe<string>
  nearest_organization_id: Maybe<string>
  completed_registration: boolean
  address_id: Maybe<string>
}

export type RenderedPatient = {
  id: string
  sex: Sex | null
  gender: string | null
  national_id_number: string | null
  completed_registration: boolean
  date_of_birth: string | null
  dob_formatted: string | null
  name: string | null
  names: null | Names
  description: string | null
  age_display: Maybe<string>
  age_years: Maybe<number>
  age_days: Maybe<number>
  avatar_url: string | null
  preferred_language_code_iso_639_2_b: string | null
  most_recent_height_cm_measurement: string | null
}

export type RenderedPatientCompletedPersonal =
  & RenderedPatient
  & RequiredFields<
    Pick<
      RenderedPatient,
      'name' | 'names' | 'date_of_birth' | 'dob_formatted' | 'sex'
    >
  >

export type RenderedPatientCompletedRegistration =
  & RenderedPatientCompletedPersonal
  & {
    completed_registration: true
  }

export type Condition = {
  id: string
  name: string
  term_icd9_code: Maybe<string>
  term_icd9_text: Maybe<string>
  consumer_name: Maybe<string>
  is_procedure: boolean
  info_link_href: Maybe<string>
  info_link_text: Maybe<string>
}

export type RenderedPatientAge = {
  age: string
  age_display: string
  age_number: number
  age_unit: AgeUnit
  age_years: number
  age_days: number
}

export type Address = {
  formatted: string
  country: string
  administrative_area_level_1: Maybe<string>
  administrative_area_level_2: Maybe<string>
  locality: Maybe<string>
  route: Maybe<string>
  street_number: Maybe<string>
  unit: Maybe<string>
  street: Maybe<string>
  postal_code: Maybe<string>
  google_maps_place_id: Maybe<string>
}

export type PatientFamily = {
  guardians: GuardianFamilyRelation[]
  dependents: FamilyRelation[]
  next_of_kin: Maybe<NextOfKin>
  religion: Maybe<string>
  family_type: Maybe<FamilyType>
  marital_status: Maybe<MaritalStatus>
  patient_cohabitation: Maybe<PatientCohabitation>
}

export type NextOfKin = {
  id: Maybe<string>
  patient_id: string
  patient_name: Maybe<string>
  patient_phone_number: Maybe<string>
  patient_sex: Maybe<Sex>
  relation: string
}

export type FamilyRelation = {
  relation_id: string
  family_relation: string
  guardian_relation: GuardianRelationName
  patient_id: string
  patient_name: string
  patient_phone_number: Maybe<string>
  patient_sex: Maybe<Sex>
  family_relation_sexed: Maybe<string>
}

export type GuardianFamilyRelation = FamilyRelation & {
  next_of_kin: SqlBool
}

export type FamilyRelationInsert = {
  patient_id?: Maybe<string>
  patient_name: string
  patient_phone_number?: Maybe<string>
  family_relation_sexed: string
  next_of_kin: boolean
}

export type FamilyUpsert = {
  guardians: FamilyRelationInsert[]
  dependents: FamilyRelationInsert[]
  next_of_kin?: Maybe<FamilyRelationInsert>
  religion?: Maybe<string>
  family_type?: Maybe<FamilyType>
  marital_status?: Maybe<MaritalStatus>
  patient_cohabitation?: Maybe<PatientCohabitation>
  under_18?: boolean
}

export type PatientAppointmentOfferedTime = {
  patient_appointment_request_id: string
  employee_id: string
  start: Date
  end: Date
  duration_minutes: number
  declined: boolean
}

export type SchedulingAppointmentOfferedTime = PatientAppointmentOfferedTime & {
  id: string
  health_worker_name: string
  role: string
  is_admin: boolean
}

export type PharmacistConversationState =
  | 'initial_message'
  | 'not_onboarded:enter_licence_number'
  | 'not_onboarded:reenter_licence_number'
  | 'not_onboarded:incorrect_licence_number'
  | 'not_onboarded:confirm_name'
  // | 'not_onboarded:enter_pharmacy_licence'
  // | 'not_onboarded:reenter_pharmacy_licence'
  // | 'not_onboarded:incorrect_pharmacy_licence'
  | 'not_onboarded:confirm_pharmacy'
  | 'not_onboarded:share_location'
  | 'not_onboarded:reshare_location'
  | 'not_onboarded:licence_expired'
  // | 'not_onboarded:pharmacy_licence_expired'
  // TODO: rewrite prescription-related states against new patient_prescriptions model
  // | 'onboarded:fill_prescription:enter_code'
  // | 'onboarded:fill_prescription:reenter_code'
  // | 'onboarded:fill_prescription:send_pdf'
  // | 'onboarded:fill_prescription:ask_dispense_one'
  // | 'onboarded:fill_prescription:ask_dispense_all'
  // | 'onboarded:fill_prescription:confirm_done'
  // | 'onboarded:fill_prescription:decision'
  // | 'onboarded:fill_prescription:ask_prescriber'
  // | 'onboarded:fill_prescription:ask_prescriber_continue'
  | 'onboarded:view_inventory'
  | 'end_of_demo'
  | 'error'

export type ConversationStateHandlerType<US extends ChatbotUserState, T> = T & {
  prompt: string | ((trx: TrxOrDb, userState: US) => string | Promise<string>)
  onExit?: ConversationStateHandlerNextState<US>
}

export type ConversationStateHandlerNextState<US extends ChatbotUserState> =
  | US['chatbot_user']['conversation_state']
  | ((
    trx: TrxOrDb,
    userState: US,
  ) =>
    | US['chatbot_user']['conversation_state']
    | Promise<US['chatbot_user']['conversation_state']>)

export type ConversationStateHandlerSelectOption<US extends ChatbotUserState> = {
  id: string
  title: string
  onExit: ConversationStateHandlerNextState<US>
}

export type ConversationStateHandlerListActionRow<US extends ChatbotUserState> = {
  id: string
  title: string
  description: string
  onExit: ConversationStateHandlerNextState<US>
}
export type ConversationStateHandlerListActionSection<
  US extends ChatbotUserState,
> = {
  title: string
  rows: ConversationStateHandlerListActionRow<US>[]
}

export type ConversationStateHandlerListAction<US extends ChatbotUserState> = {
  type: 'list'
  button: string
  sections: ConversationStateHandlerListActionSection<US>[]
}

export type ConversationStateHandlerList<US extends ChatbotUserState> = ConversationStateHandlerType<
  US,
  {
    type: 'action'
    headerText: string
    action: (
      trx: TrxOrDb,
      userState: US,
    ) => Promise<
      | ConversationStateHandlerSelect<US>
      | ConversationStateHandlerListAction<US>
    >
  }
>

export type ConversationStateHandlerSelect<US extends ChatbotUserState> = ConversationStateHandlerType<
  US,
  {
    type: 'select'
    options: ConversationStateHandlerSelectOption<US>[]
  }
>

export type ConversationStateHandlerString<US extends ChatbotUserState> = ConversationStateHandlerType<
  US,
  {
    type: 'string'
    validation?: (value: string) => boolean
  }
>

export type ConversationStateHandlerGetLocation<US extends ChatbotUserState> = ConversationStateHandlerType<
  US,
  {
    type: 'get_location'
  }
>

export type ConversationStateHandlerDate<US extends ChatbotUserState> = ConversationStateHandlerType<
  US,
  {
    type: 'date'
  }
>

export type ConversationStateHandlerSendLocation<US extends ChatbotUserState> = ConversationStateHandlerType<
  US,
  {
    type: 'send_location'
    getMessages: (trx: TrxOrDb, userState: US) => Promise<WhatsAppSendable>
  }
>
export type ConversationStateHandlerSendDocument<US extends ChatbotUserState> = ConversationStateHandlerType<
  US,
  {
    type: 'send_document'
    getMessages: (trx: TrxOrDb, userState: US) => Promise<WhatsAppSendable>
  }
>

export type ConversationStateHandlerExpectMedia<US extends ChatbotUserState> = ConversationStateHandlerType<
  US,
  {
    type: 'expect_media'
    options: [ConversationStateHandlerSelectOption<US>]
  }
>

export type ConversationStateHandler<US extends ChatbotUserState> =
  | ConversationStateHandlerSelect<US>
  | ConversationStateHandlerString<US>
  | ConversationStateHandlerDate<US>
  | ConversationStateHandlerList<US>
  | ConversationStateHandlerGetLocation<US>
  | ConversationStateHandlerSendLocation<US>
  | ConversationStateHandlerSendDocument<US>
  | ConversationStateHandlerExpectMedia<US>

export type ConversationStates<US extends ChatbotUserState> = {
  [state in US['chatbot_user']['conversation_state']]: ConversationStateHandler<
    US
  >
}

export type Appointment = {
  patient_id: string
  reason: string
  start: Date
  end: Date
  duration_minutes: number
  gcal_event_id: string
}

export type AppointmentWithAllPatientInfo = HasStringId<Appointment> & {
  patient: RenderedPatient
  media: {
    media_id: string
    mime_type: string
  }[]
}

export type AppointmentHealthWorkerAttendee = {
  appointment_id: string
  health_worker_id: string
  confirmed: boolean
}

export type PatientAppointmentRequest = {
  patient_id: string
  reason: string | null
}

export type Procurer = {
  id?: string
  name: string
}

export type MatchingState<US extends ChatbotUserState> = {
  onExit: ConversationStateHandlerNextState<US>
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
      first_names: string
      surname: string
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
  expires_in?: number
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
  kind: 'calendar#free_busy'
  time_min: string
  time_max: string
  calendars: {
    [calendarId: string]: {
      busy: { start: string; end: string }[]
    }
  }
}

export type GoogleProfile = {
  sub: string
  name: string
  first_names: string
  surname: string
  picture: string
  email: string
  email_verified: boolean
  locale: string
}
export type OrganizationDevice = {
  device_id: string
  serial_number?: string
  organization_id: string
  created_by: string
}

export type OrganizationConsumableMedicineSpecefics = {
  medications_id?: string
  strength: string
}

export type RenderedDevice = {
  id: string
  name: string
  manufacturer: string
  diagnostic_test_capabilities: string[]
}

export type RenderedConsumable = {
  id: string
  name: string
}

export type RenderedProcurer = {
  id: string
  name: string
}

export type RenderedOrganizationDevice = {
  device_id: string
  name: string
  manufacturer: string
  serial_number: string | null
  diagnostic_test_capabilities: string[]
}

export type RenderedOrganizationConsumable = {
  name: string
  consumable_id: string
  quantity_on_hand: number
  actions: {
    add: string
    history: string
  }
}
export type RenderedInventoryHistoryProcurement = {
  interaction: 'procurement'
  created_at: Date
  created_at_formatted: string
  created_by: {
    name: string
    avatar_url: string | null
    href: string
  }
  procured_from: {
    id: string
    name: string
  }
  change: number
  expiry_date: string | null
  batch_number: string | null
  patient: null
  actions: {
    reorder: string
  }
}

export type RenderedInventoryHistoryConsumption = {
  interaction: 'consumption'
  created_at: Date
  created_at_formatted: string
  created_by: {
    name: string
    avatar_url: string | null
    href: string
  }
  procured_from: null
  change: number
  expiry_date: string | null
  batch_number: string | null
  patient?: null
  actions: null
}

export type RenderedInventoryHistoryPrescriptionFilled = {
  interaction: 'prescription filled'
  created_at: Date
  created_at_formatted: string
  created_by: {
    name: string
    avatar_url: string | null
    href: string
  }
  procured_from: null
  change: number
  expiry_date: string | null
  batch_number: string | null
  patient: {
    name: string
    description: string
    avatar_url: string | null
    href: string
  }
  actions: {
    view: string
  }
}

export type RenderedInventoryHistoryExpiry = {
  interaction: 'expiry'
  created_at: Date
  created_at_formatted: string
  created_by: {
    name: string
    avatar_url: string | null
    href: string
  }
  procured_from: null
  change: number
  expiry_date: string
  batch_number: string
  patient: null
  actions: null
}

export type RenderedInventoryHistory =
  | RenderedInventoryHistoryProcurement
  | RenderedInventoryHistoryConsumption
  | RenderedInventoryHistoryPrescriptionFilled
  | RenderedInventoryHistoryExpiry

export type MedicationProcurement = RenderedInventoryHistoryProcurement & {
  quantity: number
  container_size: number
  number_of_containers: number
}

export type NurseSpecialty =
  | 'Primary care'
  | 'triage'
  | 'registered general'
  | 'midwife'
  | 'intensive and coronary care'
  | 'renal'
  | 'neonatal intensive care and paediatric'
  | 'psychiatric mental health'
  | 'operating theatre'
  | 'community'
  | 'opthalmic'
  | 'anaesthetist'
  | 'trauma care'
  | 'clinical care'
  | 'clinical officer'
  | 'orthopaedic'
  | 'oncology and palliative care'
  | 'dental'

export const NURSE_SPECIALTIES: NurseSpecialty[] = [
  'Primary care',
  'triage',
  'registered general',
  'midwife',
  'intensive and coronary care',
  'renal',
  'neonatal intensive care and paediatric',
  'psychiatric mental health',
  'operating theatre',
  'community',
  'opthalmic',
  'anaesthetist',
  'trauma care',
  'clinical care',
  'clinical officer',
  'orthopaedic',
  'oncology and palliative care',
  'dental',
]

export const DOCTOR_SPECIALTIES = [
  'Allergy and Immunology' as const,
  'Anesthesiology' as const,
  'Cardiology' as const,
  'Dermatology' as const,
  'Emergency Medicine' as const,
  'Endocrinology' as const,
  'Family Medicine' as const,
  'Gastroenterology' as const,
  'Geriatrics' as const,
  'General Practitioner' as const,
  'Hematology' as const,
  'Infectious Disease' as const,
  'Internal Medicine' as const,
  'Nephrology' as const,
  'Neurology' as const,
  'Obstetrics and Gynecology (OB/GYN)' as const,
  'Oncology' as const,
  'Ophthalmology' as const,
  'Orthopedics' as const,
  'Otolaryngology (ENT)' as const,
  'Pediatrics' as const,
  'Psychiatry' as const,
  'Pulmonology' as const,
  'Radiology' as const,
  'Rheumatology' as const,
  'Urology' as const,
]

export type DoctorSpecialty = (typeof DOCTOR_SPECIALTIES)[number]

export type Specialties = {
  employee_id: string
  specialty: NurseSpecialty
}

export type HealthWorker = Names & {
  email: string | null
  avatar_url: string | null
  phone_number?: Maybe<string>
}

export type HealthWorkerOrganization = RenderedOrganization & {
  employment_id: string
  is_admin: boolean
  role: string
  in_departments: {
    id: string
    name: string
  }[]
  active_licences: RenderedLicence[]
}

export type RenderedHealthWorker = HealthWorker & {
  id: string
  demographics: {
    sex: Sex | null
    gender: string | null
    date_of_birth: string | Date | null
  }
  contact_details: {
    mobile_phone_number: string | null
    address: Address | null
  }
  organizations: HealthWorkerOrganization[]
  ever_licensed_as_doctor: SqlBool
}

export type RenderedCountryHealthWorker = RenderedHealthWorker & {
  licences: RenderedLicence[]
}

export type Availability = {
  start: string
  end: string
}[]

export type TimeRange = {
  time_min: Date
  time_max: Date
}

export type WhatsAppMessageContents =
  | { has_media: false; body: string; media_id: null }
  | { has_media: true; body: null; media_id: string }

export type WhatsAppMessageReceived =
  & WhatsAppMessageContents
  & {
    whatsapp_id: string
    started_responding_at: Maybe<ColumnType<Date>>
    chatbot_name: string
    error_commit_hash: Maybe<string>
    error_message: Maybe<string>
  }
  & ({
    chatbot_name: 'patient'
    patient_id: string
  } | {
    chatbot_name: 'pharmacist'
    conversation_state: PharmacistConversationState
    pharmacist_id: string
  })

export type WhatsAppMessageSent = {
  patient_id: string
  whatsapp_id: string
  body: string
  responding_to_received_id: string
  read_status: string
}

export type WhatsApp = {
  phone_number: string
  sendMessage(opts: {
    phone_number: string
    chatbot_name: ChatbotName
    message: WhatsAppSingleSendable
  }): Promise<WhatsAppJSONResponse>
  sendMessages(opts: {
    phone_number: string
    chatbot_name: ChatbotName
    messages: WhatsAppSingleSendable | WhatsAppSendable
  }): Promise<WhatsAppJSONResponse[]>
}

export type MonthNum = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

export type Time = {
  hour: number
  minute?: number
  am_pm: 'am' | 'pm'
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

export type Device = {
  id?: string
  name: string
  manufacturer: string
  test_availability: DeviceTestsAvailablity[]
}

export type DeviceTestsAvailablity = {
  test_id: string
  name: string
}

export type WhatsAppMessageOption = {
  id: string
  title: string
}

export type TrxOrDb = Transaction<DatabaseSchema> | typeof db

export type TrxOrDbOrQueryCreator = TrxOrDb | QueryCreator<DB>

export type WhatsAppSingleSendable =
  | WhatsAppSendableString
  | WhatsAppSendableButtons
  | WhatsAppSendableList
  | WhatsAppSendableLocation
  | WhatsAppSendableDocument

export type WhatsAppSendable = [WhatsAppSingleSendable, WhatsAppSingleSendable]

export type EmployeeAppointmentSlot = {
  type: 'employee_appointment_slot'
  id: string
  patient?: RenderedPatient
  duration_minutes: number
  start: ParsedDateTime
  end: ParsedDateTime
  employees: RenderedAppointmentEmployee[]
  physical_location?: undefined
  virtual_location?: undefined
}

export type EmployeeAppointment = {
  type: 'employee_appointment'
  id: string
  patient: RenderedPatient
  duration_minutes: number
  start: ParsedDateTime
  end: ParsedDateTime
  employees?: RenderedAppointmentEmployee[]
  physical_location?: {
    organization: HasStringId<Organization>
  }
  virtual_location?: {
    href: string
  }
}

export type PatientAppointment = {
  type: 'patient_appointment'
  id: string
  patient: RenderedPatient
  duration_minutes: number
  start: ParsedDateTime
  end: ParsedDateTime
  employees: RenderedAppointmentEmployee[]
  physical_location?: {
    organization: HasStringId<Organization>
  }
  virtual_location?: {
    href: string
  }
}

export type RenderableAppointment =
  | EmployeeAppointment
  | EmployeeAppointmentSlot
  | PatientAppointment

export type ParsedDate = {
  day: string
  month: string
  year: string
  timezone: string
}

export type ParsedDateTime = {
  weekday: string
  day: string
  month: string
  year: string
  hour: string
  minute: string
  second: string
  timezone: string
  format: 'numeric'
}

export type ISODateString = string & {
  __ISODateString__: true
}
export type WhatsAppSendableString = {
  type: 'string'
  message_body: string
}

export type WhatsAppSendableList = {
  type: 'list'
  headerText: string
  message_body: string
  action: WhatsAppMessageAction
}

export type WhatsAppSendableLocation = {
  type: 'location'
  message_body: string
  location: WhatsAppLocation
}

export type WhatsAppSendableDocument = {
  type: 'document'
  message_body: string
  file_path: string
}

export type WhatsAppLocation = Coordinates & {
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
  message_body: string
  buttonText: string
  options: WhatsAppMessageOption[]
}

export type LoggedInHealthWorker = {
  session_id: string
  health_worker: RenderedHealthWorker
  health_worker_id: string
  present_encounter: RenderedPatientOpenEncounter | null
}

export type LoggedInHealthWorkerContext<T = Record<string, never>> = Context<
  LoggedInHealthWorker & { trx: TrxOrDb } & T
>

export class Foo<Ctx extends LoggedInHealthWorkerContext<any>> {
  constructor(public x: Ctx) {
  }
}

export type Organization = {
  name: string
  category: string | null
  is_test: boolean
  country: string
  formatted_address: string | null
  ownership: string | null
  inactive_reason: string | null
  location: Coordinates | null
  most_common_language_code: string | null
}

export type OrganizationWithAddress =
  & Coordinates
  & Organization
  & {
    address: string
  }

export type PatientNearestOrganization = {
  id: string
  name: string
  address: string
  locality: string | null
  location: Coordinates
  walking_distance: null | string
  distance_meters: number
  admins: RenderedEmployee[]
}

export type GoogleAddressComponent = {
  formatted_address: string
  address_components: {
    long_name?: string
    slug?: string
    types?: string[]
  }[]
  types: string[]
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
  Icon?: (
    props: Omit<JSX.SVGAttributes<SVGSVGElement>, 'className'> & {
      active: boolean
      className?: string
    },
  ) => JSX.Element
}

export type LinkDef = {
  route: string
  title: string
  Icon?: (
    props: Omit<JSX.SVGAttributes<SVGSVGElement>, 'className'> & {
      active: boolean
      className?: string
    },
  ) => JSX.Element
}

export type LocationDistance = {
  origin: Coordinates
  destination: Coordinates
}

export type Media = {
  mime_type: string
  binary_data: ArrayBuffer | ArrayBufferView
}

export type PatientMedia = Media & {
  id: string
}

export type AppointmentMedia = {
  appointment_id: string
  media_id: string
}

export type PatientAppointmentRequestMedia = {
  patient_appointment_request_id: string
  media_id: string
}
export type MailingListRecipient = {
  name: string
  email: string
  entrypoint: string
}

// export type PatientMedication = {
//   patient_condition_id: string
//   strength: string
//   start_date: string
//   schedules: MedicationSchedule[]
//   route: string
//   special_instructions: string | null
//   medication_id: string
// }

export type RenderedMedicationIngredient = {
  value: string
  units: string
  snomed_concept: RenderedSnomedConcept
}

// export type PrescriptionMedication = {
//   form: string
//   route: string
//   ingredients: RenderedMedicationIngredient[]
//   strength_denominator: string
//   strength_denominator_unit: string
//   description_is_units: boolean
//   prescription_id: string
//   patient_condition_id: string
//   medication_id: string
//   drug_generic_name: string
//   drug_id: string
//   special_instructions: string | null
//   condition_id: string
//   condition_name: string
//   schedules: MedicationSchedule[]
//   filled_at: Date | null
// }

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

export type DefiniteDuration = {
  duration: number
  duration_unit: Exclude<DurationUnit, 'indefinitely'>
}

export type MedicationSchedule = Duration & {
  dosage: string
  frequency: PrescriptionFrequency
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
  guardian_patient_id: string
  dependent_patient_id: string
}

export type PatientAllergies = {
  patient_id: string
  allergy_id: string
}

export type RenderedOrganization = HasStringId<Organization> & {
  waiting_room_id: string | null
  reception_id: string | null
  hrefs: {
    regulator_view: string
    health_worker_view: string
  }
}

export type RenderedOrganizationWithDepartments = RenderedOrganization & {
  departments: {
    id: string
    name: string
  }[]
}

export type RenderedPatientPresenceWaitingRoom = {
  department_name: 'Waiting room'
  current_workflow: null
  next_workflow: Workflow
  present_with_patient_encounter_employee_ids: []
  room: {
    id: string
    name: string
  }
}

export type RenderedPatientPresenceActiveDepartment = {
  department_name: Exclude<Department, 'Waiting room'>
  current_workflow: Workflow
  next_workflow: null | Workflow
  present_with_patient_encounter_employee_ids: string[]
  room: {
    id: string
    name: string
  }
}

export type RenderedPatientPresence =
  | RenderedPatientPresenceWaitingRoom
  | RenderedPatientPresenceActiveDepartment

export type RenderedPatientEncounterStatusOpen = {
  open: true
  closed_at?: never
  patient_presence: RenderedPatientPresence
}

export type RenderedPatientEncounterStatusClosed = {
  open: false
  closed_at: Date
  patient_presence?: never
}

export type RenderedPatientEncounterStatus =
  | RenderedPatientEncounterStatusOpen
  | RenderedPatientEncounterStatusClosed

export type RenderedPatientEncounterEmployee = RenderedEmployee & {
  patient_encounter_employee_id: string
  seen_at: Date
}

export type RenderedPatientEncounter = {
  patient_encounter_id: string
  reason: EncounterReason | null
  notes: null | string
  patient: RenderedPatient
  organization: RenderedOrganization
  appointment: {
    id: string
    start: Date
    employees: RenderedEmployee[]
  } | null
  workflows: Partial<
    {
      [w in Workflow]: WorkflowStatus
    }
  >
  priority: null | {
    name: Priority
    value_snomed_concept_id: string
    target_treatment_time: Date | null
  }
  arrived_timestamp: Date
  wait_time: PostgresInterval
  status: RenderedPatientEncounterStatus
  all_employees_seen: RenderedPatientEncounterEmployee[]
}

export type RenderedPatientOpenEncounter = RenderedPatientEncounter & {
  status: RenderedPatientEncounterStatusOpen
}

export type WorkflowStatusNotStarted = {
  patient_workflow_id: string
  workflow: Workflow
  status: 'not started'
  steps_completed: []
  seen_patient_encounter_employee_ids: []
  completed_at?: never
}

export type WorkflowStatusIncomplete = {
  patient_workflow_id: string
  workflow: Workflow
  status: 'incomplete'
  steps_completed: string[]
  seen_patient_encounter_employee_ids: NonEmptyArray<string>
  completed_at?: never
}

export type WorkflowStatusInProgress = {
  patient_workflow_id: string
  workflow: Workflow
  status: 'in progress'
  steps_completed: string[]
  seen_patient_encounter_employee_ids: NonEmptyArray<string>
  completed_at?: never
}

export type WorkflowStatusCompleted = {
  patient_workflow_id: string
  workflow: Workflow
  status: 'completed'
  steps_completed: string[]
  seen_patient_encounter_employee_ids: NonEmptyArray<string>
  completed_at: Date
}

export type WorkflowStatus =
  | WorkflowStatusNotStarted
  | WorkflowStatusIncomplete
  | WorkflowStatusInProgress
  | WorkflowStatusCompleted

export type ExtendedActionData = {
  text: string
  href?: string
  method?: 'GET' | 'POST'
  disabled?: boolean
  target?: '_blank'
}

export type RenderedWaitingRoom = {
  patient_encounter_id: string
  patient: {
    id: string
    name: string
    avatar_url: string | null
    description: string | null
  }
  room: {
    id: string
    name: string
  }
  actions: [ExtendedActionData]
  reason: EncounterReason | null
  workflow_status_display: string
  arrived_timestamp: Date
  arrived_ago_display: string
  target_treatment_time: Date | null
  department_name: Department
  priority: RenderedPatientOpenEncounter['priority']
  present_employees: RenderedPatientEncounterEmployee[]
  // appointment: null | {
  //   id: string
  //   start: Date
  //   employees: {
  //     health_worker_id: string
  //     employee_id: string
  //     name: string
  //   }[]
  // }
  // reviewers: RenderedProvider[]
}

export type RenderedPatientEncounterExamination = {
  examination_identifier: string
  completed: SqlBool | null
  skipped: SqlBool | null
  ordered: SqlBool | null
}

export type PatientMedicationUpsert = {
  id?: Maybe<string>
  dosage: string
  strength: string
  medication_frequency: string
  route: string
  start_date?: Maybe<string>
  end_date?: Maybe<string>
  medication_id: string
  special_instructions?: Maybe<string>
}

export type PatientSymptomInsertShared = {
  severity: number
  start_date: string
  end_date?: Maybe<string>
  notes?: Maybe<string>
}

export type PatientSymptomUpsert = PatientSymptomInsertShared & {
  snomed_concept_id: string
  altered_patient_symptom_id?: string
  media?: {
    id: string
    mime_type?: string
    url?: string
  }[]
}

export type RenderedPatientSymptom =
  & PatientSymptomInsertShared
  & {
    id: string
    name: string
    snomed_concept_id: string
    media: {
      mime_type: string
      url: string
    }[]
  }

export type RenderedICD10DiagnosisTree = {
  id: string
  code: string
  description: string
  name: string
  sub_diagnoses?: {
    code: string
    general: boolean
    description: string
    name: string
    sub_diagnoses?: {
      code: string
      general: boolean
      description: string
      name: string
      sub_diagnoses?: {
        code: string
        general: boolean
        description: string
        name: string
        sub_diagnoses?: {
          code: string
          general: boolean
          description: string
          name: string
        }[]
      }[]
    }[]
  }[]
}

export type RenderedICD10DiagnosisTreeWithIncludes =
  & RenderedICD10DiagnosisTree
  & {
    includes: {
      note: string
      similarity?: number
    }[]
  }

export type RenderedICD10DiagnosisTreeWithOptionalIncludes =
  & Omit<
    RenderedICD10DiagnosisTreeWithIncludes,
    'includes'
  >
  & Partial<RenderedICD10DiagnosisTreeWithIncludes>

export type RenderedAppointmentEmployee = RenderedEmployee & {
  calendars: {
    availability_set: boolean
    gcal_appointments_calendar_id: string
    gcal_availability_calendar_id: string
  } | null
}
export type RenderedPatientExamination = {
  patient_examination_id: string | null
  examination_identifier: string
  consultation_step: string
  slug: string
  display_name: string
  completed: SqlBool | null
  skipped: SqlBool | null
  ordered: SqlBool | null
  href: string
}

export type DatabaseSchema = DB
export type RenderedRequestFormValues = {
  id: string | null
  organization: null | {
    id: string
    name: string
    address: string | null
  }
  doctor: null | {
    id: string
    name: string
  }
  requester_notes: null | string
}

export type NotificationType = string
// export type NotificationType = 'doctor_review_request'

export type RenderedNotification = {
  notification_id: string
  notification_type: NotificationType
  avatar_url: string | null
  title: string
  description: string
  time_display: string
  created_at: Date
  action: {
    title: string
    href: string
  }
}

export type ChatbotName = 'patient' | 'pharmacist'

export type UnhandledMessage = {
  chatbot_name: ChatbotName
  message_received_id: string
  whatsapp_id: string
  body: string | null
  trimmed_body: string | null
  has_media: boolean
  media_id: string | null
  sent_by_phone_number: string
  created_at: Date
}

export type PatientSchedulingAppointmentRequest = {
  patient_appointment_request_id: string
  reason: string
  offered_times: SchedulingAppointmentOfferedTime[]
}

export type Actions = Record<string, string | null>

export type RenderedMedication = {
  id: string
  snomed_concept: RenderedSnomedConcept
  name: string
  applicant_name: string
  form: string
  routes: string[]
  doses: {
    medication_dose_id: string
    value: string
    description: string
    description_is_units: boolean
    ingredients: RenderedMedicationIngredient[]
  }[]
}

export type RenderedMedicationAvailbility = RenderedMedication & {
  recalled_at: string | null
  actions: {
    recall: string | null
  }
}

export type RenderedOrganizationMedication = RenderedMedicationAvailbility & {
  organization_id: string
  organization_doses: {
    medication_dose_id: string
    quantity_on_hand: number
    actions: {
      add: string
      history: string
    }
  }[]
}

export type Regulator = {
  name: string
  email: string
  avatar_url?: Maybe<string>
  country: string
}

export type RenderedPrescription = {
  id: string
  created_at: Date
  updated_at: Date
  prescriber_id: string
  patient_id: string
  alphanumeric_code: string | null
  prescriber_name: string
  prescriber_email: string | null
  prescriber_mobile_number: string | null
}

export type RenderedPatientExaminationFinding = {
  patient_examination_id: string
  patient_id: string
  patient_encounter_id: string
  patient_encounter_employee_id: string
  examination_identifier: string
  encounter_open: SqlBool
  edit_href: string
  snomed_concept_id: string
  text: string
  additional_notes: string | null
  body_sites: {
    snomed_concept_id: string
    snomed_english_term: string
  }[]
}

export type ExaminationChecklistDefinition = {
  label: string
  snomed_concept_id: string
  snomed_english_term: string

  body_sites: {
    snomed_concept_id: string
    snomed_english_term: string
  }[]
}

export type RenderedMessageThreadParticipant = {
  participant_type: 'employee' | 'pharmacist'
  participant_id: string
  avatar_url?: Maybe<string>
  href: string
  display_name: string
  description: string | string[]
  is_me: SqlBool
  is_system?: false
}
export type RenderedMessageSender = RenderedMessageThreadParticipant | {
  is_system: true
  participant_type: 'system'
  display_name: 'System'
  participant_id?: never
  avatar_url?: never
  href?: never
  description?: never
  is_me?: never
}

export type RenderedMessageThreadBase = {
  created_at: Date
  id: string
  updated_at: Date
  participant_id: string
  participants: RenderedMessageThreadParticipant[]
  subjects: {
    table_name: string
    row_id: string
  }[]
}

export type RenderedMessage = {
  read_by_me_at: Date | null
  created_at: Date
  id: string
  updated_at: Date
  thread_id: string
  body: string
  sender: RenderedMessageSender
  read_by_others: {
    participant_id: string
    read_at: Date
  }[]
}

export type RenderedMessageThreadWithMostRecentMessage =
  & RenderedMessageThreadBase
  & {
    most_recent_message: RenderedMessage
  }

export type RenderedMessageThreadWithAllMessages = RenderedMessageThreadBase & {
  messages: RenderedMessage[]
  last_message_read_by_everyone_else_id?: string
}

export type HealthWorkerDisplay = {
  display_name: string
  description: string
  avatar_url: string | null
}

export type RenderedLicence = {
  licence_number: string
  regulatory_agency: {
    name: string
    acronym: string
    country: string
  }
  profession: string
  specialty: string | null
  subspecialty: string | null
  start_date: string | Date
  expiry_date: string | Date
  status: 'active' | 'revoked' | 'expired'
  revoked: null | {
    at: string | Date
    by: string
    reason: string
  }
}

export type RenderedEmployee = RenderedHealthWorker & {
  organization_id: string
  employee_id: string
  is_admin: boolean
  role: string
  href: string
}

export type MessageTargetEntities = {
  organization: RenderedOrganization
  organization_category: string
  employee: RenderedEmployee
  role: string
  locality: string
  administrative_area_level_1: string
  administrative_area_level_2: string
}

export type RenderedMessageTargets = {
  [TargetType in keyof MessageTargetEntities]:
    & {
      id?: string
      target_type: TargetType
      target_category: MessageTargetCategory
      display_name: string
      description: string
      avatar_url?: Maybe<string>
    }
    & {
      [K in TargetType]: MessageTargetEntities[K]
    }
}

export type RenderedMessageTarget = RenderedMessageTargets[keyof RenderedMessageTargets]

export type RenderedMessageDraftConcerning = {
  id: string
  table_name: 'patient' | 'patient_record'
  target_uuid?: string | null
  target_value?: unknown | null
  display_name?: string
}

export type RenderedMessageDraft = {
  id: string
  employment_id: string
  body: string
  priority: MessagePriority
  targets: RenderedMessageTarget[]
  created_at: Date
  updated_at: Date
}

export enum OrganizationSortOptions {
  closest = 'Closest',
  shortest_wait = 'Shortest Wait',
}

export type OrganizationLike = {
  id: string
  name: string
  formatted_address?: Maybe<string>
  description?: Maybe<string>
  distance_meters?: Maybe<number>
  google_maps_link?: Maybe<string>
  business_hours?: Maybe<string>
  location?: Maybe<{ latitude: number; longitude: number }>
  departments: {
    id: string
    name: string
  }[]
}

export type PostgresInterval = {
  years?: number
  months?: number
  weeks?: number
  days?: number
  hours?: number
  minutes?: number
  seconds?: number
  milliseconds?: number
}

export type VitalMeasurementFormInputDefition = {
  vital: VitalMeasurement
  snomed_concept_id: string
  required: boolean
  units: string
}

export type VitalAssessmentFormInputDefition = {
  vital: VitalAssessment
  evaluation_snomed_concept_id: string
  required: boolean
  options: {
    s_expression: string
    label: string
  }[]
}

export type Evaluation = {
  priority: Priority
  note?: string | undefined
}
export type Measurement = {
  record_id: string
  snomed_concept_id: string
  value: number
  units: string
}

export type ExtantPatientOrCreationIntent = {
  patient_id: string
  create?: never
} | {
  patient_id?: never
  create: true
}

export type ExtantProcedureOrCreationIntent = {
  procedure_id: string
  create_with_specific_snomed_concept_id?: never
} | {
  procedure_id?: never
  create_with_specific_snomed_concept_id: string
}

export type PatientFamilyHistoryShared = {
  snomed_concept_id: string
  family_members: Array<{
    relation_sexed: keyof typeof SEXED_RELATION_SNOMED_CONCEPT_IDS
  }>
}

export type PatientFamilyHistoryUpsert = PatientFamilyHistoryShared & {
  altered_patient_family_history_id?: string
}

export type RenderedPatientFamilyHistory = PatientFamilyHistoryShared & {
  id: string
  name: string
}

export type RenderedChiefComplaint = {
  id: string
  note: string
  media_speech: {
    id: string
    language_code: string
  }
}

export type RenderedPatientHistory = {
  pre_existing_conditions: RenderedFindingRelativeToHealthWorker[]
  allergies: RenderedFindingRelativeToHealthWorker[]
  family_history: RenderedFindingRelativeToHealthWorker[]
  major_surgeries: RenderedFindingRelativeToHealthWorker[]
  medications: RenderedFindingRelativeToHealthWorker[]
  lifestyle: RenderedFindingRelativeToHealthWorker[]
}

export type CurrentWorkflowState = {
  workflow: Workflow
  step: string
  workflow_snomed_concept: SnomedConcept
  workflow_step_snomed_concept: SnomedConcept | null
  workflow_status: WorkflowStatus
}

export type PatientDrawerV4Props = {
  patient: RenderedPatient
  priority: Priority | null
  organization_id: string
  this_visit_findings: RenderedSidebarWorkflow[]
  patient_history: RenderedPatientHistory
  care_team: RenderedCareTeamHealthWorker[]
}

export type RenderedSidebarWorkflowStep = {
  workflow_step: string
  title: string
  status: 'not started' | 'in progress' | 'completed'
  records: RenderedFindingRelativeToHealthWorker[]
}

export type RenderedSidebarWorkflow = {
  workflow: Workflow
  status: 'not started' | 'incomplete' | 'in progress' | 'completed'
  steps: RenderedSidebarWorkflowStep[]
}

export type RenderedCareTeamHealthWorker = {
  employment_id: string
  health_worker_id: string
  name: string
  role: 'doctor' | 'nurse'
  specialty: string | null
  avatar_url: string | null
  last_visit_relative_to_now: string | null
  organization: {
    id: string
    name: string
  }
}

export type RenderedPatientInsurance = {
  id: string
  insurance_provider: string
  plan_name: string | null
  membership_number: string
  valid_from: string
  expire_date: string
  is_dependent: boolean
}

export type Names = {
  name: string
  first_names: string
  surname: string
  preferred_name: string
}

export type BriefHistoryKey =
  | 'diabetes'
  | 'hypertension'
  | 'pregnancy'
  | 'tuberculosis'
  | 'hiv'
  | 'asthma'
  | 'copd'
  | 'covid19'
  | 'heart_disease'
  | 'mental_disorder'
  | 'epilepsy'
  | 'arthritis'
  | 'cancer'

export type BriefHistory =
  & {
    key: BriefHistoryKey
  }
  & (
    | { presence: 'No' | 'Unknown' }
    | { presence: 'Yes' }
  )

export type PreviouslyCompletedProcedures = {
  workflow_record_id: string | null
  workflow_step_record_id: string | null
}

export type RenderedRecordProvider = RenderedEmployee & {
  is_me: SqlBool
}

export type AsPartOfProcedure = {
  id: string
  root_snomed_concept_id: string
  root_snomed_concept_name: string
  root_snomed_concept_category: SnomedCategory
  specific_snomed_concept_id: string
  specific_snomed_concept_name: string
  specific_snomed_concept_category: SnomedCategory
  workflow_step_name: string | null
}

export type RecordDisplays = {
  finding: string
  value: string | null | RecordValueLink
  full: string
}

export type RenderedSnomedConcept = {
  snomed_concept_id: string
  name: string
  category: SnomedCategory
}
export type RenderedAttribute = IntermediateBaseRecord & {
  displays: RecordDisplays
  value: RecordValueSnomedConcept | RecordValueEvent
}

export type RecordValueEvent = { type: 'event'; datetime: Date | string }
export type RecordValueSnomedConcept = RenderedSnomedConcept & {
  type: 'snomed_concept'
}
export type RecordValueMeasurement = {
  type: 'measurement'
  value: string
  units: string
}

export type RecordValueScore = {
  type: 'score'
  score: string
}

export type RecordValueSExpression = {
  type: 's_expression'
  s_expression: string
}

export type RecordValueLink = {
  type: 'link'
  title: string
  href: string
  thumbnail_href: string | null
}

export type RenderedMedicationSchedule = MedicationSchedule & {
  medication_dose_id: string
}

export type RecordValue =
  | RecordValueEvent
  | RecordValueSnomedConcept
  | RecordValueMeasurement
  | RecordValueScore
  | RecordValueSExpression
  | RecordValueLink

export type IntermediateRecordValue =
  | Exclude<RecordValue, RecordValueSExpression>
  | Omit<RecordValueSExpression, 'nodes' | 's_expression'>

export type IntermediateBaseRecord = {
  id: string
  created_at: Date | string
  patient_encounter_id: string
  root_snomed_concept_id: string
  root_snomed_concept_name: string
  root_snomed_concept_category: SnomedCategory
  specific_snomed_concept_id: string
  specific_snomed_concept_name: string
  specific_snomed_concept_category: SnomedCategory
  value: any
}

export type RenderedEvaluation = IntermediateBaseRecord & {
  displays: RecordDisplays
}

export type RenderedRecordRelativeToHealthWorkerDef<Type extends string, Rest> =
  & Rest
  & Omit<IntermediateBaseRecord, 'value'>
  & {
    type: Type
    modifiers: IntermediateBaseRecord[]
    attributes: RenderedAttribute[]
    displays: RecordDisplays
    evaluations: Array<
      IntermediateBaseRecord & {
        displays: RecordDisplays
      }
    >
    destination_relations: Array<
      IntermediateBaseRecord & {
        relation_name: string
        displays: RecordDisplays
      }
    >
    value: null | RecordValue
    priority: Priority | null
  }

export type RenderedEvaluationRelativeToHealthWorker = RenderedRecordRelativeToHealthWorkerDef<'evaluation', {
  provider: null | RenderedRecordProvider
  as_part_of_procedure: null | AsPartOfProcedure
  score?: never
}>

export type RenderedFindingRelativeToHealthWorker = RenderedRecordRelativeToHealthWorkerDef<'finding', {
  score: number | null
  existence: Existence
  provider: RenderedRecordProvider
  as_part_of_procedure: AsPartOfProcedure
}>

export type RenderedProcedureRelativeToHealthWorker = RenderedRecordRelativeToHealthWorkerDef<'procedure', {
  provider: RenderedRecordProvider
  as_part_of_procedure: null | AsPartOfProcedure
}>

export type RenderedRecordRelativeToHealthWorker =
  | RenderedFindingRelativeToHealthWorker
  | RenderedEvaluationRelativeToHealthWorker
  | RenderedProcedureRelativeToHealthWorker

export type RenderedMeasurementRelativeToHealthWorker =
  & RenderedFindingRelativeToHealthWorker
  & {
    value: RecordValueMeasurement
  }

export type RenderedBriefHistoryRelativeToHealthWorker =
  & RenderedFindingRelativeToHealthWorker
  & {
    pertaining_to_key: CommonConditionKey
  }

export type AppUser = string | 'admin'

export type Alert = {
  message: string
  level: 'error' | 'warning' | 'success'
  actions?: {
    text: string
    href: string
    method?: 'GET' | 'POST'
    target?: '_blank'
  }[]
}

export type Existence = 'Yes' | 'No' | 'Unknown'

export type MostRecentBriefHistoryFindings = {
  [c in CommonConditionKey]?: RenderedBriefHistoryRelativeToHealthWorker
}

type SignShared<Category> = {
  clinical_finding_s_expression: string
  primary_name: string
  secondary_text: string | null
  category: Category
  key?: string
  sats_priority?: Maybe<Priority>
}

export type WarningSignDef<Priority extends 'Urgent' | 'Very urgent' | 'Emergency'> = SignShared<Priority> & {
  key: WarningSignKey
  sats_priority: Priority
  excluding_s_expression?: string
  prompt_when_s_expression?: string
}

export type WarningSign = WarningSignDef<'Urgent' | 'Very urgent' | 'Emergency'>

export type CommonSymptom = SignShared<'Common Symptoms'>

export type WarningSignWithMaybeRecord = (WarningSign | CommonSymptom | SignShared<'Search Results' | 'Prior record'>) & {
  existing_record?: {
    id: string
    existence: Existence
  }
}

export type IntermediateProcedureRecord = {
  created_at: Date
  id: string
  snomed_concept_id: string
  name: string
  patient_encounter_id: string
  value_snomed_concept_id: null | string
}

export type RenderedRoom = {
  id: string
  name: string
  departments: string[]
  occupied_by_patient: null | {
    id: string
    name: string | null
  }
}

export type RenderedTask =
  | Lang['link']
  | Lang['finding'] & {
    displays: RecordDisplays
    s_expression: string
    existing_finding: null | RenderedFindingRelativeToHealthWorker
  }
  | Lang['measurement'] & {
    displays: RecordDisplays
    s_expression: string
    existing_measurement: null | (RenderedFindingRelativeToHealthWorker & { value: RecordValueMeasurement })
  }
export type TaskGroup = {
  due_to: Array<RenderedFindingRelativeToHealthWorker | RenderedEvaluationRelativeToHealthWorker>
  tasks: RenderedTask[]
}

export type AgeDetermination =
  | 'adult'
  | 'older child'
  | 'younger child'

export type ReferenceRange = {
  measurement_snomed_concept_id: string
  condition_codes?: readonly string[]
  normal_min: number
  normal_max: number
  critical_min?: number
  critical_max?: number
  units: string
  reference_source: string
  evidence_level?: string
  clinical_context: string
}

export type ReferenceRangeX = {
  low: number
  high: number
  color: 'green' | 'yellow' | 'orange' | 'red'
}

export type TriageAssignPriorityTableRow = {
  type: 'chief complaint/warning sign' | 'measurement' | 'assessment'
  organization_id: string
  finding: RenderedFindingRelativeToHealthWorker | RenderedEvaluationRelativeToHealthWorker
  previous: RenderedFindingRelativeToHealthWorker | null
  reference_ranges?: Maybe<ReferenceRangeX[]>
}

type OrganizationWait = {
  status: 'open (short wait)'
  minutes: number
  display: string
} | {
  status: 'open (long wait)'
  minutes: number
  display: string
} | {
  status: 'closing soon'
  minutes: number
  display: string
} | {
  status: 'closed'
}

type NearestOrganizationEmployee = {
  id: string
  name: string
  role: string
}

type OrganizationDepartment = {
  id: string
  name: string
  requires_triage: boolean
}

export type NearestOrganizationSearchResult = {
  id: string
  name: string
  category: string | null
  address: string | null
  locality: string | null
  location: Coordinates
  distance_meters: number
  google_maps_link: string
  status: string
  admins: NearestOrganizationEmployee[]
  doctors: NearestOrganizationEmployee[]
  departments: OrganizationDepartment[]
  business_hours: string
  wait: OrganizationWait
  re_opens: {
    display: string
  }
}

export type PatientProfileSummary = {
  id: string
  personal: {
    name: string
    first_names: string
    preferred_name: string | null
    surname: string | null
    phone_number: string | null
    sex: string | null
    gender: string | null
    ethnicity: string | null
    date_of_birth: string | null
    national_id_number: string | null
    preferred_language_code_iso_639_2_b: string | null
    description: string | null
  }
  nearest_health_care: {
    primary_doctor_name: string | null
    nearest_organization_id: string | null
    nearest_organization_name: string | null
  }
  address: {
    street: string | null
    locality: string | null
    administrative_area_level_1: string | null
    administrative_area_level_2: string | null
  }
  age: RenderedPatientAge | null
  completed_registration: boolean | null
  family_history: RenderedRecordRelativeToHealthWorker[]
  occupation: RenderedRecordRelativeToHealthWorker[]
  allergies: RenderedRecordRelativeToHealthWorker[]
  pre_existing_conditions: RenderedRecordRelativeToHealthWorker[]
  past_medical_conditions: RenderedRecordRelativeToHealthWorker[]
  major_surgeries: RenderedRecordRelativeToHealthWorker[]
}

export type SearchResults<SearchTerms, RenderedResult> = {
  page: number
  rows_per_page: number
  results: RenderedResult[]
  has_next_page: boolean
  search_terms: SearchTerms
}

export type EvaluatedRecord = DeepMaybe<{
  score: number
  priority: Priority
}>

export type SnomedConcept = { id: string; name: string; category: SnomedCategory; s_expression: string; snomed_concept_id: string }

export type NavLinks = {
  step: string
  route: string
}[]
