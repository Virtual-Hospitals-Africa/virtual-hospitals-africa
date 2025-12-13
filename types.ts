// deno-lint-ignore-file no-explicit-any
import { Context } from 'fresh'
import {
  ColumnType,
  Generated,
  RawBuilder,
  SelectQueryBuilder,
  SqlBool,
  Transaction,
} from 'kysely'
import { JSX } from 'preact'
import {
  AgeUnit,
  DB,
  DoctorReviewStep,
  EncounterReason,
  FamilyType,
  MaritalStatus,
  MessagePriority,
  PatientCohabitation,
  Workflow,
} from './db.d.ts'
import db from './db/db.ts'
import { Department } from './shared/departments.ts'
import { DietFrequency } from './shared/diet.ts'
import { SEXED_RELATION_SNOMED_CONCEPT_IDS } from './shared/family.ts'
import { type Priority } from './shared/priorities.ts'
import { MessageTargetCategory } from './shared/message_targets.ts'
import { CommonConditionKey } from './shared/brief_history.ts'

export * from './shared/priorities.ts'

export type Maybe<T> = T | null | undefined

export type NonNull<T> = Exclude<T, null | undefined>

export type Falsy = false | 0 | '' | null | undefined

export type BlankRecord = Record<string, never>

export type DeepPartial<T> = T extends Record<string, unknown> ? {
    [P in keyof T]?: DeepPartial<T[P]>
  }
  : T

export type NonEmptyArray<T> = [T, ...T[]]

export type JsonSerializable =
  | string
  | number
  | boolean
  | null
  | undefined
  | JsonSerializable[]
  | { [key: string]: JsonSerializable }

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

export type SqlRow<T> = {
  id: Generated<number>
  created_at: ColumnType<Date, undefined, never>
  updated_at: ColumnType<Date, undefined, never>
} & T

export type SelectShape<T> = {
  [K in keyof T]: T[K] extends ColumnType<infer S, any, any> ? S
    : T[K]
}

export type InsertShape<T> = OptionalMaybeFields<
  {
    [K in keyof T]: T[K] extends ColumnType<any, infer I, any> ? I
      : T[K] extends null | ColumnType<any, infer NullableI, any>
        ? null | NullableI
      : T[K] | RawBuilder<T[K]>
  }
>

// Helper type to exclude RawBuilder from a union type
type ExcludeRawBuilder<T> = T extends RawBuilder<any> ? never : T

export type InsertShapeLiteral<T> = OptionalMaybeFields<
  {
    [K in keyof T]: T[K] extends ColumnType<any, infer I, any>
      ? ExcludeRawBuilder<I>
      : T[K] extends null | ColumnType<any, infer NullableI, any>
        ? null | ExcludeRawBuilder<NullableI>
      : ExcludeRawBuilder<T[K]>
  }
>

export type UpdateShape<T> = OptionalMaybeFields<
  {
    [K in keyof T]?: T[K] extends ColumnType<any, any, infer U> ? U
      : T[K] extends null | ColumnType<any, any, infer NullableU>
        ? null | NullableU
      : T[K] | RawBuilder<T[K]>
  }
>

export type IdSelection = SelectQueryBuilder<DB, any, { id: string }>

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
  unregistered_primary_doctor_name: Maybe<string>
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

export type PatientCondition = {
  id: string
  patient_id: string
  condition_id: string
  start_date: string
  end_date: Maybe<string>
  comorbidity_of_condition_id: Maybe<string>
}

export type MedicalConditionBase = {
  id: string
  name: string
  start_date: string
  patient_condition_id: string
}

export type PreExistingCondition = MedicalConditionBase & {
  comorbidities: {
    id: string
    patient_condition_id: string
    name: string
    start_date?: Maybe<string>
  }[]
  medications: {
    id: string
    medication_id: string
    manufactured_medication_id: string | null
    patient_condition_medication_id: string
    strength: number
    dosage: number
    route: string
    special_instructions?: Maybe<string>
    registration_frequency: string
    name: string
    start_date: string
    end_date?: Maybe<string>
  }[]
}

export type PatientConditionMedication = {
  id: string
  drug: DrugSearchResult
  manufactured_medication_id: string | null
  medication_id: string | null
  strength: number
  route: string
  dosage: number
  registration_frequency: string
  name: string
  start_date: string
  end_date?: Maybe<string>
  special_instructions?: Maybe<string>
}

export type PreExistingConditionWithDrugs = MedicalConditionBase & {
  comorbidities: {
    id: string
    name: string
    start_date?: Maybe<string>
  }[]
  medications: PatientConditionMedication[]
}

export type DiagnosisGroup = {
  all: Diagnosis[]
  approved_by_self: Diagnosis[]
  self: Diagnosis[]
  others: DiagnosesCollaboration[]
}

export type Diagnosis = MedicalConditionBase & { diagnosis_id: string }

export type DiagnosesCollaboration = MedicalConditionBase & {
  diagnosis_id: string
  diagnosed_by: string
  diagnosed_at: string
  approval_by?: Maybe<string>
  approval?: Maybe<'agree' | 'disagree'>
  disagree_reason?: Maybe<string>
}

export type PreExistingAllergy = {
  id?: Maybe<string>
  allergy_id: string
  name?: Maybe<string>
}

export type PastMedicalCondition = MedicalConditionBase & {
  end_date: string
}

export type MajorSurgery = MedicalConditionBase

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
}

export type PatientFamily = {
  guardians: GuardianFamilyRelation[]
  dependents: FamilyRelation[]
  next_of_kin?: NextOfKin
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

export type LifestyleUpsert = {
  sexual_activity: any
  alcohol: any
  smoking: any
  substance_use: any
  exercise: any
  diet: any
}

export type PatientAppointmentOfferedTime = {
  patient_appointment_request_id: string
  provider_id: string
  start: Date
  end: Date
  duration_minutes: number
  declined: boolean
}

export type SchedulingAppointmentOfferedTime = PatientAppointmentOfferedTime & {
  id: string
  health_worker_name: string
  profession: Profession | null
  is_admin: boolean
}

export type PharmacistConversationState =
  | 'initial_message'
  | 'not_onboarded:enter_licence_number'
  | 'not_onboarded:reenter_licence_number'
  | 'not_onboarded:incorrect_licence_number'
  | 'not_onboarded:confirm_name'
  | 'not_onboarded:enter_pharmacy_licence'
  | 'not_onboarded:reenter_pharmacy_licence'
  | 'not_onboarded:incorrect_pharmacy_licence'
  | 'not_onboarded:confirm_pharmacy'
  | 'not_onboarded:share_location'
  | 'not_onboarded:reshare_location'
  | 'not_onboarded:licence_expired'
  | 'not_onboarded:pharmacy_licence_expired'
  | 'onboarded:fill_prescription:enter_code'
  | 'onboarded:fill_prescription:reenter_code'
  | 'onboarded:fill_prescription:send_pdf'
  | 'onboarded:fill_prescription:ask_dispense_one'
  | 'onboarded:fill_prescription:ask_dispense_all'
  | 'onboarded:fill_prescription:confirm_done'
  | 'onboarded:fill_prescription:decision'
  | 'onboarded:fill_prescription:ask_prescriber'
  | 'onboarded:fill_prescription:ask_prescriber_continue'
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

export type ConversationStateHandlerSelectOption<US extends ChatbotUserState> =
  {
    id: string
    title: string
    onExit: ConversationStateHandlerNextState<US>
  }

export type ConversationStateHandlerListActionRow<US extends ChatbotUserState> =
  {
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

export type ConversationStateHandlerList<US extends ChatbotUserState> =
  ConversationStateHandlerType<
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

export type ConversationStateHandlerSelect<US extends ChatbotUserState> =
  ConversationStateHandlerType<
    US,
    {
      type: 'select'
      options: ConversationStateHandlerSelectOption<US>[]
    }
  >

export type ConversationStateHandlerString<US extends ChatbotUserState> =
  ConversationStateHandlerType<
    US,
    {
      type: 'string'
      validation?: (value: string) => boolean
    }
  >

export type ConversationStateHandlerGetLocation<US extends ChatbotUserState> =
  ConversationStateHandlerType<
    US,
    {
      type: 'get_location'
    }
  >

export type ConversationStateHandlerDate<US extends ChatbotUserState> =
  ConversationStateHandlerType<
    US,
    {
      type: 'date'
    }
  >

export type ConversationStateHandlerSendLocation<US extends ChatbotUserState> =
  ConversationStateHandlerType<
    US,
    {
      type: 'send_location'
      getMessages: (trx: TrxOrDb, userState: US) => Promise<WhatsAppSendable>
    }
  >
export type ConversationStateHandlerSendDocument<US extends ChatbotUserState> =
  ConversationStateHandlerType<
    US,
    {
      type: 'send_document'
      getMessages: (trx: TrxOrDb, userState: US) => Promise<WhatsAppSendable>
    }
  >

export type ConversationStateHandlerExpectMedia<US extends ChatbotUserState> =
  ConversationStateHandlerType<
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
  given_name: string
  family_name: string
  picture: string
  email: string
  email_verified: boolean
  locale: string
}

export type HealthWorkerInvitee = {
  email: string
  organization_id: string
  profession: Profession
}

export type OrganizationEmployeeOrInvitee =
  | OrganizationEmployee
  | OrganizationEmployeeInvitee

export type RegistrationStatus = 'pending_approval' | 'approved' | 'incomplete'
export type OrganizationEmployee = {
  name: string
  is_invitee: false
  health_worker_id: string
  professions: {
    employee_id: string
    profession: Profession
    specialty: string | null
    registration_status: RegistrationStatus
  }[]
  avatar_url: null | string
  email: string
  display_name: string
  registration_status: RegistrationStatus
  actions: {
    view: string
  }
  online: null | SqlBool
}

export type OrganizationEmployeeWithActions = Omit<
  OrganizationEmployee,
  'actions'
>

export type DoctorsWithoutAction =
  & Omit<OrganizationEmployee, 'actions' | 'is_invitee' | 'professions'>
  & {
    profession: 'doctor'
    employee_id: string
    specialty: string | null
  }

export type OrganizationEmployeeInvitee = {
  name: null
  is_invitee: true
  health_worker_id: string | null
  professions: {
    employee_id?: undefined
    profession: Profession
    specialty?: undefined
  }[]
  avatar_url: null
  email: string
  display_name: string
  registration_status: 'pending_approval' | 'approved' | 'incomplete'
  actions: {
    view: null
  }
  online: null
}

export type OrganizationDevice = {
  device_id: string
  serial_number?: string
  organization_id: string
  created_by: string
}

export type OrganizationConsumableMedicineSpecefics = {
  medications_id?: string
  strength: number
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

export type RenderedOrganizationMedicine = {
  generic_name: string
  consumable_id: string
  trade_name: string
  applicant_name: string
  form: string
  strength_display: string
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
  strength: number
  quantity: number
  container_size: number
  number_of_containers: number
}

export type Profession = 'doctor' | 'nurse' | 'receptionist'

export type NurseSpecialty =
  | 'primary care'
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
  'primary care',
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

export type NurseRegistrationDetails = {
  health_worker_id: string
  sex: Sex
  gender: string
  date_of_birth: string
  national_id_number: string
  date_of_first_practice: string
  ncz_registration_number: string
  mobile_number?: Maybe<string>
  national_id_media_id: Maybe<string>
  ncz_registration_card_media_id: Maybe<string>
  face_picture_media_id: Maybe<string>
  nurse_practicing_cert_media_id: Maybe<string>
  approved_by: Maybe<string>
  address_id: Maybe<string>
}

export type Specialties = {
  employee_id: string
  specialty: NurseSpecialty
}

export type HealthWorker = Names & {
  email: string
  avatar_url: string | null
  phone_number?: Maybe<string>
}

export type EmployeeInfo = {
  name: string
  email: string
  sex: Maybe<Sex>
  gender: Maybe<string>
  date_of_birth: Maybe<string>
  national_id_number: Maybe<string>
  ncz_registration_number: Maybe<string>
  mobile_number: Maybe<string>
  health_worker_id: Maybe<string>
  date_of_first_practice: Maybe<string>
  specialty: Maybe<string>
  avatar_url: Maybe<string>
  registration_completed: SqlBool
  registration_needed: SqlBool
  registration_pending_approval: SqlBool
  address: Maybe<string>
  organization_address: string | null
  organization_id: string
  organization_name: string
  professions: Profession[]
  documents: {
    name: string
    href: string
  }[]
}

export type RenderedDoctorReviewBase = {
  encounter: {
    id: string
    reason: EncounterReason
  }
  patient: {
    id: string
    name: string
    avatar_url: string | null
    description: string | null
    primary_doctor_id: string | null
    actions: {
      view: string
    }
  }
  requested_by: RenderedPatientEncounterEmployee
}

export type RenderedDoctorReview = RenderedDoctorReviewBase & {
  review_id: string
  employment_id: string
  steps_completed: DoctorReviewStep[]
  completed: SqlBool
}
export type RenderedDoctorReviewRequest = RenderedDoctorReviewBase & {
  review_request_id: string
  requesting: {
    doctor_id: string | null
    organization_id: string | null
  }
}

export type RenderedDoctorReviewRequestOfSpecificDoctor =
  & RenderedDoctorReviewRequest
  & {
    employment_id: string
  }

export type HealthWorkerRegistrationStatus = {
  organization_id: string
  profession: Profession
  registration_needed: boolean
  registration_completed: boolean
  registration_pending_approval: boolean
}

export type HealthWorkerOrganization = RenderedOrganization & {
  employment_id: string
  specialty: string | null
  department_ids: string[]
  profession: Profession | null
  is_admin: boolean
}

export type PossiblyEmployedHealthWorker = HealthWorker & {
  id: string
  organizations: HealthWorkerOrganization[]
}

export type EmployedHealthWorker = PossiblyEmployedHealthWorker

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

export type WhatsAppSingleSendable =
  | WhatsAppSendableString
  | WhatsAppSendableButtons
  | WhatsAppSendableList
  | WhatsAppSendableLocation
  | WhatsAppSendableDocument

export type WhatsAppSendable = [WhatsAppSingleSendable, WhatsAppSingleSendable]

export type ProviderAppointmentSlot = {
  type: 'provider_appointment_slot'
  id: string
  patient?: RenderedPatient
  duration_minutes: number
  start: ParsedDateTime
  end: ParsedDateTime
  providers: RenderedAppointmentProvider[]
  physicalLocation?: undefined
  virtualLocation?: undefined
}

export type ProviderAppointment = {
  type: 'provider_appointment'
  id: string
  patient: RenderedPatient
  duration_minutes: number
  start: ParsedDateTime
  end: ParsedDateTime
  providers?: RenderedAppointmentProvider[]
  physicalLocation?: {
    organization: HasStringId<Organization>
  }
  virtualLocation?: {
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
  providers: RenderedAppointmentProvider[]
  physicalLocation?: {
    organization: HasStringId<Organization>
  }
  virtualLocation?: {
    href: string
  }
}

export type RenderableAppointment =
  | ProviderAppointment
  | ProviderAppointmentSlot
  | PatientAppointment

export type ParsedDate = {
  day: string
  month: string
  year: string
}

export type ParsedDateTime = {
  weekday: string
  day: string
  month: string
  year: string
  hour: string
  minute: string
  second: string
  format: 'numeric' /*| 'two_digit'*/
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
  health_worker: EmployedHealthWorker
  present_encounter: RenderedPatientOpenEncounter | null
}

export type LoggedInRegulator = {
  trx: TrxOrDb
  regulator: HasStringId<Regulator>
}

export type LoggedInHealthWorkerContext<T = Record<string, never>> = Context<
  LoggedInHealthWorker & { trx: TrxOrDb } & T
>

export class Foo<Ctx extends LoggedInHealthWorkerContext<any>> {
  constructor(public x: Ctx) {
  }
}

export type LoggedInRegulatorContext<T = Record<never, never>> = Context<
  LoggedInRegulator & T
>

export type Organization = {
  name: string
  category: string | null
  is_test: boolean
  country: string
  description: string | null
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
  title?: string
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

export type Drug = {
  generic_name: string
}
export type Medication = {
  drug_id: string
  form: string
  routes: string[]
  form_route: string
  strength_numerators: number[]
  strength_numerator_unit: string
  strength_denominator: string
  strength_denominator_unit: string
  strength_denominator_is_units: boolean
}

export type ManufacturedMedication = {
  medication_id: string
  trade_name: string
  applicant_name: string
  manufacturer_name: string
  strength_numerators: number[]
}

export type PatientMedication =
  & {
    patient_condition_id: string
    strength: number
    start_date: string
    schedules: MedicationSchedule[]
    route: string
    special_instructions: string | null
  }
  & (
    | { medication_id: null; manufactured_medication_id: string }
    | { medication_id: string; manufactured_medication_id: null }
  )

export type MedicationDetails = {
  form: string
  route: string
  strength_numerator: number
  strength_numerator_unit: string
  strength_denominator: number
  strength_denominator_unit: string
  strength_denominator_is_units: boolean
}

export type PrescriptionMedication = MedicationDetails & {
  prescription_medication_id: string
  patient_condition_id: string
  medication_id: string
  drug_generic_name: string
  drug_id: string
  special_instructions: string | null
  condition_id: string
  condition_name: string
  schedules: MedicationSchedule[]
  filled_at?: Date
}

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
  dosage: number
  frequency: string
}

export type DrugSearchResultMedication = {
  medication_id: string
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
    manufactured_medication_id: string
    strength_numerators: number[]
    applicant_name: string
    trade_name: string
  }[]
}

export type DrugSearchResult = {
  id: string
  name: string
  distinct_trade_names: string[]
  medications: DrugSearchResultMedication[]
  all_recalled: boolean
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

export type School =
  | {
    status: 'never attended'
  }
  | {
    status: 'in school'
    current: CurrentSchool
  }
  | {
    status: 'stopped school'
    past: PastSchool
  }
  | {
    status: 'adult in school'
    education_level: string
  }
  | {
    status: 'adult stopped school'
    education_level: string
    reason: string
    desire_to_return: Existence
  }

export type CurrentSchool = {
  grade: string
  grades_dropping_reason: string | null
  happy: Existence | null
  inappropriate_reason: string | null
}

export type PastSchool = {
  stopped_last_grade: string
  stopped_reason: string
}

export type Job = {
  happy: Existence
  descendants_employed: Existence
  require_assistance: Existence
  profession: string
  work_satisfaction: string
}

export type Occupation = {
  school: School
  sport?: Existence
  job?: Job | null
}

export type PatientOccupation = {
  patient_id: string
  occupation: Occupation
}

export type Question = {
  name?: string
  label: string
  value?: boolean
}

export type Lifestyle = {
  sexual_activity: SexualActivity | null
  alcohol: Alcohol | null
  smoking: Smoking | null
  exercise: Exercise | null
  diet: Diet | null
  substance_use: SubstanceUse | null
} //fix type names

export type SexualActivity =
  | {
    ever_been_sexually_active: 'No' | 'Unknown' | null
  }
  | {
    ever_been_sexually_active: 'Yes'
    currently_sexually_active?: Maybe<Existence>
    first_encounter?: Maybe<number>
    current_sexual_partners?: Maybe<number>
    attracted_to?: Maybe<string>
    has_traded_sex_for_favors?: Maybe<Existence>
    had_sex_after_drugs?: Maybe<Existence>
    recently_treated_for_stis?: Maybe<Existence>
    recently_hiv_tested?: Maybe<Existence>
    know_partner_hiv_status?: Maybe<Existence>
    partner_hiv_status?: Maybe<Existence>
  }

export type Alcohol =
  | {
    has_ever_drank: 'No' | 'Unknown' | null
  }
  | {
    has_ever_drank: 'Yes'
    currently_drinks?: Existence | null
    binge_drinking?: Existence | null
    drawn_to_cut_down?: Existence | null
    annoyed_by_critics?: Existence | null
    eye_opener?: Existence | null
    guilty?: Existence | null
    missed_work?: Existence | null
    criticized?: Existence | null
    arrested?: Existence | null
    attempted_to_stop?: Existence | null
    withdrawal?: Existence | null
    quit_for_six_or_more_months?: Existence | null
    abstinence_length_months?: number | null
    first_drink?: number | null
    years_drinking?: number | null
    number_drinks_per_sitting?: number | null
    alcohol_products_used?: string[] | null
  }

export type Smoking =
  | {
    has_ever_smoked: 'No' | 'Unknown' | null
  }
  | {
    has_ever_smoked: 'Yes'
    currently_smokes?: Maybe<Existence>
    first_smoke_age?: number
    weekly_smokes?: number | null
    number_of_products?: number | null
    felt_to_cutdown?: Existence | null
    annoyed_by_criticism?: Existence | null
    guilty?: Existence | null
    forbidden_place?: Existence | null
    attempt_to_quit?: Existence | null
    quit_more_than_six_months?: Existence | null
    quit_smoking_years?: number | null
    tobacco_products_used?: string[] | null
  }

export type SubstanceUse =
  | {
    has_ever_used_substance: 'No' | 'Unknown' | null
  }
  | {
    has_ever_used_substance: 'Yes'
    substances_used: {
      name: string
      injected_substance: Existence | null
      annoyed_by_criticism: Existence | null
      attempt_to_stop: Existence | null
      withdrawal_symptoms: Existence | null
      quit_more_than_six_months: Existence | null
      quit_substance_use_years: number | null
      first_use_age: number | null
      used_regularly_years: number | null
      times_used_in_a_week: number | null
    }[]
  }

export type Exercise =
  | {
    currently_exercises: 'No' | 'Unknown' | null
  }
  | {
    currently_exercises: 'Yes'
    physical_activities: {
      name: string
      frequency: string
    }[]
    sports: {
      name: string
      frequency: string
    }[]
    types_of_exercises?: string[]
    physical_injuries_or_disability: {
      disabilities: string[]
      musculoskeletal_injuries: string[]
    }
    limitations: {
      limits: string[]
      structural_conditions: string[]
      medical_conditions: string[]
    }
  }

export type Diet = {
  meals_per_day: number
  typical_foods_eaten: Meal[]
  eating_takeout_fast_food_frequency: string
  eating_home_cooked_frequency: string
  patient_skips_meals: boolean
  patient_travels_often: boolean
  reasons_for_eating_other_than_hunger: string[]
  fats_used_in_cooking: string[]
  staple_foods: string[]
  non_meats: FoodFrequency[]
  drinks: FoodFrequency[]
  meats: FoodFrequency[]
  junk_foods: FoodFrequency[]
  past_special_diets: string[]
  supplements_taken: string[]
  eats_five_portions_of_fruits_vegetables_daily: boolean
  eats_four_varieties_of_fruit_weekly: boolean
  eats_four_varieties_of_vegetables_weekly: boolean
  chooses_low_fat_products: boolean
  chooses_baked_steamed_grilled_rather_than_fried: boolean
  chooses_lean_cuts_or_removes_visible_fat: boolean
  eats_oily_fish: boolean
  bases_meals_around_starchy_foods: boolean
  regularly_chooses_wholemeal_bread: boolean
  regularly_eats_wholegrain_cereals_without_added_sugar: boolean
  regularly_eats_pulses: boolean
  regularly_eats_snacks_throughout_day: boolean
  regularly_adds_sugar_to_drinks: boolean
  regularly_adds_salt_during_or_after_cooking: boolean
  regularly_drinks_sweet_fizzy_drinks: boolean
  drinks_plenty_of_fluids_regularly_throughout_day: boolean
  skips_meals_more_than_once_a_week: boolean
}

export type FoodFrequency = {
  name: string
  frequency: DietFrequency
}

export type Meal = {
  meal: string
  time: string
  foods_eaten: string
}

export type PatientLifestyle = {
  patient_id: string
  lifestyle: Lifestyle
}

export type Allergy = {
  id: string
  snomed_concept_id: string
  name: string
}

export type PatientAllergies = {
  patient_id: string
  allergy_id: string
}

export type PatientEncounter = {
  patient_id: string
  reason: EncounterReason
  closed_at: null | Date
  appointment_id: string | null
  notes: null | string
}

export type PatientEncounterProvider = {
  patient_encounter_id: string
  provider_id: string
  seen_at: null | Date
}

export type RenderedOrganization = HasStringId<
  Organization & {
    departments: {
      id: string
      name: string
      requires_triage: boolean
      workflows: Workflow[]
    }[]
  }
>

export type RenderedPatientPresenceWaitingRoom = {
  department_name: 'waiting room'
  current_workflow: null
  next_workflow: Workflow
  present_with_patient_encounter_employee_ids: []
}

export type RenderedPatientPresenceActiveDepartment = {
  department_name: Exclude<Department, 'waiting room'>
  current_workflow: Workflow
  next_workflow: null | Workflow
  present_with_patient_encounter_employee_ids: string[]
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
    providers: RenderedEmployee[]
  } | null
  workflows: Partial<
    {
      [w in Workflow]: WorkflowStatus
    }
  >
  priority: null | {
    snomed_concept_id: string
    name: Priority
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
}

export type RenderedWaitingRoom = {
  patient_encounter_id: string
  patient: {
    id: string
    name: string
    avatar_url: string | null
    description: string | null
  }
  actions: [ExtendedActionData]
  reason: EncounterReason | null
  workflow_status_display: string
  arrived_timestamp: Date
  arrived_ago_display: string
  target_treatment_time: Date | null
  department_name: Department
  priority_level: Priority | null
  present_employees: RenderedPatientEncounterEmployee[]
  // appointment: null | {
  //   id: string
  //   start: Date
  //   providers: {
  //     health_worker_id: string
  //     provider_id: string
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
  dosage: number
  strength: number
  registration_frequency: string
  route: string
  start_date?: Maybe<string>
  end_date?: Maybe<string>
  medication_id?: Maybe<string>
  manufactured_medication_id?: Maybe<string>
  special_instructions?: Maybe<string>
}

export type PatientSymptomInsertShared = {
  snomed_concept_id: string
  severity: number
  start_date: string
  end_date?: Maybe<string>
  notes?: Maybe<string>
}

export type PatientSymptomUpsert = PatientSymptomInsertShared & {
  altered_patient_symptom_id?: string
  media?: {
    id: string
    mime_type?: string
    url?: string
  }[]
}

export type RenderedPatientSymptom =
  & PatientSymptomInsertShared
  & { id: string; name: string }
  & {
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

export type RenderedAppointmentProvider = RenderedEmployee & {
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

export type HeroIconName =
  | 'AcademicCapIcon'
  | 'AdjustmentsHorizontalIcon'
  | 'AdjustmentsVerticalIcon'
  | 'ArchiveBoxArrowDownIcon'
  | 'ArchiveBoxXMarkIcon'
  | 'ArchiveBoxIcon'
  | 'ArrowDownCircleIcon'
  | 'ArrowDownLeftIcon'
  | 'ArrowDownOnSquareStackIcon'
  | 'ArrowDownOnSquareIcon'
  | 'ArrowDownRightIcon'
  | 'ArrowDownTrayIcon'
  | 'ArrowDownIcon'
  | 'ArrowLeftCircleIcon'
  | 'ArrowLeftOnRectangleIcon'
  | 'ArrowLeftIcon'
  | 'ArrowLongDownIcon'
  | 'ArrowLongLeftIcon'
  | 'ArrowLongRightIcon'
  | 'ArrowLongUpIcon'
  | 'ArrowPathRoundedSquareIcon'
  | 'ArrowPathIcon'
  | 'ArrowRightCircleIcon'
  | 'ArrowRightOnRectangleIcon'
  | 'ArrowRightIcon'
  | 'ArrowSmallDownIcon'
  | 'ArrowSmallLeftIcon'
  | 'ArrowSmallRightIcon'
  | 'ArrowSmallUpIcon'
  | 'ArrowTopRightOnSquareIcon'
  | 'ArrowTrendingDownIcon'
  | 'ArrowTrendingUpIcon'
  | 'ArrowUpCircleIcon'
  | 'ArrowUpLeftIcon'
  | 'ArrowUpOnSquareStackIcon'
  | 'ArrowUpOnSquareIcon'
  | 'ArrowUpRightIcon'
  | 'ArrowUpTrayIcon'
  | 'ArrowUpIcon'
  | 'ArrowUturnDownIcon'
  | 'ArrowUturnLeftIcon'
  | 'ArrowUturnRightIcon'
  | 'ArrowUturnUpIcon'
  | 'ArrowsPointingInIcon'
  | 'ArrowsPointingOutIcon'
  | 'ArrowsRightLeftIcon'
  | 'ArrowsUpDownIcon'
  | 'AtSymbolIcon'
  | 'BackspaceIcon'
  | 'BackwardIcon'
  | 'BanknotesIcon'
  | 'Bars2Icon'
  | 'Bars3BottomLeftIcon'
  | 'Bars3BottomRightIcon'
  | 'Bars3CenterLeftIcon'
  | 'Bars3Icon'
  | 'Bars4Icon'
  | 'BarsArrowDownIcon'
  | 'BarsArrowUpIcon'
  | 'Battery0Icon'
  | 'Battery100Icon'
  | 'Battery50Icon'
  | 'BeakerIcon'
  | 'BellAlertIcon'
  | 'BellSlashIcon'
  | 'BellSnoozeIcon'
  | 'BellIcon'
  | 'BoltSlashIcon'
  | 'BoltIcon'
  | 'BookOpenIcon'
  | 'BookmarkSlashIcon'
  | 'BookmarkSquareIcon'
  | 'BookmarkIcon'
  | 'BriefcaseIcon'
  | 'BugAntIcon'
  | 'BuildingLibraryIcon'
  | 'BuildingOffice2Icon'
  | 'BuildingOfficeIcon'
  | 'BuildingStorefrontIcon'
  | 'CakeIcon'
  | 'CalculatorIcon'
  | 'CalendarDaysIcon'
  | 'CalendarIcon'
  | 'CameraIcon'
  | 'ChartBarSquareIcon'
  | 'ChartBarIcon'
  | 'ChartPieIcon'
  | 'ChatBubbleBottomCenterTextIcon'
  | 'ChatBubbleBottomCenterIcon'
  | 'ChatBubbleLeftEllipsisIcon'
  | 'ChatBubbleLeftRightIcon'
  | 'ChatBubbleLeftIcon'
  | 'ChatBubbleOvalLeftEllipsisIcon'
  | 'ChatBubbleOvalLeftIcon'
  | 'CheckBadgeIcon'
  | 'CheckCircleIcon'
  | 'CheckIcon'
  | 'ChevronDoubleDownIcon'
  | 'ChevronDoubleLeftIcon'
  | 'ChevronDoubleRightIcon'
  | 'ChevronDoubleUpIcon'
  | 'ChevronDownIcon'
  | 'ChevronLeftIcon'
  | 'ChevronRightIcon'
  | 'ChevronUpDownIcon'
  | 'ChevronUpIcon'
  | 'CircleStackIcon'
  | 'ClipboardDocumentCheckIcon'
  | 'ClipboardDocumentListIcon'
  | 'ClipboardDocumentIcon'
  | 'ClipboardIcon'
  | 'ClockIcon'
  | 'CloudArrowDownIcon'
  | 'CloudArrowUpIcon'
  | 'CloudIcon'
  | 'CodeBracketSquareIcon'
  | 'CodeBracketIcon'
  | 'Cog6ToothIcon'
  | 'Cog8ToothIcon'
  | 'CogIcon'
  | 'CommandLineIcon'
  | 'ComputerDesktopIcon'
  | 'CpuChipIcon'
  | 'CreditCardIcon'
  | 'CubeTransparentIcon'
  | 'CubeIcon'
  | 'CurrencyBangladeshiIcon'
  | 'CurrencyDollarIcon'
  | 'CurrencyEuroIcon'
  | 'CurrencyPoundIcon'
  | 'CurrencyRupeeIcon'
  | 'CurrencyYenIcon'
  | 'CursorArrowRaysIcon'
  | 'CursorArrowRippleIcon'
  | 'DevicePhoneMobileIcon'
  | 'DeviceTabletIcon'
  | 'DocumentArrowDownIcon'
  | 'DocumentArrowUpIcon'
  | 'DocumentChartBarIcon'
  | 'DocumentCheckIcon'
  | 'DocumentDuplicateIcon'
  | 'DocumentMagnifyingGlassIcon'
  | 'DocumentMinusIcon'
  | 'DocumentPlusIcon'
  | 'DocumentTextIcon'
  | 'DocumentIcon'
  | 'EllipsisHorizontalCircleIcon'
  | 'EllipsisHorizontalIcon'
  | 'EllipsisVerticalIcon'
  | 'EnvelopeOpenIcon'
  | 'EnvelopeIcon'
  | 'ExclamationCircleIcon'
  | 'ExclamationTriangleIcon'
  | 'EyeDropperIcon'
  | 'EyeSlashIcon'
  | 'EyeIcon'
  | 'FaceFrownIcon'
  | 'FaceSmileIcon'
  | 'FilmIcon'
  | 'FingerPrintIcon'
  | 'FireIcon'
  | 'FlagIcon'
  | 'FolderArrowDownIcon'
  | 'FolderMinusIcon'
  | 'FolderOpenIcon'
  | 'FolderPlusIcon'
  | 'FolderIcon'
  | 'ForwardIcon'
  | 'FunnelIcon'
  | 'GifIcon'
  | 'GiftTopIcon'
  | 'GiftIcon'
  | 'GlobeAltIcon'
  | 'GlobeAmericasIcon'
  | 'GlobeAsiaAustraliaIcon'
  | 'GlobeEuropeAfricaIcon'
  | 'HandRaisedIcon'
  | 'HandThumbDownIcon'
  | 'HandThumbUpIcon'
  | 'HashtagIcon'
  | 'HeartIcon'
  | 'HomeModernIcon'
  | 'HomeIcon'
  | 'IdentificationIcon'
  | 'InboxArrowDownIcon'
  | 'InboxStackIcon'
  | 'InboxIcon'
  | 'InformationCircleIcon'
  | 'KeyIcon'
  | 'LanguageIcon'
  | 'LifebuoyIcon'
  | 'LightBulbIcon'
  | 'LinkIcon'
  | 'ListBulletIcon'
  | 'LockClosedIcon'
  | 'LockOpenIcon'
  | 'MagnifyingGlassCircleIcon'
  | 'MagnifyingGlassMinusIcon'
  | 'MagnifyingGlassPlusIcon'
  | 'MagnifyingGlassIcon'
  | 'MapPinIcon'
  | 'MapIcon'
  | 'MegaphoneIcon'
  | 'MicrophoneIcon'
  | 'MinusCircleIcon'
  | 'MinusSmallIcon'
  | 'MinusIcon'
  | 'MoonIcon'
  | 'MusicalNoteIcon'
  | 'NewspaperIcon'
  | 'NoSymbolIcon'
  | 'PaintBrushIcon'
  | 'PaperAirplaneIcon'
  | 'PaperClipIcon'
  | 'PauseCircleIcon'
  | 'PauseIcon'
  | 'PencilSquareIcon'
  | 'PencilIcon'
  | 'PhoneArrowDownLeftIcon'
  | 'PhoneArrowUpRightIcon'
  | 'PhoneXMarkIcon'
  | 'PhoneIcon'
  | 'PhotoIcon'
  | 'PlayCircleIcon'
  | 'PlayPauseIcon'
  | 'PlayIcon'
  | 'PlusCircleIcon'
  | 'PlusSmallIcon'
  | 'PlusIcon'
  | 'PowerIcon'
  | 'PresentationChartBarIcon'
  | 'PresentationChartLineIcon'
  | 'PrinterIcon'
  | 'PuzzlePieceIcon'
  | 'QrCodeIcon'
  | 'QuestionMarkCircleIcon'
  | 'QueueListIcon'
  | 'RadioIcon'
  | 'ReceiptPercentIcon'
  | 'ReceiptRefundIcon'
  | 'RectangleGroupIcon'
  | 'RectangleStackIcon'
  | 'RocketLaunchIcon'
  | 'RssIcon'
  | 'ScaleIcon'
  | 'ScissorsIcon'
  | 'ServerStackIcon'
  | 'ServerIcon'
  | 'ShareIcon'
  | 'ShieldCheckIcon'
  | 'ShieldExclamationIcon'
  | 'ShoppingBagIcon'
  | 'ShoppingCartIcon'
  | 'SignalSlashIcon'
  | 'SignalIcon'
  | 'SparklesIcon'
  | 'SpeakerWaveIcon'
  | 'SpeakerXMarkIcon'
  | 'Square2StackIcon'
  | 'Square3Stack3dIcon'
  | 'Squares2x2Icon'
  | 'SquaresPlusIcon'
  | 'StarIcon'
  | 'StopCircleIcon'
  | 'StopIcon'
  | 'SunIcon'
  | 'SwatchIcon'
  | 'TableCellsIcon'
  | 'TagIcon'
  | 'TicketIcon'
  | 'TrashIcon'
  | 'TrophyIcon'
  | 'TruckIcon'
  | 'TvIcon'
  | 'UserCircleIcon'
  | 'UserGroupIcon'
  | 'UserMinusIcon'
  | 'UserPlusIcon'
  | 'UserIcon'
  | 'UsersIcon'
  | 'VariableIcon'
  | 'VideoCameraSlashIcon'
  | 'VideoCameraIcon'
  | 'ViewColumnsIcon'
  | 'ViewfinderCircleIcon'
  | 'WalletIcon'
  | 'WifiIcon'
  | 'WindowIcon'
  | 'WrenchScrewdriverIcon'
  | 'WrenchIcon'
  | 'XCircleIcon'
  | 'XMarkIcon'

export type Image = {
  type: 'avatar'
  url: string | null
  className?: string
} | {
  type: 'icon'
  icon: HeroIconName | 'BluetoothIcon'
  className?: string
}

export type SendableToEntity = {
  type: 'entity'
  entity_type: 'health_worker' | 'facility'
  entity_id: string
  online?: Maybe<boolean>
  reopens?: string
}

export type SendableToAction = {
  type: 'action'
  action: 'search' | 'waiting_room' | 'device'
}

export type SendableTo = SendableToEntity | SendableToAction

export type SendToFormSubmission = {
  action?: SendableToAction['action']
  entity?: {
    type: SendableToEntity['entity_type']
    id: SendableToEntity['entity_id']
  }
  request_type?:
    | 'request_visit'
    | 'request_review'
    | 'make_appointment'
    | 'declare_emergency'
  additional_notes?: string
}
export type Sendable = {
  key: string
  image: Image
  name: string
  description?: {
    text: string
    href?: string
    parenthetical?: string
  }
  additional_description?: string
  additional_info?: string
  status: string
  menu_options?: {
    name: string
    href: string
  }[]
  to: SendableTo
  request_type_options?: string[]
  textarea?: string
}

export type SelectedPatient = {
  name: string
  avatar_url?: Maybe<string>
  description?: Maybe<string>
  actions: {
    view: string
  }
}

export type RenderedPharmacy = {
  id: string
  country: string
  address: string | null
  town: string | null
  address_display: string | null
  expiry_date: string
  licence_number: string
  licensee: string
  name: string
  pharmacies_types:
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
  href: string
  supervisors: Supervisor[]
  actions: {
    view: string
  }
}

export type PharmacistInPharmacy = RenderedPharmacy & {
  is_supervisor: boolean
}

export type RenderedPharmacist = {
  id: string
  licence_number: string
  prefix: Prefix | null
  name: string
  given_name: string
  family_name: string
  address: string | null
  full_address?: string | null
  country: string
  town: string | null
  address_display: string | null
  expiry_date: string
  pharmacist_type:
    | 'Dispensing Medical Practitioner'
    | 'Ind Clinic Nurse'
    | 'Pharmacist'
    | 'Pharmacy Technician'
  pharmacies: Omit<PharmacistInPharmacy, 'actions' | 'supervisors'>[]
  href: string
  actions: {
    view: string
    revoke: string
    edit: string
  }
}

export type Supervisor = {
  id: string
  href: string
  name: string
  prefix: Prefix | null
}

export type DetailedPharmacist = {
  id?: string
  licence_number: string
  prefix: Prefix | null
  name?: string
  given_name: string
  family_name: string
  address: string | null
  town: string | null
  expiry_date: string
  pharmacist_type:
    | 'Dispensing Medical Practitioner'
    | 'Ind Clinic Nurse'
    | 'Pharmacist'
    | 'Pharmacy Technician'
  pharmacies: Omit<PharmacistInPharmacy, 'actions' | 'supervisors'>[]
}

export type RenderedManufacturedMedication = {
  id: string
  name: string
  generic_name: string
  trade_name: string
  applicant_name: string
  form: string
  strength_summary: string
  strength_numerators: number[]
  strength_numerator_unit: string
  strength_denominator: number
  strength_denominator_unit: string
  strength_denominator_is_units: boolean
  actions: {
    recall: string | null
  }
  recalled_at: string | null
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

export type PrescriptionMedicationWithDrug = PrescriptionMedication & {
  drug: DrugSearchResult
}

export type RenderedPrescriptionWithMedications = RenderedPrescription & {
  medications: PrescriptionMedicationWithDrug[]
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

export type RenderedEmployee = EmployedHealthWorker & {
  organization_id: string
  employee_id: string
  profession: Profession | null
  is_admin: boolean
  specialty: string | null
  href: string
}

export type MessageTargetEntities = {
  organization: RenderedOrganization
  organization_category: string
  employee: RenderedEmployee
  profession: Profession | 'admin'
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

export type RenderedMessageTarget =
  RenderedMessageTargets[keyof RenderedMessageTargets]

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
  finding_id: string
  snomed_concept_id: string
  required: true
  label: string
  units: string
}

export type MostRecentVitalMeasurement =
  & {
    finding_id: string
    snomed_concept_id: string
    value_display: string
    patient_encounter_id: string
    created_at: Date
    // TODO include who made the evaluation
    evaluations: {
      snomed_concept_id: string
      note: string | null
    }[]
  }
  & ({
    finding_type: 'manual'
    provider: RenderedPatientEncounterEmployee
  } | {
    finding_type: 'computed'
    provider: null
  })

export type Evaluation = {
  priority: Priority
  note?: string | undefined
}
export type Measurement = {
  finding_id: string
  snomed_concept_id: string
  value: number
  units: string
}

export type ExtantProcedureOrCreationIntent = {
  id: string
  create_from_snomed_concept_id?: never
} | {
  id?: never
  create_from_snomed_concept_id: string
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

export type PatientDrawerRecordDisplay = {
  record_id: string
  priority: Priority
  display: string
}

// Type definition based on user requirements

export type ThisVisitRecords = {
  chief_complaint: PatientDrawerRecordDisplay[]
  vitals: PatientDrawerRecordDisplay[]
  symptoms: PatientDrawerRecordDisplay[]
  history: PatientDrawerRecordDisplay[]
  general_assessments: PatientDrawerRecordDisplay[]
  examinations: PatientDrawerRecordDisplay[]
  diagnostic_tests: PatientDrawerRecordDisplay[]
  diagnoses: PatientDrawerRecordDisplay[]
  prescriptions: PatientDrawerRecordDisplay[]
  orders: PatientDrawerRecordDisplay[]
}

export type RenderedPatientHistory = {
  pre_existing_conditions: PatientDrawerRecordDisplay[]
  allergies: PatientDrawerRecordDisplay[]
  family_history: PatientDrawerRecordDisplay[]
  major_surgeries: PatientDrawerRecordDisplay[]
  medications: PatientDrawerRecordDisplay[]
  lifestyle: PatientDrawerRecordDisplay[]
}

export type PatientDrawerV3Props = {
  patient: RenderedPatient
  encounter: RenderedPatientEncounter
  current_consultation_step: string
  this_visit_records: ThisVisitRecords
  patient_history: RenderedPatientHistory
  care_team: RenderedCareTeamHealthWorker[]
}

export type RenderedCareTeamHealthWorker = {
  employment_id: string
  health_worker_id: string
  name: string
  profession: 'doctor' | 'nurse'
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
  | 'coronavirus'
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

export type RenderedFindingProvider = RenderedPatientEncounterEmployee & {
  is_me: boolean
}

export type AsPartOfProcedure = {
  record_id: string
  snomed_concept_id: string
  name: string
}

export type RenderedFindingQualifierRelativeToHealthWorker = {
  record_id: string
  patient_encounter_id: string
  snomed_concept_id: string
  name: string
  attribute_value: string | null
  qualifiers: RenderedFindingQualifierRelativeToHealthWorker[]
}

export type RenderedFindingRelativeToHealthWorker<
  PertainingToKey extends string = string,
> = {
  record_id: string
  patient_encounter_id: string
  snomed_concept_id: string
  name: string
  value_display: string
  pertaining_to_key: PertainingToKey
  created_at: Date | string
  provider: RenderedFindingProvider
  as_part_of_procedure: AsPartOfProcedure
  qualifiers: RenderedFindingQualifierRelativeToHealthWorker[]
  existence: Existence
  notes?: {
    note: string
    created_at: Date
    provider: RenderedFindingProvider & {
      is_same_person_who_made_originally_noted_finding: boolean
    }
  }[]
}

export type AppUser = Profession | 'admin' | 'regulator'

export type Alert = {
  message: string
  level: 'error' | 'warning' | 'success'
  actions?: {
    name: string
    href: string
    method?: 'GET' | 'POST'
  }[]
}

type QualifierIntermediate =
  & Omit<
    RenderedFindingQualifierRelativeToHealthWorker,
    'provider' | 'value_display'
  >
  & {
    attribute_value: string | null
  }

export type Existence = 'Yes' | 'No' | 'Unknown'

export type IntermediateFindingRecord<PertainingToKey extends string = string> =
  {
    created_at: Date
    record_id: string
    snomed_concept_id: string
    name: string
    patient_encounter_id: string
    patient_encounter_employee_id: string
    pertaining_to_key: PertainingToKey
    as_part_of_procedure: AsPartOfProcedure
    qualifiers: QualifierIntermediate[]
    value_snomed_concept_id: null | string
    value_name: null | string
  }

export type MostRecentBriefHistoryFindings = {
  [c in CommonConditionKey]: null | RenderedFindingRelativeToHealthWorker
}

export type WarningSign = {
  clinical_finding_s_expression: string
  sats_primary_name: string
  sats_secondary_text: string | null
  sats_priority: 'Urgent' | 'Very urgent' | 'Emergency'
  prompt_when_s_expression?: string
}

export type KeyedWarningSign = {
  key: string
} & WarningSign
