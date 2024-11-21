// deno-lint-ignore-file no-explicit-any
import { ColumnType, Generated, SqlBool, Transaction } from 'kysely'
import { JSX } from 'preact'
import { FreshContext, Handlers } from '$fresh/server.ts'
import db from './db/db.ts'
import {
  AgeUnit,
  DB,
  DoctorReviewStep,
  EncounterReason,
  EncounterStep,
  FamilyType,
  IntakeStep,
  MaritalStatus,
  PatientCohabitation,
} from './db.d.ts'
import { Examination } from './shared/examinations.ts'
import { DietFrequency } from './shared/diet.ts'
import { ExtendedActionData } from './components/library/Table.tsx'

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

export type HasStringId<
  T extends Record<string, unknown> = Record<string, unknown>,
> =
  & T
  & {
    id: string
  }

export type Location = {
  longitude: number
  latitude: number
}

export type Gender = 'male' | 'female' | 'non-binary'

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
  | 'onboarded:appointment_cancelled'
  | 'onboarded:main_menu'
  | 'find_nearest_facilities:share_location'
  | 'find_nearest_facilities:got_location'
  | 'find_nearest_facilities:send_organization_location'
  | 'end_of_demo'
  | 'error'

export type Patient = PatientPersonal & {
  primary_doctor_id: Maybe<string>
  nearest_organization_id: Maybe<string>
  completed_intake: boolean
  address_id: Maybe<string>
  unregistered_primary_doctor_name: Maybe<string>
  intake_steps_completed: IntakeStep[]
}

export type PatientDemographicInfo = {
  phone_number: Maybe<string>
  name: string
  gender: Maybe<Gender>
  ethnicity: Maybe<string>
  date_of_birth: Maybe<string>
  national_id_number: Maybe<string>
}
export type PatientPersonal = {
  conversation_state: PatientConversationState
  avatar_media_id: Maybe<string>
  location: Maybe<Location>
} & PatientDemographicInfo

export type RenderedPatient =
  & Pick<
    Patient,
    | 'gender'
    | 'ethnicity'
    | 'national_id_number'
    | 'phone_number'
    | 'completed_intake'
    | 'intake_steps_completed'
  >
  & {
    id: string
    address: string | null
    dob_formatted: string | null
    name: string
    description: string | null
    age_display: Maybe<string>
    avatar_url: string | null
    nearest_organization: string | null
    last_visited: null // TODO: implement
    location: {
      longitude: number | null
      latitude: number | null
    }
    actions: {
      view: string
    }
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
    intake_frequency: string
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
  intake_frequency: string
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

export type PatientIntake =
  & {
    id: string
    avatar_url: Maybe<string>
    description: Maybe<string>
    nearest_organization_name: Maybe<string>
    nearest_organization_address: Maybe<string>
    primary_doctor_name: Maybe<string>
    age?: RenderedPatientAge
    address?: Maybe<Address>
    actions: {
      view: string
    }
  }
  & Pick<
    Patient,
    | 'name'
    | 'phone_number'
    | 'gender'
    | 'ethnicity'
    | 'date_of_birth'
    | 'national_id_number'
    | 'nearest_organization_id'
    | 'completed_intake'
    | 'intake_steps_completed'
    | 'primary_doctor_id'
    | 'unregistered_primary_doctor_name'
  >

export type PatientFamily = {
  guardians: GuardianFamilyRelation[]
  dependents: FamilyRelation[]
  other_next_of_kin: Maybe<NextOfKin>
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
  patient_gender: Maybe<Gender>
  relation: string
}

export type FamilyRelation = {
  relation_id: string
  family_relation: string
  guardian_relation: GuardianRelationName
  patient_id: string
  patient_name: string
  patient_phone_number: Maybe<string>
  patient_gender: Maybe<Gender>
  family_relation_gendered: Maybe<string>
}

export type GuardianFamilyRelation = FamilyRelation & {
  next_of_kin: SqlBool
}

export type FamilyRelationInsert = {
  patient_id?: Maybe<string>
  patient_name: string
  patient_phone_number?: Maybe<string>
  family_relation_gendered: string
  next_of_kin: boolean
}

export type FamilyUpsert = {
  guardians: FamilyRelationInsert[]
  dependents: FamilyRelationInsert[]
  other_next_of_kin?: Maybe<FamilyRelationInsert>
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

export type PatientWithOpenEncounter = RenderedPatient & {
  open_encounter: Maybe<RenderedPatientEncounter>
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
  profession: Profession
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
  patient: PatientWithOpenEncounter
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
  health_worker_id: string
  profession: Profession
  organization_id: string
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

export type OrganizationDoctorOrNurse =
  & Omit<
    OrganizationEmployee,
    'is_invitee' | 'professions'
  >
  & {
    profession: 'doctor' | 'nurse'
    employee_id: string
    specialty: string | null
  }

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

export type Profession = 'admin' | 'doctor' | 'nurse'

export type NurseSpecialty =
  | 'primary care'
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

export type NurseRegistrationDetails = {
  health_worker_id: string
  gender: Gender
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

export type HealthWorker = {
  name: string
  email: string
  avatar_url: string
  phone_number?: Maybe<string>
}

export type EmployeeInfo = {
  name: string
  email: string
  gender: Maybe<Gender>
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
  requested_by: {
    profession: 'nurse' | 'doctor'
    name: string
    avatar_url: string | null
    organization: {
      id: string
      name: string
    }
    patient_encounter_provider_id: string
  }
}

export type RenderedDoctorReview = RenderedDoctorReviewBase & {
  review_id: string
  employment_id: string
  steps_completed: DoctorReviewStep[]
  completed: SqlBool
}
export type RenderedDoctorReviewRequest = RenderedDoctorReviewBase & {
  review_request_id: string
}

export type RenderedDoctorReviewRequestOfSpecificDoctor =
  & RenderedDoctorReviewRequest
  & {
    employment_id: string
  }

export type HealthWorkerEmployment = {
  organization: {
    id: string
    name: string
    address: string | null
  }
  roles: {
    nurse: null | {
      registration_needed: boolean
      registration_completed: boolean
      registration_pending_approval: boolean
      employment_id: string
    }
    doctor: null | {
      registration_needed: boolean
      registration_completed: boolean
      registration_pending_approval: boolean
      employment_id: string
    }
    admin: null | {
      registration_needed: boolean
      registration_completed: boolean
      registration_pending_approval: boolean
      employment_id: string
    }
  }
  gcal_appointments_calendar_id: string
  gcal_availability_calendar_id: string
  availability_set: boolean
}

export type PossiblyEmployedHealthWorker = HealthWorker & {
  id: string
  access_token: string
  refresh_token: string
  expires_at: Date | string
  employment: HealthWorkerEmployment[]
  default_organization_id: string | null
  open_encounters: RenderedPatientEncounter[]
  reviews: {
    requested: RenderedDoctorReviewRequestOfSpecificDoctor[]
    in_progress: RenderedDoctorReview[]
  }
}

export type EmployedHealthWorker = PossiblyEmployedHealthWorker & {
  default_organization_id: string
}

export type HealthWorkerWithGoogleTokens =
  & HealthWorker
  & GoogleTokens
  & {
    id: string
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
  hour: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  minute?: 0 | 5 | 10 | 15 | 20 | 25 | 30 | 35 | 40 | 45 | 50 | 55
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
  patient?: {
    id: string
    avatar_url: Maybe<string>
    name: Maybe<string>
    phone_number: Maybe<string>
  }
  duration_minutes: number
  start: ParsedDateTime
  end: ParsedDateTime
  providers: Provider[]
  physicalLocation?: undefined
  virtualLocation?: undefined
}

export type ProviderAppointment = {
  type: 'provider_appointment'
  id: string
  patient: {
    id: string
    avatar_url: Maybe<string>
    name: Maybe<string>
    phone_number: Maybe<string>
  }
  duration_minutes: number
  start: ParsedDateTime
  end: ParsedDateTime
  providers?: Provider[]
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
  patient: {
    id: string
    avatar_url: Maybe<string>
    name: Maybe<string>
    phone_number: Maybe<string>
  }
  duration_minutes: number
  start: ParsedDateTime
  end: ParsedDateTime
  providers: Provider[]
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
  format: 'numeric' | 'twoDigit'
}

export type ISODateString = string & {
  __ISODateString__: true
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

export type WhatsAppSendableDocument = {
  type: 'document'
  messageBody: string
  file_path: string
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
  healthWorker: EmployedHealthWorker
}

export type LoggedInRegulator = {
  trx: TrxOrDb
  regulator: {
    id: string
  }
}

export type LoggedInHealthWorkerContext<T = Record<never, never>> =
  FreshContext<LoggedInHealthWorker & T>

export type LoggedInHealthWorkerHandlerWithProps<
  Props = Record<string, never>,
  Extra = Record<string, never>,
> = Handlers<Props, LoggedInHealthWorker & Extra>

export type LoggedInRegulatorHandlerWithProps<
  Props = Record<string, never>,
  Extra = Record<string, never>,
> = Handlers<Props, LoggedInRegulator & Extra>

export type LoggedInHealthWorkerHandler<Context = Record<string, never>> =
  Context extends { state: infer State }
    ? LoggedInHealthWorkerHandlerWithProps<unknown, State>
    : LoggedInHealthWorkerHandlerWithProps<unknown, Context>

export type LoggedInRegulatorContext<T = Record<never, never>> = FreshContext<
  LoggedInRegulator & T
>

export type LoggedInRegulatorHandler<Context = Record<string, never>> =
  Context extends { state: infer State }
    ? LoggedInRegulatorHandlerWithProps<unknown, State>
    : LoggedInRegulatorHandlerWithProps<unknown, Context>

export type Organization = {
  name: string
  category: string | null
  address: string | null
  location: Location | null
}

export type OrganizationWithAddress =
  & Location
  & Organization
  & {
    address: string
  }

export type PatientNearestOrganization = Location & {
  organization_id: string
  organization_name: string
  address: string
  walking_distance: null | number
  distance: number
  vha: boolean
}

export type GoogleAddressComponent = {
  formatted_address: string
  address_components: {
    long_name?: string
    short_name?: string
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
  origin: Location
  destination: Location
}

export type Media = {
  mime_type: string
  binary_data: BinaryData
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

export type Country = { name: string }

export type Province = { name: string; country_id: string }

export type District = { name: string; province_id: string }

export type Ward = { name: string; district_id: string }

export type CountryAddressTree = {
  id: string
  name: string
  provinces: {
    id: string
    name: string
    districts: {
      id: string
      name: string
      wards: {
        id: string
        name: string
      }[]
    }[]
  }[]
}[]

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
    desire_to_return: boolean
  }

export type CurrentSchool = {
  grade: string
  grades_dropping_reason: string | null
  happy: boolean | null
  inappropriate_reason: string | null
}

export type PastSchool = {
  stopped_last_grade: string
  stopped_reason: string
}

export type Job = {
  happy: boolean
  descendants_employed: boolean
  require_assistance: boolean
  profession: string
  work_satisfaction: string
}

export type Occupation = {
  school: School
  sport?: boolean
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
    ever_been_sexually_active: false | null
  }
  | {
    ever_been_sexually_active: true
    currently_sexually_active?: Maybe<boolean>
    first_encounter?: Maybe<number>
    current_sexual_partners?: Maybe<number>
    attracted_to?: Maybe<string>
    has_traded_sex_for_favors?: Maybe<boolean>
    had_sex_after_drugs?: Maybe<boolean>
    recently_treated_for_stis?: Maybe<boolean>
    recently_hiv_tested?: Maybe<boolean>
    know_partner_hiv_status?: Maybe<boolean>
    partner_hiv_status?: Maybe<boolean>
  }

export type Alcohol =
  | {
    has_ever_drank: false | null
  }
  | {
    has_ever_drank: true
    currently_drinks?: boolean | null
    binge_drinking?: boolean | null
    drawn_to_cut_down?: boolean | null
    annoyed_by_critics?: boolean | null
    eye_opener?: boolean | null
    guilty?: boolean | null
    missed_work?: boolean | null
    criticized?: boolean | null
    arrested?: boolean | null
    attempted_to_stop?: boolean | null
    withdrawal?: boolean | null
    quit_for_six_or_more_months?: boolean | null
    abstinence_length_months?: number | null
    first_drink?: number | null
    years_drinking?: number | null
    number_drinks_per_sitting?: number | null
    alcohol_products_used?: string[] | null
  }

export type Smoking =
  | {
    has_ever_smoked: false | null
  }
  | {
    has_ever_smoked: true
    currently_smokes?: Maybe<boolean>
    first_smoke_age?: number
    weekly_smokes?: number | null
    number_of_products?: number | null
    felt_to_cutdown?: boolean | null
    annoyed_by_criticism?: boolean | null
    guilty?: boolean | null
    forbidden_place?: boolean | null
    attempt_to_quit?: boolean | null
    quit_more_than_six_months?: boolean | null
    quit_smoking_years?: number | null
    tobacco_products_used?: string[] | null
  }

export type SubstanceUse =
  | {
    has_ever_used_substance: false | null
  }
  | {
    has_ever_used_substance: true
    substances_used: {
      name: string
      injected_substance: boolean | null
      annoyed_by_criticism: boolean | null
      attempt_to_stop: boolean | null
      withdrawal_symptoms: boolean | null
      quit_more_than_six_months: boolean | null
      quit_substance_use_years: number | null
      first_use_age: number | null
      used_regularly_years: number | null
      times_used_in_a_week: number | null
    }[]
  }

export type Exercise =
  | {
    currently_exercises: false | null
  }
  | {
    currently_exercises: true
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
  patient_allergy_id: string
  snomed_concept_id: number
  snomed_english_term: string
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

export type WaitingRoom = {
  organization_id: string
  patient_encounter_id: string
}

export type RenderedProvider = {
  health_worker_id: string
  employee_id: string
  name: string
  profession: string
  avatar_url: string | null
  href: string
  seen: SqlBool
  organization_id?: string
}
export type RenderedWaitingRoom = {
  patient: {
    id: string
    name: string
    avatar_url: string | null
    description: string | null
  }
  actions: {
    view: ExtendedActionData | null
    intake: ExtendedActionData | null
    review: ExtendedActionData | null
    awaiting_review: ExtendedActionData | null
  }
  reason: EncounterReason
  is_emergency: SqlBool
  in_waiting_room: SqlBool
  status: string
  arrived_ago_display: string
  appointment: null | {
    id: string
    start: Date
    providers: {
      health_worker_id: string
      provider_id: string
      name: string
    }[]
  }
  providers: RenderedProvider[]
  reviewers: RenderedProvider[]
}

export type RenderedPatientEncounterProvider = {
  patient_encounter_provider_id: string
  employment_id: string
  organization_id: string
  profession: Profession
  health_worker_id: string
  health_worker_name: string
  seen: SqlBool
}

export type RenderedPatientEncounterExamination = {
  examination_name: Examination
  completed: SqlBool
  skipped: SqlBool
  ordered: SqlBool
  recommended: SqlBool
}

export type RenderedPatientEncounter = {
  encounter_id: string
  created_at: Date
  closed_at: null | Date
  reason: EncounterReason
  notes: null | string
  patient_id: string
  appointment_id: string | null
  waiting_room_id: string | null
  waiting_room_organization_id: null | string
  providers: RenderedPatientEncounterProvider[]
  steps_completed: EncounterStep[]
}

export type Measurements = {
  height: [string, number, 'cm']
  weight: [string, number, 'kg']
  temperature: [string, number, 'celsius']
  blood_pressure_diastolic: [string, number, 'mmHg']
  blood_pressure_systolic: [string, number, 'mmHg']
  blood_oxygen_saturation: [string, number, '%']
  blood_glucose: [string, number, 'mg/dL']
  pulse: [string, number, 'bpm']
  respiratory_rate: [string, number, 'bpm']
  midarm_circumference: [string, number, 'cm']
  triceps_skinfold: [string, number, 'cm']
}

export type Measurement<Name extends keyof Measurements> = {
  measurement_name: Name
  snomed_code?: Measurements[Name][0]
  value?: Measurements[Name][1]
  units: Measurements[Name][2]
  is_flagged: boolean
}

export type MeasurementsUpsert = {
  value?: number
  is_flagged: boolean
  measurement_name: string // keyof Measurements
}

export type PatientMeasurement = {
  patient_id: string
  encounter_id: string
  encounter_provider_id: string
  measurement_name: keyof Measurements
  value: number
  is_flagged: boolean
}

export type PatientMedicationUpsert = {
  id?: Maybe<string>
  dosage: number
  strength: number
  intake_frequency: string
  route: string
  start_date?: Maybe<string>
  end_date?: Maybe<string>
  medication_id?: Maybe<string>
  manufactured_medication_id?: Maybe<string>
  special_instructions?: Maybe<string>
}

export type PatientSymptomInsertShared = {
  patient_symptom_id?: string
  code: string
  severity: number
  start_date: string
  end_date?: Maybe<string>
  notes?: Maybe<string>
  media_edited?: boolean
}

export type PatientSymptomUpsert = PatientSymptomInsertShared & {
  media?: {
    id: string
    mime_type?: string
    url?: string
  }[]
}

export type RenderedPatientSymptom =
  & PatientSymptomInsertShared
  & RenderedICD10DiagnosisTree
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

export type Provider = {
  avatar_url: string
  email: string
  name: string
  access_token: string
  refresh_token: string
  expires_at: Date
  profession: 'doctor' | 'nurse'
  availability_set: boolean
  gcal_appointments_calendar_id: string
  gcal_availability_calendar_id: string
  health_worker_id: string
  provider_id: string
}
export type RenderedPatientExamination = {
  patient_examination_id: string | null
  examination_name: Examination
  completed: boolean | null
  skipped: boolean | null
  ordered: boolean | null
  href: string
  findings: {
    patient_examination_finding_id: string
    snomed_concept_id: number
    snomed_english_term: string
    additional_notes: string | null
    body_sites: {
      patient_examination_finding_body_site_id: string
      snomed_concept_id: number
      snomed_english_term: string
    }[]
  }[]
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

export type NotificationType = 'doctor_review_request'

export type RenderedNotification = {
  type: NotificationType
  entity_id: string
  avatar_url: string | null
  title: string
  description: string
  time_display: string
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
  avatar_url?: string
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
  encounter_id: string
  encounter_provider_id: string
  encounter_open: SqlBool
  edit_href: string
  snomed_concept_id: number
  text: string
  additional_notes: string | null
  body_sites: {
    snomed_concept_id: number
    snomed_english_term: string
  }[]
}

export type ExaminationChecklistDefinition = {
  label: string
  snomed_concept_id: number
  snomed_english_term: string

  body_sites: {
    snomed_concept_id: number
    snomed_english_term: string
  }[]
}
