import type { ColumnType } from 'kysely'

export type AgeUnit = 'day' | 'month' | 'week' | 'year'

export type ArrayType<T> = ArrayTypeImpl<T> extends (infer U)[] ? U[]
  : ArrayTypeImpl<T>

export type ArrayTypeImpl<T> = T extends ColumnType<infer S, infer I, infer U> ? ColumnType<S[], I[], U[]>
  : T[]

export type ChatbotName = 'patient' | 'pharmacist'

export type Comparator = '<' | '<=' | '=' | '>' | '>='

export type DoctorReviewStep = 'clinical_notes' | 'diagnosis' | 'orders' | 'prescriptions' | 'referral' | 'revert'

export type EmergencyContactRelationship = 'Friend' | 'Other' | 'Parent' | 'Sibling'

export type EncounterReason = 'administration' | 'checkup' | 'follow up' | 'maternity' | 'referral' | 'seeking treatment'

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

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U> ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>

export type GuardianRelation = 'adopted parent' | 'biological parent' | 'foster parent' | 'grandparent' | 'other guardian' | 'sibling' | 'sibling of parent'

export type Int8 = ColumnType<string, bigint | number | string, bigint | number | string>

export type Json = JsonValue

export type JsonArray = JsonValue[]

export type JsonObject = {
  [K in string]?: JsonValue
}

export type JsonPrimitive = boolean | number | string | null

export type JsonValue = JsonArray | JsonObject | JsonPrimitive

export type LanguageScope = 'Collective' | 'Individual' | 'Local' | 'Macrolanguage' | 'Special'

export type LanguageType = 'Constructed' | 'Extinct' | 'Genetic' | 'Genetic-like' | 'Geographic' | 'Historical' | 'Living' | 'Special'

export type MaritalStatus = 'Co-habiting' | 'Divorced' | 'Married' | 'Never Married' | 'Separated' | 'Single' | 'Widowed'

export type MessageConcerningType = 'patient' | 'patient_record'

export type MessagePriority = 'Emergency' | 'Non-urgent' | 'Urgent' | 'Very urgent'

export type MessageTargetType =
  | 'administrative_area_level_1'
  | 'administrative_area_level_2'
  | 'employee'
  | 'locality'
  | 'organization'
  | 'organization_category'
  | 'profession'

export type NamePrefix = 'Dr' | 'Miss' | 'Mr' | 'Mrs' | 'Ms' | 'Sr'

export type Numeric = ColumnType<string, number | string, number | string>

export type PatientCohabitation = 'Father' | 'Foster Parent' | 'Grandparent(s)' | 'Mother' | 'Orphanage' | 'Other Relative' | 'Sibling' | 'Uncle or Aunt'

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

export type PharmacistType = 'Dispensing Medical Practitioner' | 'Ind Clinic Nurse' | 'Pharmacist' | 'Pharmacy Technician'

export type Profession = 'doctor' | 'nurse' | 'receptionist'

export type Sex = 'female' | 'male' | 'other' | 'prefer not to say'

export type SnomedCategory =
  | 'administration method'
  | 'assessment scale'
  | 'attribute'
  | 'basic dose form'
  | 'body structure'
  | 'calculation'
  | 'cell'
  | 'cell structure'
  | 'clinical drug'
  | 'core metadata concept'
  | 'disorder'
  | 'disposition'
  | 'dose form'
  | 'environment'
  | 'environment / location'
  | 'ethnic group'
  | 'event'
  | 'finding'
  | 'foundation metadata concept'
  | 'geographic location'
  | 'intended site'
  | 'link assertion'
  | 'linkage concept'
  | 'medicinal product'
  | 'medicinal product form'
  | 'metadata'
  | 'morphologic abnormality'
  | 'namespace concept'
  | 'navigational concept'
  | 'observable entity'
  | 'occupation'
  | 'organism'
  | 'OWL metadata concept'
  | 'person'
  | 'physical force'
  | 'physical object'
  | 'procedure'
  | 'product'
  | 'product name'
  | 'qualifier value'
  | 'racial group'
  | 'record artifact'
  | 'regime/therapy'
  | 'release characteristic'
  | 'religion/philosophy'
  | 'role'
  | 'situation'
  | 'SNOMED RT+CTV3'
  | 'social concept'
  | 'special concept'
  | 'specimen'
  | 'staging scale'
  | 'state of matter'
  | 'substance'
  | 'supplier'
  | 'transformation'
  | 'tumor staging'
  | 'unit of presentation'

export type Timestamp = ColumnType<Date, Date | string, Date | string>

export type VitalAssessment = 'consciousness' | 'mobility_assessment' | 'trauma_presence'

export type Workflow =
  | 'consultation'
  | 'doctor_review'
  | 'emergency_escalation'
  | 'maternity'
  | 'prescription_refill'
  | 'registration'
  | 'stabilization'
  | 'triage'

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

export interface AgeMeasurementRequirements {
  active: Generated<boolean>
  age_max_days: number | null
  age_min_days: number | null
  clinical_rationale: string
  created_at: Generated<Timestamp>
  effective_date: Generated<Timestamp>
  expiration_date: Timestamp | null
  id: Generated<string>
  is_required: Generated<boolean>
  medical_standard: string
  required_measurement_snomed_concept_id: Int8
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

export interface ConditionMeasurementRequirements {
  active: Generated<boolean>
  clinical_rationale: string
  condition_snomed_concept_id: Int8
  created_at: Generated<Timestamp>
  effective_date: Generated<Timestamp>
  expiration_date: Timestamp | null
  frequency_recommendation: string | null
  id: Generated<string>
  is_required: Generated<boolean>
  medical_standard: string
  required_measurement_snomed_concept_id: Int8
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
  alternate_names: string[] | null
  emoji: string | null
  iso_3166_2: string
  iso_3166_3: string
  official_name: string
  phone_code: string | null
}

export interface DepartmentEmployment {
  created_at: Generated<Timestamp>
  department_id: string
  employment_id: string
  id: Generated<string>
  updated_at: Generated<Timestamp>
}

export interface Departments {
  name: string
  requires_triage: Generated<boolean>
  workflows: ArrayType<Workflow>
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
  gender: string
  health_worker_id: string
  id: Generated<string>
  mobile_number: string | null
  national_id_media_id: string | null
  national_id_number: string
  ncz_registration_card_media_id: string | null
  ncz_registration_number: string
  sex: Sex
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
  id: Generated<string>
  organization_id: string | null
  patient_encounter_id: string
  patient_id: string
  requested_by: string
  requester_notes: string | null
  updated_at: Generated<Timestamp>
}

export interface DoctorReviews {
  completed_at: Timestamp | null
  created_at: Generated<Timestamp>
  id: Generated<string>
  patient_encounter_id: string
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

export interface Doctors {
  id: string
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
  is_admin: boolean
  organization_id: string
  profession: Profession | null
  specialty: string | null
  updated_at: Generated<Timestamp>
}

export interface EmploymentCalendars {
  availability_set: Generated<boolean>
  created_at: Generated<Timestamp>
  employment_id: string
  gcal_appointments_calendar_id: string
  gcal_availability_calendar_id: string
  id: Generated<string>
  updated_at: Generated<Timestamp>
}

export interface EmploymentPresence {
  at_work: Generated<boolean>
  created_at: Generated<Timestamp>
  id: string
  updated_at: Generated<Timestamp>
  with_patient_id: string | null
}

export interface EventListeners {
  created_at: Generated<Timestamp>
  error_message: string | null
  event_id: string
  id: Generated<string>
  listener_name: string
  processed_at: Timestamp | null
  started_processing_at: Timestamp | null
  updated_at: Generated<Timestamp>
}

export interface Events {
  all_processed_at: Timestamp | null
  created_at: Generated<Timestamp>
  data: Json
  error_message: string | null
  id: Generated<string>
  listener_names: string[]
  type: string
  updated_at: Generated<Timestamp>
}

export interface Examinations {
  consultation_step: string
  display_name: string
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
  is_admin: boolean
  organization_id: string
  profession: Profession | null
  updated_at: Generated<Timestamp>
}

export interface HealthWorkers {
  avatar_media_id: string | null
  created_at: Generated<Timestamp>
  email: string
  first_names: string
  id: Generated<string>
  name: string
  preferred_name: string
  surname: string
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

export interface Languages {
  iso_639_1: string | null
  iso_639_2_b: string
  iso_639_2_t: string
  language_names: string[]
  native_names: string[]
  other_names: string[]
  scope: LanguageScope
  type: LanguageType
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
  strength_numerators: ArrayType<Numeric>
  trade_name: string
  updated_at: Generated<Timestamp>
}

export interface ManufacturedMedicationStrengths {
  consumable_id: string
  created_at: Generated<Timestamp>
  id: Generated<string>
  manufactured_medication_id: string
  strength_numerator: Numeric
  updated_at: Generated<Timestamp>
}

export interface MeasurementReferenceRanges {
  active: Generated<boolean>
  age_max_days: number | null
  age_min_days: number | null
  clinical_context: string | null
  condition_codes: ArrayType<Int8> | null
  created_at: Generated<Timestamp>
  critical_max: Numeric | null
  critical_min: Numeric | null
  effective_date: Generated<Timestamp>
  evidence_level: string | null
  expiration_date: Timestamp | null
  gender: string | null
  id: Generated<string>
  measurement_snomed_concept_id: Int8
  normal_max: Numeric
  normal_min: Numeric
  reference_source: string
  units: string
  updated_at: Generated<Timestamp>
}

export interface Media {
  binary_data: Buffer
  created_at: Generated<Timestamp>
  file_name: string | null
  id: Generated<string>
  mime_type: string
  updated_at: Generated<Timestamp>
}

export interface MediaAudios {
  id: string
}

export interface MediaImages {
  id: string
}

export interface MediaImagesOrVideos {
  id: string
}

export interface MediaSpeeches {
  id: string
  language_code: string
}

export interface MediaVideos {
  id: string
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
  strength_numerators: ArrayType<Numeric>
  updated_at: Generated<Timestamp>
}

export interface MessageDraftConcerning {
  concerning_type: MessageConcerningType
  concerning_uuid: string
  created_at: Generated<Timestamp>
  id: Generated<string>
  message_draft_id: string
  updated_at: Generated<Timestamp>
}

export interface MessageDrafts {
  body: string
  created_at: Generated<Timestamp>
  employment_id: string
  id: Generated<string>
  priority: MessagePriority
  updated_at: Generated<Timestamp>
}

export interface MessageDraftTargets {
  created_at: Generated<Timestamp>
  id: Generated<string>
  message_draft_id: string
  target_type: MessageTargetType
  target_uuid: string | null
  target_value: string | null
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
  sender_participant_id: string | null
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
  country: string | null
  created_at: Generated<Timestamp>
  date_of_birth: Timestamp
  date_of_first_practice: Timestamp
  face_picture_media_id: string | null
  gender: string
  health_worker_id: string
  id: Generated<string>
  mobile_number: string | null
  national_id_media_id: string | null
  national_id_number: string
  ncz_registration_card_media_id: string | null
  ncz_registration_number: string
  nurse_practicing_cert_media_id: string | null
  sex: Sex
  updated_at: Generated<Timestamp>
}

export interface NurseRegistrationDetailsInProgress {
  created_at: Generated<Timestamp>
  data: Generated<Json>
  health_worker_id: string
  id: Generated<string>
  updated_at: Generated<Timestamp>
}

export interface Nurses {
  id: string
}

export interface OrganizationAdmins {
  id: string
}

export interface OrganizationConsumables {
  consumable_id: string
  created_at: Generated<Timestamp>
  id: Generated<string>
  organization_id: string
  quantity_on_hand: number
  updated_at: Generated<Timestamp>
}

export interface OrganizationDepartmentRooms {
  created_at: Generated<Timestamp>
  id: Generated<string>
  organization_department_id: string
  organization_room_id: string
  updated_at: Generated<Timestamp>
}

export interface OrganizationDepartments {
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

export interface OrganizationRooms {
  created_at: Generated<Timestamp>
  id: Generated<string>
  name: string
  organization_id: string
  updated_at: Generated<Timestamp>
}

export interface Organizations {
  address_id: string | null
  category: string | null
  country: string
  created_at: Generated<Timestamp>
  id: Generated<string>
  inactive_reason: string | null
  is_test: Generated<boolean>
  location: string | null
  most_common_language_code: string | null
  name: string
  ownership: string | null
  updated_at: Generated<Timestamp>
}

export interface PatientAge {
  age: string | null
  age_days: number | null
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

export interface PatientChiefComplaints {
  id: string
  language_code: string
  note: string
  patient_id: string
}

export interface PatientChiefComplaintsP0 {
  id: string
  language_code: string
  note: string
  patient_id: string
}

export interface PatientChiefComplaintsP1 {
  id: string
  language_code: string
  note: string
  patient_id: string
}

export interface PatientChiefComplaintsP10 {
  id: string
  language_code: string
  note: string
  patient_id: string
}

export interface PatientChiefComplaintsP11 {
  id: string
  language_code: string
  note: string
  patient_id: string
}

export interface PatientChiefComplaintsP12 {
  id: string
  language_code: string
  note: string
  patient_id: string
}

export interface PatientChiefComplaintsP13 {
  id: string
  language_code: string
  note: string
  patient_id: string
}

export interface PatientChiefComplaintsP14 {
  id: string
  language_code: string
  note: string
  patient_id: string
}

export interface PatientChiefComplaintsP15 {
  id: string
  language_code: string
  note: string
  patient_id: string
}

export interface PatientChiefComplaintsP2 {
  id: string
  language_code: string
  note: string
  patient_id: string
}

export interface PatientChiefComplaintsP3 {
  id: string
  language_code: string
  note: string
  patient_id: string
}

export interface PatientChiefComplaintsP4 {
  id: string
  language_code: string
  note: string
  patient_id: string
}

export interface PatientChiefComplaintsP5 {
  id: string
  language_code: string
  note: string
  patient_id: string
}

export interface PatientChiefComplaintsP6 {
  id: string
  language_code: string
  note: string
  patient_id: string
}

export interface PatientChiefComplaintsP7 {
  id: string
  language_code: string
  note: string
  patient_id: string
}

export interface PatientChiefComplaintsP8 {
  id: string
  language_code: string
  note: string
  patient_id: string
}

export interface PatientChiefComplaintsP9 {
  id: string
  language_code: string
  note: string
  patient_id: string
}

export interface PatientComputedFindings {
  computation_algorithm_version: string
  computation_metadata: Generated<Json>
  created_at: Generated<Timestamp>
  full_display: string | null
  id: string
  patient_id: string
  units: string | null
  value: Numeric | null
}

export interface PatientComputedFindingsInputs {
  computed_finding_id: string
  created_at: Generated<Timestamp>
  id: Generated<string>
  input_measurement_id: string
  patient_id: string
  updated_at: Generated<Timestamp>
}

export interface PatientComputedFindingsInputsP0 {
  computed_finding_id: string
  created_at: Generated<Timestamp>
  id: Generated<string>
  input_measurement_id: string
  patient_id: string
  updated_at: Generated<Timestamp>
}

export interface PatientComputedFindingsInputsP1 {
  computed_finding_id: string
  created_at: Generated<Timestamp>
  id: Generated<string>
  input_measurement_id: string
  patient_id: string
  updated_at: Generated<Timestamp>
}

export interface PatientComputedFindingsInputsP10 {
  computed_finding_id: string
  created_at: Generated<Timestamp>
  id: Generated<string>
  input_measurement_id: string
  patient_id: string
  updated_at: Generated<Timestamp>
}

export interface PatientComputedFindingsInputsP11 {
  computed_finding_id: string
  created_at: Generated<Timestamp>
  id: Generated<string>
  input_measurement_id: string
  patient_id: string
  updated_at: Generated<Timestamp>
}

export interface PatientComputedFindingsInputsP12 {
  computed_finding_id: string
  created_at: Generated<Timestamp>
  id: Generated<string>
  input_measurement_id: string
  patient_id: string
  updated_at: Generated<Timestamp>
}

export interface PatientComputedFindingsInputsP13 {
  computed_finding_id: string
  created_at: Generated<Timestamp>
  id: Generated<string>
  input_measurement_id: string
  patient_id: string
  updated_at: Generated<Timestamp>
}

export interface PatientComputedFindingsInputsP14 {
  computed_finding_id: string
  created_at: Generated<Timestamp>
  id: Generated<string>
  input_measurement_id: string
  patient_id: string
  updated_at: Generated<Timestamp>
}

export interface PatientComputedFindingsInputsP15 {
  computed_finding_id: string
  created_at: Generated<Timestamp>
  id: Generated<string>
  input_measurement_id: string
  patient_id: string
  updated_at: Generated<Timestamp>
}

export interface PatientComputedFindingsInputsP2 {
  computed_finding_id: string
  created_at: Generated<Timestamp>
  id: Generated<string>
  input_measurement_id: string
  patient_id: string
  updated_at: Generated<Timestamp>
}

export interface PatientComputedFindingsInputsP3 {
  computed_finding_id: string
  created_at: Generated<Timestamp>
  id: Generated<string>
  input_measurement_id: string
  patient_id: string
  updated_at: Generated<Timestamp>
}

export interface PatientComputedFindingsInputsP4 {
  computed_finding_id: string
  created_at: Generated<Timestamp>
  id: Generated<string>
  input_measurement_id: string
  patient_id: string
  updated_at: Generated<Timestamp>
}

export interface PatientComputedFindingsInputsP5 {
  computed_finding_id: string
  created_at: Generated<Timestamp>
  id: Generated<string>
  input_measurement_id: string
  patient_id: string
  updated_at: Generated<Timestamp>
}

export interface PatientComputedFindingsInputsP6 {
  computed_finding_id: string
  created_at: Generated<Timestamp>
  id: Generated<string>
  input_measurement_id: string
  patient_id: string
  updated_at: Generated<Timestamp>
}

export interface PatientComputedFindingsInputsP7 {
  computed_finding_id: string
  created_at: Generated<Timestamp>
  id: Generated<string>
  input_measurement_id: string
  patient_id: string
  updated_at: Generated<Timestamp>
}

export interface PatientComputedFindingsInputsP8 {
  computed_finding_id: string
  created_at: Generated<Timestamp>
  id: Generated<string>
  input_measurement_id: string
  patient_id: string
  updated_at: Generated<Timestamp>
}

export interface PatientComputedFindingsInputsP9 {
  computed_finding_id: string
  created_at: Generated<Timestamp>
  id: Generated<string>
  input_measurement_id: string
  patient_id: string
  updated_at: Generated<Timestamp>
}

export interface PatientComputedFindingsP0 {
  computation_algorithm_version: string
  computation_metadata: Generated<Json>
  created_at: Generated<Timestamp>
  full_display: string | null
  id: string
  patient_id: string
  units: string | null
  value: Numeric | null
}

export interface PatientComputedFindingsP1 {
  computation_algorithm_version: string
  computation_metadata: Generated<Json>
  created_at: Generated<Timestamp>
  full_display: string | null
  id: string
  patient_id: string
  units: string | null
  value: Numeric | null
}

export interface PatientComputedFindingsP10 {
  computation_algorithm_version: string
  computation_metadata: Generated<Json>
  created_at: Generated<Timestamp>
  full_display: string | null
  id: string
  patient_id: string
  units: string | null
  value: Numeric | null
}

export interface PatientComputedFindingsP11 {
  computation_algorithm_version: string
  computation_metadata: Generated<Json>
  created_at: Generated<Timestamp>
  full_display: string | null
  id: string
  patient_id: string
  units: string | null
  value: Numeric | null
}

export interface PatientComputedFindingsP12 {
  computation_algorithm_version: string
  computation_metadata: Generated<Json>
  created_at: Generated<Timestamp>
  full_display: string | null
  id: string
  patient_id: string
  units: string | null
  value: Numeric | null
}

export interface PatientComputedFindingsP13 {
  computation_algorithm_version: string
  computation_metadata: Generated<Json>
  created_at: Generated<Timestamp>
  full_display: string | null
  id: string
  patient_id: string
  units: string | null
  value: Numeric | null
}

export interface PatientComputedFindingsP14 {
  computation_algorithm_version: string
  computation_metadata: Generated<Json>
  created_at: Generated<Timestamp>
  full_display: string | null
  id: string
  patient_id: string
  units: string | null
  value: Numeric | null
}

export interface PatientComputedFindingsP15 {
  computation_algorithm_version: string
  computation_metadata: Generated<Json>
  created_at: Generated<Timestamp>
  full_display: string | null
  id: string
  patient_id: string
  units: string | null
  value: Numeric | null
}

export interface PatientComputedFindingsP2 {
  computation_algorithm_version: string
  computation_metadata: Generated<Json>
  created_at: Generated<Timestamp>
  full_display: string | null
  id: string
  patient_id: string
  units: string | null
  value: Numeric | null
}

export interface PatientComputedFindingsP3 {
  computation_algorithm_version: string
  computation_metadata: Generated<Json>
  created_at: Generated<Timestamp>
  full_display: string | null
  id: string
  patient_id: string
  units: string | null
  value: Numeric | null
}

export interface PatientComputedFindingsP4 {
  computation_algorithm_version: string
  computation_metadata: Generated<Json>
  created_at: Generated<Timestamp>
  full_display: string | null
  id: string
  patient_id: string
  units: string | null
  value: Numeric | null
}

export interface PatientComputedFindingsP5 {
  computation_algorithm_version: string
  computation_metadata: Generated<Json>
  created_at: Generated<Timestamp>
  full_display: string | null
  id: string
  patient_id: string
  units: string | null
  value: Numeric | null
}

export interface PatientComputedFindingsP6 {
  computation_algorithm_version: string
  computation_metadata: Generated<Json>
  created_at: Generated<Timestamp>
  full_display: string | null
  id: string
  patient_id: string
  units: string | null
  value: Numeric | null
}

export interface PatientComputedFindingsP7 {
  computation_algorithm_version: string
  computation_metadata: Generated<Json>
  created_at: Generated<Timestamp>
  full_display: string | null
  id: string
  patient_id: string
  units: string | null
  value: Numeric | null
}

export interface PatientComputedFindingsP8 {
  computation_algorithm_version: string
  computation_metadata: Generated<Json>
  created_at: Generated<Timestamp>
  full_display: string | null
  id: string
  patient_id: string
  units: string | null
  value: Numeric | null
}

export interface PatientComputedFindingsP9 {
  computation_algorithm_version: string
  computation_metadata: Generated<Json>
  created_at: Generated<Timestamp>
  full_display: string | null
  id: string
  patient_id: string
  units: string | null
  value: Numeric | null
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

export interface PatientEmergencyContacts {
  contact_order: Generated<number>
  created_at: Generated<Timestamp>
  id: Generated<string>
  name: string
  patient_id: string
  phone_number: string
  relationship: EmergencyContactRelationship
  updated_at: Generated<Timestamp>
}

export interface PatientEncounterEmployees {
  created_at: Generated<Timestamp>
  employment_id: string
  id: Generated<string>
  patient_encounter_id: string
  seen_at: Generated<Timestamp>
  updated_at: Generated<Timestamp>
}

export interface PatientEncounters {
  appointment_id: string | null
  closed_at: Timestamp | null
  created_at: Generated<Timestamp>
  id: Generated<string>
  location: string
  notes: string | null
  organization_id: string
  patient_id: string
  reason: EncounterReason | null
  updated_at: Generated<Timestamp>
}

export interface PatientEvaluations {
  by_system: boolean
  employment_id: string | null
  evaluates_record_id: string
  id: string
  patient_id: string
  procedure_id: string | null
}

export interface PatientEvaluationScores {
  id: string
  patient_id: string
  score: number
}

export interface PatientEvaluationScoresP0 {
  id: string
  patient_id: string
  score: number
}

export interface PatientEvaluationScoresP1 {
  id: string
  patient_id: string
  score: number
}

export interface PatientEvaluationScoresP10 {
  id: string
  patient_id: string
  score: number
}

export interface PatientEvaluationScoresP11 {
  id: string
  patient_id: string
  score: number
}

export interface PatientEvaluationScoresP12 {
  id: string
  patient_id: string
  score: number
}

export interface PatientEvaluationScoresP13 {
  id: string
  patient_id: string
  score: number
}

export interface PatientEvaluationScoresP14 {
  id: string
  patient_id: string
  score: number
}

export interface PatientEvaluationScoresP15 {
  id: string
  patient_id: string
  score: number
}

export interface PatientEvaluationScoresP2 {
  id: string
  patient_id: string
  score: number
}

export interface PatientEvaluationScoresP3 {
  id: string
  patient_id: string
  score: number
}

export interface PatientEvaluationScoresP4 {
  id: string
  patient_id: string
  score: number
}

export interface PatientEvaluationScoresP5 {
  id: string
  patient_id: string
  score: number
}

export interface PatientEvaluationScoresP6 {
  id: string
  patient_id: string
  score: number
}

export interface PatientEvaluationScoresP7 {
  id: string
  patient_id: string
  score: number
}

export interface PatientEvaluationScoresP8 {
  id: string
  patient_id: string
  score: number
}

export interface PatientEvaluationScoresP9 {
  id: string
  patient_id: string
  score: number
}

export interface PatientEvaluationsP0 {
  by_system: boolean
  employment_id: string | null
  evaluates_record_id: string
  id: string
  patient_id: string
  procedure_id: string | null
}

export interface PatientEvaluationsP1 {
  by_system: boolean
  employment_id: string | null
  evaluates_record_id: string
  id: string
  patient_id: string
  procedure_id: string | null
}

export interface PatientEvaluationsP10 {
  by_system: boolean
  employment_id: string | null
  evaluates_record_id: string
  id: string
  patient_id: string
  procedure_id: string | null
}

export interface PatientEvaluationsP11 {
  by_system: boolean
  employment_id: string | null
  evaluates_record_id: string
  id: string
  patient_id: string
  procedure_id: string | null
}

export interface PatientEvaluationsP12 {
  by_system: boolean
  employment_id: string | null
  evaluates_record_id: string
  id: string
  patient_id: string
  procedure_id: string | null
}

export interface PatientEvaluationsP13 {
  by_system: boolean
  employment_id: string | null
  evaluates_record_id: string
  id: string
  patient_id: string
  procedure_id: string | null
}

export interface PatientEvaluationsP14 {
  by_system: boolean
  employment_id: string | null
  evaluates_record_id: string
  id: string
  patient_id: string
  procedure_id: string | null
}

export interface PatientEvaluationsP15 {
  by_system: boolean
  employment_id: string | null
  evaluates_record_id: string
  id: string
  patient_id: string
  procedure_id: string | null
}

export interface PatientEvaluationsP2 {
  by_system: boolean
  employment_id: string | null
  evaluates_record_id: string
  id: string
  patient_id: string
  procedure_id: string | null
}

export interface PatientEvaluationsP3 {
  by_system: boolean
  employment_id: string | null
  evaluates_record_id: string
  id: string
  patient_id: string
  procedure_id: string | null
}

export interface PatientEvaluationsP4 {
  by_system: boolean
  employment_id: string | null
  evaluates_record_id: string
  id: string
  patient_id: string
  procedure_id: string | null
}

export interface PatientEvaluationsP5 {
  by_system: boolean
  employment_id: string | null
  evaluates_record_id: string
  id: string
  patient_id: string
  procedure_id: string | null
}

export interface PatientEvaluationsP6 {
  by_system: boolean
  employment_id: string | null
  evaluates_record_id: string
  id: string
  patient_id: string
  procedure_id: string | null
}

export interface PatientEvaluationsP7 {
  by_system: boolean
  employment_id: string | null
  evaluates_record_id: string
  id: string
  patient_id: string
  procedure_id: string | null
}

export interface PatientEvaluationsP8 {
  by_system: boolean
  employment_id: string | null
  evaluates_record_id: string
  id: string
  patient_id: string
  procedure_id: string | null
}

export interface PatientEvaluationsP9 {
  by_system: boolean
  employment_id: string | null
  evaluates_record_id: string
  id: string
  patient_id: string
  procedure_id: string | null
}

export interface PatientEvents {
  address_id: string | null
  datetime: Timestamp
  id: string
  location: string | null
  patient_id: string
}

export interface PatientEventsP0 {
  address_id: string | null
  datetime: Timestamp
  id: string
  location: string | null
  patient_id: string
}

export interface PatientEventsP1 {
  address_id: string | null
  datetime: Timestamp
  id: string
  location: string | null
  patient_id: string
}

export interface PatientEventsP10 {
  address_id: string | null
  datetime: Timestamp
  id: string
  location: string | null
  patient_id: string
}

export interface PatientEventsP11 {
  address_id: string | null
  datetime: Timestamp
  id: string
  location: string | null
  patient_id: string
}

export interface PatientEventsP12 {
  address_id: string | null
  datetime: Timestamp
  id: string
  location: string | null
  patient_id: string
}

export interface PatientEventsP13 {
  address_id: string | null
  datetime: Timestamp
  id: string
  location: string | null
  patient_id: string
}

export interface PatientEventsP14 {
  address_id: string | null
  datetime: Timestamp
  id: string
  location: string | null
  patient_id: string
}

export interface PatientEventsP15 {
  address_id: string | null
  datetime: Timestamp
  id: string
  location: string | null
  patient_id: string
}

export interface PatientEventsP2 {
  address_id: string | null
  datetime: Timestamp
  id: string
  location: string | null
  patient_id: string
}

export interface PatientEventsP3 {
  address_id: string | null
  datetime: Timestamp
  id: string
  location: string | null
  patient_id: string
}

export interface PatientEventsP4 {
  address_id: string | null
  datetime: Timestamp
  id: string
  location: string | null
  patient_id: string
}

export interface PatientEventsP5 {
  address_id: string | null
  datetime: Timestamp
  id: string
  location: string | null
  patient_id: string
}

export interface PatientEventsP6 {
  address_id: string | null
  datetime: Timestamp
  id: string
  location: string | null
  patient_id: string
}

export interface PatientEventsP7 {
  address_id: string | null
  datetime: Timestamp
  id: string
  location: string | null
  patient_id: string
}

export interface PatientEventsP8 {
  address_id: string | null
  datetime: Timestamp
  id: string
  location: string | null
  patient_id: string
}

export interface PatientEventsP9 {
  address_id: string | null
  datetime: Timestamp
  id: string
  location: string | null
  patient_id: string
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
  examination_identifier: string
  id: Generated<string>
  ordered: Generated<boolean>
  patient_encounter_employee_id: string
  patient_encounter_id: string
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

export interface PatientFindingMediaImages {
  finding_id: string
  id: string
  media_image_id: string
  patient_id: string
}

export interface PatientFindingMediaImagesP0 {
  finding_id: string
  id: string
  media_image_id: string
  patient_id: string
}

export interface PatientFindingMediaImagesP1 {
  finding_id: string
  id: string
  media_image_id: string
  patient_id: string
}

export interface PatientFindingMediaImagesP10 {
  finding_id: string
  id: string
  media_image_id: string
  patient_id: string
}

export interface PatientFindingMediaImagesP11 {
  finding_id: string
  id: string
  media_image_id: string
  patient_id: string
}

export interface PatientFindingMediaImagesP12 {
  finding_id: string
  id: string
  media_image_id: string
  patient_id: string
}

export interface PatientFindingMediaImagesP13 {
  finding_id: string
  id: string
  media_image_id: string
  patient_id: string
}

export interface PatientFindingMediaImagesP14 {
  finding_id: string
  id: string
  media_image_id: string
  patient_id: string
}

export interface PatientFindingMediaImagesP15 {
  finding_id: string
  id: string
  media_image_id: string
  patient_id: string
}

export interface PatientFindingMediaImagesP2 {
  finding_id: string
  id: string
  media_image_id: string
  patient_id: string
}

export interface PatientFindingMediaImagesP3 {
  finding_id: string
  id: string
  media_image_id: string
  patient_id: string
}

export interface PatientFindingMediaImagesP4 {
  finding_id: string
  id: string
  media_image_id: string
  patient_id: string
}

export interface PatientFindingMediaImagesP5 {
  finding_id: string
  id: string
  media_image_id: string
  patient_id: string
}

export interface PatientFindingMediaImagesP6 {
  finding_id: string
  id: string
  media_image_id: string
  patient_id: string
}

export interface PatientFindingMediaImagesP7 {
  finding_id: string
  id: string
  media_image_id: string
  patient_id: string
}

export interface PatientFindingMediaImagesP8 {
  finding_id: string
  id: string
  media_image_id: string
  patient_id: string
}

export interface PatientFindingMediaImagesP9 {
  finding_id: string
  id: string
  media_image_id: string
  patient_id: string
}

export interface PatientFindingMediaSpeeches {
  finding_id: string
  id: string
  media_speech_id: string
  patient_id: string
}

export interface PatientFindingMediaSpeechesP0 {
  finding_id: string
  id: string
  media_speech_id: string
  patient_id: string
}

export interface PatientFindingMediaSpeechesP1 {
  finding_id: string
  id: string
  media_speech_id: string
  patient_id: string
}

export interface PatientFindingMediaSpeechesP10 {
  finding_id: string
  id: string
  media_speech_id: string
  patient_id: string
}

export interface PatientFindingMediaSpeechesP11 {
  finding_id: string
  id: string
  media_speech_id: string
  patient_id: string
}

export interface PatientFindingMediaSpeechesP12 {
  finding_id: string
  id: string
  media_speech_id: string
  patient_id: string
}

export interface PatientFindingMediaSpeechesP13 {
  finding_id: string
  id: string
  media_speech_id: string
  patient_id: string
}

export interface PatientFindingMediaSpeechesP14 {
  finding_id: string
  id: string
  media_speech_id: string
  patient_id: string
}

export interface PatientFindingMediaSpeechesP15 {
  finding_id: string
  id: string
  media_speech_id: string
  patient_id: string
}

export interface PatientFindingMediaSpeechesP2 {
  finding_id: string
  id: string
  media_speech_id: string
  patient_id: string
}

export interface PatientFindingMediaSpeechesP3 {
  finding_id: string
  id: string
  media_speech_id: string
  patient_id: string
}

export interface PatientFindingMediaSpeechesP4 {
  finding_id: string
  id: string
  media_speech_id: string
  patient_id: string
}

export interface PatientFindingMediaSpeechesP5 {
  finding_id: string
  id: string
  media_speech_id: string
  patient_id: string
}

export interface PatientFindingMediaSpeechesP6 {
  finding_id: string
  id: string
  media_speech_id: string
  patient_id: string
}

export interface PatientFindingMediaSpeechesP7 {
  finding_id: string
  id: string
  media_speech_id: string
  patient_id: string
}

export interface PatientFindingMediaSpeechesP8 {
  finding_id: string
  id: string
  media_speech_id: string
  patient_id: string
}

export interface PatientFindingMediaSpeechesP9 {
  finding_id: string
  id: string
  media_speech_id: string
  patient_id: string
}

export interface PatientFindings {
  id: string
  patient_encounter_employee_id: string
  patient_id: string
  procedure_id: string
}

export interface PatientFindingsP0 {
  id: string
  patient_encounter_employee_id: string
  patient_id: string
  procedure_id: string
}

export interface PatientFindingsP1 {
  id: string
  patient_encounter_employee_id: string
  patient_id: string
  procedure_id: string
}

export interface PatientFindingsP10 {
  id: string
  patient_encounter_employee_id: string
  patient_id: string
  procedure_id: string
}

export interface PatientFindingsP11 {
  id: string
  patient_encounter_employee_id: string
  patient_id: string
  procedure_id: string
}

export interface PatientFindingsP12 {
  id: string
  patient_encounter_employee_id: string
  patient_id: string
  procedure_id: string
}

export interface PatientFindingsP13 {
  id: string
  patient_encounter_employee_id: string
  patient_id: string
  procedure_id: string
}

export interface PatientFindingsP14 {
  id: string
  patient_encounter_employee_id: string
  patient_id: string
  procedure_id: string
}

export interface PatientFindingsP15 {
  id: string
  patient_encounter_employee_id: string
  patient_id: string
  procedure_id: string
}

export interface PatientFindingsP2 {
  id: string
  patient_encounter_employee_id: string
  patient_id: string
  procedure_id: string
}

export interface PatientFindingsP3 {
  id: string
  patient_encounter_employee_id: string
  patient_id: string
  procedure_id: string
}

export interface PatientFindingsP4 {
  id: string
  patient_encounter_employee_id: string
  patient_id: string
  procedure_id: string
}

export interface PatientFindingsP5 {
  id: string
  patient_encounter_employee_id: string
  patient_id: string
  procedure_id: string
}

export interface PatientFindingsP6 {
  id: string
  patient_encounter_employee_id: string
  patient_id: string
  procedure_id: string
}

export interface PatientFindingsP7 {
  id: string
  patient_encounter_employee_id: string
  patient_id: string
  procedure_id: string
}

export interface PatientFindingsP8 {
  id: string
  patient_encounter_employee_id: string
  patient_id: string
  procedure_id: string
}

export interface PatientFindingsP9 {
  id: string
  patient_encounter_employee_id: string
  patient_id: string
  procedure_id: string
}

export interface PatientGuardians {
  created_at: Generated<Timestamp>
  dependent_patient_id: string
  guardian_patient_id: string
  guardian_relation: GuardianRelation
  id: Generated<string>
  updated_at: Generated<Timestamp>
}

export interface PatientInsurance {
  created_at: Generated<Timestamp>
  expire_date: Timestamp
  id: Generated<string>
  insurance_provider: string
  is_dependent: boolean
  membership_number: string
  patient_id: string
  plan_name: string | null
  updated_at: Generated<Timestamp>
  valid_from: Timestamp
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
  comparator: Generated<Comparator>
  id: string
  patient_id: string
  units: string
  value: Numeric
}

export interface PatientMeasurementsP0 {
  comparator: Generated<Comparator>
  id: string
  patient_id: string
  units: string
  value: Numeric
}

export interface PatientMeasurementsP1 {
  comparator: Generated<Comparator>
  id: string
  patient_id: string
  units: string
  value: Numeric
}

export interface PatientMeasurementsP10 {
  comparator: Generated<Comparator>
  id: string
  patient_id: string
  units: string
  value: Numeric
}

export interface PatientMeasurementsP11 {
  comparator: Generated<Comparator>
  id: string
  patient_id: string
  units: string
  value: Numeric
}

export interface PatientMeasurementsP12 {
  comparator: Generated<Comparator>
  id: string
  patient_id: string
  units: string
  value: Numeric
}

export interface PatientMeasurementsP13 {
  comparator: Generated<Comparator>
  id: string
  patient_id: string
  units: string
  value: Numeric
}

export interface PatientMeasurementsP14 {
  comparator: Generated<Comparator>
  id: string
  patient_id: string
  units: string
  value: Numeric
}

export interface PatientMeasurementsP15 {
  comparator: Generated<Comparator>
  id: string
  patient_id: string
  units: string
  value: Numeric
}

export interface PatientMeasurementsP2 {
  comparator: Generated<Comparator>
  id: string
  patient_id: string
  units: string
  value: Numeric
}

export interface PatientMeasurementsP3 {
  comparator: Generated<Comparator>
  id: string
  patient_id: string
  units: string
  value: Numeric
}

export interface PatientMeasurementsP4 {
  comparator: Generated<Comparator>
  id: string
  patient_id: string
  units: string
  value: Numeric
}

export interface PatientMeasurementsP5 {
  comparator: Generated<Comparator>
  id: string
  patient_id: string
  units: string
  value: Numeric
}

export interface PatientMeasurementsP6 {
  comparator: Generated<Comparator>
  id: string
  patient_id: string
  units: string
  value: Numeric
}

export interface PatientMeasurementsP7 {
  comparator: Generated<Comparator>
  id: string
  patient_id: string
  units: string
  value: Numeric
}

export interface PatientMeasurementsP8 {
  comparator: Generated<Comparator>
  id: string
  patient_id: string
  units: string
  value: Numeric
}

export interface PatientMeasurementsP9 {
  comparator: Generated<Comparator>
  id: string
  patient_id: string
  units: string
  value: Numeric
}

export interface PatientOccupations {
  created_at: Generated<Timestamp>
  id: Generated<string>
  occupation: Json | null
  patient_id: string
  updated_at: Generated<Timestamp>
}

export interface PatientPresence {
  created_at: Generated<Timestamp>
  current_workflow: Workflow | null
  department_name: string
  id: string
  next_workflow: Workflow | null
  organization_id: string
  organization_room_id: string
  patient_encounter_id: string
  updated_at: Generated<Timestamp>
}

export interface PatientProcedures {
  as_part_of_procedure_id: string | null
  by_system: boolean
  employment_id: string | null
  id: string
  patient_id: string
}

export interface PatientProceduresP0 {
  as_part_of_procedure_id: string | null
  by_system: boolean
  employment_id: string | null
  id: string
  patient_id: string
}

export interface PatientProceduresP1 {
  as_part_of_procedure_id: string | null
  by_system: boolean
  employment_id: string | null
  id: string
  patient_id: string
}

export interface PatientProceduresP10 {
  as_part_of_procedure_id: string | null
  by_system: boolean
  employment_id: string | null
  id: string
  patient_id: string
}

export interface PatientProceduresP11 {
  as_part_of_procedure_id: string | null
  by_system: boolean
  employment_id: string | null
  id: string
  patient_id: string
}

export interface PatientProceduresP12 {
  as_part_of_procedure_id: string | null
  by_system: boolean
  employment_id: string | null
  id: string
  patient_id: string
}

export interface PatientProceduresP13 {
  as_part_of_procedure_id: string | null
  by_system: boolean
  employment_id: string | null
  id: string
  patient_id: string
}

export interface PatientProceduresP14 {
  as_part_of_procedure_id: string | null
  by_system: boolean
  employment_id: string | null
  id: string
  patient_id: string
}

export interface PatientProceduresP15 {
  as_part_of_procedure_id: string | null
  by_system: boolean
  employment_id: string | null
  id: string
  patient_id: string
}

export interface PatientProceduresP2 {
  as_part_of_procedure_id: string | null
  by_system: boolean
  employment_id: string | null
  id: string
  patient_id: string
}

export interface PatientProceduresP3 {
  as_part_of_procedure_id: string | null
  by_system: boolean
  employment_id: string | null
  id: string
  patient_id: string
}

export interface PatientProceduresP4 {
  as_part_of_procedure_id: string | null
  by_system: boolean
  employment_id: string | null
  id: string
  patient_id: string
}

export interface PatientProceduresP5 {
  as_part_of_procedure_id: string | null
  by_system: boolean
  employment_id: string | null
  id: string
  patient_id: string
}

export interface PatientProceduresP6 {
  as_part_of_procedure_id: string | null
  by_system: boolean
  employment_id: string | null
  id: string
  patient_id: string
}

export interface PatientProceduresP7 {
  as_part_of_procedure_id: string | null
  by_system: boolean
  employment_id: string | null
  id: string
  patient_id: string
}

export interface PatientProceduresP8 {
  as_part_of_procedure_id: string | null
  by_system: boolean
  employment_id: string | null
  id: string
  patient_id: string
}

export interface PatientProceduresP9 {
  as_part_of_procedure_id: string | null
  by_system: boolean
  employment_id: string | null
  id: string
  patient_id: string
}

export interface PatientRecordLinks {
  href: string
  id: string
  patient_id: string
  thumbnail_href: string | null
  title: string
}

export interface PatientRecordLinksP0 {
  href: string
  id: string
  patient_id: string
  thumbnail_href: string | null
  title: string
}

export interface PatientRecordLinksP1 {
  href: string
  id: string
  patient_id: string
  thumbnail_href: string | null
  title: string
}

export interface PatientRecordLinksP10 {
  href: string
  id: string
  patient_id: string
  thumbnail_href: string | null
  title: string
}

export interface PatientRecordLinksP11 {
  href: string
  id: string
  patient_id: string
  thumbnail_href: string | null
  title: string
}

export interface PatientRecordLinksP12 {
  href: string
  id: string
  patient_id: string
  thumbnail_href: string | null
  title: string
}

export interface PatientRecordLinksP13 {
  href: string
  id: string
  patient_id: string
  thumbnail_href: string | null
  title: string
}

export interface PatientRecordLinksP14 {
  href: string
  id: string
  patient_id: string
  thumbnail_href: string | null
  title: string
}

export interface PatientRecordLinksP15 {
  href: string
  id: string
  patient_id: string
  thumbnail_href: string | null
  title: string
}

export interface PatientRecordLinksP2 {
  href: string
  id: string
  patient_id: string
  thumbnail_href: string | null
  title: string
}

export interface PatientRecordLinksP3 {
  href: string
  id: string
  patient_id: string
  thumbnail_href: string | null
  title: string
}

export interface PatientRecordLinksP4 {
  href: string
  id: string
  patient_id: string
  thumbnail_href: string | null
  title: string
}

export interface PatientRecordLinksP5 {
  href: string
  id: string
  patient_id: string
  thumbnail_href: string | null
  title: string
}

export interface PatientRecordLinksP6 {
  href: string
  id: string
  patient_id: string
  thumbnail_href: string | null
  title: string
}

export interface PatientRecordLinksP7 {
  href: string
  id: string
  patient_id: string
  thumbnail_href: string | null
  title: string
}

export interface PatientRecordLinksP8 {
  href: string
  id: string
  patient_id: string
  thumbnail_href: string | null
  title: string
}

export interface PatientRecordLinksP9 {
  href: string
  id: string
  patient_id: string
  thumbnail_href: string | null
  title: string
}

export interface PatientRecordQualifiers {
  id: string
  patient_id: string
  qualifies_record_id: string
}

export interface PatientRecordQualifiersP0 {
  id: string
  patient_id: string
  qualifies_record_id: string
}

export interface PatientRecordQualifiersP1 {
  id: string
  patient_id: string
  qualifies_record_id: string
}

export interface PatientRecordQualifiersP10 {
  id: string
  patient_id: string
  qualifies_record_id: string
}

export interface PatientRecordQualifiersP11 {
  id: string
  patient_id: string
  qualifies_record_id: string
}

export interface PatientRecordQualifiersP12 {
  id: string
  patient_id: string
  qualifies_record_id: string
}

export interface PatientRecordQualifiersP13 {
  id: string
  patient_id: string
  qualifies_record_id: string
}

export interface PatientRecordQualifiersP14 {
  id: string
  patient_id: string
  qualifies_record_id: string
}

export interface PatientRecordQualifiersP15 {
  id: string
  patient_id: string
  qualifies_record_id: string
}

export interface PatientRecordQualifiersP2 {
  id: string
  patient_id: string
  qualifies_record_id: string
}

export interface PatientRecordQualifiersP3 {
  id: string
  patient_id: string
  qualifies_record_id: string
}

export interface PatientRecordQualifiersP4 {
  id: string
  patient_id: string
  qualifies_record_id: string
}

export interface PatientRecordQualifiersP5 {
  id: string
  patient_id: string
  qualifies_record_id: string
}

export interface PatientRecordQualifiersP6 {
  id: string
  patient_id: string
  qualifies_record_id: string
}

export interface PatientRecordQualifiersP7 {
  id: string
  patient_id: string
  qualifies_record_id: string
}

export interface PatientRecordQualifiersP8 {
  id: string
  patient_id: string
  qualifies_record_id: string
}

export interface PatientRecordQualifiersP9 {
  id: string
  patient_id: string
  qualifies_record_id: string
}

export interface PatientRecordRelations {
  destination_id: string
  id: string
  patient_id: string
  source_id: string
}

export interface PatientRecordRelationsP0 {
  destination_id: string
  id: string
  patient_id: string
  source_id: string
}

export interface PatientRecordRelationsP1 {
  destination_id: string
  id: string
  patient_id: string
  source_id: string
}

export interface PatientRecordRelationsP10 {
  destination_id: string
  id: string
  patient_id: string
  source_id: string
}

export interface PatientRecordRelationsP11 {
  destination_id: string
  id: string
  patient_id: string
  source_id: string
}

export interface PatientRecordRelationsP12 {
  destination_id: string
  id: string
  patient_id: string
  source_id: string
}

export interface PatientRecordRelationsP13 {
  destination_id: string
  id: string
  patient_id: string
  source_id: string
}

export interface PatientRecordRelationsP14 {
  destination_id: string
  id: string
  patient_id: string
  source_id: string
}

export interface PatientRecordRelationsP15 {
  destination_id: string
  id: string
  patient_id: string
  source_id: string
}

export interface PatientRecordRelationsP2 {
  destination_id: string
  id: string
  patient_id: string
  source_id: string
}

export interface PatientRecordRelationsP3 {
  destination_id: string
  id: string
  patient_id: string
  source_id: string
}

export interface PatientRecordRelationsP4 {
  destination_id: string
  id: string
  patient_id: string
  source_id: string
}

export interface PatientRecordRelationsP5 {
  destination_id: string
  id: string
  patient_id: string
  source_id: string
}

export interface PatientRecordRelationsP6 {
  destination_id: string
  id: string
  patient_id: string
  source_id: string
}

export interface PatientRecordRelationsP7 {
  destination_id: string
  id: string
  patient_id: string
  source_id: string
}

export interface PatientRecordRelationsP8 {
  destination_id: string
  id: string
  patient_id: string
  source_id: string
}

export interface PatientRecordRelationsP9 {
  destination_id: string
  id: string
  patient_id: string
  source_id: string
}

export interface PatientRecords {
  created_at: Generated<Timestamp>
  id: Generated<string>
  patient_encounter_id: string
  patient_id: string
  root_snomed_concept_id: Int8
  specific_snomed_concept_id: Int8
  updated_at: Generated<Timestamp>
  value_snomed_concept_id: Int8 | null
}

export interface PatientRecordSExpressions {
  id: string
  patient_id: string
  s_expression: string
}

export interface PatientRecordSExpressionsP0 {
  id: string
  patient_id: string
  s_expression: string
}

export interface PatientRecordSExpressionsP1 {
  id: string
  patient_id: string
  s_expression: string
}

export interface PatientRecordSExpressionsP10 {
  id: string
  patient_id: string
  s_expression: string
}

export interface PatientRecordSExpressionsP11 {
  id: string
  patient_id: string
  s_expression: string
}

export interface PatientRecordSExpressionsP12 {
  id: string
  patient_id: string
  s_expression: string
}

export interface PatientRecordSExpressionsP13 {
  id: string
  patient_id: string
  s_expression: string
}

export interface PatientRecordSExpressionsP14 {
  id: string
  patient_id: string
  s_expression: string
}

export interface PatientRecordSExpressionsP15 {
  id: string
  patient_id: string
  s_expression: string
}

export interface PatientRecordSExpressionsP2 {
  id: string
  patient_id: string
  s_expression: string
}

export interface PatientRecordSExpressionsP3 {
  id: string
  patient_id: string
  s_expression: string
}

export interface PatientRecordSExpressionsP4 {
  id: string
  patient_id: string
  s_expression: string
}

export interface PatientRecordSExpressionsP5 {
  id: string
  patient_id: string
  s_expression: string
}

export interface PatientRecordSExpressionsP6 {
  id: string
  patient_id: string
  s_expression: string
}

export interface PatientRecordSExpressionsP7 {
  id: string
  patient_id: string
  s_expression: string
}

export interface PatientRecordSExpressionsP8 {
  id: string
  patient_id: string
  s_expression: string
}

export interface PatientRecordSExpressionsP9 {
  id: string
  patient_id: string
  s_expression: string
}

export interface PatientRecordsP0 {
  created_at: Generated<Timestamp>
  id: Generated<string>
  patient_encounter_id: string
  patient_id: string
  root_snomed_concept_id: Int8
  specific_snomed_concept_id: Int8
  updated_at: Generated<Timestamp>
  value_snomed_concept_id: Int8 | null
}

export interface PatientRecordsP1 {
  created_at: Generated<Timestamp>
  id: Generated<string>
  patient_encounter_id: string
  patient_id: string
  root_snomed_concept_id: Int8
  specific_snomed_concept_id: Int8
  updated_at: Generated<Timestamp>
  value_snomed_concept_id: Int8 | null
}

export interface PatientRecordsP10 {
  created_at: Generated<Timestamp>
  id: Generated<string>
  patient_encounter_id: string
  patient_id: string
  root_snomed_concept_id: Int8
  specific_snomed_concept_id: Int8
  updated_at: Generated<Timestamp>
  value_snomed_concept_id: Int8 | null
}

export interface PatientRecordsP11 {
  created_at: Generated<Timestamp>
  id: Generated<string>
  patient_encounter_id: string
  patient_id: string
  root_snomed_concept_id: Int8
  specific_snomed_concept_id: Int8
  updated_at: Generated<Timestamp>
  value_snomed_concept_id: Int8 | null
}

export interface PatientRecordsP12 {
  created_at: Generated<Timestamp>
  id: Generated<string>
  patient_encounter_id: string
  patient_id: string
  root_snomed_concept_id: Int8
  specific_snomed_concept_id: Int8
  updated_at: Generated<Timestamp>
  value_snomed_concept_id: Int8 | null
}

export interface PatientRecordsP13 {
  created_at: Generated<Timestamp>
  id: Generated<string>
  patient_encounter_id: string
  patient_id: string
  root_snomed_concept_id: Int8
  specific_snomed_concept_id: Int8
  updated_at: Generated<Timestamp>
  value_snomed_concept_id: Int8 | null
}

export interface PatientRecordsP14 {
  created_at: Generated<Timestamp>
  id: Generated<string>
  patient_encounter_id: string
  patient_id: string
  root_snomed_concept_id: Int8
  specific_snomed_concept_id: Int8
  updated_at: Generated<Timestamp>
  value_snomed_concept_id: Int8 | null
}

export interface PatientRecordsP15 {
  created_at: Generated<Timestamp>
  id: Generated<string>
  patient_encounter_id: string
  patient_id: string
  root_snomed_concept_id: Int8
  specific_snomed_concept_id: Int8
  updated_at: Generated<Timestamp>
  value_snomed_concept_id: Int8 | null
}

export interface PatientRecordsP2 {
  created_at: Generated<Timestamp>
  id: Generated<string>
  patient_encounter_id: string
  patient_id: string
  root_snomed_concept_id: Int8
  specific_snomed_concept_id: Int8
  updated_at: Generated<Timestamp>
  value_snomed_concept_id: Int8 | null
}

export interface PatientRecordsP3 {
  created_at: Generated<Timestamp>
  id: Generated<string>
  patient_encounter_id: string
  patient_id: string
  root_snomed_concept_id: Int8
  specific_snomed_concept_id: Int8
  updated_at: Generated<Timestamp>
  value_snomed_concept_id: Int8 | null
}

export interface PatientRecordsP4 {
  created_at: Generated<Timestamp>
  id: Generated<string>
  patient_encounter_id: string
  patient_id: string
  root_snomed_concept_id: Int8
  specific_snomed_concept_id: Int8
  updated_at: Generated<Timestamp>
  value_snomed_concept_id: Int8 | null
}

export interface PatientRecordsP5 {
  created_at: Generated<Timestamp>
  id: Generated<string>
  patient_encounter_id: string
  patient_id: string
  root_snomed_concept_id: Int8
  specific_snomed_concept_id: Int8
  updated_at: Generated<Timestamp>
  value_snomed_concept_id: Int8 | null
}

export interface PatientRecordsP6 {
  created_at: Generated<Timestamp>
  id: Generated<string>
  patient_encounter_id: string
  patient_id: string
  root_snomed_concept_id: Int8
  specific_snomed_concept_id: Int8
  updated_at: Generated<Timestamp>
  value_snomed_concept_id: Int8 | null
}

export interface PatientRecordsP7 {
  created_at: Generated<Timestamp>
  id: Generated<string>
  patient_encounter_id: string
  patient_id: string
  root_snomed_concept_id: Int8
  specific_snomed_concept_id: Int8
  updated_at: Generated<Timestamp>
  value_snomed_concept_id: Int8 | null
}

export interface PatientRecordsP8 {
  created_at: Generated<Timestamp>
  id: Generated<string>
  patient_encounter_id: string
  patient_id: string
  root_snomed_concept_id: Int8
  specific_snomed_concept_id: Int8
  updated_at: Generated<Timestamp>
  value_snomed_concept_id: Int8 | null
}

export interface PatientRecordsP9 {
  created_at: Generated<Timestamp>
  id: Generated<string>
  patient_encounter_id: string
  patient_id: string
  root_snomed_concept_id: Int8
  specific_snomed_concept_id: Int8
  updated_at: Generated<Timestamp>
  value_snomed_concept_id: Int8 | null
}

export interface PatientReferrals {
  employment_id: string | null
  id: string
  organization_department_id: string | null
  organization_id: string | null
  organization_room_id: string | null
  patient_id: string
}

export interface PatientReferralsP0 {
  employment_id: string | null
  id: string
  organization_department_id: string | null
  organization_id: string | null
  organization_room_id: string | null
  patient_id: string
}

export interface PatientReferralsP1 {
  employment_id: string | null
  id: string
  organization_department_id: string | null
  organization_id: string | null
  organization_room_id: string | null
  patient_id: string
}

export interface PatientReferralsP10 {
  employment_id: string | null
  id: string
  organization_department_id: string | null
  organization_id: string | null
  organization_room_id: string | null
  patient_id: string
}

export interface PatientReferralsP11 {
  employment_id: string | null
  id: string
  organization_department_id: string | null
  organization_id: string | null
  organization_room_id: string | null
  patient_id: string
}

export interface PatientReferralsP12 {
  employment_id: string | null
  id: string
  organization_department_id: string | null
  organization_id: string | null
  organization_room_id: string | null
  patient_id: string
}

export interface PatientReferralsP13 {
  employment_id: string | null
  id: string
  organization_department_id: string | null
  organization_id: string | null
  organization_room_id: string | null
  patient_id: string
}

export interface PatientReferralsP14 {
  employment_id: string | null
  id: string
  organization_department_id: string | null
  organization_id: string | null
  organization_room_id: string | null
  patient_id: string
}

export interface PatientReferralsP15 {
  employment_id: string | null
  id: string
  organization_department_id: string | null
  organization_id: string | null
  organization_room_id: string | null
  patient_id: string
}

export interface PatientReferralsP2 {
  employment_id: string | null
  id: string
  organization_department_id: string | null
  organization_id: string | null
  organization_room_id: string | null
  patient_id: string
}

export interface PatientReferralsP3 {
  employment_id: string | null
  id: string
  organization_department_id: string | null
  organization_id: string | null
  organization_room_id: string | null
  patient_id: string
}

export interface PatientReferralsP4 {
  employment_id: string | null
  id: string
  organization_department_id: string | null
  organization_id: string | null
  organization_room_id: string | null
  patient_id: string
}

export interface PatientReferralsP5 {
  employment_id: string | null
  id: string
  organization_department_id: string | null
  organization_id: string | null
  organization_room_id: string | null
  patient_id: string
}

export interface PatientReferralsP6 {
  employment_id: string | null
  id: string
  organization_department_id: string | null
  organization_id: string | null
  organization_room_id: string | null
  patient_id: string
}

export interface PatientReferralsP7 {
  employment_id: string | null
  id: string
  organization_department_id: string | null
  organization_id: string | null
  organization_room_id: string | null
  patient_id: string
}

export interface PatientReferralsP8 {
  employment_id: string | null
  id: string
  organization_department_id: string | null
  organization_id: string | null
  organization_room_id: string | null
  patient_id: string
}

export interface PatientReferralsP9 {
  employment_id: string | null
  id: string
  organization_department_id: string | null
  organization_id: string | null
  organization_room_id: string | null
  patient_id: string
}

export interface PatientRegistration {
  being_taken_by: string
  created_at: Generated<Timestamp>
  id: Generated<string>
  organization_id: string
  patient_id: string
  updated_at: Generated<Timestamp>
}

export interface Patients {
  address_id: string | null
  avatar_media_id: string | null
  completed_registration: Generated<boolean>
  country: string
  created_at: Generated<Timestamp>
  date_of_birth: Timestamp | null
  ethnicity: string | null
  first_names: string | null
  gender: string | null
  id: Generated<string>
  location: string | null
  name: string | null
  national_id_number: string | null
  nearest_organization_id: string | null
  phone_number: string | null
  preferred_language_code_iso_639_2_b: string | null
  preferred_name: string | null
  primary_doctor_id: string | null
  sex: Sex | null
  surname: string | null
  unregistered_primary_doctor_name: string | null
  updated_at: Generated<Timestamp>
}

export interface PatientSymptoms {
  end_date: Timestamp | null
  id: string
  notes: string | null
  patient_id: string
  severity: number
  start_date: Timestamp
}

export interface PatientSymptomsP0 {
  end_date: Timestamp | null
  id: string
  notes: string | null
  patient_id: string
  severity: number
  start_date: Timestamp
}

export interface PatientSymptomsP1 {
  end_date: Timestamp | null
  id: string
  notes: string | null
  patient_id: string
  severity: number
  start_date: Timestamp
}

export interface PatientSymptomsP10 {
  end_date: Timestamp | null
  id: string
  notes: string | null
  patient_id: string
  severity: number
  start_date: Timestamp
}

export interface PatientSymptomsP11 {
  end_date: Timestamp | null
  id: string
  notes: string | null
  patient_id: string
  severity: number
  start_date: Timestamp
}

export interface PatientSymptomsP12 {
  end_date: Timestamp | null
  id: string
  notes: string | null
  patient_id: string
  severity: number
  start_date: Timestamp
}

export interface PatientSymptomsP13 {
  end_date: Timestamp | null
  id: string
  notes: string | null
  patient_id: string
  severity: number
  start_date: Timestamp
}

export interface PatientSymptomsP14 {
  end_date: Timestamp | null
  id: string
  notes: string | null
  patient_id: string
  severity: number
  start_date: Timestamp
}

export interface PatientSymptomsP15 {
  end_date: Timestamp | null
  id: string
  notes: string | null
  patient_id: string
  severity: number
  start_date: Timestamp
}

export interface PatientSymptomsP2 {
  end_date: Timestamp | null
  id: string
  notes: string | null
  patient_id: string
  severity: number
  start_date: Timestamp
}

export interface PatientSymptomsP3 {
  end_date: Timestamp | null
  id: string
  notes: string | null
  patient_id: string
  severity: number
  start_date: Timestamp
}

export interface PatientSymptomsP4 {
  end_date: Timestamp | null
  id: string
  notes: string | null
  patient_id: string
  severity: number
  start_date: Timestamp
}

export interface PatientSymptomsP5 {
  end_date: Timestamp | null
  id: string
  notes: string | null
  patient_id: string
  severity: number
  start_date: Timestamp
}

export interface PatientSymptomsP6 {
  end_date: Timestamp | null
  id: string
  notes: string | null
  patient_id: string
  severity: number
  start_date: Timestamp
}

export interface PatientSymptomsP7 {
  end_date: Timestamp | null
  id: string
  notes: string | null
  patient_id: string
  severity: number
  start_date: Timestamp
}

export interface PatientSymptomsP8 {
  end_date: Timestamp | null
  id: string
  notes: string | null
  patient_id: string
  severity: number
  start_date: Timestamp
}

export interface PatientSymptomsP9 {
  end_date: Timestamp | null
  id: string
  notes: string | null
  patient_id: string
  severity: number
  start_date: Timestamp
}

export interface PatientTriageLevel {
  created_at: Generated<Timestamp>
  id: string
  patient_id: string
  target_treatment_time: Timestamp | null
}

export interface PatientTriageLevelP0 {
  created_at: Generated<Timestamp>
  id: string
  patient_id: string
  target_treatment_time: Timestamp | null
}

export interface PatientTriageLevelP1 {
  created_at: Generated<Timestamp>
  id: string
  patient_id: string
  target_treatment_time: Timestamp | null
}

export interface PatientTriageLevelP10 {
  created_at: Generated<Timestamp>
  id: string
  patient_id: string
  target_treatment_time: Timestamp | null
}

export interface PatientTriageLevelP11 {
  created_at: Generated<Timestamp>
  id: string
  patient_id: string
  target_treatment_time: Timestamp | null
}

export interface PatientTriageLevelP12 {
  created_at: Generated<Timestamp>
  id: string
  patient_id: string
  target_treatment_time: Timestamp | null
}

export interface PatientTriageLevelP13 {
  created_at: Generated<Timestamp>
  id: string
  patient_id: string
  target_treatment_time: Timestamp | null
}

export interface PatientTriageLevelP14 {
  created_at: Generated<Timestamp>
  id: string
  patient_id: string
  target_treatment_time: Timestamp | null
}

export interface PatientTriageLevelP15 {
  created_at: Generated<Timestamp>
  id: string
  patient_id: string
  target_treatment_time: Timestamp | null
}

export interface PatientTriageLevelP2 {
  created_at: Generated<Timestamp>
  id: string
  patient_id: string
  target_treatment_time: Timestamp | null
}

export interface PatientTriageLevelP3 {
  created_at: Generated<Timestamp>
  id: string
  patient_id: string
  target_treatment_time: Timestamp | null
}

export interface PatientTriageLevelP4 {
  created_at: Generated<Timestamp>
  id: string
  patient_id: string
  target_treatment_time: Timestamp | null
}

export interface PatientTriageLevelP5 {
  created_at: Generated<Timestamp>
  id: string
  patient_id: string
  target_treatment_time: Timestamp | null
}

export interface PatientTriageLevelP6 {
  created_at: Generated<Timestamp>
  id: string
  patient_id: string
  target_treatment_time: Timestamp | null
}

export interface PatientTriageLevelP7 {
  created_at: Generated<Timestamp>
  id: string
  patient_id: string
  target_treatment_time: Timestamp | null
}

export interface PatientTriageLevelP8 {
  created_at: Generated<Timestamp>
  id: string
  patient_id: string
  target_treatment_time: Timestamp | null
}

export interface PatientTriageLevelP9 {
  created_at: Generated<Timestamp>
  id: string
  patient_id: string
  target_treatment_time: Timestamp | null
}

export interface PatientWorkflows {
  created_at: Generated<Timestamp>
  id: Generated<string>
  patient_encounter_id: string
  updated_at: Generated<Timestamp>
  workflow: Workflow
}

export interface PatientWorkflowsCompleted {
  created_at: Generated<Timestamp>
  id: string
}

export interface PatientWorkflowsStarted {
  created_at: Generated<Timestamp>
  id: Generated<string>
  patient_encounter_employee_id: string
  patient_workflow_id: string
  updated_at: Generated<Timestamp>
}

export interface PatientWorkflowStepsCompleted {
  created_at: Generated<Timestamp>
  id: Generated<string>
  patient_workflow_id: string
  updated_at: Generated<Timestamp>
  workflow_step: string
}

export interface PgStatMonitor {
  application_name: string | null
  blk_read_time: number | null
  blk_write_time: number | null
  bucket: Int8 | null
  bucket_done: boolean | null
  bucket_start_time: Timestamp | null
  calls: Int8 | null
  client_ip: string | null
  cmd_type: number | null
  cmd_type_text: string | null
  comments: string | null
  cpu_sys_time: number | null
  cpu_user_time: number | null
  datname: string | null
  dbid: number | null
  elevel: number | null
  jit_emission_count: Int8 | null
  jit_emission_time: number | null
  jit_functions: Int8 | null
  jit_generation_time: number | null
  jit_inlining_count: Int8 | null
  jit_inlining_time: number | null
  jit_optimization_count: Int8 | null
  jit_optimization_time: number | null
  local_blks_dirtied: Int8 | null
  local_blks_hit: Int8 | null
  local_blks_read: Int8 | null
  local_blks_written: Int8 | null
  max_exec_time: number | null
  max_plan_time: number | null
  mean_exec_time: number | null
  mean_plan_time: number | null
  message: string | null
  min_exec_time: number | null
  min_plan_time: number | null
  pgsm_query_id: Int8 | null
  planid: Int8 | null
  plans: Int8 | null
  query: string | null
  query_plan: string | null
  queryid: Int8 | null
  relations: string[] | null
  resp_calls: string[] | null
  rows: Int8 | null
  shared_blks_dirtied: Int8 | null
  shared_blks_hit: Int8 | null
  shared_blks_read: Int8 | null
  shared_blks_written: Int8 | null
  sqlcode: string | null
  stddev_exec_time: number | null
  stddev_plan_time: number | null
  temp_blk_read_time: number | null
  temp_blk_write_time: number | null
  temp_blks_read: Int8 | null
  temp_blks_written: Int8 | null
  top_query: string | null
  top_queryid: Int8 | null
  toplevel: boolean | null
  total_exec_time: number | null
  total_plan_time: number | null
  userid: number | null
  username: string | null
  wal_bytes: Numeric | null
  wal_fpi: Int8 | null
  wal_records: Int8 | null
}

export interface PgStatStatements {
  blk_read_time: number | null
  blk_write_time: number | null
  calls: Int8 | null
  dbid: number | null
  jit_emission_count: Int8 | null
  jit_emission_time: number | null
  jit_functions: Int8 | null
  jit_generation_time: number | null
  jit_inlining_count: Int8 | null
  jit_inlining_time: number | null
  jit_optimization_count: Int8 | null
  jit_optimization_time: number | null
  local_blks_dirtied: Int8 | null
  local_blks_hit: Int8 | null
  local_blks_read: Int8 | null
  local_blks_written: Int8 | null
  max_exec_time: number | null
  max_plan_time: number | null
  mean_exec_time: number | null
  mean_plan_time: number | null
  min_exec_time: number | null
  min_plan_time: number | null
  plans: Int8 | null
  query: string | null
  queryid: Int8 | null
  rows: Int8 | null
  shared_blks_dirtied: Int8 | null
  shared_blks_hit: Int8 | null
  shared_blks_read: Int8 | null
  shared_blks_written: Int8 | null
  stddev_exec_time: number | null
  stddev_plan_time: number | null
  temp_blk_read_time: number | null
  temp_blk_write_time: number | null
  temp_blks_read: Int8 | null
  temp_blks_written: Int8 | null
  toplevel: boolean | null
  total_exec_time: number | null
  total_plan_time: number | null
  userid: number | null
  wal_bytes: Numeric | null
  wal_fpi: Int8 | null
  wal_records: Int8 | null
}

export interface PgStatStatementsInfo {
  dealloc: Int8 | null
  stats_reset: Timestamp | null
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

export interface Providers {
  id: string
}

export interface Receptionists {
  id: string
}

export interface Regulators {
  avatar_media_id: string | null
  country: string
  created_at: Generated<Timestamp>
  email: string
  id: Generated<string>
  name: string
  updated_at: Generated<Timestamp>
}

export interface SatsPriorityLevels {
  id: Int8
  sats_name: string
}

export interface SatsTriageAssessmentOptions {
  assessment_snomed_concept_id: Int8
  created_at: Generated<Timestamp>
  display_label: string
  display_order: number
  id: string
  option_snomed_concept_id: Int8
  ordinal_value: number
  updated_at: Generated<Timestamp>
}

export interface SatsTriageAssessments {
  assessment_snomed_concept_id: Int8
  category: string
  created_at: Generated<Timestamp>
  display_order: number
  required_for_triage: Generated<boolean>
  updated_at: Generated<Timestamp>
  vital: VitalAssessment
}

export interface SatsTriageScoringRules {
  age_max_days: number | null
  age_min_days: number | null
  assessment_option_id: string | null
  created_at: Generated<Timestamp>
  height_max_cm: number | null
  height_min_cm: number | null
  id: string
  score_value: number
  scoring_system: string
  specific_snomed_concept_id: Int8 | null
  updated_at: Generated<Timestamp>
  value_max: Numeric | null
  value_min: Numeric | null
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

export interface SnomedFamilyHistory {
  id: Int8
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

export interface SnomedInferredCanonicalNameAndCategory {
  category: SnomedCategory
  description_id: Int8
  id: Int8
  language_code: string
  name: string
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

export interface SpeechTranscriptions {
  created_at: Generated<Timestamp>
  finished: boolean
  id: Generated<string>
  media_speech_id: string
  model: string
  transcription: string | null
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

export interface Workflows {
  order: Int8
  snomed_concept_id: Int8
  workflow: Workflow
}

export interface WorkflowSteps {
  order: Int8
  snomed_concept_id: Int8 | null
  step: string
  workflow: Workflow
  workflow_step: string
}

export interface DB {
  addresses: Addresses
  age_measurement_requirements: AgeMeasurementRequirements
  appointment_media: AppointmentMedia
  appointment_providers: AppointmentProviders
  appointments: Appointments
  condition_icd10_codes: ConditionIcd10Codes
  condition_measurement_requirements: ConditionMeasurementRequirements
  conditions: Conditions
  consumables: Consumables
  consumption: Consumption
  countries: Countries
  department_employment: DepartmentEmployment
  departments: Departments
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
  doctors: Doctors
  drugs: Drugs
  employment: Employment
  employment_calendars: EmploymentCalendars
  employment_presence: EmploymentPresence
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
  languages: Languages
  mailing_list: MailingList
  manufactured_medication_availabilities: ManufacturedMedicationAvailabilities
  manufactured_medication_recalls: ManufacturedMedicationRecalls
  manufactured_medication_strengths: ManufacturedMedicationStrengths
  manufactured_medications: ManufacturedMedications
  measurement_reference_ranges: MeasurementReferenceRanges
  media: Media
  media_audios: MediaAudios
  media_images: MediaImages
  media_images_or_videos: MediaImagesOrVideos
  media_speeches: MediaSpeeches
  media_videos: MediaVideos
  medications: Medications
  message_draft_concerning: MessageDraftConcerning
  message_draft_targets: MessageDraftTargets
  message_drafts: MessageDrafts
  message_reads: MessageReads
  message_thread_participants: MessageThreadParticipants
  message_thread_subjects: MessageThreadSubjects
  message_threads: MessageThreads
  messages: Messages
  nurse_registration_details: NurseRegistrationDetails
  nurse_registration_details_in_progress: NurseRegistrationDetailsInProgress
  nurses: Nurses
  organization_admins: OrganizationAdmins
  organization_consumables: OrganizationConsumables
  organization_department_rooms: OrganizationDepartmentRooms
  organization_departments: OrganizationDepartments
  organization_devices: OrganizationDevices
  organization_rooms: OrganizationRooms
  organizations: Organizations
  patient_age: PatientAge
  patient_allergies: PatientAllergies
  patient_appointment_offered_times: PatientAppointmentOfferedTimes
  patient_appointment_request_media: PatientAppointmentRequestMedia
  patient_appointment_requests: PatientAppointmentRequests
  patient_chatbot_user_whatsapp_messages_received: PatientChatbotUserWhatsappMessagesReceived
  patient_chatbot_users: PatientChatbotUsers
  patient_chief_complaints: PatientChiefComplaints
  patient_chief_complaints_p0: PatientChiefComplaintsP0
  patient_chief_complaints_p1: PatientChiefComplaintsP1
  patient_chief_complaints_p10: PatientChiefComplaintsP10
  patient_chief_complaints_p11: PatientChiefComplaintsP11
  patient_chief_complaints_p12: PatientChiefComplaintsP12
  patient_chief_complaints_p13: PatientChiefComplaintsP13
  patient_chief_complaints_p14: PatientChiefComplaintsP14
  patient_chief_complaints_p15: PatientChiefComplaintsP15
  patient_chief_complaints_p2: PatientChiefComplaintsP2
  patient_chief_complaints_p3: PatientChiefComplaintsP3
  patient_chief_complaints_p4: PatientChiefComplaintsP4
  patient_chief_complaints_p5: PatientChiefComplaintsP5
  patient_chief_complaints_p6: PatientChiefComplaintsP6
  patient_chief_complaints_p7: PatientChiefComplaintsP7
  patient_chief_complaints_p8: PatientChiefComplaintsP8
  patient_chief_complaints_p9: PatientChiefComplaintsP9
  patient_computed_findings: PatientComputedFindings
  patient_computed_findings_inputs: PatientComputedFindingsInputs
  patient_computed_findings_inputs_p0: PatientComputedFindingsInputsP0
  patient_computed_findings_inputs_p1: PatientComputedFindingsInputsP1
  patient_computed_findings_inputs_p10: PatientComputedFindingsInputsP10
  patient_computed_findings_inputs_p11: PatientComputedFindingsInputsP11
  patient_computed_findings_inputs_p12: PatientComputedFindingsInputsP12
  patient_computed_findings_inputs_p13: PatientComputedFindingsInputsP13
  patient_computed_findings_inputs_p14: PatientComputedFindingsInputsP14
  patient_computed_findings_inputs_p15: PatientComputedFindingsInputsP15
  patient_computed_findings_inputs_p2: PatientComputedFindingsInputsP2
  patient_computed_findings_inputs_p3: PatientComputedFindingsInputsP3
  patient_computed_findings_inputs_p4: PatientComputedFindingsInputsP4
  patient_computed_findings_inputs_p5: PatientComputedFindingsInputsP5
  patient_computed_findings_inputs_p6: PatientComputedFindingsInputsP6
  patient_computed_findings_inputs_p7: PatientComputedFindingsInputsP7
  patient_computed_findings_inputs_p8: PatientComputedFindingsInputsP8
  patient_computed_findings_inputs_p9: PatientComputedFindingsInputsP9
  patient_computed_findings_p0: PatientComputedFindingsP0
  patient_computed_findings_p1: PatientComputedFindingsP1
  patient_computed_findings_p10: PatientComputedFindingsP10
  patient_computed_findings_p11: PatientComputedFindingsP11
  patient_computed_findings_p12: PatientComputedFindingsP12
  patient_computed_findings_p13: PatientComputedFindingsP13
  patient_computed_findings_p14: PatientComputedFindingsP14
  patient_computed_findings_p15: PatientComputedFindingsP15
  patient_computed_findings_p2: PatientComputedFindingsP2
  patient_computed_findings_p3: PatientComputedFindingsP3
  patient_computed_findings_p4: PatientComputedFindingsP4
  patient_computed_findings_p5: PatientComputedFindingsP5
  patient_computed_findings_p6: PatientComputedFindingsP6
  patient_computed_findings_p7: PatientComputedFindingsP7
  patient_computed_findings_p8: PatientComputedFindingsP8
  patient_computed_findings_p9: PatientComputedFindingsP9
  patient_condition_medications: PatientConditionMedications
  patient_conditions: PatientConditions
  patient_emergency_contacts: PatientEmergencyContacts
  patient_encounter_employees: PatientEncounterEmployees
  patient_encounters: PatientEncounters
  patient_evaluation_scores: PatientEvaluationScores
  patient_evaluation_scores_p0: PatientEvaluationScoresP0
  patient_evaluation_scores_p1: PatientEvaluationScoresP1
  patient_evaluation_scores_p10: PatientEvaluationScoresP10
  patient_evaluation_scores_p11: PatientEvaluationScoresP11
  patient_evaluation_scores_p12: PatientEvaluationScoresP12
  patient_evaluation_scores_p13: PatientEvaluationScoresP13
  patient_evaluation_scores_p14: PatientEvaluationScoresP14
  patient_evaluation_scores_p15: PatientEvaluationScoresP15
  patient_evaluation_scores_p2: PatientEvaluationScoresP2
  patient_evaluation_scores_p3: PatientEvaluationScoresP3
  patient_evaluation_scores_p4: PatientEvaluationScoresP4
  patient_evaluation_scores_p5: PatientEvaluationScoresP5
  patient_evaluation_scores_p6: PatientEvaluationScoresP6
  patient_evaluation_scores_p7: PatientEvaluationScoresP7
  patient_evaluation_scores_p8: PatientEvaluationScoresP8
  patient_evaluation_scores_p9: PatientEvaluationScoresP9
  patient_evaluations: PatientEvaluations
  patient_evaluations_p0: PatientEvaluationsP0
  patient_evaluations_p1: PatientEvaluationsP1
  patient_evaluations_p10: PatientEvaluationsP10
  patient_evaluations_p11: PatientEvaluationsP11
  patient_evaluations_p12: PatientEvaluationsP12
  patient_evaluations_p13: PatientEvaluationsP13
  patient_evaluations_p14: PatientEvaluationsP14
  patient_evaluations_p15: PatientEvaluationsP15
  patient_evaluations_p2: PatientEvaluationsP2
  patient_evaluations_p3: PatientEvaluationsP3
  patient_evaluations_p4: PatientEvaluationsP4
  patient_evaluations_p5: PatientEvaluationsP5
  patient_evaluations_p6: PatientEvaluationsP6
  patient_evaluations_p7: PatientEvaluationsP7
  patient_evaluations_p8: PatientEvaluationsP8
  patient_evaluations_p9: PatientEvaluationsP9
  patient_events: PatientEvents
  patient_events_p0: PatientEventsP0
  patient_events_p1: PatientEventsP1
  patient_events_p10: PatientEventsP10
  patient_events_p11: PatientEventsP11
  patient_events_p12: PatientEventsP12
  patient_events_p13: PatientEventsP13
  patient_events_p14: PatientEventsP14
  patient_events_p15: PatientEventsP15
  patient_events_p2: PatientEventsP2
  patient_events_p3: PatientEventsP3
  patient_events_p4: PatientEventsP4
  patient_events_p5: PatientEventsP5
  patient_events_p6: PatientEventsP6
  patient_events_p7: PatientEventsP7
  patient_events_p8: PatientEventsP8
  patient_events_p9: PatientEventsP9
  patient_examination_finding_body_sites: PatientExaminationFindingBodySites
  patient_examination_findings: PatientExaminationFindings
  patient_examinations: PatientExaminations
  patient_family: PatientFamily
  patient_finding_media_images: PatientFindingMediaImages
  patient_finding_media_images_p0: PatientFindingMediaImagesP0
  patient_finding_media_images_p1: PatientFindingMediaImagesP1
  patient_finding_media_images_p10: PatientFindingMediaImagesP10
  patient_finding_media_images_p11: PatientFindingMediaImagesP11
  patient_finding_media_images_p12: PatientFindingMediaImagesP12
  patient_finding_media_images_p13: PatientFindingMediaImagesP13
  patient_finding_media_images_p14: PatientFindingMediaImagesP14
  patient_finding_media_images_p15: PatientFindingMediaImagesP15
  patient_finding_media_images_p2: PatientFindingMediaImagesP2
  patient_finding_media_images_p3: PatientFindingMediaImagesP3
  patient_finding_media_images_p4: PatientFindingMediaImagesP4
  patient_finding_media_images_p5: PatientFindingMediaImagesP5
  patient_finding_media_images_p6: PatientFindingMediaImagesP6
  patient_finding_media_images_p7: PatientFindingMediaImagesP7
  patient_finding_media_images_p8: PatientFindingMediaImagesP8
  patient_finding_media_images_p9: PatientFindingMediaImagesP9
  patient_finding_media_speeches: PatientFindingMediaSpeeches
  patient_finding_media_speeches_p0: PatientFindingMediaSpeechesP0
  patient_finding_media_speeches_p1: PatientFindingMediaSpeechesP1
  patient_finding_media_speeches_p10: PatientFindingMediaSpeechesP10
  patient_finding_media_speeches_p11: PatientFindingMediaSpeechesP11
  patient_finding_media_speeches_p12: PatientFindingMediaSpeechesP12
  patient_finding_media_speeches_p13: PatientFindingMediaSpeechesP13
  patient_finding_media_speeches_p14: PatientFindingMediaSpeechesP14
  patient_finding_media_speeches_p15: PatientFindingMediaSpeechesP15
  patient_finding_media_speeches_p2: PatientFindingMediaSpeechesP2
  patient_finding_media_speeches_p3: PatientFindingMediaSpeechesP3
  patient_finding_media_speeches_p4: PatientFindingMediaSpeechesP4
  patient_finding_media_speeches_p5: PatientFindingMediaSpeechesP5
  patient_finding_media_speeches_p6: PatientFindingMediaSpeechesP6
  patient_finding_media_speeches_p7: PatientFindingMediaSpeechesP7
  patient_finding_media_speeches_p8: PatientFindingMediaSpeechesP8
  patient_finding_media_speeches_p9: PatientFindingMediaSpeechesP9
  patient_findings: PatientFindings
  patient_findings_p0: PatientFindingsP0
  patient_findings_p1: PatientFindingsP1
  patient_findings_p10: PatientFindingsP10
  patient_findings_p11: PatientFindingsP11
  patient_findings_p12: PatientFindingsP12
  patient_findings_p13: PatientFindingsP13
  patient_findings_p14: PatientFindingsP14
  patient_findings_p15: PatientFindingsP15
  patient_findings_p2: PatientFindingsP2
  patient_findings_p3: PatientFindingsP3
  patient_findings_p4: PatientFindingsP4
  patient_findings_p5: PatientFindingsP5
  patient_findings_p6: PatientFindingsP6
  patient_findings_p7: PatientFindingsP7
  patient_findings_p8: PatientFindingsP8
  patient_findings_p9: PatientFindingsP9
  patient_guardians: PatientGuardians
  patient_insurance: PatientInsurance
  patient_kin: PatientKin
  patient_lifestyle: PatientLifestyle
  patient_measurements: PatientMeasurements
  patient_measurements_p0: PatientMeasurementsP0
  patient_measurements_p1: PatientMeasurementsP1
  patient_measurements_p10: PatientMeasurementsP10
  patient_measurements_p11: PatientMeasurementsP11
  patient_measurements_p12: PatientMeasurementsP12
  patient_measurements_p13: PatientMeasurementsP13
  patient_measurements_p14: PatientMeasurementsP14
  patient_measurements_p15: PatientMeasurementsP15
  patient_measurements_p2: PatientMeasurementsP2
  patient_measurements_p3: PatientMeasurementsP3
  patient_measurements_p4: PatientMeasurementsP4
  patient_measurements_p5: PatientMeasurementsP5
  patient_measurements_p6: PatientMeasurementsP6
  patient_measurements_p7: PatientMeasurementsP7
  patient_measurements_p8: PatientMeasurementsP8
  patient_measurements_p9: PatientMeasurementsP9
  patient_occupations: PatientOccupations
  patient_presence: PatientPresence
  patient_procedures: PatientProcedures
  patient_procedures_p0: PatientProceduresP0
  patient_procedures_p1: PatientProceduresP1
  patient_procedures_p10: PatientProceduresP10
  patient_procedures_p11: PatientProceduresP11
  patient_procedures_p12: PatientProceduresP12
  patient_procedures_p13: PatientProceduresP13
  patient_procedures_p14: PatientProceduresP14
  patient_procedures_p15: PatientProceduresP15
  patient_procedures_p2: PatientProceduresP2
  patient_procedures_p3: PatientProceduresP3
  patient_procedures_p4: PatientProceduresP4
  patient_procedures_p5: PatientProceduresP5
  patient_procedures_p6: PatientProceduresP6
  patient_procedures_p7: PatientProceduresP7
  patient_procedures_p8: PatientProceduresP8
  patient_procedures_p9: PatientProceduresP9
  patient_record_links: PatientRecordLinks
  patient_record_links_p0: PatientRecordLinksP0
  patient_record_links_p1: PatientRecordLinksP1
  patient_record_links_p10: PatientRecordLinksP10
  patient_record_links_p11: PatientRecordLinksP11
  patient_record_links_p12: PatientRecordLinksP12
  patient_record_links_p13: PatientRecordLinksP13
  patient_record_links_p14: PatientRecordLinksP14
  patient_record_links_p15: PatientRecordLinksP15
  patient_record_links_p2: PatientRecordLinksP2
  patient_record_links_p3: PatientRecordLinksP3
  patient_record_links_p4: PatientRecordLinksP4
  patient_record_links_p5: PatientRecordLinksP5
  patient_record_links_p6: PatientRecordLinksP6
  patient_record_links_p7: PatientRecordLinksP7
  patient_record_links_p8: PatientRecordLinksP8
  patient_record_links_p9: PatientRecordLinksP9
  patient_record_qualifiers: PatientRecordQualifiers
  patient_record_qualifiers_p0: PatientRecordQualifiersP0
  patient_record_qualifiers_p1: PatientRecordQualifiersP1
  patient_record_qualifiers_p10: PatientRecordQualifiersP10
  patient_record_qualifiers_p11: PatientRecordQualifiersP11
  patient_record_qualifiers_p12: PatientRecordQualifiersP12
  patient_record_qualifiers_p13: PatientRecordQualifiersP13
  patient_record_qualifiers_p14: PatientRecordQualifiersP14
  patient_record_qualifiers_p15: PatientRecordQualifiersP15
  patient_record_qualifiers_p2: PatientRecordQualifiersP2
  patient_record_qualifiers_p3: PatientRecordQualifiersP3
  patient_record_qualifiers_p4: PatientRecordQualifiersP4
  patient_record_qualifiers_p5: PatientRecordQualifiersP5
  patient_record_qualifiers_p6: PatientRecordQualifiersP6
  patient_record_qualifiers_p7: PatientRecordQualifiersP7
  patient_record_qualifiers_p8: PatientRecordQualifiersP8
  patient_record_qualifiers_p9: PatientRecordQualifiersP9
  patient_record_relations: PatientRecordRelations
  patient_record_relations_p0: PatientRecordRelationsP0
  patient_record_relations_p1: PatientRecordRelationsP1
  patient_record_relations_p10: PatientRecordRelationsP10
  patient_record_relations_p11: PatientRecordRelationsP11
  patient_record_relations_p12: PatientRecordRelationsP12
  patient_record_relations_p13: PatientRecordRelationsP13
  patient_record_relations_p14: PatientRecordRelationsP14
  patient_record_relations_p15: PatientRecordRelationsP15
  patient_record_relations_p2: PatientRecordRelationsP2
  patient_record_relations_p3: PatientRecordRelationsP3
  patient_record_relations_p4: PatientRecordRelationsP4
  patient_record_relations_p5: PatientRecordRelationsP5
  patient_record_relations_p6: PatientRecordRelationsP6
  patient_record_relations_p7: PatientRecordRelationsP7
  patient_record_relations_p8: PatientRecordRelationsP8
  patient_record_relations_p9: PatientRecordRelationsP9
  patient_record_s_expressions: PatientRecordSExpressions
  patient_record_s_expressions_p0: PatientRecordSExpressionsP0
  patient_record_s_expressions_p1: PatientRecordSExpressionsP1
  patient_record_s_expressions_p10: PatientRecordSExpressionsP10
  patient_record_s_expressions_p11: PatientRecordSExpressionsP11
  patient_record_s_expressions_p12: PatientRecordSExpressionsP12
  patient_record_s_expressions_p13: PatientRecordSExpressionsP13
  patient_record_s_expressions_p14: PatientRecordSExpressionsP14
  patient_record_s_expressions_p15: PatientRecordSExpressionsP15
  patient_record_s_expressions_p2: PatientRecordSExpressionsP2
  patient_record_s_expressions_p3: PatientRecordSExpressionsP3
  patient_record_s_expressions_p4: PatientRecordSExpressionsP4
  patient_record_s_expressions_p5: PatientRecordSExpressionsP5
  patient_record_s_expressions_p6: PatientRecordSExpressionsP6
  patient_record_s_expressions_p7: PatientRecordSExpressionsP7
  patient_record_s_expressions_p8: PatientRecordSExpressionsP8
  patient_record_s_expressions_p9: PatientRecordSExpressionsP9
  patient_records: PatientRecords
  patient_records_p0: PatientRecordsP0
  patient_records_p1: PatientRecordsP1
  patient_records_p10: PatientRecordsP10
  patient_records_p11: PatientRecordsP11
  patient_records_p12: PatientRecordsP12
  patient_records_p13: PatientRecordsP13
  patient_records_p14: PatientRecordsP14
  patient_records_p15: PatientRecordsP15
  patient_records_p2: PatientRecordsP2
  patient_records_p3: PatientRecordsP3
  patient_records_p4: PatientRecordsP4
  patient_records_p5: PatientRecordsP5
  patient_records_p6: PatientRecordsP6
  patient_records_p7: PatientRecordsP7
  patient_records_p8: PatientRecordsP8
  patient_records_p9: PatientRecordsP9
  patient_referrals: PatientReferrals
  patient_referrals_p0: PatientReferralsP0
  patient_referrals_p1: PatientReferralsP1
  patient_referrals_p10: PatientReferralsP10
  patient_referrals_p11: PatientReferralsP11
  patient_referrals_p12: PatientReferralsP12
  patient_referrals_p13: PatientReferralsP13
  patient_referrals_p14: PatientReferralsP14
  patient_referrals_p15: PatientReferralsP15
  patient_referrals_p2: PatientReferralsP2
  patient_referrals_p3: PatientReferralsP3
  patient_referrals_p4: PatientReferralsP4
  patient_referrals_p5: PatientReferralsP5
  patient_referrals_p6: PatientReferralsP6
  patient_referrals_p7: PatientReferralsP7
  patient_referrals_p8: PatientReferralsP8
  patient_referrals_p9: PatientReferralsP9
  patient_registration: PatientRegistration
  patient_symptoms: PatientSymptoms
  patient_symptoms_p0: PatientSymptomsP0
  patient_symptoms_p1: PatientSymptomsP1
  patient_symptoms_p10: PatientSymptomsP10
  patient_symptoms_p11: PatientSymptomsP11
  patient_symptoms_p12: PatientSymptomsP12
  patient_symptoms_p13: PatientSymptomsP13
  patient_symptoms_p14: PatientSymptomsP14
  patient_symptoms_p15: PatientSymptomsP15
  patient_symptoms_p2: PatientSymptomsP2
  patient_symptoms_p3: PatientSymptomsP3
  patient_symptoms_p4: PatientSymptomsP4
  patient_symptoms_p5: PatientSymptomsP5
  patient_symptoms_p6: PatientSymptomsP6
  patient_symptoms_p7: PatientSymptomsP7
  patient_symptoms_p8: PatientSymptomsP8
  patient_symptoms_p9: PatientSymptomsP9
  patient_triage_level: PatientTriageLevel
  patient_triage_level_p0: PatientTriageLevelP0
  patient_triage_level_p1: PatientTriageLevelP1
  patient_triage_level_p10: PatientTriageLevelP10
  patient_triage_level_p11: PatientTriageLevelP11
  patient_triage_level_p12: PatientTriageLevelP12
  patient_triage_level_p13: PatientTriageLevelP13
  patient_triage_level_p14: PatientTriageLevelP14
  patient_triage_level_p15: PatientTriageLevelP15
  patient_triage_level_p2: PatientTriageLevelP2
  patient_triage_level_p3: PatientTriageLevelP3
  patient_triage_level_p4: PatientTriageLevelP4
  patient_triage_level_p5: PatientTriageLevelP5
  patient_triage_level_p6: PatientTriageLevelP6
  patient_triage_level_p7: PatientTriageLevelP7
  patient_triage_level_p8: PatientTriageLevelP8
  patient_triage_level_p9: PatientTriageLevelP9
  patient_workflow_steps_completed: PatientWorkflowStepsCompleted
  patient_workflows: PatientWorkflows
  patient_workflows_completed: PatientWorkflowsCompleted
  patient_workflows_started: PatientWorkflowsStarted
  patients: Patients
  pg_stat_monitor: PgStatMonitor
  pg_stat_statements: PgStatStatements
  pg_stat_statements_info: PgStatStatementsInfo
  pharmacies: Pharmacies
  pharmacist_chatbot_user_whatsapp_messages_received: PharmacistChatbotUserWhatsappMessagesReceived
  pharmacist_chatbot_users: PharmacistChatbotUsers
  pharmacists: Pharmacists
  pharmacy_employment: PharmacyEmployment
  prescription_codes: PrescriptionCodes
  prescription_medications: PrescriptionMedications
  prescription_medications_filled: PrescriptionMedicationsFilled
  prescriptions: Prescriptions
  procurement: Procurement
  procurers: Procurers
  providers: Providers
  receptionists: Receptionists
  regulators: Regulators
  sats_priority_levels: SatsPriorityLevels
  sats_triage_assessment_options: SatsTriageAssessmentOptions
  sats_triage_assessments: SatsTriageAssessments
  sats_triage_scoring_rules: SatsTriageScoringRules
  sessions: Sessions
  snomed_c_refset_association: SnomedCRefsetAssociation
  snomed_c_refset_attribute_value: SnomedCRefsetAttributeValue
  snomed_c_refset_language: SnomedCRefsetLanguage
  snomed_c_refset_mrcm_module_scope: SnomedCRefsetMrcmModuleScope
  snomed_cci_refset_refset_descriptor: SnomedCciRefsetRefsetDescriptor
  snomed_ci_refset_description_type: SnomedCiRefsetDescriptionType
  snomed_cisscc_refset_mrcm_attribute_domain: SnomedCissccRefsetMrcmAttributeDomain
  snomed_concept: SnomedConcept
  snomed_description: SnomedDescription
  snomed_family_history: SnomedFamilyHistory
  snomed_iissscc_refset_extended_map: SnomedIisssccRefsetExtendedMap
  snomed_inferred_canonical_name_and_category: SnomedInferredCanonicalNameAndCategory
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
  speech_transcriptions: SpeechTranscriptions
  whatsapp_messages_received: WhatsappMessagesReceived
  whatsapp_messages_sent: WhatsappMessagesSent
  workflow_steps: WorkflowSteps
  workflows: Workflows
}
type Buffer = Uint8Array
