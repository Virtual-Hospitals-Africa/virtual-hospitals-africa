// deno-lint-ignore-file no-explicit-any
import { ColumnType, Generated, SqlBool, Transaction } from 'kysely'
import { JSX } from 'preact'
import { FreshContext, Handlers } from '$fresh/server.ts'
import { Session, WithSession } from 'fresh_session'
import db from './db/db.ts'
import {
  AgeUnit,
  DB,
  DoctorReviewStep,
  EncounterReason,
  EncounterStep,
  ExaminationFindingType,
  FamilyType,
  IntakeStep,
  MaritalStatus,
  PatientCohabitation,
  Religion,
} from './db.d.ts'

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

export type Location = {
  longitude: number
  latitude: number
}

export type Gender = 'male' | 'female' | 'non-binary'

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
  completed_intake: boolean
  address_id: Maybe<number>
  unregistered_primary_doctor_name: Maybe<string>
  intake_steps_completed: IntakeStep[]
}

export type PatientDemographicInfo = {
  phone_number: Maybe<string>
  name: Maybe<string>
  gender: Maybe<Gender>
  ethnicity: Maybe<string>
  date_of_birth: Maybe<string>
  national_id_number: Maybe<string>
}
export type PatientPersonal = {
  conversation_state: PatientConversationState
  avatar_media_id: Maybe<number>
  location: Maybe<Location>
} & PatientDemographicInfo

export type RenderedPatient =
  & Pick<
    Patient,
    | 'gender'
    | 'ethnicity'
    | 'national_id_number'
    | 'phone_number'
    | 'name'
    | 'conversation_state'
    | 'completed_intake'
    | 'intake_steps_completed'
  >
  & {
    id: number
    dob_formatted: string | null
    description: string | null
    // age_formatted: Maybe<string> // TODO: implement
    avatar_url: string | null
    nearest_facility: string | null
    last_visited: null // TODO: implement
    location: {
      longitude: number | null
      latitude: number | null
    }
    actions: {
      view: string | null
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
  id: number
  patient_id: number
  condition_id: string
  start_date: string
  end_date: Maybe<string>
  comorbidity_of_condition_id: Maybe<number>
}

export type MedicalConditionBase = {
  id: string
  name: string
  start_date: string
  patient_condition_id: number
}

export type PreExistingCondition = MedicalConditionBase & {
  comorbidities: {
    id: string
    patient_condition_id: number
    name: string
    start_date?: Maybe<string>
  }[]
  medications: {
    id: number
    medication_id: number
    manufactured_medication_id: number | null
    patient_condition_medication_id: number
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
  id: number
  drug: DrugSearchResult
  manufactured_medication_id: number | null
  medication_id: number | null
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

export type PreExistingAllergy = {
  id?: Maybe<number>
  allergy_id: number
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

export type PatientIntake =
  & {
    id: number
    avatar_url: Maybe<string>
    nearest_facility_name: Maybe<string>
    nearest_facility_address: Maybe<string>
    primary_doctor_name: Maybe<string>
    age?: RenderedPatientAge
    address: {
      street: Maybe<string>
      suburb_id: Maybe<number>
      ward_id: Maybe<number>
      district_id: Maybe<number>
      province_id: Maybe<number>
      country_id: Maybe<number>
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
    | 'nearest_facility_id'
    | 'completed_intake'
    | 'intake_steps_completed'
    | 'primary_doctor_id'
    | 'unregistered_primary_doctor_name'
  >

export type PatientFamily = {
  guardians: GuardianFamilyRelation[]
  dependents: FamilyRelation[]
  other_next_of_kin: Maybe<NextOfKin>
  home_satisfaction: Maybe<number>
  spiritual_satisfaction: Maybe<number>
  social_satisfaction: Maybe<number>
  religion: Maybe<Religion>
  family_type: Maybe<FamilyType>
  marital_status: Maybe<MaritalStatus>
  patient_cohabitation: Maybe<PatientCohabitation>
}

export type NextOfKin = {
  id: Maybe<number>
  patient_id: number
  patient_name: Maybe<string>
  patient_phone_number: Maybe<string>
  patient_gender: Maybe<Gender>
  relation: string
}

export type FamilyRelation = {
  relation_id: number
  family_relation: string
  guardian_relation: GuardianRelationName
  patient_id: number
  patient_name: Maybe<string>
  patient_phone_number: Maybe<string>
  patient_gender: Maybe<Gender>
  family_relation_gendered: Maybe<string>
}

export type GuardianFamilyRelation = FamilyRelation & {
  next_of_kin: SqlBool
}

export type FamilyRelationInsert = {
  patient_id?: Maybe<number>
  patient_name: Maybe<string>
  patient_phone_number: Maybe<string>
  family_relation_gendered: string
  next_of_kin: boolean
}

export type FamilyUpsert = {
  guardians: FamilyRelationInsert[]
  dependents: FamilyRelationInsert[]
  other_next_of_kin?: Maybe<FamilyRelationInsert>
  home_satisfaction?: Maybe<number>
  spiritual_satisfaction?: Maybe<number>
  social_satisfaction?: Maybe<number>
  religion?: Maybe<Religion>
  family_type?: Maybe<FamilyType>
  marital_status?: Maybe<MaritalStatus>
  patient_cohabitation?: Maybe<PatientCohabitation>
  under_18?: boolean
}

export type LifestyleUpsert = {
  sexual_activity: any
  alcohol: any
  smoking: any
}

export type PatientWithOpenEncounter = RenderedPatient & {
  open_encounter: Maybe<RenderedPatientEncounter>
}

export type PatientAppointmentOfferedTime = {
  patient_appointment_request_id: number
  provider_id: number
  start: Date
  declined: boolean
}

export type SchedulingAppointmentOfferedTime = PatientAppointmentOfferedTime & {
  id: number
  health_worker_name: string
  profession: Profession
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
    offered_times: SchedulingAppointmentOfferedTime[]
  }
  scheduled_appointment?: {
    id: number
    reason: string
    provider_id: number
    health_worker_name: string
    gcal_event_id: string
    start: Date
  }
  created_at: Date
  updated_at: Date
  nearest_facilities?: HasId<PatientNearestFacility>[]
  nearest_facility_name?: string
  selectedFacility?: FacilityWithAddress
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

export type AppointmentWithAllPatientInfo = HasId<Appointment> & {
  patient: PatientWithOpenEncounter
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
  reason: string | null
}

export type Procurer = {
  id?: number
  name: string
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

export type FacilityEmployeeOrInvitee =
  | FacilityEmployee
  | FacilityEmployeeInvitee

export type FacilityEmployee = {
  name: string
  is_invitee: false
  health_worker_id: number
  professions: {
    employee_id: number
    profession: Profession
    specialty: NurseSpecialty | null
  }[]
  avatar_url: null | string
  email: string
  display_name: string
  registration_status: 'pending_approval' | 'approved' | 'incomplete'
  actions: {
    view: string
  }
}

export type FacilityDoctorOrNurse =
  & Omit<FacilityEmployee, 'is_invitee' | 'professions'>
  & {
    profession: 'doctor' | 'nurse'
    employee_id: number
    specialty: NurseSpecialty | null
  }

export type FacilityEmployeeInvitee = {
  name: null
  is_invitee: true
  health_worker_id: null | number
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
}

export type FacilityDevice = {
  device_id: number
  serial_number?: string
  facility_id: number
  created_by: number
}

export type FacilityConsumable = {
  facility_id: number
  created_by: number
  consumable_id: number
  procured_by: number
  quantity: number
}

export type RenderedDevice = {
  id: number
  name: string
  manufacturer: string
  diagnostic_test_capabilities: string[]
}

export type RenderedConsumable = {
  id: number
  name: string
}

export type RenderedProcurer = {
  id: number
  name: string
}

export type RenderedFacilityDevice = {
  device_id: number
  name: string
  manufacturer: string
  serial_number: string | null
  diagnostic_test_capabilities: string[]
}

export type RenderedFacilityConsumable = {
  name: string
  consumable_id: number
  quantity_on_hand: number
}

export type RenderedFacilityMedicine = {
  consumable_id: number
  medication_id: number
  trade_name: string
  applicant_name: string
  manufacturer_name: string
  quantity_on_hand: number
}

export type RenderedInventoryHistory = {
  created_at: Date
  created_by: string
  procured_by?: string
  quantity: number
  type: 'procurement' | 'consumption'
}

export type Profession =
  | 'admin'
  | 'doctor'
  | 'nurse'

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
  facility_address: string | null
  facility_id: number
  facility_name: string
  professions: Profession[]
  documents: {
    name: string
    href: string
  }[]
}

export type RenderedDoctorReviewBase = {
  employment_id: number
  encounter: {
    id: number
    reason: EncounterReason
  }
  patient: {
    id: number
    name: string
    avatar_url: string | null
    description: string | null
  }
  requested_by: {
    profession: 'nurse' | 'doctor'
    name: string
    avatar_url: string | null
    facility: {
      id: number
      name: string
    }
    patient_encounter_provider_id: number
  }
}

export type RenderedDoctorReview = RenderedDoctorReviewBase & {
  review_id: number
  steps_completed: DoctorReviewStep[]
  completed: SqlBool
}
export type RenderedDoctorReviewRequest = RenderedDoctorReviewBase & {
  review_request_id: number
}

export type PossiblyEmployedHealthWorker = HealthWorker & {
  id: number
  access_token: string
  refresh_token: string
  expires_at: Date | string
  employment: {
    facility: {
      id: number
      name: string
      address: string | null
    }
    roles: {
      nurse: null | {
        registration_needed: boolean
        registration_completed: boolean
        registration_pending_approval: boolean
        employment_id: number
      }
      doctor: null | {
        registration_needed: boolean
        registration_completed: boolean
        registration_pending_approval: boolean
        employment_id: number
      }
      admin: null | {
        registration_needed: boolean
        registration_completed: boolean
        registration_pending_approval: boolean
        employment_id: number
      }
    }
    gcal_appointments_calendar_id: string
    gcal_availability_calendar_id: string
    availability_set: boolean
  }[]
  default_facility_id: number | null
  open_encounters: RenderedPatientEncounter[]
  reviews: {
    requested: RenderedDoctorReviewRequest[]
    in_progress: RenderedDoctorReview[]
  }
  notifications: RenderedNotification[]
}

export type EmployedHealthWorker = PossiblyEmployedHealthWorker & {
  default_facility_id: number
}

export type HealthWorkerWithGoogleTokens = HealthWorker & GoogleTokens & {
  id: number
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

export type Device = {
  id?: number
  name: string
  manufacturer: string
  test_availability: DeviceTestsAvailablity[]
}

export type DeviceTestsAvailablity = {
  test_id: number
  name: string
}

export type WhatsAppMessageOption = {
  id: string
  title: string
}

export type TrxOrDb = Transaction<DB> | typeof db

export type WhatsAppSingleSendable =
  | WhatsAppSendableString
  | WhatsAppSendableButtons
  | WhatsAppSendableList
  | WhatsAppSendableLocation

export type WhatsAppSendable = [WhatsAppSingleSendable, WhatsAppSingleSendable]

export type ProviderAppointmentSlot = {
  type: 'slot'
  id: string
  patient?: {
    id: number
    avatar_url: Maybe<string>
    name: Maybe<string>
    phone_number: Maybe<string>
  }
  durationMinutes: number
  start: ParsedDateTime
  end: ParsedDateTime
  providers: Provider[]
  physicalLocation?: undefined
  virtualLocation?: undefined
}

export type ProviderAppointment = {
  type: 'appointment'
  id: number
  patient: {
    id: number
    avatar_url: Maybe<string>
    name: Maybe<string>
    phone_number: Maybe<string>
  }
  durationMinutes: number
  start: ParsedDateTime
  end: ParsedDateTime
  providers?: Provider[]
  physicalLocation?: {
    facility: HasId<Facility>
  }
  virtualLocation?: {
    href: string
  }
}

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
  healthWorker: EmployedHealthWorker
}

export type LoggedInHealthWorkerContext<T = Record<never, never>> =
  FreshContext<
    WithSession & {
      trx: TrxOrDb
      healthWorker: EmployedHealthWorker
    } & T
  >

export type LoggedInHealthWorkerHandlerWithProps<
  Props = Record<string, never>,
  Extra = Record<string, never>,
> = Handlers<
  Props,
  LoggedInHealthWorker & Extra
>

export type LoggedInHealthWorkerHandler<Context = Record<string, never>> =
  Context extends { state: infer State }
    ? LoggedInHealthWorkerHandlerWithProps<unknown, State>
    : LoggedInHealthWorkerHandlerWithProps<unknown, Context>

export type Facility = Partial<Location> & {
  name: string
  category: string
  address: string | null
  phone: string | null
}

export type FacilityWithAddress = Location & Facility & {
  address: string
}

export type PatientNearestFacility = FacilityWithAddress & {
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

export type CalendarPageProps = {
  appointments: ProviderAppointment[]
  day: string
  today: string
  healthWorker: EmployedHealthWorker
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

export type CountryAddressTree = {
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
  suburb_id?: Maybe<number>
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
  strength_denominator: string
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
  id: number
  name: string
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

export type School = {
  status: 'never attended'
} | {
  status: 'in school'
  current: CurrentSchool
} | {
  status: 'stopped school'
  past: PastSchool
} | {
  status: 'adult in school'
  education_level: string
} | {
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
  last_grade: string
  reason: string
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
  patient_id: number
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
} //fix type names

export type SexualActivity = {
  ever_been_sexually_active: false | null
} | {
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

export type Alcohol = {
  has_ever_drank: false | null
} | {
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
  quit_smoking_years?: number | null
  alcohol_products_used?: string[] | null
}

export type Smoking = {
  has_ever_smoked: false | null
} | {
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

export type PatientLifestyle = {
  patient_id: number
  lifestyle: Lifestyle
}

export type Allergy = {
  id: number
  name: string
}

export type PatientAllergies = {
  patient_id: number
  allergy_id: number
}

export type PatientEncounter = {
  patient_id: number
  reason: EncounterReason
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

export type RenderedProvider = {
  health_worker_id: number
  employee_id: number
  name: string
  profession: string
  href: string
  seen: SqlBool
}
export type RenderedWaitingRoom = {
  patient: {
    id: number
    name: string
    avatar_url: string | null
    description: string | null
  }
  actions: {
    view: string | null
    intake: string | null
    review: string | null
  }
  reason: EncounterReason
  is_emergency: SqlBool
  in_waiting_room: SqlBool
  status: string
  arrived_ago_display: string
  appointment: null | {
    id: number
    start: Date
    providers: {
      health_worker_id: number
      provider_id: number
      name: string
    }[]
  }
  providers: RenderedProvider[]
}

export type RenderedPatientEncounterProvider = {
  patient_encounter_provider_id: number
  employment_id: number
  facility_id: number
  profession: Profession
  health_worker_id: number
  health_worker_name: string
  seen: SqlBool
}

export type RenderedPatientEncounterExamination = {
  examination_name: string
  completed: SqlBool
  skipped: SqlBool
  recommended: SqlBool
}

export type RenderedPatientEncounter = {
  encounter_id: number
  created_at: Date
  closed_at: null | Date
  reason: EncounterReason
  notes: null | string
  patient_id: number
  appointment_id: null | number
  waiting_room_id: null | number
  waiting_room_facility_id: null | number
  providers: RenderedPatientEncounterProvider[]
  steps_completed: EncounterStep[]
  examinations: RenderedPatientEncounterExamination[]
}

export type Measurements = {
  height: [number, 'cm']
  weight: [number, 'kg']
  temperature: [number, 'celsius']
  blood_pressure_diastolic: [number, 'mmHg']
  blood_pressure_systolic: [number, 'mmHg']
  blood_oxygen_saturation: [number, '%']
  blood_glucose: [number, 'mg/dL']
  pulse: [number, 'bpm']
  respiratory_rate: [number, 'bpm']
  midarm_circumference: [number, 'cm']
  triceps_skinfold: [number, 'cm']
}
export type Measurement<Name extends keyof Measurements> = {
  name: Name
  units: Measurements[Name][1]
}

export type MeasurementsUpsert = {
  [Name in keyof Measurements]?: number
}

export type PatientMeasurement = {
  patient_id: number
  encounter_id: number
  encounter_provider_id: number
  measurement_name: keyof Measurements
  value: number
}

export type PatientSymptomInsertShared = {
  code: string
  severity: number
  start_date: string
  end_date: string | null
  notes: string | null
}

export type PatientSymptomUpsert = PatientSymptomInsertShared & {
  media: { id: number }[]
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
  & Omit<RenderedICD10DiagnosisTreeWithIncludes, 'includes'>
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
  health_worker_id: number
  provider_id: number
}

export type RenderedPatientExaminationFinding = {
  name: string
  label: string
  type: ExaminationFindingType
  required: boolean
  options: string[] | null
  value: any
}
export type RenderedPatientExaminationCategory = {
  category: string
  findings: RenderedPatientExaminationFinding[]
}

export type RenderedPatientExamination = {
  completed: boolean
  skipped: boolean
  categories: RenderedPatientExaminationCategory[]
}

export type RenderedRequestFormValues = {
  id: null | number
  facility: null | {
    id: number
    name: string
    address: string | null
  }
  doctor: null | {
    id: number
    name: string
  }
  requester_notes: null | string
}

export type NotificationType = 'doctor_review_request'

export type RenderedNotification = {
  type: NotificationType
  entity_id: number
  avatar_url: string | null
  title: string
  description: string
  time_display: string
  action: {
    title: string
    href: string
  }
}
