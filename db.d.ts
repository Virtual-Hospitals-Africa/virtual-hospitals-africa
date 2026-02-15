import type { ColumnType } from 'kysely'

export type AgeUnit = 'day' | 'month' | 'week' | 'year'

export type ArrayType<T> = ArrayTypeImpl<T> extends (infer U)[] ? U[]
  : ArrayTypeImpl<T>

export type ArrayTypeImpl<T> = T extends ColumnType<infer S, infer I, infer U> ? ColumnType<S[], I[], U[]>
  : T[]

export type ChatbotName = 'patient' | 'pharmacist'

export type Comparator = '<' | '<=' | '=' | '>' | '>='

export type DoctorReviewStep = 'clinical_notes' | 'diagnosis' | 'orders' | 'prescriptions' | 'referral' | 'revert'

export type DurationUnits = 'days' | 'indefinitely' | 'months' | 'weeks' | 'years'

export type EmergencyContactRelationship = 'Child' | 'Friend' | 'Guardian' | 'Other' | 'Parent' | 'Sibling' | 'Spouse'

export type EncounterReason = 'administration' | 'checkup' | 'follow up' | 'maternity' | 'referral' | 'seeking treatment'

export type EntityType = 'health_worker' | 'regulator'

export type Existence = 'No' | 'Unknown' | 'Yes'

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

export type MedicationFrequency =
  | 'ac'
  | 'am'
  | 'bd'
  | 'bm'
  | 'bw'
  | 'hs'
  | 'mane'
  | 'nocte'
  | 'od'
  | 'pm'
  | 'prn'
  | 'q15'
  | 'q1h'
  | 'q24h'
  | 'q2h'
  | 'q30'
  | 'q30h'
  | 'q48h'
  | 'q4h'
  | 'q6h'
  | 'q72h'
  | 'q8h'
  | 'qd'
  | 'qhs'
  | 'qid'
  | 'qm'
  | 'qmane'
  | 'qn'
  | 'qod'
  | 'qs'
  | 'qw'
  | 'stat'
  | 'tds'
  | 'tm'
  | 'tw'

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

export type Numeric = ColumnType<string, number | string, number | string>

export type PatientCohabitation = 'Father' | 'Foster Parent' | 'Grandparent(s)' | 'Mother' | 'Orphanage' | 'Other Relative' | 'Sibling' | 'Uncle or Aunt'

export type Profession = 'doctor' | 'nurse' | 'pharmacist' | 'receptionist'

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
  | 'create_google_meet'
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
  google_maps_place_id: string | null
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
  success_message: string | null
  updated_at: Generated<Timestamp>
}

export interface Events {
  all_processed_at: Timestamp | null
  created_at: Generated<Timestamp>
  data: Json
  error_message: string | null
  id: Generated<string>
  listener_names: string[]
  patient_encounter_id: string | null
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

export interface HealthWorkerAccounts {
  avatar_media_id: string | null
  email: string
  id: string
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

export interface HealthWorkerLicenceRevocations {
  created_at: Generated<Timestamp>
  health_worker_license_id: string
  id: Generated<string>
  revoked_at: Generated<Timestamp>
  revoked_by: string
  updated_at: Generated<Timestamp>
}

export interface HealthWorkerLicences {
  additional_data: Json | null
  address_id: string | null
  country: string
  created_at: Generated<Timestamp>
  expiry_date: Timestamp
  gender: string
  health_worker_id: string
  id: Generated<string>
  licence_number: string
  media_id: string | null
  mobile_phone_number: string | null
  name: string
  profession: Profession
  sex: Sex
  updated_at: Generated<Timestamp>
}

export interface HealthWorkers {
  created_at: Generated<Timestamp>
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

export interface MedicationAvailabilities {
  country: string
  created_at: Generated<Timestamp>
  id: Generated<string>
  medication_id: string
  registration_number: string
  updated_at: Generated<Timestamp>
}

export interface MedicationDoseIngredients {
  created_at: Generated<Timestamp>
  id: Generated<string>
  medication_dose_id: string
  snomed_concept_id: Int8
  updated_at: Generated<Timestamp>
}

export interface MedicationDoseIngredientStrengths {
  id: string
  units: string
  value: Numeric
}

export interface MedicationDoses {
  description: string
  description_is_units: Generated<boolean>
  id: string
  medication_id: string
  value: Numeric
}

export interface MedicationRecalls {
  created_at: Generated<Timestamp>
  id: Generated<string>
  medication_availability_id: string
  recalled_at: Timestamp
  recalled_by: string
  updated_at: Generated<Timestamp>
}

export interface Medications {
  applicant_name: string
  created_at: Generated<Timestamp>
  form: string
  form_route: Generated<string>
  id: Generated<string>
  manufacturer_name: string
  routes: string[]
  snomed_concept_id: Int8
  trade_name: string
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
}

export interface PatientComputedFindings {
  computation_algorithm_version: string
  computation_metadata: Generated<Json>
  created_at: Generated<Timestamp>
  full_display: string | null
  id: string
  units: string | null
  value: Numeric | null
}

export interface PatientComputedFindingsInputs {
  computed_finding_id: string
  created_at: Generated<Timestamp>
  id: Generated<string>
  input_measurement_id: string
  updated_at: Generated<Timestamp>
}

export interface PatientEmergencyContacts {
  contact_order: Generated<number>
  created_at: Generated<Timestamp>
  id: Generated<string>
  name: string
  patient_id: string
  phone_number: string | null
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
  evaluates_record_id: string | null
  id: string
  procedure_id: string | null
}

export interface PatientEvaluationScores {
  id: string
  score: number
}

export interface PatientEvents {
  address_id: string | null
  datetime: Timestamp
  id: string
  location: string | null
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
}

export interface PatientFindingMediaSpeeches {
  finding_id: string
  id: string
  media_speech_id: string
}

export interface PatientFindings {
  id: string
  patient_encounter_employee_id: string
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

export interface PatientMeasurements {
  comparator: Generated<Comparator>
  id: string
  units: string
  value: Numeric
}

export interface PatientPrescriptionMedications {
  id: string
  medication_id: string
  special_instructions: string | null
}

export interface PatientPrescriptionMedicationSchedules {
  dosage: string | null
  duration: number | null
  duration_unit: DurationUnits | null
  frequency: MedicationFrequency
  id: string
  medication_dose_id: string
  order: number
  patient_prescription_medications_id: string
  route: string
}

export interface PatientPrescriptionRedemptionCodes {
  alphanumeric_code: Generated<string>
  created_at: Generated<Timestamp>
  id: Generated<string>
  patient_prescription_signature_id: string
  updated_at: Generated<Timestamp>
}

export interface PatientPrescriptionsFilled {
  id: string
  patient_prescription_medication_id: string
}

export interface PatientPrescriptionSignatures {
  id: string
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
  employment_id: string
  id: string
}

export interface PatientRecordLinks {
  href: string
  id: string
  thumbnail_href: string | null
  title: string
}

export interface PatientRecordQualifiers {
  id: string
  qualifies_record_id: string
}

export interface PatientRecordRelations {
  destination_id: string
  id: string
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

export interface PatientRecordsAggregated {
  created_at: Timestamp
  existence: Existence
  id: string
  patient_encounter_id: string
  patient_id: string
  root_snomed_concept_category: SnomedCategory
  root_snomed_concept_id: Int8
  root_snomed_concept_name: string
  specific_snomed_concept_category: SnomedCategory
  specific_snomed_concept_id: Int8
  specific_snomed_concept_name: string
  value: Json | null
}

export interface PatientRecordSExpressions {
  id: string
  s_expression: string
}

export interface PatientRecordsStillValid {
  id: string
}

export interface PatientReferrals {
  employment_id: string | null
  id: string
  organization_department_id: string | null
  organization_id: string | null
  organization_room_id: string | null
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
  severity: number
  start_date: Timestamp
}

export interface PatientTriageLevel {
  created_at: Generated<Timestamp>
  id: string
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
  id: string
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
  doctor_review: DoctorReview
  doctor_review_requests: DoctorReviewRequests
  doctor_review_steps: DoctorReviewSteps
  doctor_reviews: DoctorReviews
  doctors: Doctors
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
  health_worker_accounts: HealthWorkerAccounts
  health_worker_invitees: HealthWorkerInvitees
  health_worker_licence_revocations: HealthWorkerLicenceRevocations
  health_worker_licences: HealthWorkerLicences
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
  measurement_reference_ranges: MeasurementReferenceRanges
  media: Media
  media_audios: MediaAudios
  media_images: MediaImages
  media_images_or_videos: MediaImagesOrVideos
  media_speeches: MediaSpeeches
  media_videos: MediaVideos
  medication_availabilities: MedicationAvailabilities
  medication_dose_ingredient_strengths: MedicationDoseIngredientStrengths
  medication_dose_ingredients: MedicationDoseIngredients
  medication_doses: MedicationDoses
  medication_recalls: MedicationRecalls
  medications: Medications
  message_draft_concerning: MessageDraftConcerning
  message_draft_targets: MessageDraftTargets
  message_drafts: MessageDrafts
  message_reads: MessageReads
  message_thread_participants: MessageThreadParticipants
  message_thread_subjects: MessageThreadSubjects
  message_threads: MessageThreads
  messages: Messages
  nurses: Nurses
  organization_admins: OrganizationAdmins
  organization_consumables: OrganizationConsumables
  organization_department_rooms: OrganizationDepartmentRooms
  organization_departments: OrganizationDepartments
  organization_devices: OrganizationDevices
  organization_rooms: OrganizationRooms
  organizations: Organizations
  patient_age: PatientAge
  patient_appointment_offered_times: PatientAppointmentOfferedTimes
  patient_appointment_request_media: PatientAppointmentRequestMedia
  patient_appointment_requests: PatientAppointmentRequests
  patient_chatbot_user_whatsapp_messages_received: PatientChatbotUserWhatsappMessagesReceived
  patient_chatbot_users: PatientChatbotUsers
  patient_chief_complaints: PatientChiefComplaints
  patient_computed_findings: PatientComputedFindings
  patient_computed_findings_inputs: PatientComputedFindingsInputs
  patient_emergency_contacts: PatientEmergencyContacts
  patient_encounter_employees: PatientEncounterEmployees
  patient_encounters: PatientEncounters
  patient_evaluation_scores: PatientEvaluationScores
  patient_evaluations: PatientEvaluations
  patient_events: PatientEvents
  patient_family: PatientFamily
  patient_finding_media_images: PatientFindingMediaImages
  patient_finding_media_speeches: PatientFindingMediaSpeeches
  patient_findings: PatientFindings
  patient_guardians: PatientGuardians
  patient_insurance: PatientInsurance
  patient_kin: PatientKin
  patient_measurements: PatientMeasurements
  patient_prescription_medication_schedules: PatientPrescriptionMedicationSchedules
  patient_prescription_medications: PatientPrescriptionMedications
  patient_prescription_redemption_codes: PatientPrescriptionRedemptionCodes
  patient_prescription_signatures: PatientPrescriptionSignatures
  patient_prescriptions_filled: PatientPrescriptionsFilled
  patient_presence: PatientPresence
  patient_procedures: PatientProcedures
  patient_record_links: PatientRecordLinks
  patient_record_qualifiers: PatientRecordQualifiers
  patient_record_relations: PatientRecordRelations
  patient_record_s_expressions: PatientRecordSExpressions
  patient_records: PatientRecords
  patient_records_aggregated: PatientRecordsAggregated
  patient_records_still_valid: PatientRecordsStillValid
  patient_referrals: PatientReferrals
  patient_registration: PatientRegistration
  patient_symptoms: PatientSymptoms
  patient_triage_level: PatientTriageLevel
  patient_workflow_steps_completed: PatientWorkflowStepsCompleted
  patient_workflows: PatientWorkflows
  patient_workflows_completed: PatientWorkflowsCompleted
  patient_workflows_started: PatientWorkflowsStarted
  patients: Patients
  pg_stat_statements: PgStatStatements
  pg_stat_statements_info: PgStatStatementsInfo
  pharmacist_chatbot_user_whatsapp_messages_received: PharmacistChatbotUserWhatsappMessagesReceived
  pharmacist_chatbot_users: PharmacistChatbotUsers
  pharmacists: Pharmacists
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
