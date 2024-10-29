import type { ColumnType } from 'kysely'

export type AgeUnit = 'day' | 'month' | 'week' | 'year'

export type ArrayType<T> = ArrayTypeImpl<T> extends (infer U)[] ? U[]
  : ArrayTypeImpl<T>

export type ArrayTypeImpl<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S[], I[], U[]>
  : T[]

export type ChatbotName = 'patient' | 'pharmacist'

export type DoctorReviewStep =
  | 'clinical_notes'
  | 'diagnosis'
  | 'orders'
  | 'prescriptions'
  | 'referral'
  | 'revert'

export type DoctorSpecialty =
  | 'Allergy and Immunology'
  | 'Anesthesiology'
  | 'Cardiology'
  | 'Dermatology'
  | 'Emergency Medicine'
  | 'Endocrinology'
  | 'Family Medicine'
  | 'Gastroenterology'
  | 'Geriatrics'
  | 'Hematology'
  | 'Infectious Disease'
  | 'Internal Medicine'
  | 'Nephrology'
  | 'Neurology'
  | 'Obstetrics and Gynecology (OB/GYN)'
  | 'Oncology'
  | 'Ophthalmology'
  | 'Orthopedics'
  | 'Otolaryngology (ENT)'
  | 'Pediatrics'
  | 'Psychiatry'
  | 'Pulmonology'
  | 'Radiology'
  | 'Rheumatology'
  | 'Urology'

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
  | 'diagnosis'
  | 'examinations'
  | 'orders'
  | 'prescriptions'
  | 'referral'
  | 'symptoms'
  | 'vitals'

export type ExaminationFindingType =
  | 'boolean'
  | 'date'
  | 'float'
  | 'integer'
  | 'multiselect'
  | 'select'
  | 'string'

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

export type IntakeStep =
  | 'address'
  | 'conditions'
  | 'family'
  | 'history'
  | 'lifestyle'
  | 'occupation'
  | 'personal'
  | 'summary'

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

export type Religion =
  | 'African Traditional Religion'
  | 'Apostolic Sect'
  | 'Islam'
  | 'Non-Religious'
  | 'Other'
  | 'Pentecostal/Protestant Christianity'
  | 'Roman Catholic'

export type Timestamp = ColumnType<Date, Date | string, Date | string>

export interface Address {
  address: string | null
  city: string | null
  country: string | null
  postalCode: string | null
  resourceId: string
  state: string | null
  use: string | null
}

export interface Address2 {
  country_id: string
  created_at: Generated<Timestamp>
  district_id: string
  id: Generated<string>
  province_id: string
  street: string | null
  suburb_id: string | null
  updated_at: Generated<Timestamp>
  ward_id: string
}

export interface Allergies {
  id: Generated<string>
  name: string
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
  gcal_event_id: string
  id: Generated<string>
  patient_id: string
  reason: string
  start: Timestamp
  updated_at: Generated<Timestamp>
}

export interface ClientApplication {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  name: string | null
  projectId: string | null
}

export interface ClientApplicationHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface Condition {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  abatementAge: number | null
  abatementDate: Timestamp | null
  abatementString: string | null
  assertedDate: Timestamp | null
  asserter: string | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  encounter: string | null
  evidenceDetail: string[] | null
  id: string
  lastUpdated: Timestamp
  onsetAge: number | null
  onsetDate: Timestamp | null
  onsetInfo: string | null
  patient: string | null
  projectId: string | null
  recordedDate: Timestamp | null
  subject: string | null
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
  id: Generated<string>
  name: string
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

export interface DiagnosticTests {
  name: string
}

export interface Districts {
  id: Generated<string>
  name: string
  province_id: string
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
  encounter_id: string
  id: Generated<string>
  organization_id: string | null
  patient_id: string
  pending: Generated<boolean>
  requested_by: string
  requester_notes: string | null
  requesting_doctor_id: string | null
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

export interface DoctorSpecialties {
  created_at: Generated<Timestamp>
  employee_id: string
  id: Generated<string>
  specialty: DoctorSpecialty
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
  updated_at: Generated<Timestamp>
}

export interface Encounter {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  account: string[] | null
  appointment: string[] | null
  basedOn: string[] | null
  compartments: string[]
  content: string
  date: Timestamp | null
  deleted: Generated<boolean>
  diagnosis: string[] | null
  episodeOfCare: string[] | null
  id: string
  lastUpdated: Timestamp
  length: number | null
  location: string[] | null
  locationPeriod: ArrayType<Timestamp> | null
  participant: string[] | null
  partOf: string | null
  patient: string | null
  practitioner: string[] | null
  projectId: string | null
  reasonReference: string[] | null
  serviceProvider: string | null
  status: string | null
  subject: string | null
}

export interface Encounter2 {
  order: Int8
  step: EncounterStep
}

export interface ExaminationCategories {
  category: string
  examination_name: string
  id: Generated<string>
  order: number
}

export interface ExaminationFindings {
  ask_dependent_on: string | null
  ask_dependent_values: Json | null
  examination_category_id: string
  id: Generated<string>
  label: string
  name: string
  options: string[] | null
  order: number
  required: Generated<boolean>
  type: ExaminationFindingType
}

export interface Examinations {
  name: string
  order: number
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
  dependent: string
  female_dependent: string | null
  female_guardian: string | null
  guardian: GuardianRelation
  male_dependent: string | null
  male_guardian: string | null
}

export interface HealthWorkerGoogleTokens {
  access_token: string
  created_at: Generated<Timestamp>
  expires_at: Timestamp
  health_worker_id: string
  id: Generated<string>
  refresh_token: string
  updated_at: Generated<Timestamp>
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

export interface HealthWorkerSessions {
  created_at: Generated<Timestamp>
  entity_id: string
  id: Generated<string>
  updated_at: Generated<Timestamp>
}

export interface HumanName {
  family: string | null
  given: string | null
  name: string | null
  resourceId: string
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

export interface Intake {
  order: Int8
  step: IntakeStep
}

export interface Location {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  endpoint: string[] | null
  id: string
  lastUpdated: Timestamp
  location: string
  name: string[] | null
  near: string | null
  organization: string | null
  organizationId: string
  partof: string | null
  projectId: string | null
  status: string | null
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
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  basedOn: string[] | null
  compartments: string[]
  content: string
  created: Timestamp | null
  deleted: Generated<boolean>
  device: string | null
  encounter: string | null
  id: string
  lastUpdated: Timestamp
  operator: string | null
  patient: string | null
  projectId: string | null
  status: string | null
  subject: string | null
}

export interface Media2 {
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
  mobile_number: string
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

export interface NurseSpecialties {
  created_at: Generated<Timestamp>
  employee_id: string
  id: Generated<string>
  specialty: NurseSpecialty
  updated_at: Generated<Timestamp>
}

export interface Organization {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  active: boolean | null
  canonicalName: string
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  endpoint: string[] | null
  id: string
  lastUpdated: Timestamp
  name: string[] | null
  partof: string | null
  phonetic: string | null
  projectId: string | null
}

export interface OrganizationConsumables {
  consumable_id: string
  created_at: Generated<Timestamp>
  id: Generated<string>
  organization_id: string
  quantity_on_hand: number
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

export interface PatientAge {
  age: string | null
  age_display: string | null
  age_number: number | null
  age_unit: AgeUnit | null
  age_years: Numeric | null
  patient_id: string | null
}

export interface PatientAllergies {
  allergy_id: string
  created_at: Generated<Timestamp>
  id: Generated<string>
  patient_id: string
  updated_at: Generated<Timestamp>
}

export interface PatientAppointmentOfferedTimes {
  created_at: Generated<Timestamp>
  declined: Generated<boolean>
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
  noted_during_patient_intake_by: string | null
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

export interface PatientExaminationFindings {
  created_at: Generated<Timestamp>
  examination_finding_id: string
  id: Generated<string>
  patient_examination_id: string
  updated_at: Generated<Timestamp>
  value: Json
}

export interface PatientExaminations {
  completed: Generated<boolean>
  created_at: Generated<Timestamp>
  encounter_id: string
  encounter_provider_id: string
  examination_name: string
  id: Generated<string>
  ordered: Generated<boolean>
  patient_id: string
  skipped: Generated<boolean>
  updated_at: Generated<Timestamp>
}

export interface PatientFamily {
  created_at: Generated<Timestamp>
  family_type: FamilyType | null
  home_satisfaction: number | null
  id: Generated<string>
  marital_status: MaritalStatus | null
  patient_cohabitation: PatientCohabitation | null
  patient_id: string
  religion: Religion | null
  social_satisfaction: number | null
  spiritual_satisfaction: number | null
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
  created_at: Generated<Timestamp>
  id: Generated<string>
  intake_step: IntakeStep
  patient_id: string
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
  measurement_name: string
  patient_id: string
  updated_at: Generated<Timestamp>
  value: Numeric
}

export interface PatientNearestOrganizations {
  nearest_organizations: Json | null
  patient_id: string | null
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

export interface Practitioner {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  active: boolean | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  gender: string | null
  id: string
  lastUpdated: Timestamp
  phonetic: string[] | null
  projectId: string | null
}

export interface PractitionerHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
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

export interface Project {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  googleClientId: string[] | null
  id: string
  lastUpdated: Timestamp
  name: string | null
  owner: string | null
  projectId: string | null
  recaptchaSiteKey: string[] | null
}

export interface ProjectHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface ProjectMembership {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  accessPolicy: string[] | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  externalId: string | null
  id: string
  lastUpdated: Timestamp
  profile: Generated<string | null>
  profileType: string | null
  project: string | null
  projectId: string | null
  user: string | null
  userName: string | null
}

export interface ProjectMembershipHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
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

export interface Provinces {
  country_id: string
  id: Generated<string>
  name: string
}

export interface RegulatorGoogleTokens {
  access_token: string
  created_at: Generated<Timestamp>
  expires_at: Timestamp
  id: Generated<string>
  refresh_token: string
  regulator_id: string
  updated_at: Generated<Timestamp>
}

export interface Regulators {
  avatar_url: string | null
  created_at: Generated<Timestamp>
  email: string
  id: Generated<string>
  name: string
  updated_at: Generated<Timestamp>
}

export interface RegulatorSessions {
  created_at: Generated<Timestamp>
  entity_id: string
  id: Generated<string>
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
  id: Generated<string>
  name: string
  ward_id: string
}

export interface User {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  email: string | null
  externalId: string | null
  id: string
  lastUpdated: Timestamp
  project: string | null
  projectId: string | null
}

export interface UserHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface WaitingRoom {
  created_at: Generated<Timestamp>
  id: Generated<string>
  organization_id: string
  patient_encounter_id: string
  updated_at: Generated<Timestamp>
}

export interface Wards {
  district_id: string
  id: Generated<string>
  name: string
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
  created_at: Generated<Timestamp>
  id: Generated<string>
  read_status: string
  responding_to_received_id: string
  sent_by_phone_number: string
  sent_to_phone_number: string
  updated_at: Generated<Timestamp>
  whatsapp_id: string
}

export interface DB {
  address: Address2
  Address: Address
  allergies: Allergies
  appointment_media: AppointmentMedia
  appointment_providers: AppointmentProviders
  appointments: Appointments
  ClientApplication: ClientApplication
  ClientApplication_History: ClientApplicationHistory
  Condition: Condition
  condition_icd10_codes: ConditionIcd10Codes
  conditions: Conditions
  consumables: Consumables
  consumption: Consumption
  countries: Countries
  device_capabilities: DeviceCapabilities
  devices: Devices
  diagnoses: Diagnoses
  diagnoses_collaboration: DiagnosesCollaboration
  diagnostic_tests: DiagnosticTests
  districts: Districts
  doctor_registration_details: DoctorRegistrationDetails
  doctor_registration_details_in_progress: DoctorRegistrationDetailsInProgress
  doctor_review: DoctorReview
  doctor_review_requests: DoctorReviewRequests
  doctor_review_steps: DoctorReviewSteps
  doctor_reviews: DoctorReviews
  doctor_specialties: DoctorSpecialties
  drugs: Drugs
  employment: Employment
  encounter: Encounter2
  Encounter: Encounter
  examination_categories: ExaminationCategories
  examination_findings: ExaminationFindings
  examinations: Examinations
  geography_columns: GeographyColumns
  geometry_columns: GeometryColumns
  guardian_relations: GuardianRelations
  health_worker_google_tokens: HealthWorkerGoogleTokens
  health_worker_invitees: HealthWorkerInvitees
  health_worker_sessions: HealthWorkerSessions
  health_workers: HealthWorkers
  HumanName: HumanName
  icd10_categories: Icd10Categories
  icd10_codes: Icd10Codes
  icd10_diagnoses: Icd10Diagnoses
  icd10_diagnoses_excludes: Icd10DiagnosesExcludes
  icd10_diagnoses_excludes_categories: Icd10DiagnosesExcludesCategories
  icd10_diagnoses_excludes_code_ranges: Icd10DiagnosesExcludesCodeRanges
  icd10_diagnoses_excludes_codes: Icd10DiagnosesExcludesCodes
  icd10_diagnoses_includes: Icd10DiagnosesIncludes
  icd10_sections: Icd10Sections
  intake: Intake
  Location: Location
  mailing_list: MailingList
  manufactured_medication_recalls: ManufacturedMedicationRecalls
  manufactured_medication_strengths: ManufacturedMedicationStrengths
  manufactured_medications: ManufacturedMedications
  measurements: Measurements
  media: Media2
  Media: Media
  medications: Medications
  nurse_registration_details: NurseRegistrationDetails
  nurse_registration_details_in_progress: NurseRegistrationDetailsInProgress
  nurse_specialties: NurseSpecialties
  Organization: Organization
  organization_consumables: OrganizationConsumables
  organization_devices: OrganizationDevices
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
  patient_examination_findings: PatientExaminationFindings
  patient_examinations: PatientExaminations
  patient_family: PatientFamily
  patient_guardians: PatientGuardians
  patient_intake: PatientIntake
  patient_kin: PatientKin
  patient_lifestyle: PatientLifestyle
  patient_measurements: PatientMeasurements
  patient_nearest_organizations: PatientNearestOrganizations
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
  Practitioner: Practitioner
  Practitioner_History: PractitionerHistory
  prescription_codes: PrescriptionCodes
  prescription_medications: PrescriptionMedications
  prescription_medications_filled: PrescriptionMedicationsFilled
  prescriptions: Prescriptions
  procurement: Procurement
  procurers: Procurers
  Project: Project
  Project_History: ProjectHistory
  ProjectMembership: ProjectMembership
  ProjectMembership_History: ProjectMembershipHistory
  provider_calendars: ProviderCalendars
  provinces: Provinces
  regulator_google_tokens: RegulatorGoogleTokens
  regulator_sessions: RegulatorSessions
  regulators: Regulators
  spatial_ref_sys: SpatialRefSys
  suburbs: Suburbs
  User: User
  User_History: UserHistory
  waiting_room: WaitingRoom
  wards: Wards
  whatsapp_messages_received: WhatsappMessagesReceived
  whatsapp_messages_sent: WhatsappMessagesSent
}
type Buffer = Uint8Array
