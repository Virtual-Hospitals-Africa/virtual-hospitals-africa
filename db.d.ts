import type { ColumnType } from 'kysely'

export type AgeUnit = 'day' | 'month' | 'week' | 'year'

export type ChatbotName = 'patient' | 'pharmacist'

export type DoctorReviewStep =
  | 'clinical_notes'
  | 'diagnosis'
  | 'orders'
  | 'prescriptions'
  | 'referral'
  | 'revert'

export type EncounterReason =
  | 'appointment'
  | 'checkup'
  | 'emergency'
  | 'follow up'
  | 'maternity'
  | 'other'
  | 'referral'
  | 'seeking treatment'

export type EncounterStep =
  | 'clinical_notes'
  | 'close_visit'
  | 'diagnoses'
  | 'diagnostic_tests'
  | 'examinations'
  | 'general_assessments'
  | 'history'
  | 'orders'
  | 'prescriptions'
  | 'request_review'
  | 'symptoms'
  | 'vitals'

export type EntityType = 'health_worker' | 'regulator'

export type FamilyType =
  | '2 married parents'
  | 'Blended'
  | 'Child-headed'
  | 'Divorced'
  | 'Extended'
  | 'Grandparent-led'
  | 'Orphan'
  | 'Polygamous/Compound'
  | 'Single Parent'

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

export type Int8 = ColumnType<
  string,
  bigint | number | string,
  bigint | number | string
>

export type Json = JsonValue

export type JsonArray = JsonValue[]

export type JsonObject = {
  [K in string]?: JsonValue
}

export type JsonPrimitive = boolean | number | string | null

export type JsonValue = JsonArray | JsonObject | JsonPrimitive

export type MaritalStatus =
  | 'Co-habiting'
  | 'Divorced'
  | 'Married'
  | 'Never Married'
  | 'Separated'
  | 'Single'
  | 'Widowed'

export type NamePrefix = 'Dr' | 'Miss' | 'Mr' | 'Mrs' | 'Ms' | 'Sr'

export type Numeric = ColumnType<string, number | string, number | string>

export type PatientCohabitation =
  | 'Father'
  | 'Foster Parent'
  | 'Grandparent(s)'
  | 'Mother'
  | 'Orphanage'
  | 'Other Relative'
  | 'Sibling'
  | 'Uncle or Aunt'

export type PharmaciesTypes =
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

export type PharmacistType =
  | 'Dispensing Medical Practitioner'
  | 'Ind Clinic Nurse'
  | 'Pharmacist'
  | 'Pharmacy Technician'

export type Profession = 'admin' | 'doctor' | 'nurse'

export type Timestamp = ColumnType<Date, Date | string, Date | string>

export interface Addresses {
  administrative_area_level_1: string | null
  administrative_area_level_2: string | null
  country: string
  created_at: Generated<Timestamp>
  formatted: string
  id: Generated<string>
  locality: string | null
  postal_code: string | null
  route: string | null
  street: string | null
  street_number: string | null
  unit: string | null
  updated_at: Generated<Timestamp>
}

export interface AppointmentMedia {
  appointment_id: string
  created_at: Generated<Timestamp>
  id: Generated<string>
  media_id: string
  updated_at: Generated<Timestamp>
}

export interface AppointmentProviders {
  appointment_id: string
  confirmed: Generated<boolean>
  created_at: Generated<Timestamp>
  id: Generated<string>
  provider_id: string
  updated_at: Generated<Timestamp>
}

export interface Appointments {
  created_at: Generated<Timestamp>
  duration_minutes: number
  end: Timestamp
  gcal_event_id: string
  gcal_hangout_link: string | null
  id: Generated<string>
  patient_id: string
  reason: string
  start: Timestamp
  updated_at: Generated<Timestamp>
}

export interface ConditionIcd10Codes {
  condition_id: string
  icd10_code: string
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

export interface Consumables {
  created_at: Generated<Timestamp>
  id: Generated<string>
  is_medication: boolean | null
  name: string
  updated_at: Generated<Timestamp>
}

export interface Consumption {
  created_at: Generated<Timestamp>
  created_by: string
  id: Generated<string>
  organization_id: string
  procurement_id: string
  quantity: number
  updated_at: Generated<Timestamp>
}

export interface Countries {
  full_name: string
  iso_3166: string
}

export interface DepartmentEmployment {
  created_at: Generated<Timestamp>
  department_id: string
  employment_id: string
  id: Generated<string>
  updated_at: Generated<Timestamp>
}

export interface DeviceCapabilities {
  created_at: Generated<Timestamp>
  device_id: string
  diagnostic_test: string
  id: Generated<string>
  updated_at: Generated<Timestamp>
}

export interface Devices {
  created_at: Generated<Timestamp>
  id: Generated<string>
  manufacturer: string
  name: string
  updated_at: Generated<Timestamp>
}

export interface Diagnoses {
  created_at: Generated<Timestamp>
  doctor_review_id: string | null
  id: Generated<string>
  patient_condition_id: string
  patient_encounter_id: string | null
  provider_id: string
  updated_at: Generated<Timestamp>
}

export interface DiagnosesCollaboration {
  approver_id: string
  created_at: Generated<Timestamp>
  diagnosis_id: string
  disagree_reason: string | null
  id: Generated<string>
  is_approved: boolean
  updated_at: Generated<Timestamp>
}

export interface DoctorRegistrationDetails {
  address_id: string | null
  approved_by: string | null
  created_at: Generated<Timestamp>
  date_of_birth: Timestamp
  date_of_first_practice: Timestamp
  doctor_practicing_cert_media_id: string | null
  face_picture_media_id: string | null
  gender: Gender
  health_worker_id: string
  id: Generated<string>
  mobile_number: string
  national_id_media_id: string | null
  national_id_number: string
  ncz_registration_card_media_id: string | null
  ncz_registration_number: string
  updated_at: Generated<Timestamp>
}

export interface DoctorRegistrationDetailsInProgress {
  created_at: Generated<Timestamp>
  data: Generated<Json>
  health_worker_id: string
  id: Generated<string>
  updated_at: Generated<Timestamp>
}

export interface DoctorReview {
  order: Int8
  step: DoctorReviewStep
}

export interface DoctorReviewRequests {
  created_at: Generated<Timestamp>
  doctor_id: string | null
  encounter_id: string
  id: Generated<string>
  organization_id: string | null
  patient_id: string
  requested_by: string
  requester_notes: string | null
  updated_at: Generated<Timestamp>
}

export interface DoctorReviews {
  completed_at: Timestamp | null
  created_at: Generated<Timestamp>
  encounter_id: string
  id: Generated<string>
  patient_id: string
  requested_by: string
  requester_notes: string | null
  reviewer_id: string
  reviewer_notes: string | null
  updated_at: Generated<Timestamp>
}

export interface DoctorReviewSteps {
  created_at: Generated<Timestamp>
  doctor_review_id: string
  id: Generated<string>
  step: DoctorReviewStep
  updated_at: Generated<Timestamp>
}

export interface Drugs {
  created_at: Generated<Timestamp>
  generic_name: string
  id: Generated<string>
  updated_at: Generated<Timestamp>
}

export interface Employment {
  created_at: Generated<Timestamp>
  health_worker_id: string
  id: Generated<string>
  organization_id: string
  profession: Profession
  specialty: string | null
  updated_at: Generated<Timestamp>
}

export interface Encounter {
  order: Int8
  step: EncounterStep
}

export interface EventListeners {
  backoff_until: Timestamp | null
  created_at: Generated<Timestamp>
  error_count: Generated<number>
  error_message: string | null
  event_id: string
  id: Generated<string>
  listener_name: string
  processed_at: Timestamp | null
  updated_at: Generated<Timestamp>
}

export interface Events {
  created_at: Generated<Timestamp>
  data: Json
  error_message_no_automated_retry: string | null
  id: Generated<string>
  listeners_inserted_at: Timestamp | null
  type: string
  updated_at: Generated<Timestamp>
}

export interface Examinations {
  display_name: string
  encounter_step: EncounterStep
  identifier: string
  order: number
  path: string
  slug: string
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

export interface GoogleTokens {
  access_token: string
  created_at: Generated<Timestamp>
  entity_id: string
  entity_type: EntityType
  expires_at: Timestamp
  id: Generated<string>
  refresh_token: string
  updated_at: Generated<Timestamp>
}

export interface GuardianRelations {
  dependent: string
  female_dependent: string | null
  female_guardian: string | null
  guardian: GuardianRelation
  male_dependent: string | null
  male_guardian: string | null
}

export interface HealthWorkerInvitees {
  created_at: Generated<Timestamp>
  email: string
  id: Generated<string>
  organization_id: string
  profession: Profession
  updated_at: Generated<Timestamp>
}

export interface HealthWorkers {
  avatar_url: string
  created_at: Generated<Timestamp>
  email: string
  id: Generated<string>
  name: string
  updated_at: Generated<Timestamp>
}

export interface HealthWorkerWebNotifications {
  action_href: string
  action_title: string
  avatar_url: string
  created_at: Generated<Timestamp>
  description: string
  health_worker_id: string
  id: Generated<string>
  notification_type: string
  row_id: string
  seen_at: Timestamp | null
  table_name: string
  title: string
  updated_at: Generated<Timestamp>
}

export interface Icd10Categories {
  category: string
  description: string
  section: string
}

export interface Icd10Codes {
  code: string
  created_at: Generated<Timestamp>
  name: string
  updated_at: Generated<Timestamp>
}

export interface Icd10Diagnoses {
  category: string
  code: string
  description: string
  description_vector: string
  general: Generated<boolean>
  parent_code: string | null
}

export interface Icd10DiagnosesExcludes {
  code: string
  id: Generated<string>
  note: string
  pure: boolean
}

export interface Icd10DiagnosesExcludesCategories {
  category: string
  exclude_id: string
  id: Generated<string>
}

export interface Icd10DiagnosesExcludesCodeRanges {
  code_range_end: string
  code_range_end_dash: Generated<boolean>
  code_range_start: string
  code_range_start_dash: Generated<boolean>
  exclude_id: string
  id: Generated<string>
}

export interface Icd10DiagnosesExcludesCodes {
  code: string
  dash: Generated<boolean>
  exclude_id: string
  id: Generated<string>
}

export interface Icd10DiagnosesIncludes {
  code: string
  id: Generated<string>
  note: string
  note_vector: string
  sourced_from_index: boolean
}

export interface Icd10Sections {
  description: string
  section: string
}

export interface MailingList {
  created_at: Generated<Timestamp>
  email: string
  entrypoint: string
  id: Generated<string>
  interest: string | null
  message: string | null
  name: string
  support: string | null
  updated_at: Generated<Timestamp>
}

export interface ManufacturedMedicationAvailabilities {
  country: string
  created_at: Generated<Timestamp>
  id: Generated<string>
  manufactured_medication_id: string
  updated_at: Generated<Timestamp>
}

export interface ManufacturedMedicationRecalls {
  created_at: Generated<Timestamp>
  id: Generated<string>
  manufactured_medication_id: string
  recalled_at: Timestamp
  recalled_by: string
  updated_at: Generated<Timestamp>
}

export interface ManufacturedMedications {
  applicant_name: string
  created_at: Generated<Timestamp>
  id: Generated<string>
  manufacturer_name: string
  medication_id: string
  strength_numerators: number[]
  trade_name: string
  updated_at: Generated<Timestamp>
}

export interface ManufacturedMedicationStrengths {
  consumable_id: string
  created_at: Generated<Timestamp>
  id: Generated<string>
  manufactured_medication_id: string
  strength_numerator: number
  updated_at: Generated<Timestamp>
}

export interface Measurements {
  name: string
  units: string
}

export interface Media {
  binary_data: Buffer
  created_at: Generated<Timestamp>
  id: Generated<string>
  mime_type: string
  updated_at: Generated<Timestamp>
  uuid: Generated<string>
}

export interface Medications {
  created_at: Generated<Timestamp>
  drug_id: string
  form: string
  form_route: Generated<string>
  id: Generated<string>
  routes: string[]
  strength_denominator: Numeric
  strength_denominator_is_units: Generated<boolean>
  strength_denominator_unit: string
  strength_numerator_unit: string
  strength_numerators: number[]
  updated_at: Generated<Timestamp>
}

export interface MessageReads {
  created_at: Generated<Timestamp>
  id: Generated<string>
  message_id: string
  participant_id: string
  updated_at: Generated<Timestamp>
}

export interface Messages {
  body: string
  created_at: Generated<Timestamp>
  id: Generated<string>
  is_from_system: Generated<boolean>
  sender_id: string | null
  thread_id: string
  updated_at: Generated<Timestamp>
}

export interface MessageThreadParticipants {
  created_at: Generated<Timestamp>
  id: Generated<string>
  row_id: string
  table_name: string
  thread_id: string
  updated_at: Generated<Timestamp>
}

export interface MessageThreads {
  created_at: Generated<Timestamp>
  id: Generated<string>
  updated_at: Generated<Timestamp>
}

export interface MessageThreadSubjects {
  created_at: Generated<Timestamp>
  id: Generated<string>
  row_id: string
  table_name: string
  thread_id: string
  updated_at: Generated<Timestamp>
}

export interface NurseRegistrationDetails {
  address_id: string | null
  approved_by: string | null
  created_at: Generated<Timestamp>
  date_of_birth: Timestamp
  date_of_first_practice: Timestamp
  face_picture_media_id: string | null
  gender: Gender
  health_worker_id: string
  id: Generated<string>
  mobile_number: string | null
  national_id_media_id: string | null
  national_id_number: string
  ncz_registration_card_media_id: string | null
  ncz_registration_number: string
  nurse_practicing_cert_media_id: string | null
  updated_at: Generated<Timestamp>
}

export interface NurseRegistrationDetailsInProgress {
  created_at: Generated<Timestamp>
  data: Generated<Json>
  health_worker_id: string
  id: Generated<string>
  updated_at: Generated<Timestamp>
}

export interface OrganizationConsumables {
  consumable_id: string
  created_at: Generated<Timestamp>
  id: Generated<string>
  organization_id: string
  quantity_on_hand: number
  updated_at: Generated<Timestamp>
}

export interface OrganizationDepartments {
  accepts_patients: Generated<boolean>
  address_id: string | null
  created_at: Generated<Timestamp>
  id: Generated<string>
  inactive_reason: string | null
  location: string | null
  name: string
  organization_id: string
  updated_at: Generated<Timestamp>
}

export interface OrganizationDevices {
  created_at: Generated<Timestamp>
  created_by: string
  device_id: string
  id: Generated<string>
  organization_id: string
  serial_number: string | null
  updated_at: Generated<Timestamp>
  updated_by: string | null
}

export interface Organizations {
  address_id: string | null
  category: string | null
  created_at: Generated<Timestamp>
  id: Generated<string>
  inactive_reason: string | null
  is_test: Generated<boolean>
  location: string | null
  name: string
  updated_at: Generated<Timestamp>
}

export interface PatientAge {
  age: string | null
  age_display: string | null
  age_number: number | null
  age_unit: AgeUnit | null
  age_years: Numeric | null
  patient_id: string | null
}

export interface PatientAllergies {
  created_at: Generated<Timestamp>
  id: Generated<string>
  patient_id: string
  snomed_concept_id: Int8
  updated_at: Generated<Timestamp>
}

export interface PatientAppointmentOfferedTimes {
  created_at: Generated<Timestamp>
  declined: Generated<boolean>
  duration_minutes: number
  end: Timestamp
  id: Generated<string>
  patient_appointment_request_id: string
  provider_id: string
  start: Timestamp
  updated_at: Generated<Timestamp>
}

export interface PatientAppointmentRequestMedia {
  created_at: Generated<Timestamp>
  id: Generated<string>
  media_id: string
  patient_appointment_request_id: string
  updated_at: Generated<Timestamp>
}

export interface PatientAppointmentRequests {
  created_at: Generated<Timestamp>
  id: Generated<string>
  patient_id: string
  reason: string | null
  updated_at: Generated<Timestamp>
}

export interface PatientChatbotUsers {
  conversation_state: string
  created_at: Generated<Timestamp>
  data: Json
  entity_id: string | null
  id: Generated<string>
  phone_number: string
  updated_at: Generated<Timestamp>
}

export interface PatientChatbotUserWhatsappMessagesReceived {
  chatbot_user_id: string
  conversation_state: string
  created_at: Generated<Timestamp>
  id: Generated<string>
  updated_at: Generated<Timestamp>
  whatsapp_message_received_id: string
}

export interface PatientConditionMedications {
  created_at: Generated<Timestamp>
  id: Generated<string>
  manufactured_medication_id: string | null
  medication_id: string | null
  patient_condition_id: string
  route: string
  schedules: string[] | null
  special_instructions: string | null
  start_date: Timestamp | null
  strength: Numeric
  updated_at: Generated<Timestamp>
}

export interface PatientConditions {
  comorbidity_of_condition_id: string | null
  condition_id: string
  created_at: Generated<Timestamp>
  end_date: Timestamp | null
  id: Generated<string>
  patient_examination_id: string | null
  patient_id: string
  start_date: Timestamp
  updated_at: Generated<Timestamp>
}

export interface PatientEncounterProviders {
  created_at: Generated<Timestamp>
  id: Generated<string>
  patient_encounter_id: string
  provider_id: string
  seen_at: Timestamp | null
  updated_at: Generated<Timestamp>
}

export interface PatientEncounters {
  appointment_id: string | null
  closed_at: Timestamp | null
  created_at: Generated<Timestamp>
  id: Generated<string>
  location: string
  notes: string | null
  patient_id: string
  reason: EncounterReason
  updated_at: Generated<Timestamp>
}

export interface PatientEncounterSteps {
  created_at: Generated<Timestamp>
  encounter_step: EncounterStep
  id: Generated<string>
  patient_encounter_id: string
  updated_at: Generated<Timestamp>
}

export interface PatientExaminationFindingBodySites {
  created_at: Generated<Timestamp>
  id: Generated<string>
  patient_examination_finding_id: string
  snomed_concept_id: Int8
  updated_at: Generated<Timestamp>
}

export interface PatientExaminationFindings {
  additional_notes: string | null
  created_at: Generated<Timestamp>
  id: Generated<string>
  patient_examination_id: string
  snomed_concept_id: Int8
  updated_at: Generated<Timestamp>
}

export interface PatientExaminations {
  completed: Generated<boolean>
  created_at: Generated<Timestamp>
  encounter_id: string
  encounter_provider_id: string
  examination_identifier: string
  id: Generated<string>
  ordered: Generated<boolean>
  patient_id: string
  skipped: Generated<boolean>
  updated_at: Generated<Timestamp>
}

export interface PatientFamily {
  created_at: Generated<Timestamp>
  family_type: FamilyType | null
  id: Generated<string>
  marital_status: MaritalStatus | null
  patient_cohabitation: PatientCohabitation | null
  patient_id: string
  religion: string | null
  updated_at: Generated<Timestamp>
}

export interface PatientGuardians {
  created_at: Generated<Timestamp>
  dependent_patient_id: string
  guardian_patient_id: string
  guardian_relation: GuardianRelation
  id: Generated<string>
  updated_at: Generated<Timestamp>
}

export interface PatientIntake {
  being_taken_by: string
  created_at: Generated<Timestamp>
  id: Generated<string>
  organization_id: string
  patient_id: string
  updated_at: Generated<Timestamp>
}

export interface PatientIntakeVisitReason {
  created_at: Generated<Timestamp>
  department_id: string
  emergency: Generated<boolean>
  id: Generated<string>
  notes: string | null
  patient_intake_id: string
  reason: EncounterReason
  updated_at: Generated<Timestamp>
}

export interface PatientKin {
  created_at: Generated<Timestamp>
  id: Generated<string>
  next_of_kin_patient_id: string
  patient_id: string
  relationship: string
  updated_at: Generated<Timestamp>
}

export interface PatientLifestyle {
  alcohol: Json | null
  created_at: Generated<Timestamp>
  diet: Json | null
  exercise: Json | null
  id: Generated<string>
  patient_id: string
  sexual_activity: Json | null
  smoking: Json | null
  substance_use: Json | null
  updated_at: Generated<Timestamp>
}

export interface PatientMeasurements {
  created_at: Generated<Timestamp>
  encounter_id: string
  encounter_provider_id: string
  id: Generated<string>
  is_flagged: Generated<boolean | null>
  measurement_name: string
  patient_id: string
  updated_at: Generated<Timestamp>
  value: Numeric
}

export interface PatientNearestFacilities {
  nearest_facilities: Json | null
  patient_id: string | null
}

export interface PatientObservations {
  created_at: Generated<Timestamp>
  encounter_id: string
  encounter_provider_id: string
  id: Generated<string>
  observation_type: string
  patient_id: string
  snomed_concept_id: Int8
  updated_at: Generated<Timestamp>
  value: Json | null
}

export interface PatientOccupations {
  created_at: Generated<Timestamp>
  id: Generated<string>
  occupation: Json | null
  patient_id: string
  updated_at: Generated<Timestamp>
}

export interface Patients {
  address_id: string | null
  avatar_media_id: string | null
  completed_intake: Generated<boolean>
  created_at: Generated<Timestamp>
  date_of_birth: Timestamp | null
  ethnicity: string | null
  first_language: string | null
  gender: Gender | null
  id: Generated<string>
  location: string | null
  name: string
  national_id_number: string | null
  nearest_organization_id: string | null
  phone_number: string | null
  primary_doctor_id: string | null
  unregistered_primary_doctor_name: string | null
  updated_at: Generated<Timestamp>
}

export interface PatientSymptomMedia {
  created_at: Generated<Timestamp>
  id: Generated<string>
  media_id: string
  patient_symptom_id: string
  updated_at: Generated<Timestamp>
}

export interface PatientSymptoms {
  code: string
  created_at: Generated<Timestamp>
  encounter_id: string
  encounter_provider_id: string
  end_date: Timestamp | null
  id: Generated<string>
  notes: string | null
  patient_id: string
  severity: number
  start_date: Timestamp
  updated_at: Generated<Timestamp>
}

export interface Pharmacies {
  address: string | null
  country: string
  created_at: Generated<Timestamp>
  expiry_date: Timestamp
  id: Generated<string>
  licence_number: string
  licensee: string
  name: string
  pharmacies_types: PharmaciesTypes
  town: string | null
  updated_at: Generated<Timestamp>
}

export interface PharmacistChatbotUsers {
  conversation_state: string
  created_at: Generated<Timestamp>
  data: Json
  entity_id: string | null
  id: Generated<string>
  phone_number: string
  updated_at: Generated<Timestamp>
}

export interface PharmacistChatbotUserWhatsappMessagesReceived {
  chatbot_user_id: string
  conversation_state: string
  created_at: Generated<Timestamp>
  id: Generated<string>
  updated_at: Generated<Timestamp>
  whatsapp_message_received_id: string
}

export interface Pharmacists {
  address: string | null
  country: string
  created_at: Generated<Timestamp>
  expiry_date: Timestamp
  family_name: string
  given_name: string
  id: Generated<string>
  licence_number: string
  pharmacist_type: PharmacistType
  prefix: NamePrefix | null
  revoked_at: Timestamp | null
  revoked_by: string | null
  town: string | null
  updated_at: Generated<Timestamp>
}

export interface PharmacyEmployment {
  created_at: Generated<Timestamp>
  id: Generated<string>
  is_supervisor: boolean
  pharmacist_id: string
  pharmacy_id: string
  updated_at: Generated<Timestamp>
}

export interface PrescriptionCodes {
  alphanumeric_code: Generated<string>
  created_at: Generated<Timestamp>
  id: Generated<string>
  prescription_id: string
  updated_at: Generated<Timestamp>
}

export interface PrescriptionMedications {
  created_at: Generated<Timestamp>
  id: Generated<string>
  patient_condition_medication_id: string
  prescription_id: string
  updated_at: Generated<Timestamp>
}

export interface PrescriptionMedicationsFilled {
  created_at: Generated<Timestamp>
  id: Generated<string>
  pharmacist_id: string
  pharmacy_id: string | null
  prescription_medication_id: string
  updated_at: Generated<Timestamp>
}

export interface Prescriptions {
  created_at: Generated<Timestamp>
  doctor_review_id: string | null
  id: Generated<string>
  patient_encounter_id: string | null
  patient_id: string
  prescriber_id: string
  updated_at: Generated<Timestamp>
}

export interface Procurement {
  batch_number: string | null
  consumable_id: string
  consumed_amount: Generated<number>
  container_size: number
  created_at: Generated<Timestamp>
  created_by: string
  expiry_date: Timestamp | null
  id: Generated<string>
  number_of_containers: number
  organization_id: string
  procured_from: string
  quantity: number
  updated_at: Generated<Timestamp>
}

export interface Procurers {
  created_at: Generated<Timestamp>
  id: Generated<string>
  name: string
  updated_at: Generated<Timestamp>
}

export interface ProviderCalendars {
  availability_set: Generated<boolean>
  created_at: Generated<Timestamp>
  gcal_appointments_calendar_id: string
  gcal_availability_calendar_id: string
  health_worker_id: string
  id: Generated<string>
  organization_id: string
  updated_at: Generated<Timestamp>
}

export interface Regulators {
  avatar_url: string | null
  country: string
  created_at: Generated<Timestamp>
  email: string
  id: Generated<string>
  name: string
  updated_at: Generated<Timestamp>
}

export interface Sessions {
  created_at: Generated<Timestamp>
  entity_id: string
  entity_type: EntityType
  id: Generated<string>
  updated_at: Generated<Timestamp>
}

export interface SnomedCciRefsetRefsetDescriptor {
  active: boolean
  attribute_description: Int8
  attribute_order: Int8
  attribute_type: Int8
  effective_time: Timestamp
  id: string
  module_id: Int8
  referenced_component_id: Int8
  refset_id: Int8
}

export interface SnomedCiRefsetDescriptionType {
  active: boolean
  description_format: Int8
  description_length: Int8
  effective_time: Timestamp
  id: string
  module_id: Int8
  referenced_component_id: Int8
  refset_id: Int8
}

export interface SnomedCissccRefsetMrcmAttributeDomain {
  active: boolean
  attribute_cardinality: string
  attribute_in_group_cardinality: string
  content_type_id: Int8
  domain_id: Int8
  effective_time: Timestamp
  grouped: boolean
  id: string
  module_id: Int8
  referenced_component_id: Int8
  refset_id: Int8
  rule_strength_id: Int8
}

export interface SnomedConcept {
  active: boolean
  definition_status_id: Int8
  effective_time: Timestamp
  id: Int8
  module_id: Int8
}

export interface SnomedCRefsetAssociation {
  active: boolean
  effective_time: Timestamp
  id: string
  module_id: Int8
  referenced_component_id: Int8
  refset_id: Int8
  target_component_id: Int8
}

export interface SnomedCRefsetAttributeValue {
  active: boolean
  effective_time: Timestamp
  id: string
  module_id: Int8
  referenced_component_id: Int8
  refset_id: Int8
  value_id: Int8
}

export interface SnomedCRefsetLanguage {
  acceptability_id: Int8
  active: boolean
  effective_time: Timestamp
  id: string
  module_id: Int8
  referenced_component_id: Int8
  refset_id: Int8
}

export interface SnomedCRefsetMrcmModuleScope {
  active: boolean
  effective_time: Timestamp
  id: string
  module_id: Int8
  mrcm_rule_refset_id: Int8
  referenced_component_id: Int8
  refset_id: Int8
}

export interface SnomedDescription {
  active: boolean
  case_significance_id: Int8
  concept_id: Int8
  effective_time: Timestamp
  id: Int8
  language_code: string
  module_id: Int8
  term: string
  type_id: Int8
}

export interface SnomedIisssccRefsetExtendedMap {
  active: boolean
  correlation_id: Int8
  effective_time: Timestamp
  id: string
  map_advice: string | null
  map_category_id: Int8
  map_group: Int8
  map_priority: Int8
  map_rule: string | null
  map_target: string | null
  module_id: Int8
  referenced_component_id: Int8
  refset_id: Int8
}

export interface SnomedRefsetSimple {
  active: boolean
  effective_time: Timestamp
  id: string
  module_id: Int8
  referenced_component_id: Int8
  refset_id: Int8
}

export interface SnomedRelationship {
  active: boolean
  characteristic_type_id: Int8
  destination_id: Int8
  effective_time: Timestamp
  id: Int8
  modifier_id: Int8
  module_id: Int8
  relationship_group: Int8
  source_id: Int8
  type_id: Int8
}

export interface SnomedRelationshipConcreteValues {
  active: boolean
  characteristic_type_id: Int8
  effective_time: Timestamp
  id: Int8
  modifier_id: Int8
  module_id: Int8
  relationship_group: Int8
  source_id: Int8
  type_id: Int8
  value: string
}

export interface SnomedSRefsetOwlExpression {
  active: boolean
  effective_time: Timestamp
  id: string
  module_id: Int8
  owl_expression: string
  referenced_component_id: Int8
  refset_id: Int8
}

export interface SnomedSRefsetSimpleMap {
  active: boolean
  effective_time: Timestamp
  id: string
  map_target: string
  module_id: Int8
  referenced_component_id: Int8
  refset_id: Int8
}

export interface SnomedSsccRefsetMrcmAttributeRange {
  active: boolean
  attribute_rule: string
  content_type_id: Int8
  effective_time: Timestamp
  id: string
  module_id: Int8
  range_constraint: string
  referenced_component_id: Int8
  refset_id: Int8
  rule_strength_id: Int8
}

export interface SnomedSsRefsetModuleDependency {
  active: boolean
  effective_time: Timestamp
  id: string
  module_id: Int8
  referenced_component_id: Int8
  refset_id: Int8
  source_effective_time: Timestamp
  target_effective_time: Timestamp
}

export interface SnomedSssssssRefsetMrcmDomain {
  active: boolean
  domain_constraint: string
  domain_template_for_postcoordination: string
  domain_template_for_precoordination: string
  effective_time: Timestamp
  guide_url: string | null
  id: string
  module_id: Int8
  parent_domain: string | null
  proximal_primitive_constraint: string
  proximal_primitive_refinement: string | null
  referenced_component_id: Int8
  refset_id: Int8
}

export interface SnomedStatedRelationship {
  active: boolean
  characteristic_type_id: Int8
  destination_id: Int8
  effective_time: Timestamp
  id: Int8
  modifier_id: Int8
  module_id: Int8
  relationship_group: Int8
  source_id: Int8
  type_id: Int8
}

export interface SnomedTextDefinition {
  active: boolean
  case_significance_id: Int8
  concept_id: Int8
  effective_time: Timestamp
  id: Int8
  language_code: string
  module_id: Int8
  term: string
  type_id: Int8
}

export interface SpatialRefSys {
  auth_name: string | null
  auth_srid: number | null
  proj4text: string | null
  srid: number
  srtext: string | null
}

export interface TigerAddr {
  arid: string | null
  fromarmid: number | null
  fromhn: string | null
  fromtyp: string | null
  gid: Generated<number>
  mtfcc: string | null
  plus4: string | null
  side: string | null
  statefp: string | null
  tlid: Int8 | null
  toarmid: number | null
  tohn: string | null
  totyp: string | null
  zip: string | null
}

export interface TigerAddrfeat {
  aridl: string | null
  aridr: string | null
  edge_mtfcc: string | null
  fullname: string | null
  gid: Generated<number>
  lfromhn: string | null
  lfromtyp: string | null
  linearid: string | null
  ltohn: string | null
  ltotyp: string | null
  offsetl: string | null
  offsetr: string | null
  parityl: string | null
  parityr: string | null
  plus4l: string | null
  plus4r: string | null
  rfromhn: string | null
  rfromtyp: string | null
  rtohn: string | null
  rtotyp: string | null
  statefp: string
  the_geom: string | null
  tlid: Int8 | null
  zipl: string | null
  zipr: string | null
}

export interface TigerBg {
  aland: number | null
  awater: number | null
  bg_id: string
  blkgrpce: string | null
  countyfp: string | null
  funcstat: string | null
  gid: Generated<number>
  intptlat: string | null
  intptlon: string | null
  mtfcc: string | null
  namelsad: string | null
  statefp: string | null
  the_geom: string | null
  tractce: string | null
}

export interface TigerCounty {
  aland: Int8 | null
  awater: number | null
  cbsafp: string | null
  classfp: string | null
  cntyidfp: string
  countyfp: string | null
  countyns: string | null
  csafp: string | null
  funcstat: string | null
  gid: Generated<number>
  intptlat: string | null
  intptlon: string | null
  lsad: string | null
  metdivfp: string | null
  mtfcc: string | null
  name: string | null
  namelsad: string | null
  statefp: string | null
  the_geom: string | null
}

export interface TigerCountyLookup {
  co_code: number
  name: string | null
  st_code: number
  state: string | null
}

export interface TigerCountysubLookup {
  co_code: number
  county: string | null
  cs_code: number
  name: string | null
  st_code: number
  state: string | null
}

export interface TigerCousub {
  aland: Numeric | null
  awater: Numeric | null
  classfp: string | null
  cnectafp: string | null
  cosbidfp: string
  countyfp: string | null
  cousubfp: string | null
  cousubns: string | null
  funcstat: string | null
  gid: Generated<number>
  intptlat: string | null
  intptlon: string | null
  lsad: string | null
  mtfcc: string | null
  name: string | null
  namelsad: string | null
  nctadvfp: string | null
  nectafp: string | null
  statefp: string | null
  the_geom: string | null
}

export interface TigerDirectionLookup {
  abbrev: string | null
  name: string
}

export interface TigerEdges {
  artpath: string | null
  countyfp: string | null
  deckedroad: string | null
  divroad: string | null
  exttyp: string | null
  featcat: string | null
  fullname: string | null
  gcseflg: string | null
  gid: Generated<number>
  hydroflg: string | null
  lfromadd: string | null
  ltoadd: string | null
  mtfcc: string | null
  offsetl: string | null
  offsetr: string | null
  olfflg: string | null
  passflg: string | null
  persist: string | null
  railflg: string | null
  rfromadd: string | null
  roadflg: string | null
  rtoadd: string | null
  smid: string | null
  statefp: string | null
  tfidl: Numeric | null
  tfidr: Numeric | null
  the_geom: string | null
  tlid: Int8 | null
  tnidf: Numeric | null
  tnidt: Numeric | null
  ttyp: string | null
  zipl: string | null
  zipr: string | null
}

export interface TigerFaces {
  aiannhce: string | null
  aiannhce00: string | null
  aiannhfp: string | null
  aiannhfp00: string | null
  anrcfp: string | null
  anrcfp00: string | null
  atotal: number | null
  blkgrpce: string | null
  blkgrpce00: string | null
  blkgrpce20: string | null
  blockce: string | null
  blockce00: string | null
  blockce20: string | null
  cbsafp: string | null
  cd108fp: string | null
  cd111fp: string | null
  cnectafp: string | null
  comptyp: string | null
  comptyp00: string | null
  conctyfp: string | null
  conctyfp00: string | null
  countyfp: string | null
  countyfp00: string | null
  countyfp20: string | null
  cousubfp: string | null
  cousubfp00: string | null
  csafp: string | null
  elsdlea: string | null
  elsdlea00: string | null
  gid: Generated<number>
  intptlat: string | null
  intptlon: string | null
  lwflag: string | null
  metdivfp: string | null
  nctadvfp: string | null
  nectafp: string | null
  offset: string | null
  placefp: string | null
  placefp00: string | null
  puma5ce: string | null
  puma5ce00: string | null
  scsdlea: string | null
  scsdlea00: string | null
  sldlst: string | null
  sldlst00: string | null
  sldust: string | null
  sldust00: string | null
  statefp: string | null
  statefp00: string | null
  statefp20: string | null
  submcdfp: string | null
  submcdfp00: string | null
  tazce: string | null
  tazce00: string | null
  tblkgpce: string | null
  tfid: Numeric | null
  the_geom: string | null
  tractce: string | null
  tractce00: string | null
  tractce20: string | null
  trsubce: string | null
  trsubce00: string | null
  trsubfp: string | null
  trsubfp00: string | null
  ttractce: string | null
  uace: string | null
  uace00: string | null
  ugace: string | null
  ugace00: string | null
  unsdlea: string | null
  unsdlea00: string | null
  vtdst: string | null
  vtdst00: string | null
  zcta5ce: string | null
  zcta5ce00: string | null
}

export interface TigerFeatnames {
  fullname: string | null
  gid: Generated<number>
  linearid: string | null
  mtfcc: string | null
  name: string | null
  paflag: string | null
  predir: string | null
  predirabrv: string | null
  prequal: string | null
  prequalabr: string | null
  pretyp: string | null
  pretypabrv: string | null
  statefp: string | null
  sufdir: string | null
  sufdirabrv: string | null
  sufqual: string | null
  sufqualabr: string | null
  suftyp: string | null
  suftypabrv: string | null
  tlid: Int8 | null
}

export interface TigerGeocodeSettings {
  category: string | null
  name: string
  setting: string | null
  short_desc: string | null
  unit: string | null
}

export interface TigerGeocodeSettingsDefault {
  category: string | null
  name: string
  setting: string | null
  short_desc: string | null
  unit: string | null
}

export interface TigerLoaderLookuptables {
  /**
   * List of columns to exclude as an array. This is excluded from both input table and output table and rest of columns remaining are assumed to be in same order in both tables. gid, geoid,cpi,suffix1ce are excluded if no columns are specified.
   */
  columns_exclude: string[] | null
  insert_mode: Generated<string>
  level_county: Generated<boolean>
  /**
   * These are tables that contain all data for the whole US so there is just a single file
   */
  level_nation: Generated<boolean>
  level_state: Generated<boolean>
  /**
   * Whether or not to load the table.  For states and zcta5 (you may just want to download states10, zcta510 nationwide file manually) load your own into a single table that inherits from tiger.states, tiger.zcta5.  You'll get improved performance for some geocoding cases.
   */
  load: Generated<boolean>
  /**
   * This is the table name to inherit from and suffix of resulting output table -- how the table will be named --  edges here would mean -- ma_edges , pa_edges etc. except in the case of national tables. national level tables have no prefix
   */
  lookup_name: string
  post_load_process: string | null
  pre_load_process: string | null
  process_order: Generated<number>
  single_geom_mode: Generated<boolean | null>
  single_mode: Generated<boolean>
  /**
   * suffix of the tables to load e.g.  edges would load all tables like *edges.dbf(shp)  -- so tl_2010_42129_edges.dbf .
   */
  table_name: string | null
  /**
   * Path to use for wget instead of that specified in year table.  Needed currently for zcta where they release that only for 2000 and 2010
   */
  website_root_override: string | null
}

export interface TigerLoaderPlatform {
  county_process_command: string | null
  declare_sect: string | null
  environ_set_command: string | null
  loader: string | null
  os: string
  path_sep: string | null
  pgbin: string | null
  psql: string | null
  unzip_command: string | null
  wget: string | null
}

export interface TigerLoaderVariables {
  data_schema: string | null
  staging_fold: string | null
  staging_schema: string | null
  tiger_year: string
  website_root: string | null
}

export interface TigerPagcGaz {
  id: Generated<number>
  is_custom: Generated<boolean>
  seq: number | null
  stdword: string | null
  token: number | null
  word: string | null
}

export interface TigerPagcLex {
  id: Generated<number>
  is_custom: Generated<boolean>
  seq: number | null
  stdword: string | null
  token: number | null
  word: string | null
}

export interface TigerPagcRules {
  id: Generated<number>
  is_custom: Generated<boolean | null>
  rule: string | null
}

export interface TigerPlace {
  aland: Int8 | null
  awater: Int8 | null
  classfp: string | null
  cpi: string | null
  funcstat: string | null
  gid: Generated<number>
  intptlat: string | null
  intptlon: string | null
  lsad: string | null
  mtfcc: string | null
  name: string | null
  namelsad: string | null
  pcicbsa: string | null
  pcinecta: string | null
  placefp: string | null
  placens: string | null
  plcidfp: string
  statefp: string | null
  the_geom: string | null
}

export interface TigerPlaceLookup {
  name: string | null
  pl_code: number
  st_code: number
  state: string | null
}

export interface TigerSecondaryUnitLookup {
  abbrev: string | null
  name: string
}

export interface TigerState {
  aland: Int8 | null
  awater: Int8 | null
  division: string | null
  funcstat: string | null
  gid: Generated<number>
  intptlat: string | null
  intptlon: string | null
  lsad: string | null
  mtfcc: string | null
  name: string | null
  region: string | null
  statefp: string
  statens: string | null
  stusps: string
  the_geom: string | null
}

export interface TigerStateLookup {
  abbrev: string | null
  name: string | null
  st_code: number
  statefp: string | null
}

export interface TigerStreetTypeLookup {
  abbrev: string | null
  is_hw: Generated<boolean>
  name: string
}

export interface TigerTabblock {
  aland: number | null
  awater: number | null
  blockce: string | null
  countyfp: string | null
  funcstat: string | null
  gid: Generated<number>
  intptlat: string | null
  intptlon: string | null
  mtfcc: string | null
  name: string | null
  statefp: string | null
  tabblock_id: string
  the_geom: string | null
  tractce: string | null
  uace: string | null
  ur: string | null
}

export interface TigerTabblock20 {
  aland: number | null
  awater: number | null
  blockce: string | null
  countyfp: string | null
  funcstat: string | null
  geoid: string
  housing: number | null
  intptlat: string | null
  intptlon: string | null
  mtfcc: string | null
  name: string | null
  pop: number | null
  statefp: string | null
  the_geom: string | null
  tractce: string | null
  uace: string | null
  uatype: string | null
  ur: string | null
}

export interface TigerTract {
  aland: number | null
  awater: number | null
  countyfp: string | null
  funcstat: string | null
  gid: Generated<number>
  intptlat: string | null
  intptlon: string | null
  mtfcc: string | null
  name: string | null
  namelsad: string | null
  statefp: string | null
  the_geom: string | null
  tract_id: string
  tractce: string | null
}

export interface TigerZcta5 {
  aland: number | null
  awater: number | null
  classfp: string | null
  funcstat: string | null
  gid: Generated<number>
  intptlat: string | null
  intptlon: string | null
  mtfcc: string | null
  partflg: string | null
  statefp: string
  the_geom: string | null
  zcta5ce: string
}

export interface TigerZipLookup {
  cnt: number | null
  co_code: number | null
  county: string | null
  cousub: string | null
  cs_code: number | null
  pl_code: number | null
  place: string | null
  st_code: number | null
  state: string | null
  zip: number
}

export interface TigerZipLookupAll {
  cnt: number | null
  co_code: number | null
  county: string | null
  cousub: string | null
  cs_code: number | null
  pl_code: number | null
  place: string | null
  st_code: number | null
  state: string | null
  zip: number | null
}

export interface TigerZipLookupBase {
  city: string | null
  county: string | null
  state: string | null
  statefp: string | null
  zip: string
}

export interface TigerZipState {
  statefp: string | null
  stusps: string
  zip: string
}

export interface TigerZipStateLoc {
  place: string
  statefp: string | null
  stusps: string
  zip: string
}

export interface TopologyLayer {
  child_id: number | null
  feature_column: string
  feature_type: number
  layer_id: number
  level: Generated<number>
  schema_name: string
  table_name: string
  topology_id: number
}

export interface TopologyTopology {
  hasz: Generated<boolean>
  id: Generated<number>
  name: string
  precision: number
  srid: number
}

export interface WaitingRoom {
  created_at: Generated<Timestamp>
  id: Generated<string>
  organization_id: string
  patient_encounter_id: string
  updated_at: Generated<Timestamp>
}

export interface WhatsappMessagesReceived {
  body: string | null
  chatbot_name: ChatbotName
  created_at: Generated<Timestamp>
  error_commit_hash: string | null
  error_message: string | null
  has_media: Generated<boolean>
  id: Generated<string>
  media_id: string | null
  received_by_phone_number: string
  sent_by_phone_number: string
  started_responding_at: Timestamp | null
  updated_at: Generated<Timestamp>
  whatsapp_id: string
}

export interface WhatsappMessagesSent {
  body: string
  chatbot_name: ChatbotName
  corresponding_message_id: string | null
  created_at: Generated<Timestamp>
  id: Generated<string>
  read_status: string
  responding_to_received_id: string | null
  sent_by_phone_number: string
  sent_to_phone_number: string
  updated_at: Generated<Timestamp>
  whatsapp_id: string
}

export interface DB {
  addresses: Addresses
  appointment_media: AppointmentMedia
  appointment_providers: AppointmentProviders
  appointments: Appointments
  condition_icd10_codes: ConditionIcd10Codes
  conditions: Conditions
  consumables: Consumables
  consumption: Consumption
  countries: Countries
  department_employment: DepartmentEmployment
  device_capabilities: DeviceCapabilities
  devices: Devices
  diagnoses: Diagnoses
  diagnoses_collaboration: DiagnosesCollaboration
  doctor_registration_details: DoctorRegistrationDetails
  doctor_registration_details_in_progress: DoctorRegistrationDetailsInProgress
  doctor_review: DoctorReview
  doctor_review_requests: DoctorReviewRequests
  doctor_review_steps: DoctorReviewSteps
  doctor_reviews: DoctorReviews
  drugs: Drugs
  employment: Employment
  encounter: Encounter
  event_listeners: EventListeners
  events: Events
  examinations: Examinations
  geography_columns: GeographyColumns
  geometry_columns: GeometryColumns
  google_tokens: GoogleTokens
  guardian_relations: GuardianRelations
  health_worker_invitees: HealthWorkerInvitees
  health_worker_web_notifications: HealthWorkerWebNotifications
  health_workers: HealthWorkers
  icd10_categories: Icd10Categories
  icd10_codes: Icd10Codes
  icd10_diagnoses: Icd10Diagnoses
  icd10_diagnoses_excludes: Icd10DiagnosesExcludes
  icd10_diagnoses_excludes_categories: Icd10DiagnosesExcludesCategories
  icd10_diagnoses_excludes_code_ranges: Icd10DiagnosesExcludesCodeRanges
  icd10_diagnoses_excludes_codes: Icd10DiagnosesExcludesCodes
  icd10_diagnoses_includes: Icd10DiagnosesIncludes
  icd10_sections: Icd10Sections
  mailing_list: MailingList
  manufactured_medication_availabilities: ManufacturedMedicationAvailabilities
  manufactured_medication_recalls: ManufacturedMedicationRecalls
  manufactured_medication_strengths: ManufacturedMedicationStrengths
  manufactured_medications: ManufacturedMedications
  measurements: Measurements
  media: Media
  medications: Medications
  message_reads: MessageReads
  message_thread_participants: MessageThreadParticipants
  message_thread_subjects: MessageThreadSubjects
  message_threads: MessageThreads
  messages: Messages
  nurse_registration_details: NurseRegistrationDetails
  nurse_registration_details_in_progress: NurseRegistrationDetailsInProgress
  organization_consumables: OrganizationConsumables
  organization_departments: OrganizationDepartments
  organization_devices: OrganizationDevices
  organizations: Organizations
  patient_age: PatientAge
  patient_allergies: PatientAllergies
  patient_appointment_offered_times: PatientAppointmentOfferedTimes
  patient_appointment_request_media: PatientAppointmentRequestMedia
  patient_appointment_requests: PatientAppointmentRequests
  patient_chatbot_user_whatsapp_messages_received:
    PatientChatbotUserWhatsappMessagesReceived
  patient_chatbot_users: PatientChatbotUsers
  patient_condition_medications: PatientConditionMedications
  patient_conditions: PatientConditions
  patient_encounter_providers: PatientEncounterProviders
  patient_encounter_steps: PatientEncounterSteps
  patient_encounters: PatientEncounters
  patient_examination_finding_body_sites: PatientExaminationFindingBodySites
  patient_examination_findings: PatientExaminationFindings
  patient_examinations: PatientExaminations
  patient_family: PatientFamily
  patient_guardians: PatientGuardians
  patient_intake: PatientIntake
  patient_intake_visit_reason: PatientIntakeVisitReason
  patient_kin: PatientKin
  patient_lifestyle: PatientLifestyle
  patient_measurements: PatientMeasurements
  patient_nearest_facilities: PatientNearestFacilities
  patient_observations: PatientObservations
  patient_occupations: PatientOccupations
  patient_symptom_media: PatientSymptomMedia
  patient_symptoms: PatientSymptoms
  patients: Patients
  pharmacies: Pharmacies
  pharmacist_chatbot_user_whatsapp_messages_received:
    PharmacistChatbotUserWhatsappMessagesReceived
  pharmacist_chatbot_users: PharmacistChatbotUsers
  pharmacists: Pharmacists
  pharmacy_employment: PharmacyEmployment
  prescription_codes: PrescriptionCodes
  prescription_medications: PrescriptionMedications
  prescription_medications_filled: PrescriptionMedicationsFilled
  prescriptions: Prescriptions
  procurement: Procurement
  procurers: Procurers
  provider_calendars: ProviderCalendars
  regulators: Regulators
  sessions: Sessions
  snomed_c_refset_association: SnomedCRefsetAssociation
  snomed_c_refset_attribute_value: SnomedCRefsetAttributeValue
  snomed_c_refset_language: SnomedCRefsetLanguage
  snomed_c_refset_mrcm_module_scope: SnomedCRefsetMrcmModuleScope
  snomed_cci_refset_refset_descriptor: SnomedCciRefsetRefsetDescriptor
  snomed_ci_refset_description_type: SnomedCiRefsetDescriptionType
  snomed_cisscc_refset_mrcm_attribute_domain:
    SnomedCissccRefsetMrcmAttributeDomain
  snomed_concept: SnomedConcept
  snomed_description: SnomedDescription
  snomed_iissscc_refset_extended_map: SnomedIisssccRefsetExtendedMap
  snomed_refset_simple: SnomedRefsetSimple
  snomed_relationship: SnomedRelationship
  snomed_relationship_concrete_values: SnomedRelationshipConcreteValues
  snomed_s_refset_owl_expression: SnomedSRefsetOwlExpression
  snomed_s_refset_simple_map: SnomedSRefsetSimpleMap
  snomed_ss_refset_module_dependency: SnomedSsRefsetModuleDependency
  snomed_sscc_refset_mrcm_attribute_range: SnomedSsccRefsetMrcmAttributeRange
  snomed_sssssss_refset_mrcm_domain: SnomedSssssssRefsetMrcmDomain
  snomed_stated_relationship: SnomedStatedRelationship
  snomed_text_definition: SnomedTextDefinition
  spatial_ref_sys: SpatialRefSys
  'tiger.addr': TigerAddr
  'tiger.addrfeat': TigerAddrfeat
  'tiger.bg': TigerBg
  'tiger.county': TigerCounty
  'tiger.county_lookup': TigerCountyLookup
  'tiger.countysub_lookup': TigerCountysubLookup
  'tiger.cousub': TigerCousub
  'tiger.direction_lookup': TigerDirectionLookup
  'tiger.edges': TigerEdges
  'tiger.faces': TigerFaces
  'tiger.featnames': TigerFeatnames
  'tiger.geocode_settings': TigerGeocodeSettings
  'tiger.geocode_settings_default': TigerGeocodeSettingsDefault
  'tiger.loader_lookuptables': TigerLoaderLookuptables
  'tiger.loader_platform': TigerLoaderPlatform
  'tiger.loader_variables': TigerLoaderVariables
  'tiger.pagc_gaz': TigerPagcGaz
  'tiger.pagc_lex': TigerPagcLex
  'tiger.pagc_rules': TigerPagcRules
  'tiger.place': TigerPlace
  'tiger.place_lookup': TigerPlaceLookup
  'tiger.secondary_unit_lookup': TigerSecondaryUnitLookup
  'tiger.state': TigerState
  'tiger.state_lookup': TigerStateLookup
  'tiger.street_type_lookup': TigerStreetTypeLookup
  'tiger.tabblock': TigerTabblock
  'tiger.tabblock20': TigerTabblock20
  'tiger.tract': TigerTract
  'tiger.zcta5': TigerZcta5
  'tiger.zip_lookup': TigerZipLookup
  'tiger.zip_lookup_all': TigerZipLookupAll
  'tiger.zip_lookup_base': TigerZipLookupBase
  'tiger.zip_state': TigerZipState
  'tiger.zip_state_loc': TigerZipStateLoc
  'topology.layer': TopologyLayer
  'topology.topology': TopologyTopology
  waiting_room: WaitingRoom
  whatsapp_messages_received: WhatsappMessagesReceived
  whatsapp_messages_sent: WhatsappMessagesSent
}
type Buffer = Uint8Array
