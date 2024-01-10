import type { ColumnType } from 'kysely'

export type AgeUnit = 'day' | 'month' | 'week' | 'year'

export type EncounterReason =
  | 'appointment'
  | 'checkup'
  | 'emergency'
  | 'follow up'
  | 'other'
  | 'referral'
  | 'seeking treatment'

export type Gender = 'female' | 'male' | 'non-binary'

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>

export type GuardianRelation =
  | 'adopted parent'
  | 'biological parent'
  | 'foster parent'
  | 'grandparent'
  | 'other guardian'
  | 'sibling'
  | 'sibling of parent'

export type HealthWorkerProfessions = 'admin' | 'doctor' | 'nurse'

export type Json = ColumnType<JsonValue, string, string>

export type JsonArray = JsonValue[]

export type JsonObject = {
  [K in string]?: JsonValue
}

export type JsonPrimitive = boolean | number | string | null

export type JsonValue = JsonArray | JsonObject | JsonPrimitive

export type Numeric = ColumnType<string, number | string, number | string>

export type NurseSpecialty =
  | 'anaesthetist'
  | 'clinical care'
  | 'clinical officer'
  | 'community'
  | 'dental'
  | 'intensive and coronary care'
  | 'midwife'
  | 'neonatal intensive care and paediatric'
  | 'oncology and palliative care'
  | 'operating theatre'
  | 'opthalmic'
  | 'orthopaedic'
  | 'primary care'
  | 'psychiatric mental health'
  | 'registered general'
  | 'renal'
  | 'trauma care'

export type PatientConversationState =
  | 'find_nearest_facility:got_location'
  | 'find_nearest_facility:send_facility_location'
  | 'find_nearest_facility:share_location'
  | 'initial_message'
  | 'not_onboarded:make_appointment:enter_date_of_birth'
  | 'not_onboarded:make_appointment:enter_gender'
  | 'not_onboarded:make_appointment:enter_name'
  | 'not_onboarded:make_appointment:enter_national_id_number'
  | 'not_onboarded:welcome'
  | 'onboarded:appointment_scheduled'
  | 'onboarded:cancel_appointment'
  | 'onboarded:main_menu'
  | 'onboarded:make_appointment:confirm_details'
  | 'onboarded:make_appointment:enter_appointment_reason'
  | 'onboarded:make_appointment:first_scheduling_option'
  | 'onboarded:make_appointment:initial_ask_for_media'
  | 'onboarded:make_appointment:other_scheduling_options'
  | 'onboarded:make_appointment:subsequent_ask_for_media'
  | 'other_end_of_demo'

export type Timestamp = ColumnType<Date, Date | string, Date | string>

export interface Address {
  country_id: number
  created_at: Generated<Timestamp>
  district_id: number
  id: Generated<number>
  province_id: number
  street: string | null
  suburb_id: number | null
  updated_at: Generated<Timestamp>
  ward_id: number
}

export interface Allergies {
  created_at: Generated<Timestamp>
  id: Generated<number>
  name: string
  updated_at: Generated<Timestamp>
}

export interface AppointmentHealthWorkerAttendees {
  appointment_id: number
  confirmed: Generated<boolean>
  created_at: Generated<Timestamp>
  health_worker_id: number
  id: Generated<number>
  updated_at: Generated<Timestamp>
}

export interface AppointmentMedia {
  appointment_id: number
  media_id: number
}

export interface Appointments {
  created_at: Generated<Timestamp>
  gcal_event_id: string
  id: Generated<number>
  patient_id: number
  reason: string
  start: Timestamp
  updated_at: Generated<Timestamp>
}

export interface ConditionIcd10Codes {
  condition_id: string
  created_at: Generated<Timestamp>
  icd10_code: string
  updated_at: Generated<Timestamp>
}

export interface Conditions {
  consumer_name: string
  created_at: Generated<Timestamp>
  id: string
  info_link_href: string | null
  info_link_text: string | null
  is_procedure: boolean
  name: string
  term_icd9_code: string | null
  term_icd9_text: string | null
  updated_at: Generated<Timestamp>
}

export interface Countries {
  created_at: Generated<Timestamp>
  id: Generated<number>
  name: string
  updated_at: Generated<Timestamp>
}

export interface Districts {
  created_at: Generated<Timestamp>
  id: Generated<number>
  name: string
  province_id: number
  updated_at: Generated<Timestamp>
}

export interface Drugs {
  created_at: Generated<Timestamp>
  generic_name: string
  id: Generated<number>
  updated_at: Generated<Timestamp>
}

export interface Employment {
  created_at: Generated<Timestamp>
  facility_id: number
  health_worker_id: number
  id: Generated<number>
  profession: HealthWorkerProfessions
  updated_at: Generated<Timestamp>
}

export interface Facilities {
  address: string
  category: string
  created_at: Generated<Timestamp>
  id: Generated<number>
  location: string
  name: string
  phone: string | null
  updated_at: Generated<Timestamp>
}

export interface GeographyColumns {
  coord_dimension: number | null
  f_geography_column: string | null
  f_table_catalog: string | null
  f_table_name: string | null
  f_table_schema: string | null
  srid: number | null
  type: string | null
}

export interface GeometryColumns {
  coord_dimension: number | null
  f_geometry_column: string | null
  f_table_catalog: string | null
  f_table_name: string | null
  f_table_schema: string | null
  srid: number | null
  type: string | null
}

export interface GuardianRelations {
  created_at: Generated<Timestamp>
  dependent: string
  female_dependent: string | null
  female_guardian: string | null
  guardian: GuardianRelation
  male_dependent: string | null
  male_guardian: string | null
  updated_at: Generated<Timestamp>
}

export interface HealthWorkerGoogleTokens {
  access_token: string
  created_at: Generated<Timestamp>
  expires_at: Timestamp
  health_worker_id: number
  id: Generated<number>
  refresh_token: string
  updated_at: Generated<Timestamp>
}

export interface HealthWorkerInvitees {
  created_at: Generated<Timestamp>
  email: string
  facility_id: number
  id: Generated<number>
  profession: HealthWorkerProfessions
  updated_at: Generated<Timestamp>
}

export interface HealthWorkers {
  avatar_url: string
  created_at: Generated<Timestamp>
  email: string
  gcal_appointments_calendar_id: string
  gcal_availability_calendar_id: string
  id: Generated<number>
  name: string
  updated_at: Generated<Timestamp>
}

export interface Icd10Codes {
  code: string
  created_at: Generated<Timestamp>
  name: string
  updated_at: Generated<Timestamp>
}

export interface MailingList {
  created_at: Generated<Timestamp>
  email: string
  entrypoint: string
  id: Generated<number>
  interest: string | null
  message: string | null
  name: string
  support: string | null
  updated_at: Generated<Timestamp>
}

export interface ManufacturedMedications {
  applicant_name: string
  created_at: Generated<Timestamp>
  id: Generated<number>
  manufacturer_name: string
  medication_id: number
  strength_numerators: number[]
  trade_name: string
  updated_at: Generated<Timestamp>
}

export interface Measurements {
  name: string
  units: string
}

export interface Media {
  binary_data: Buffer
  created_at: Generated<Timestamp>
  id: Generated<number>
  mime_type: string
  updated_at: Generated<Timestamp>
}

export interface Medications {
  created_at: Generated<Timestamp>
  drug_id: number
  form: string
  form_route: Generated<string>
  id: Generated<number>
  routes: string[]
  strength_denominator: Numeric
  strength_denominator_is_units: Generated<boolean>
  strength_denominator_unit: string
  strength_numerator_unit: string
  strength_numerators: number[]
  updated_at: Generated<Timestamp>
}

export interface NurseRegistrationDetails {
  address_id: number | null
  approved_by: number | null
  created_at: Generated<Timestamp>
  date_of_birth: Timestamp
  date_of_first_practice: Timestamp
  face_picture_media_id: number | null
  gender: Gender
  health_worker_id: number
  id: Generated<number>
  mobile_number: string
  national_id_media_id: number | null
  national_id_number: string
  ncz_registration_card_media_id: number | null
  ncz_registration_number: string
  nurse_practicing_cert_media_id: number | null
  updated_at: Generated<Timestamp>
}

export interface NurseSpecialties {
  created_at: Generated<Timestamp>
  employee_id: number
  id: Generated<number>
  specialty: NurseSpecialty
  updated_at: Generated<Timestamp>
}

export interface PatientAge {
  age: string | null
  age_display: string | null
  age_number: number | null
  age_unit: AgeUnit | null
  patient_id: number | null
}

export interface PatientAllergies {
  allergy_id: number
  created_at: Generated<Timestamp>
  id: Generated<number>
  patient_id: number
  updated_at: Generated<Timestamp>
}

export interface PatientAppointmentOfferedTimes {
  created_at: Generated<Timestamp>
  declined: Generated<boolean | null>
  health_worker_id: number
  id: Generated<number>
  patient_appointment_request_id: number
  start: Timestamp
  updated_at: Generated<Timestamp>
}

export interface PatientAppointmentRequestMedia {
  created_at: Generated<Timestamp>
  id: Generated<number>
  media_id: number
  patient_appointment_request_id: number
  updated_at: Generated<Timestamp>
}

export interface PatientAppointmentRequests {
  created_at: Generated<Timestamp>
  id: Generated<number>
  patient_id: number
  reason: string | null
  updated_at: Generated<Timestamp>
}

export interface PatientConditionMedications {
  created_at: Generated<Timestamp>
  id: Generated<number>
  manufactured_medication_id: number | null
  medication_id: number | null
  patient_condition_id: number
  route: string
  schedules: string[] | null
  special_instructions: string | null
  start_date: Timestamp
  strength: Numeric
  updated_at: Generated<Timestamp>
}

export interface PatientConditions {
  comorbidity_of_condition_id: number | null
  condition_id: string
  created_at: Generated<Timestamp>
  end_date: Timestamp | null
  id: Generated<number>
  patient_id: number
  start_date: Timestamp
  updated_at: Generated<Timestamp>
}

export interface PatientEncounterProviders {
  created_at: Generated<Timestamp>
  id: Generated<number>
  patient_encounter_id: number
  provider_id: number | null
  seen_at: Timestamp | null
  updated_at: Generated<Timestamp>
}

export interface PatientEncounters {
  appointment_id: number | null
  closed_at: Timestamp | null
  created_at: Generated<Timestamp>
  id: Generated<number>
  notes: string | null
  patient_id: number
  reason: EncounterReason
  updated_at: Generated<Timestamp>
}

export interface PatientGuardians {
  created_at: Generated<Timestamp>
  dependent_patient_id: number
  guardian_patient_id: number
  guardian_relation: GuardianRelation
  id: Generated<number>
  updated_at: Generated<Timestamp>
}

export interface PatientKin {
  created_at: Generated<Timestamp>
  id: Generated<number>
  next_of_kin_patient_id: number
  patient_id: number
  relationship: string
  updated_at: Generated<Timestamp>
}

export interface PatientMeasurements {
  created_at: Generated<Timestamp>
  encounter_id: number
  encounter_provider_id: number
  id: Generated<number>
  measurement_name: string
  patient_id: number
  updated_at: Generated<Timestamp>
  value: Numeric
}

export interface PatientNearestFacilities {
  nearest_facilities: Json | null
  patient_id: number | null
}

export interface PatientOccupations {
  created_at: Generated<Timestamp>
  id: Generated<number>
  job: Json | null
  patient_id: number
  school: Json | null
  updated_at: Generated<Timestamp>
}

export interface Patients {
  address_id: number | null
  avatar_media_id: number | null
  completed_intake: Generated<boolean>
  conversation_state: Generated<PatientConversationState>
  created_at: Generated<Timestamp>
  date_of_birth: Timestamp | null
  ethnicity: string | null
  gender: Gender | null
  id: Generated<number>
  location: string | null
  name: string | null
  national_id_number: string | null
  nearest_facility_id: number | null
  phone_number: string | null
  primary_doctor_id: number | null
  unregistered_primary_doctor_name: string | null
  updated_at: Generated<Timestamp>
}

export interface Provinces {
  country_id: number
  created_at: Generated<Timestamp>
  id: Generated<number>
  name: string
  updated_at: Generated<Timestamp>
}

export interface SpatialRefSys {
  auth_name: string | null
  auth_srid: number | null
  proj4text: string | null
  srid: number
  srtext: string | null
}

export interface Suburbs {
  created_at: Generated<Timestamp>
  id: Generated<number>
  name: string
  updated_at: Generated<Timestamp>
  ward_id: number
}

export interface WaitingRoom {
  created_at: Generated<Timestamp>
  facility_id: number
  id: Generated<number>
  patient_encounter_id: number
  updated_at: Generated<Timestamp>
}

export interface Wards {
  created_at: Generated<Timestamp>
  district_id: number
  id: Generated<number>
  name: string
  updated_at: Generated<Timestamp>
}

export interface WhatsappMessagesReceived {
  body: string | null
  conversation_state: Generated<PatientConversationState>
  created_at: Generated<Timestamp>
  error_commit_hash: string | null
  error_message: string | null
  has_media: Generated<boolean>
  id: Generated<number>
  media_id: number | null
  patient_id: number
  started_responding_at: Timestamp | null
  updated_at: Generated<Timestamp>
  whatsapp_id: string
}

export interface WhatsappMessagesSent {
  body: string
  created_at: Generated<Timestamp>
  id: Generated<number>
  patient_id: number
  read_status: string
  responding_to_id: number
  updated_at: Generated<Timestamp>
  whatsapp_id: string
}

export interface DB {
  address: Address
  allergies: Allergies
  appointment_health_worker_attendees: AppointmentHealthWorkerAttendees
  appointment_media: AppointmentMedia
  appointments: Appointments
  condition_icd10_codes: ConditionIcd10Codes
  conditions: Conditions
  countries: Countries
  districts: Districts
  drugs: Drugs
  employment: Employment
  facilities: Facilities
  geography_columns: GeographyColumns
  geometry_columns: GeometryColumns
  guardian_relations: GuardianRelations
  health_worker_google_tokens: HealthWorkerGoogleTokens
  health_worker_invitees: HealthWorkerInvitees
  health_workers: HealthWorkers
  icd10_codes: Icd10Codes
  mailing_list: MailingList
  manufactured_medications: ManufacturedMedications
  measurements: Measurements
  media: Media
  medications: Medications
  nurse_registration_details: NurseRegistrationDetails
  nurse_specialties: NurseSpecialties
  patient_age: PatientAge
  patient_allergies: PatientAllergies
  patient_appointment_offered_times: PatientAppointmentOfferedTimes
  patient_appointment_request_media: PatientAppointmentRequestMedia
  patient_appointment_requests: PatientAppointmentRequests
  patient_condition_medications: PatientConditionMedications
  patient_conditions: PatientConditions
  patient_encounter_providers: PatientEncounterProviders
  patient_encounters: PatientEncounters
  patient_guardians: PatientGuardians
  patient_kin: PatientKin
  patient_measurements: PatientMeasurements
  patient_nearest_facilities: PatientNearestFacilities
  patient_occupations: PatientOccupations
  patients: Patients
  provinces: Provinces
  spatial_ref_sys: SpatialRefSys
  suburbs: Suburbs
  waiting_room: WaitingRoom
  wards: Wards
  whatsapp_messages_received: WhatsappMessagesReceived
  whatsapp_messages_sent: WhatsappMessagesSent
}
type Buffer = Uint8Array
