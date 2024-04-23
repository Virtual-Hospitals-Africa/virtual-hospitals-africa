import type { ColumnType } from 'kysely'

export type AgeUnit = 'day' | 'month' | 'week' | 'year'

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
  | 'review'

export type Json = ColumnType<JsonValue, string, string>

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

export type PatientConversationState =
  | 'find_nearest_organization:got_location'
  | 'find_nearest_organization:send_organization_location'
  | 'find_nearest_organization:share_location'
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

export interface AccessPolicy {
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

export interface AccessPolicyHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface AccessPolicyReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface AccessPolicyToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface Account {
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
  owner: string | null
  patient: string[] | null
  period: Timestamp | null
  projectId: string | null
  status: string | null
  subject: string[] | null
  type: string | null
}

export interface AccountHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface AccountReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface AccountToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface ActivityDefinition {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  composedOf: string[] | null
  content: string
  context: string[] | null
  contextQuantity: number[] | null
  contextType: string[] | null
  contextTypeQuantity: string[] | null
  contextTypeValue: string[] | null
  date: Timestamp | null
  deleted: Generated<boolean>
  dependsOn: string[] | null
  derivedFrom: string[] | null
  description: string | null
  effective: Timestamp | null
  id: string
  jurisdiction: string[] | null
  lastUpdated: Timestamp
  name: string | null
  predecessor: string[] | null
  projectId: string | null
  publisher: string | null
  status: string | null
  successor: string[] | null
  title: string | null
  topic: string[] | null
  url: string | null
  version: string | null
}

export interface ActivityDefinitionHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface ActivityDefinitionReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface ActivityDefinitionToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

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

export interface AdverseEvent {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  actuality: string | null
  category: string[] | null
  compartments: string[]
  content: string
  date: Timestamp | null
  deleted: Generated<boolean>
  event: string | null
  id: string
  lastUpdated: Timestamp
  location: string | null
  projectId: string | null
  recorder: string | null
  resultingcondition: string[] | null
  seriousness: string | null
  severity: string | null
  study: string[] | null
  subject: string | null
  substance: string[] | null
}

export interface AdverseEventHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface AdverseEventReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface AdverseEventToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface Agent {
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
  status: string | null
}

export interface AgentHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface AgentReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface AgentToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface Allergies {
  id: Generated<number>
  name: string
}

export interface AllergyIntolerance {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  asserter: string | null
  category: string[] | null
  clinicalStatus: string | null
  code: string[] | null
  compartments: string[]
  content: string
  criticality: string | null
  date: Timestamp | null
  deleted: Generated<boolean>
  id: string
  lastDate: Timestamp | null
  lastUpdated: Timestamp
  manifestation: string[] | null
  onset: Timestamp[] | null
  patient: string | null
  projectId: string | null
  recorder: string | null
  route: string[] | null
  severity: string[] | null
  type: string | null
  verificationStatus: string | null
}

export interface AllergyIntoleranceHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface AllergyIntoleranceReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface AllergyIntoleranceToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface Appointment {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  actor: string[] | null
  appointmentType: string | null
  basedOn: string[] | null
  compartments: string[]
  content: string
  date: Timestamp | null
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  location: string[] | null
  partStatus: string[] | null
  patient: string[] | null
  practitioner: string[] | null
  projectId: string | null
  reasonCode: string[] | null
  reasonReference: string[] | null
  serviceCategory: string[] | null
  serviceType: string[] | null
  slot: string[] | null
  specialty: string[] | null
  status: string | null
  supportingInfo: string[] | null
}

export interface AppointmentHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface AppointmentMedia {
  appointment_id: number
  created_at: Generated<Timestamp>
  id: Generated<number>
  media_id: number
  updated_at: Generated<Timestamp>
}

export interface AppointmentProviders {
  appointment_id: number
  confirmed: Generated<boolean>
  created_at: Generated<Timestamp>
  id: Generated<number>
  provider_id: number
  updated_at: Generated<Timestamp>
}

export interface AppointmentReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface AppointmentResponse {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  actor: string | null
  appointment: string | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  location: string | null
  partStatus: string | null
  patient: string | null
  practitioner: string | null
  projectId: string | null
}

export interface AppointmentResponseHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface AppointmentResponseReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface AppointmentResponseToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
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

export interface AppointmentToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface AsyncJob {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  projectId: string | null
  status: string | null
  user: string | null
}

export interface AsyncJobHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface AsyncJobReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface AsyncJobToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface AuditEvent {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  action: string | null
  address: string[] | null
  agent: string[] | null
  agentName: string[] | null
  agentRole: string[] | null
  altid: string[] | null
  compartments: string[]
  content: string
  date: Timestamp | null
  deleted: Generated<boolean>
  entity: string[] | null
  entityName: string[] | null
  entityRole: string[] | null
  entityType: string[] | null
  id: string
  lastUpdated: Timestamp
  outcome: string | null
  patient: string[] | null
  policy: string[] | null
  projectId: string | null
  site: string | null
  source: string | null
  subtype: string[] | null
  type: string | null
}

export interface AuditEventHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface AuditEventReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface AuditEventToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface Basic {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  author: string | null
  code: string | null
  compartments: string[]
  content: string
  created: Timestamp | null
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  patient: string | null
  projectId: string | null
  subject: string | null
}

export interface BasicHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface BasicReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface BasicToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface Binary {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  projectId: string | null
}

export interface BinaryHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface BinaryReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface BinaryToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface BiologicallyDerivedProduct {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  projectId: string | null
}

export interface BiologicallyDerivedProductHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface BiologicallyDerivedProductReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface BiologicallyDerivedProductToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface BodyStructure {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  location: string | null
  morphology: string | null
  patient: string | null
  projectId: string | null
}

export interface BodyStructureHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface BodyStructureReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface BodyStructureToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface Bot {
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

export interface BotHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface BotReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface BotToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface BulkDataExport {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  projectId: string | null
  status: string | null
}

export interface BulkDataExportHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface BulkDataExportReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface BulkDataExportToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface Bundle {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  composition: string | null
  content: string
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  message: string | null
  projectId: string | null
  timestamp: Timestamp | null
  type: string | null
}

export interface BundleHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface BundleReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface BundleToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface CapabilityStatement {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  context: string[] | null
  contextQuantity: number[] | null
  contextType: string[] | null
  contextTypeQuantity: string[] | null
  contextTypeValue: string[] | null
  date: Timestamp | null
  deleted: Generated<boolean>
  description: string | null
  fhirversion: string | null
  format: string[] | null
  guide: string[] | null
  id: string
  jurisdiction: string[] | null
  lastUpdated: Timestamp
  mode: string[] | null
  name: string | null
  projectId: string | null
  publisher: string | null
  resource: string[] | null
  resourceProfile: string[] | null
  securityService: string[] | null
  software: string | null
  status: string | null
  supportedProfile: string[] | null
  title: string | null
  url: string | null
  version: string | null
}

export interface CapabilityStatementHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface CapabilityStatementReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface CapabilityStatementToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface CarePlan {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  activityCode: string[] | null
  activityDate: Timestamp[] | null
  activityReference: string[] | null
  basedOn: string[] | null
  careTeam: string[] | null
  category: string[] | null
  compartments: string[]
  condition: string[] | null
  content: string
  date: Timestamp | null
  deleted: Generated<boolean>
  encounter: string | null
  goal: string[] | null
  id: string
  instantiatesCanonical: string[] | null
  instantiatesUri: string[] | null
  intent: string | null
  lastUpdated: Timestamp
  partOf: string[] | null
  patient: string | null
  performer: string[] | null
  projectId: string | null
  replaces: string[] | null
  status: string | null
  subject: string | null
}

export interface CarePlanHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface CarePlanReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface CarePlanToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface CareTeam {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  category: string[] | null
  compartments: string[]
  content: string
  date: Timestamp | null
  deleted: Generated<boolean>
  encounter: string | null
  id: string
  lastUpdated: Timestamp
  name: string | null
  participant: string[] | null
  patient: string | null
  projectId: string | null
  status: string | null
  subject: string | null
}

export interface CareTeamHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface CareTeamReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface CareTeamToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface CatalogEntry {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  projectId: string | null
}

export interface CatalogEntryHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface CatalogEntryReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface CatalogEntryToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface ChargeItem {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  account: string[] | null
  code: string | null
  compartments: string[]
  content: string
  context: string | null
  deleted: Generated<boolean>
  enteredDate: Timestamp | null
  enterer: string | null
  factorOverride: number | null
  id: string
  lastUpdated: Timestamp
  occurrence: Timestamp | null
  patient: string | null
  performerActor: string[] | null
  performerFunction: string[] | null
  performingOrganization: string | null
  priceOverride: number | null
  projectId: string | null
  quantity: number | null
  requestingOrganization: string | null
  service: string[] | null
  subject: string | null
}

export interface ChargeItemDefinition {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  context: string[] | null
  contextQuantity: number[] | null
  contextType: string[] | null
  contextTypeQuantity: string[] | null
  contextTypeValue: string[] | null
  date: Timestamp | null
  deleted: Generated<boolean>
  description: string | null
  effective: Timestamp | null
  id: string
  jurisdiction: string[] | null
  lastUpdated: Timestamp
  projectId: string | null
  publisher: string | null
  status: string | null
  title: string | null
  url: string | null
  version: string | null
}

export interface ChargeItemDefinitionHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface ChargeItemDefinitionReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface ChargeItemDefinitionToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface ChargeItemHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface ChargeItemReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface ChargeItemToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface Claim {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  careTeam: string[] | null
  compartments: string[]
  content: string
  created: Timestamp | null
  deleted: Generated<boolean>
  detailUdi: string[] | null
  encounter: string[] | null
  enterer: string | null
  facility: string | null
  id: string
  insurer: string | null
  itemUdi: string[] | null
  lastUpdated: Timestamp
  patient: string | null
  payee: string | null
  priority: string | null
  procedureUdi: string[] | null
  projectId: string | null
  provider: string | null
  status: string | null
  subdetailUdi: string[] | null
  use: string | null
}

export interface ClaimHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface ClaimReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface ClaimResponse {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  created: Timestamp | null
  deleted: Generated<boolean>
  disposition: string | null
  id: string
  insurer: string | null
  lastUpdated: Timestamp
  outcome: string | null
  patient: string | null
  paymentDate: Timestamp | null
  projectId: string | null
  request: string | null
  requestor: string | null
  status: string | null
  use: string | null
}

export interface ClaimResponseHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface ClaimResponseReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface ClaimResponseToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface ClaimToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
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

export interface ClientApplicationReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface ClientApplicationToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface ClinicalImpression {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  assessor: string | null
  compartments: string[]
  content: string
  date: Timestamp | null
  deleted: Generated<boolean>
  encounter: string | null
  findingCode: string[] | null
  findingRef: string[] | null
  id: string
  investigation: string[] | null
  lastUpdated: Timestamp
  patient: string | null
  previous: string | null
  problem: string[] | null
  projectId: string | null
  status: string | null
  subject: string | null
  supportingInfo: string[] | null
}

export interface ClinicalImpressionHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface ClinicalImpressionReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface ClinicalImpressionToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface CodeSystem {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  code: string[] | null
  compartments: string[]
  content: string
  contentMode: string | null
  context: string[] | null
  contextQuantity: number[] | null
  contextType: string[] | null
  contextTypeQuantity: string[] | null
  contextTypeValue: string[] | null
  date: Timestamp | null
  deleted: Generated<boolean>
  description: string | null
  id: string
  jurisdiction: string[] | null
  language: string[] | null
  lastUpdated: Timestamp
  name: string | null
  projectId: string | null
  publisher: string | null
  status: string | null
  supplements: string | null
  system: string | null
  title: string | null
  url: string | null
  version: string | null
}

export interface CodeSystemHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface CodeSystemProperty {
  code: string
  description: string | null
  id: Generated<Int8>
  system: string
  type: string
  uri: string | null
}

export interface CodeSystemReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface CodeSystemToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface Coding {
  code: string
  display: string | null
  id: Generated<Int8>
  system: string
}

export interface CodingProperty {
  coding: Int8
  property: Int8
  target: Int8 | null
  value: string | null
}

export interface Communication {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  basedOn: string[] | null
  category: string[] | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  encounter: string | null
  id: string
  instantiatesCanonical: string[] | null
  instantiatesUri: string[] | null
  lastUpdated: Timestamp
  medium: string[] | null
  partOf: string[] | null
  patient: string | null
  projectId: string | null
  received: Timestamp | null
  recipient: string[] | null
  sender: string | null
  sent: Timestamp | null
  status: string | null
  subject: string | null
}

export interface CommunicationHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface CommunicationReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface CommunicationRequest {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  authored: Timestamp | null
  basedOn: string[] | null
  category: string[] | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  encounter: string | null
  groupIdentifier: string | null
  id: string
  lastUpdated: Timestamp
  medium: string[] | null
  occurrence: Timestamp | null
  patient: string | null
  priority: string | null
  priorityOrder: number | null
  projectId: string | null
  recipient: string[] | null
  replaces: string[] | null
  requester: string | null
  sender: string | null
  status: string | null
  subject: string | null
}

export interface CommunicationRequestHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface CommunicationRequestReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface CommunicationRequestToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface CommunicationToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface CompartmentDefinition {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  code: string | null
  compartments: string[]
  content: string
  context: string[] | null
  contextQuantity: number[] | null
  contextType: string[] | null
  contextTypeQuantity: string[] | null
  contextTypeValue: string[] | null
  date: Timestamp | null
  deleted: Generated<boolean>
  description: string | null
  id: string
  lastUpdated: Timestamp
  name: string | null
  projectId: string | null
  publisher: string | null
  resource: string[] | null
  status: string | null
  url: string | null
  version: string | null
}

export interface CompartmentDefinitionHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface CompartmentDefinitionReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface CompartmentDefinitionToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface Composition {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  attester: string[] | null
  author: string[] | null
  category: string[] | null
  compartments: string[]
  confidentiality: string | null
  content: string
  context: string[] | null
  date: Timestamp | null
  deleted: Generated<boolean>
  encounter: string | null
  entry: string[] | null
  id: string
  lastUpdated: Timestamp
  patient: string | null
  period: Timestamp[] | null
  projectId: string | null
  relatedId: string[] | null
  relatedRef: string[] | null
  section: string[] | null
  status: string | null
  subject: string | null
  title: string | null
  type: string | null
}

export interface CompositionHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface CompositionReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface CompositionToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface ConceptMap {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  context: string[] | null
  contextQuantity: number[] | null
  contextType: string[] | null
  contextTypeQuantity: string[] | null
  contextTypeValue: string[] | null
  date: Timestamp | null
  deleted: Generated<boolean>
  dependson: string[] | null
  description: string | null
  id: string
  jurisdiction: string[] | null
  lastUpdated: Timestamp
  name: string | null
  other: string[] | null
  product: string[] | null
  projectId: string | null
  publisher: string | null
  source: string | null
  sourceCode: string[] | null
  sourceSystem: string[] | null
  sourceUri: string | null
  status: string | null
  target: string | null
  targetCode: string[] | null
  targetSystem: string[] | null
  targetUri: string | null
  title: string | null
  url: string | null
  version: string | null
}

export interface ConceptMapHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface ConceptMapReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface ConceptMapToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
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
  bodySite: string[] | null
  category: string[] | null
  clinicalStatus: string | null
  code: string | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  encounter: string | null
  evidence: string[] | null
  evidenceDetail: string[] | null
  id: string
  lastUpdated: Timestamp
  onsetAge: number | null
  onsetDate: Timestamp | null
  onsetInfo: string | null
  patient: string | null
  projectId: string | null
  recordedDate: Timestamp | null
  severity: string | null
  stage: string[] | null
  subject: string | null
  verificationStatus: string | null
}

export interface ConditionHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface ConditionIcd10Codes {
  condition_id: string
  icd10_code: string
}

export interface ConditionReferences {
  code: string
  resourceId: string
  targetId: string
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

export interface ConditionToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface Consent {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  action: string[] | null
  actor: string[] | null
  category: string[] | null
  compartments: string[]
  consentor: string[] | null
  content: string
  data: string[] | null
  date: Timestamp | null
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  organization: string[] | null
  patient: string | null
  period: Timestamp | null
  projectId: string | null
  purpose: string[] | null
  scope: string | null
  securityLabel: string[] | null
  sourceReference: string | null
  status: string | null
}

export interface ConsentHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface ConsentReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface ConsentToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface Consumables {
  created_at: Generated<Timestamp>
  id: Generated<number>
  is_medication: boolean | null
  name: string
  updated_at: Generated<Timestamp>
}

export interface Consumption {
  created_at: Generated<Timestamp>
  created_by: number
  id: Generated<number>
  organization_id: string
  procurement_id: number
  quantity: number
  updated_at: Generated<Timestamp>
}

export interface ContactPoint {
  content: string
  id: string
  index: number
  resourceId: string
  system: string | null
  value: string | null
}

export interface Contract {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  authority: string[] | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  domain: string[] | null
  id: string
  instantiates: string | null
  issued: Timestamp | null
  lastUpdated: Timestamp
  patient: string[] | null
  projectId: string | null
  signer: string[] | null
  status: string | null
  subject: string[] | null
  url: string | null
}

export interface ContractHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface ContractReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface ContractToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface Countries {
  id: Generated<number>
  name: string
}

export interface Coverage {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  beneficiary: string | null
  classType: string[] | null
  classValue: string[] | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  dependent: string | null
  id: string
  lastUpdated: Timestamp
  patient: string | null
  payor: string[] | null
  policyHolder: string | null
  projectId: string | null
  status: string | null
  subscriber: string | null
  type: string | null
}

export interface CoverageEligibilityRequest {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  created: Timestamp | null
  deleted: Generated<boolean>
  enterer: string | null
  facility: string | null
  id: string
  lastUpdated: Timestamp
  patient: string | null
  projectId: string | null
  provider: string | null
  status: string | null
}

export interface CoverageEligibilityRequestHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface CoverageEligibilityRequestReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface CoverageEligibilityRequestToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface CoverageEligibilityResponse {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  created: Timestamp | null
  deleted: Generated<boolean>
  disposition: string | null
  id: string
  insurer: string | null
  lastUpdated: Timestamp
  outcome: string | null
  patient: string | null
  projectId: string | null
  request: string | null
  requestor: string | null
  status: string | null
}

export interface CoverageEligibilityResponseHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface CoverageEligibilityResponseReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface CoverageEligibilityResponseToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface CoverageHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface CoverageReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface CoverageToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface DatabaseMigration {
  dataVersion: number
  id: number
  version: number
}

export interface DetectedIssue {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  author: string | null
  code: string | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  id: string
  identified: Timestamp | null
  implicated: string[] | null
  lastUpdated: Timestamp
  patient: string | null
  projectId: string | null
}

export interface DetectedIssueHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface DetectedIssueReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface DetectedIssueToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface Device {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  deviceName: string[] | null
  id: string
  lastUpdated: Timestamp
  location: string | null
  manufacturer: string | null
  model: string | null
  organization: string | null
  patient: string | null
  projectId: string | null
  status: string | null
  type: string | null
  udiCarrier: string[] | null
  udiDi: string[] | null
  url: string | null
}

export interface DeviceCapabilities {
  created_at: Generated<Timestamp>
  device_id: number
  diagnostic_test: string
  id: Generated<number>
  updated_at: Generated<Timestamp>
}

export interface DeviceDefinition {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  classification: string[] | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  parent: string | null
  projectId: string | null
  type: string | null
}

export interface DeviceDefinitionHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface DeviceDefinitionReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface DeviceDefinitionToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface DeviceHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface DeviceMetric {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  category: string | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  parent: string | null
  projectId: string | null
  source: string | null
  type: string | null
}

export interface DeviceMetricHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface DeviceMetricReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface DeviceMetricToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface DeviceReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface DeviceRequest {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  authoredOn: Timestamp | null
  basedOn: string[] | null
  code: string | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  device: string | null
  encounter: string | null
  eventDate: Timestamp | null
  groupIdentifier: string | null
  id: string
  instantiatesCanonical: string[] | null
  instantiatesUri: string[] | null
  insurance: string[] | null
  intent: string | null
  lastUpdated: Timestamp
  patient: string | null
  performer: string | null
  priorRequest: string[] | null
  projectId: string | null
  requester: string | null
  status: string | null
  subject: string | null
}

export interface DeviceRequestHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface DeviceRequestReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface DeviceRequestToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface Devices {
  created_at: Generated<Timestamp>
  id: Generated<number>
  manufacturer: string
  name: string
  updated_at: Generated<Timestamp>
}

export interface DeviceToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface DeviceUseStatement {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  device: string | null
  id: string
  lastUpdated: Timestamp
  patient: string | null
  projectId: string | null
  subject: string | null
}

export interface DeviceUseStatementHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface DeviceUseStatementReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface DeviceUseStatementToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface DiagnosticReport {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  basedOn: string[] | null
  category: string[] | null
  code: string | null
  compartments: string[]
  conclusion: string[] | null
  content: string
  date: Timestamp | null
  deleted: Generated<boolean>
  encounter: string | null
  id: string
  issued: Timestamp | null
  lastUpdated: Timestamp
  media: string[] | null
  patient: string | null
  performer: string[] | null
  projectId: string | null
  result: string[] | null
  resultsInterpreter: string[] | null
  specimen: string[] | null
  status: string | null
  subject: string | null
}

export interface DiagnosticReportHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface DiagnosticReportReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface DiagnosticReportToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface DiagnosticTests {
  name: string
}

export interface Districts {
  id: Generated<number>
  name: string
  province_id: number
}

export interface DoctorReview {
  order: Int8
  step: DoctorReviewStep
}

export interface DoctorReviewRequests {
  created_at: Generated<Timestamp>
  encounter_id: number
  id: Generated<number>
  organization_id: string | null
  patient_id: number
  pending: Generated<boolean>
  requested_by: number
  requester_notes: string | null
  requesting_doctor_id: number | null
  updated_at: Generated<Timestamp>
}

export interface DoctorReviews {
  completed_at: Timestamp | null
  created_at: Generated<Timestamp>
  encounter_id: number
  id: Generated<number>
  patient_id: number
  requested_by: number
  requester_notes: string | null
  reviewer_id: number
  reviewer_notes: string | null
  updated_at: Generated<Timestamp>
}

export interface DoctorReviewSteps {
  created_at: Generated<Timestamp>
  doctor_review_id: number
  id: Generated<number>
  step: DoctorReviewStep
  updated_at: Generated<Timestamp>
}

export interface DocumentManifest {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  author: string[] | null
  compartments: string[]
  content: string
  created: Timestamp | null
  deleted: Generated<boolean>
  description: string | null
  id: string
  item: string[] | null
  lastUpdated: Timestamp
  patient: string | null
  projectId: string | null
  recipient: string[] | null
  relatedId: string[] | null
  relatedRef: string[] | null
  source: string | null
  status: string | null
  subject: string | null
  type: string | null
}

export interface DocumentManifestHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface DocumentManifestReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface DocumentManifestToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface DocumentReference {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  authenticator: string | null
  author: string[] | null
  category: string[] | null
  compartments: string[]
  content: string
  contenttype: string[] | null
  custodian: string | null
  date: Timestamp | null
  deleted: Generated<boolean>
  description: string | null
  encounter: string[] | null
  event: string[] | null
  facility: string | null
  format: string[] | null
  id: string
  language: string[] | null
  lastUpdated: Timestamp
  location: string[] | null
  patient: string | null
  period: Timestamp | null
  projectId: string | null
  related: string[] | null
  relatesto: string[] | null
  relation: string[] | null
  relationship: string[] | null
  securityLabel: string[] | null
  setting: string | null
  status: string | null
  subject: string | null
  type: string | null
}

export interface DocumentReferenceHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface DocumentReferenceReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface DocumentReferenceToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface DomainConfiguration {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  domain: string | null
  id: string
  lastUpdated: Timestamp
  projectId: string | null
}

export interface DomainConfigurationHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface DomainConfigurationReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface DomainConfigurationToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface Drugs {
  created_at: Generated<Timestamp>
  generic_name: string
  id: Generated<number>
  updated_at: Generated<Timestamp>
}

export interface EffectEvidenceSynthesis {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  context: string[] | null
  contextQuantity: number[] | null
  contextType: string[] | null
  contextTypeQuantity: string[] | null
  contextTypeValue: string[] | null
  date: Timestamp | null
  deleted: Generated<boolean>
  description: string | null
  effective: Timestamp | null
  id: string
  jurisdiction: string[] | null
  lastUpdated: Timestamp
  name: string | null
  projectId: string | null
  publisher: string | null
  status: string | null
  title: string | null
  url: string | null
  version: string | null
}

export interface EffectEvidenceSynthesisHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface EffectEvidenceSynthesisReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface EffectEvidenceSynthesisToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface Employment {
  created_at: Generated<Timestamp>
  health_worker_id: number
  id: Generated<number>
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
  class: string | null
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
  locationPeriod: Timestamp[] | null
  participant: string[] | null
  participantType: string[] | null
  partOf: string | null
  patient: string | null
  practitioner: string[] | null
  projectId: string | null
  reasonCode: string[] | null
  reasonReference: string[] | null
  serviceProvider: string | null
  specialArrangement: string[] | null
  status: string | null
  subject: string | null
  type: string[] | null
}

export interface Encounter2 {
  order: Int8
  step: EncounterStep
}

export interface EncounterHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface EncounterReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface EncounterToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface Endpoint {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  connectionType: string | null
  content: string
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  name: string | null
  organization: string | null
  payloadType: string[] | null
  projectId: string | null
  status: string | null
}

export interface EndpointHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface EndpointReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface EndpointToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface EnrollmentRequest {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  patient: string | null
  projectId: string | null
  status: string | null
  subject: string | null
}

export interface EnrollmentRequestHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface EnrollmentRequestReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface EnrollmentRequestToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface EnrollmentResponse {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  projectId: string | null
  request: string | null
  status: string | null
}

export interface EnrollmentResponseHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface EnrollmentResponseReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface EnrollmentResponseToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface EpisodeOfCare {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  careManager: string | null
  compartments: string[]
  condition: string[] | null
  content: string
  date: Timestamp | null
  deleted: Generated<boolean>
  id: string
  incomingReferral: string[] | null
  lastUpdated: Timestamp
  organization: string | null
  patient: string | null
  projectId: string | null
  status: string | null
  type: string[] | null
}

export interface EpisodeOfCareHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface EpisodeOfCareReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface EpisodeOfCareToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface EventDefinition {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  composedOf: string[] | null
  content: string
  context: string[] | null
  contextQuantity: number[] | null
  contextType: string[] | null
  contextTypeQuantity: string[] | null
  contextTypeValue: string[] | null
  date: Timestamp | null
  deleted: Generated<boolean>
  dependsOn: string[] | null
  derivedFrom: string[] | null
  description: string | null
  effective: Timestamp | null
  id: string
  jurisdiction: string[] | null
  lastUpdated: Timestamp
  name: string | null
  predecessor: string[] | null
  projectId: string | null
  publisher: string | null
  status: string | null
  successor: string[] | null
  title: string | null
  topic: string[] | null
  url: string | null
  version: string | null
}

export interface EventDefinitionHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface EventDefinitionReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface EventDefinitionToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface Evidence {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  composedOf: string[] | null
  content: string
  context: string[] | null
  contextQuantity: number[] | null
  contextType: string[] | null
  contextTypeQuantity: string[] | null
  contextTypeValue: string[] | null
  date: Timestamp | null
  deleted: Generated<boolean>
  dependsOn: string[] | null
  derivedFrom: string[] | null
  description: string | null
  effective: Timestamp | null
  id: string
  jurisdiction: string[] | null
  lastUpdated: Timestamp
  name: string | null
  predecessor: string[] | null
  projectId: string | null
  publisher: string | null
  status: string | null
  successor: string[] | null
  title: string | null
  topic: string[] | null
  url: string | null
  version: string | null
}

export interface EvidenceHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface EvidenceReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface EvidenceToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface EvidenceVariable {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  composedOf: string[] | null
  content: string
  context: string[] | null
  contextQuantity: number[] | null
  contextType: string[] | null
  contextTypeQuantity: string[] | null
  contextTypeValue: string[] | null
  date: Timestamp | null
  deleted: Generated<boolean>
  dependsOn: string[] | null
  derivedFrom: string[] | null
  description: string | null
  effective: Timestamp | null
  id: string
  jurisdiction: string[] | null
  lastUpdated: Timestamp
  name: string | null
  predecessor: string[] | null
  projectId: string | null
  publisher: string | null
  status: string | null
  successor: string[] | null
  title: string | null
  topic: string[] | null
  url: string | null
  version: string | null
}

export interface EvidenceVariableHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface EvidenceVariableReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface EvidenceVariableToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface ExaminationCategories {
  category: string
  examination_name: string
  id: Generated<number>
  order: number
}

export interface ExaminationFindings {
  ask_dependent_on: number | null
  ask_dependent_values: Json | null
  examination_category_id: number
  id: Generated<number>
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

export interface ExampleScenario {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  context: string[] | null
  contextQuantity: number[] | null
  contextType: string[] | null
  contextTypeQuantity: string[] | null
  contextTypeValue: string[] | null
  date: Timestamp | null
  deleted: Generated<boolean>
  id: string
  jurisdiction: string[] | null
  lastUpdated: Timestamp
  name: string | null
  projectId: string | null
  publisher: string | null
  status: string | null
  url: string | null
  version: string | null
}

export interface ExampleScenarioHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface ExampleScenarioReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface ExampleScenarioToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface ExplanationOfBenefit {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  careTeam: string[] | null
  claim: string | null
  compartments: string[]
  content: string
  coverage: string[] | null
  created: Timestamp | null
  deleted: Generated<boolean>
  detailUdi: string[] | null
  disposition: string | null
  encounter: string[] | null
  enterer: string | null
  facility: string | null
  id: string
  itemUdi: string[] | null
  lastUpdated: Timestamp
  patient: string | null
  payee: string | null
  procedureUdi: string[] | null
  projectId: string | null
  provider: string | null
  status: string | null
  subdetailUdi: string[] | null
}

export interface ExplanationOfBenefitHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface ExplanationOfBenefitReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface ExplanationOfBenefitToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface FamilyMemberHistory {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  code: string[] | null
  compartments: string[]
  content: string
  date: Timestamp | null
  deleted: Generated<boolean>
  id: string
  instantiatesCanonical: string[] | null
  instantiatesUri: string[] | null
  lastUpdated: Timestamp
  patient: string | null
  projectId: string | null
  relationship: string | null
  sex: string | null
  status: string | null
}

export interface FamilyMemberHistoryHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface FamilyMemberHistoryReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface FamilyMemberHistoryToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface Flag {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  author: string | null
  compartments: string[]
  content: string
  date: Timestamp | null
  deleted: Generated<boolean>
  encounter: string | null
  id: string
  lastUpdated: Timestamp
  patient: string | null
  projectId: string | null
  subject: string | null
}

export interface FlagHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface FlagReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface FlagToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
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

export interface Goal {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  achievementStatus: string | null
  category: string[] | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  lifecycleStatus: string | null
  patient: string | null
  projectId: string | null
  startDate: Timestamp | null
  subject: string | null
  targetDate: Timestamp[] | null
}

export interface GoalHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface GoalReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface GoalToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface GraphDefinition {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  context: string[] | null
  contextQuantity: number[] | null
  contextType: string[] | null
  contextTypeQuantity: string[] | null
  contextTypeValue: string[] | null
  date: Timestamp | null
  deleted: Generated<boolean>
  description: string | null
  id: string
  jurisdiction: string[] | null
  lastUpdated: Timestamp
  name: string | null
  projectId: string | null
  publisher: string | null
  start: string | null
  status: string | null
  url: string | null
  version: string | null
}

export interface GraphDefinitionHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface GraphDefinitionReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface GraphDefinitionToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface Group {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  actual: boolean | null
  characteristic: string[] | null
  characteristicValue: string[] | null
  code: string | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  exclude: boolean[] | null
  id: string
  lastUpdated: Timestamp
  managingEntity: string | null
  member: string[] | null
  name: string | null
  projectId: string | null
  type: string | null
  value: string[] | null
}

export interface GroupHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface GroupReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface GroupToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface GuardianRelations {
  dependent: string
  female_dependent: string | null
  female_guardian: string | null
  guardian: GuardianRelation
  male_dependent: string | null
  male_guardian: string | null
}

export interface GuidanceResponse {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  patient: string | null
  projectId: string | null
  request: string | null
  subject: string | null
}

export interface GuidanceResponseHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface GuidanceResponseReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface GuidanceResponseToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface HealthcareService {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  active: boolean | null
  characteristic: string[] | null
  compartments: string[]
  content: string
  coverageArea: string[] | null
  deleted: Generated<boolean>
  endpoint: string[] | null
  id: string
  lastUpdated: Timestamp
  location: string[] | null
  name: string | null
  organization: string | null
  program: string[] | null
  projectId: string | null
  serviceCategory: string[] | null
  serviceType: string[] | null
  specialty: string[] | null
}

export interface HealthcareServiceHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface HealthcareServiceReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface HealthcareServiceToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
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
  id: Generated<number>
  organization_id: string
  profession: Profession
  updated_at: Generated<Timestamp>
}

export interface HealthWorkers {
  avatar_url: string
  created_at: Generated<Timestamp>
  email: string
  id: Generated<number>
  name: string
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
  id: Generated<number>
  note: string
  pure: boolean
}

export interface Icd10DiagnosesExcludesCategories {
  category: string
  exclude_id: number
  id: Generated<number>
}

export interface Icd10DiagnosesExcludesCodeRanges {
  code_range_end: string
  code_range_end_dash: Generated<boolean>
  code_range_start: string
  code_range_start_dash: Generated<boolean>
  exclude_id: number
  id: Generated<number>
}

export interface Icd10DiagnosesExcludesCodes {
  code: string
  dash: Generated<boolean>
  exclude_id: number
  id: Generated<number>
}

export interface Icd10DiagnosesIncludes {
  code: string
  id: Generated<number>
  note: string
  note_vector: string
  sourced_from_index: boolean
}

export interface Icd10Sections {
  description: string
  section: string
}

export interface Identifier {
  content: string
  id: string
  index: number
  resourceId: string
  system: string | null
  value: string | null
}

export interface ImagingStudy {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  basedon: string[] | null
  bodysite: string[] | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  dicomClass: string[] | null
  encounter: string | null
  endpoint: string[] | null
  id: string
  instance: string[] | null
  interpreter: string[] | null
  lastUpdated: Timestamp
  modality: string[] | null
  patient: string | null
  performer: string[] | null
  projectId: string | null
  reason: string[] | null
  referrer: string | null
  series: string[] | null
  started: Timestamp | null
  status: string | null
  subject: string | null
}

export interface ImagingStudyHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface ImagingStudyReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface ImagingStudyToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface Immunization {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  date: Timestamp | null
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  location: string | null
  lotNumber: string | null
  manufacturer: string | null
  patient: string | null
  performer: string[] | null
  projectId: string | null
  reaction: string[] | null
  reactionDate: Timestamp[] | null
  reasonCode: string[] | null
  reasonReference: string[] | null
  series: string[] | null
  status: string | null
  statusReason: string | null
  targetDisease: string[] | null
  vaccineCode: string | null
}

export interface ImmunizationEvaluation {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  date: Timestamp | null
  deleted: Generated<boolean>
  doseStatus: string | null
  id: string
  immunizationEvent: string | null
  lastUpdated: Timestamp
  patient: string | null
  projectId: string | null
  status: string | null
  targetDisease: string | null
}

export interface ImmunizationEvaluationHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface ImmunizationEvaluationReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface ImmunizationEvaluationToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface ImmunizationHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface ImmunizationRecommendation {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  date: Timestamp | null
  deleted: Generated<boolean>
  id: string
  information: string[] | null
  lastUpdated: Timestamp
  patient: string | null
  projectId: string | null
  status: string[] | null
  support: string[] | null
  targetDisease: string[] | null
  vaccineType: string[] | null
}

export interface ImmunizationRecommendationHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface ImmunizationRecommendationReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface ImmunizationRecommendationToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface ImmunizationReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface ImmunizationToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface ImplementationGuide {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  context: string[] | null
  contextQuantity: number[] | null
  contextType: string[] | null
  contextTypeQuantity: string[] | null
  contextTypeValue: string[] | null
  date: Timestamp | null
  deleted: Generated<boolean>
  dependsOn: string[] | null
  description: string | null
  experimental: boolean | null
  global: string[] | null
  id: string
  jurisdiction: string[] | null
  lastUpdated: Timestamp
  name: string | null
  projectId: string | null
  publisher: string | null
  resource: string[] | null
  status: string | null
  title: string | null
  url: string | null
  version: string | null
}

export interface ImplementationGuideHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface ImplementationGuideReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface ImplementationGuideToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface InsurancePlan {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  administeredBy: string | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  endpoint: string[] | null
  id: string
  lastUpdated: Timestamp
  name: string | null
  ownedBy: string | null
  phonetic: string | null
  projectId: string | null
  status: string | null
  type: string[] | null
}

export interface InsurancePlanHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface InsurancePlanReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface InsurancePlanToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface Intake {
  order: Int8
  step: IntakeStep
}

export interface Invoice {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  account: string | null
  compartments: string[]
  content: string
  date: Timestamp | null
  deleted: Generated<boolean>
  id: string
  issuer: string | null
  lastUpdated: Timestamp
  participant: string[] | null
  participantRole: string[] | null
  patient: string | null
  projectId: string | null
  recipient: string | null
  status: string | null
  subject: string | null
  totalgross: number | null
  totalnet: number | null
  type: string | null
}

export interface InvoiceHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface InvoiceReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface InvoiceToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface JsonWebKey {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  active: boolean | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  projectId: string | null
}

export interface JsonWebKeyHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface JsonWebKeyReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface JsonWebKeyToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface Library {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  composedOf: string[] | null
  content: string
  contentType: string[] | null
  context: string[] | null
  contextQuantity: number[] | null
  contextType: string[] | null
  contextTypeQuantity: string[] | null
  contextTypeValue: string[] | null
  date: Timestamp | null
  deleted: Generated<boolean>
  dependsOn: string[] | null
  derivedFrom: string[] | null
  description: string | null
  effective: Timestamp | null
  id: string
  jurisdiction: string[] | null
  lastUpdated: Timestamp
  name: string | null
  predecessor: string[] | null
  projectId: string | null
  publisher: string | null
  status: string | null
  successor: string[] | null
  title: string | null
  topic: string[] | null
  type: string | null
  url: string | null
  version: string | null
}

export interface LibraryHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface LibraryReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface LibraryToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface Linkage {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  author: string | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  id: string
  item: string[] | null
  lastUpdated: Timestamp
  projectId: string | null
  source: string[] | null
}

export interface LinkageHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface LinkageReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface LinkageToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface List {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  code: string | null
  compartments: string[]
  content: string
  date: Timestamp | null
  deleted: Generated<boolean>
  emptyReason: string | null
  encounter: string | null
  id: string
  item: string[] | null
  lastUpdated: Timestamp
  notes: string[] | null
  patient: string | null
  projectId: string | null
  source: string | null
  status: string | null
  subject: string | null
  title: string | null
}

export interface ListHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface ListReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface ListToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
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
  operationalStatus: string | null
  organization: string | null
  organizationId: string
  partof: string | null
  projectId: string | null
  status: string | null
  type: string[] | null
}

export interface LocationHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface LocationReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface LocationToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface Login {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  code: string | null
  compartments: string[]
  content: string
  cookie: string | null
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  projectId: string | null
  user: string | null
}

export interface LoginHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface LoginReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface LoginToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
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

export interface ManufacturedMedicationStrengths {
  consumable_id: number
  created_at: Generated<Timestamp>
  id: Generated<number>
  manufactured_medication_id: number
  strength_numerator: number
  updated_at: Generated<Timestamp>
}

export interface Measure {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  composedOf: string[] | null
  content: string
  context: string[] | null
  contextQuantity: number[] | null
  contextType: string[] | null
  contextTypeQuantity: string[] | null
  contextTypeValue: string[] | null
  date: Timestamp | null
  deleted: Generated<boolean>
  dependsOn: string[] | null
  derivedFrom: string[] | null
  description: string | null
  effective: Timestamp | null
  id: string
  jurisdiction: string[] | null
  lastUpdated: Timestamp
  name: string | null
  predecessor: string[] | null
  projectId: string | null
  publisher: string | null
  status: string | null
  successor: string[] | null
  title: string | null
  topic: string[] | null
  url: string | null
  version: string | null
}

export interface MeasureHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface Measurements {
  name: string
  units: string
}

export interface MeasureReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface MeasureReport {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  date: Timestamp | null
  deleted: Generated<boolean>
  evaluatedResource: string[] | null
  id: string
  lastUpdated: Timestamp
  measure: string | null
  patient: string | null
  period: Timestamp | null
  period_range: string | null
  projectId: string | null
  reporter: string | null
  status: string | null
  subject: string | null
}

export interface MeasureReportHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface MeasureReportReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface MeasureReportToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface MeasureToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
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
  modality: string | null
  operator: string | null
  patient: string | null
  projectId: string | null
  site: string | null
  status: string | null
  subject: string | null
  type: string | null
  view: string | null
}

export interface Media2 {
  binary_data: Buffer
  created_at: Generated<Timestamp>
  id: Generated<number>
  mime_type: string
  updated_at: Generated<Timestamp>
  uuid: Generated<string>
}

export interface MediaHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface MediaReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface MediaToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface Medication {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  code: string | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  expirationDate: Timestamp | null
  form: string | null
  id: string
  ingredient: string[] | null
  ingredientCode: string[] | null
  lastUpdated: Timestamp
  lotNumber: string | null
  manufacturer: string | null
  projectId: string | null
  status: string | null
}

export interface MedicationAdministration {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  code: string | null
  compartments: string[]
  content: string
  context: string | null
  deleted: Generated<boolean>
  device: string[] | null
  effectiveTime: Timestamp | null
  id: string
  lastUpdated: Timestamp
  medication: string | null
  patient: string | null
  performer: string[] | null
  projectId: string | null
  reasonGiven: string[] | null
  reasonNotGiven: string[] | null
  request: string | null
  status: string | null
  subject: string | null
}

export interface MedicationAdministrationHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface MedicationAdministrationReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface MedicationAdministrationToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface MedicationDispense {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  code: string | null
  compartments: string[]
  content: string
  context: string | null
  deleted: Generated<boolean>
  destination: string | null
  id: string
  lastUpdated: Timestamp
  medication: string | null
  patient: string | null
  performer: string[] | null
  prescription: string[] | null
  projectId: string | null
  receiver: string[] | null
  responsibleparty: string[] | null
  status: string | null
  subject: string | null
  type: string | null
  whenhandedover: Timestamp | null
  whenprepared: Timestamp | null
}

export interface MedicationDispenseHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface MedicationDispenseReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface MedicationDispenseToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface MedicationHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface MedicationKnowledge {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  classification: string[] | null
  classificationType: string[] | null
  code: string | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  doseform: string | null
  id: string
  ingredient: string[] | null
  ingredientCode: string[] | null
  lastUpdated: Timestamp
  manufacturer: string | null
  monitoringProgramName: string[] | null
  monitoringProgramType: string[] | null
  monograph: string[] | null
  monographType: string[] | null
  projectId: string | null
  sourceCost: string[] | null
  status: string | null
}

export interface MedicationKnowledgeHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface MedicationKnowledgeReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface MedicationKnowledgeToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface MedicationReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface MedicationRequest {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  authoredon: Timestamp | null
  category: string[] | null
  code: string | null
  compartments: string[]
  content: string
  date: Timestamp[] | null
  deleted: Generated<boolean>
  encounter: string | null
  id: string
  intendedDispenser: string | null
  intendedPerformer: string | null
  intendedPerformertype: string | null
  intent: string | null
  lastUpdated: Timestamp
  medication: string | null
  patient: string | null
  priority: string | null
  priorityOrder: number | null
  projectId: string | null
  requester: string | null
  status: string | null
  subject: string | null
}

export interface MedicationRequestHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface MedicationRequestReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface MedicationRequestToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
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

export interface MedicationStatement {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  category: string | null
  code: string | null
  compartments: string[]
  content: string
  context: string | null
  deleted: Generated<boolean>
  effective: Timestamp | null
  id: string
  lastUpdated: Timestamp
  medication: string | null
  partOf: string[] | null
  patient: string | null
  projectId: string | null
  source: string | null
  status: string | null
  subject: string | null
}

export interface MedicationStatementHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface MedicationStatementReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface MedicationStatementToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface MedicationToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface MedicinalProduct {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  name: string[] | null
  nameLanguage: string[] | null
  projectId: string | null
}

export interface MedicinalProductAuthorization {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  country: string[] | null
  deleted: Generated<boolean>
  holder: string | null
  id: string
  lastUpdated: Timestamp
  projectId: string | null
  status: string | null
  subject: string | null
}

export interface MedicinalProductAuthorizationHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface MedicinalProductAuthorizationReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface MedicinalProductAuthorizationToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface MedicinalProductContraindication {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  projectId: string | null
  subject: string[] | null
}

export interface MedicinalProductContraindicationHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface MedicinalProductContraindicationReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface MedicinalProductContraindicationToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface MedicinalProductHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface MedicinalProductIndication {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  projectId: string | null
  subject: string[] | null
}

export interface MedicinalProductIndicationHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface MedicinalProductIndicationReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface MedicinalProductIndicationToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface MedicinalProductIngredient {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  projectId: string | null
}

export interface MedicinalProductIngredientHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface MedicinalProductIngredientReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface MedicinalProductIngredientToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface MedicinalProductInteraction {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  projectId: string | null
  subject: string[] | null
}

export interface MedicinalProductInteractionHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface MedicinalProductInteractionReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface MedicinalProductInteractionToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface MedicinalProductManufactured {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  projectId: string | null
}

export interface MedicinalProductManufacturedHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface MedicinalProductManufacturedReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface MedicinalProductManufacturedToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface MedicinalProductPackaged {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  projectId: string | null
  subject: string[] | null
}

export interface MedicinalProductPackagedHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface MedicinalProductPackagedReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface MedicinalProductPackagedToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface MedicinalProductPharmaceutical {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  projectId: string | null
  route: string[] | null
  targetSpecies: string[] | null
}

export interface MedicinalProductPharmaceuticalHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface MedicinalProductPharmaceuticalReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface MedicinalProductPharmaceuticalToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface MedicinalProductReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface MedicinalProductToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface MedicinalProductUndesirableEffect {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  projectId: string | null
  subject: string[] | null
}

export interface MedicinalProductUndesirableEffectHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface MedicinalProductUndesirableEffectReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface MedicinalProductUndesirableEffectToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface MessageDefinition {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  category: string | null
  compartments: string[]
  content: string
  context: string[] | null
  contextQuantity: number[] | null
  contextType: string[] | null
  contextTypeQuantity: string[] | null
  contextTypeValue: string[] | null
  date: Timestamp | null
  deleted: Generated<boolean>
  description: string | null
  event: string | null
  focus: string[] | null
  id: string
  jurisdiction: string[] | null
  lastUpdated: Timestamp
  name: string | null
  parent: string[] | null
  projectId: string | null
  publisher: string | null
  status: string | null
  title: string | null
  url: string | null
  version: string | null
}

export interface MessageDefinitionHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface MessageDefinitionReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface MessageDefinitionToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface MessageHeader {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  author: string | null
  code: string | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  destination: string[] | null
  destinationUri: string[] | null
  enterer: string | null
  event: string | null
  focus: string[] | null
  id: string
  lastUpdated: Timestamp
  projectId: string | null
  receiver: string[] | null
  responseId: string | null
  responsible: string | null
  sender: string | null
  source: string | null
  sourceUri: string | null
  target: string[] | null
}

export interface MessageHeaderHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface MessageHeaderReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface MessageHeaderToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface MolecularSequence {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  chromosome: string | null
  chromosomeVariantCoordinate: string[] | null
  chromosomeWindowCoordinate: string | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  patient: string | null
  projectId: string | null
  referenceseqid: string | null
  referenceseqidVariantCoordinate: string[] | null
  referenceseqidWindowCoordinate: string | null
  type: string | null
  variantEnd: number[] | null
  variantStart: number[] | null
  windowEnd: number | null
  windowStart: number | null
}

export interface MolecularSequenceHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface MolecularSequenceReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface MolecularSequenceToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface NamingSystem {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  contact: string[] | null
  content: string
  context: string[] | null
  contextQuantity: number[] | null
  contextType: string[] | null
  contextTypeQuantity: string[] | null
  contextTypeValue: string[] | null
  date: Timestamp | null
  deleted: Generated<boolean>
  description: string | null
  id: string
  idType: string[] | null
  jurisdiction: string[] | null
  kind: string | null
  lastUpdated: Timestamp
  name: string | null
  period: Timestamp[] | null
  projectId: string | null
  publisher: string | null
  responsible: string | null
  status: string | null
  telecom: string[] | null
  type: string | null
  value: string[] | null
}

export interface NamingSystemHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface NamingSystemReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface NamingSystemToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
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

export interface NutritionOrder {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  additive: string | null
  compartments: string[]
  content: string
  datetime: Timestamp | null
  deleted: Generated<boolean>
  encounter: string | null
  formula: string | null
  id: string
  instantiatesCanonical: string[] | null
  instantiatesUri: string[] | null
  lastUpdated: Timestamp
  oraldiet: string[] | null
  patient: string | null
  projectId: string | null
  provider: string | null
  status: string | null
  supplement: string[] | null
}

export interface NutritionOrderHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface NutritionOrderReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface NutritionOrderToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface Observation {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  basedOn: string[] | null
  category: string[] | null
  code: string | null
  codeValueConcept: string | null
  codeValueDate: string | null
  codeValueQuantity: string | null
  codeValueString: string | null
  comboCode: string[] | null
  comboCodeValueConcept: string[] | null
  comboCodeValueQuantity: string[] | null
  comboDataAbsentReason: string[] | null
  comboValueConcept: string[] | null
  comboValueQuantity: number[] | null
  compartments: string[]
  componentCode: string[] | null
  componentCodeValueConcept: string[] | null
  componentCodeValueQuantity: string[] | null
  componentDataAbsentReason: string[] | null
  componentValueConcept: string[] | null
  componentValueQuantity: number[] | null
  content: string
  dataAbsentReason: string | null
  date: Timestamp | null
  deleted: Generated<boolean>
  derivedFrom: string[] | null
  device: string | null
  encounter: string | null
  focus: string[] | null
  hasMember: string[] | null
  id: string
  lastUpdated: Timestamp
  method: string | null
  partOf: string[] | null
  patient: string | null
  performer: string[] | null
  projectId: string | null
  specimen: string | null
  status: string | null
  subject: string | null
  valueConcept: string | null
  valueDate: Timestamp | null
  valueQuantity: number | null
  valueString: string | null
}

export interface ObservationDefinition {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  code: string | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  projectId: string | null
  publisher: string | null
}

export interface ObservationDefinitionHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface ObservationDefinitionReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface ObservationDefinitionToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface ObservationHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface ObservationReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface ObservationToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface OperationDefinition {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  base: string | null
  code: string | null
  compartments: string[]
  content: string
  context: string[] | null
  contextQuantity: number[] | null
  contextType: string[] | null
  contextTypeQuantity: string[] | null
  contextTypeValue: string[] | null
  date: Timestamp | null
  deleted: Generated<boolean>
  description: string | null
  id: string
  inputProfile: string | null
  instance: boolean | null
  jurisdiction: string[] | null
  kind: string | null
  lastUpdated: Timestamp
  name: string | null
  outputProfile: string | null
  projectId: string | null
  publisher: string | null
  status: string | null
  system: boolean | null
  title: string | null
  type: boolean | null
  url: string | null
  version: string | null
}

export interface OperationDefinitionHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface OperationDefinitionReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface OperationDefinitionToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface OperationOutcome {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  projectId: string | null
}

export interface OperationOutcomeHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface OperationOutcomeReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface OperationOutcomeToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface Organization {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  active: boolean | null
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
  type: string[] | null
}

export interface OrganizationAffiliation {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  active: boolean | null
  compartments: string[]
  content: string
  date: Timestamp | null
  deleted: Generated<boolean>
  endpoint: string[] | null
  id: string
  lastUpdated: Timestamp
  location: string[] | null
  network: string[] | null
  participatingOrganization: string | null
  primaryOrganization: string | null
  projectId: string | null
  role: string[] | null
  service: string[] | null
  specialty: string[] | null
}

export interface OrganizationAffiliationHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface OrganizationAffiliationReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface OrganizationAffiliationToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface OrganizationConsumables {
  consumable_id: number
  created_at: Generated<Timestamp>
  id: Generated<number>
  organization_id: string
  quantity_on_hand: number
  updated_at: Generated<Timestamp>
}

export interface OrganizationDevices {
  created_at: Generated<Timestamp>
  created_by: number
  device_id: number
  id: Generated<number>
  organization_id: string
  serial_number: string | null
  updated_at: Generated<Timestamp>
  updated_by: number | null
}

export interface OrganizationHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface OrganizationReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface OrganizationToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface Parameters {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  projectId: string | null
}

export interface ParametersHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface ParametersReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface ParametersToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface PasswordChangeRequest {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  projectId: string | null
  user: string | null
}

export interface PasswordChangeRequestHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface PasswordChangeRequestReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface PasswordChangeRequestToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface Patient {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  active: boolean | null
  birthdate: Timestamp | null
  compartments: string[]
  content: string
  deathDate: Timestamp | null
  deceased: boolean | null
  deleted: Generated<boolean>
  ethnicity: string[] | null
  gender: string | null
  genderIdentity: string[] | null
  generalPractitioner: string[] | null
  id: string
  language: string[] | null
  lastUpdated: Timestamp
  link: string[] | null
  organization: string | null
  phonetic: string[] | null
  projectId: string | null
  race: string[] | null
}

export interface PatientAge {
  age: string | null
  age_display: string | null
  age_number: number | null
  age_unit: AgeUnit | null
  age_years: Numeric | null
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
  declined: Generated<boolean>
  id: Generated<number>
  patient_appointment_request_id: number
  provider_id: number
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
  provider_id: number
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

export interface PatientEncounterSteps {
  created_at: Generated<Timestamp>
  encounter_step: EncounterStep
  id: Generated<number>
  patient_encounter_id: number
  updated_at: Generated<Timestamp>
}

export interface PatientExaminationFindings {
  created_at: Generated<Timestamp>
  examination_finding_id: number
  id: Generated<number>
  patient_examination_id: number
  updated_at: Generated<Timestamp>
  value: Json
}

export interface PatientExaminations {
  completed: Generated<boolean>
  created_at: Generated<Timestamp>
  encounter_id: number
  encounter_provider_id: number
  examination_name: string
  id: Generated<number>
  ordered: Generated<boolean>
  patient_id: number
  skipped: Generated<boolean>
  updated_at: Generated<Timestamp>
}

export interface PatientFamily {
  created_at: Generated<Timestamp>
  family_type: FamilyType | null
  home_satisfaction: number | null
  id: Generated<number>
  marital_status: MaritalStatus | null
  patient_cohabitation: PatientCohabitation | null
  patient_id: number
  religion: Religion | null
  social_satisfaction: number | null
  spiritual_satisfaction: number | null
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

export interface PatientHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface PatientIntake {
  created_at: Generated<Timestamp>
  id: Generated<number>
  intake_step: IntakeStep
  patient_id: number
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

export interface PatientLifestyle {
  alcohol: Json | null
  created_at: Generated<Timestamp>
  diet: Json | null
  exercise: Json | null
  id: Generated<number>
  patient_id: number
  sexual_activity: Json | null
  smoking: Json | null
  substance_use: Json | null
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

export interface PatientNearestOrganizations {
  nearest_organizations: Json | null
  patient_id: number | null
}

export interface PatientOccupations {
  created_at: Generated<Timestamp>
  id: Generated<number>
  occupation: Json | null
  patient_id: number
  updated_at: Generated<Timestamp>
}

export interface PatientReferences {
  code: string
  resourceId: string
  targetId: string
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
  nearest_organization_id: string | null
  phone_number: string | null
  primary_doctor_id: number | null
  unregistered_primary_doctor_name: string | null
  updated_at: Generated<Timestamp>
}

export interface PatientSymptomMedia {
  created_at: Generated<Timestamp>
  id: Generated<number>
  media_id: number
  patient_symptom_id: number
  updated_at: Generated<Timestamp>
}

export interface PatientSymptoms {
  code: string
  created_at: Generated<Timestamp>
  encounter_id: number
  encounter_provider_id: number
  end_date: Timestamp | null
  id: Generated<number>
  notes: string | null
  patient_id: number
  severity: number
  start_date: Timestamp
  updated_at: Generated<Timestamp>
}

export interface PatientToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface PaymentNotice {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  created: Timestamp | null
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  paymentStatus: string | null
  projectId: string | null
  provider: string | null
  request: string | null
  response: string | null
  status: string | null
}

export interface PaymentNoticeHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface PaymentNoticeReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface PaymentNoticeToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface PaymentReconciliation {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  created: Timestamp | null
  deleted: Generated<boolean>
  disposition: string | null
  id: string
  lastUpdated: Timestamp
  outcome: string | null
  paymentIssuer: string | null
  projectId: string | null
  request: string | null
  requestor: string | null
  status: string | null
}

export interface PaymentReconciliationHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface PaymentReconciliationReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface PaymentReconciliationToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface Person {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  birthdate: Timestamp | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  gender: string | null
  id: string
  lastUpdated: Timestamp
  link: string[] | null
  organization: string | null
  patient: string[] | null
  phonetic: string[] | null
  practitioner: string[] | null
  projectId: string | null
  relatedperson: string[] | null
}

export interface PersonHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface PersonReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface PersonToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface PlanDefinition {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  composedOf: string[] | null
  content: string
  context: string[] | null
  contextQuantity: number[] | null
  contextType: string[] | null
  contextTypeQuantity: string[] | null
  contextTypeValue: string[] | null
  date: Timestamp | null
  definition: string[] | null
  deleted: Generated<boolean>
  dependsOn: string[] | null
  derivedFrom: string[] | null
  description: string | null
  effective: Timestamp | null
  id: string
  jurisdiction: string[] | null
  lastUpdated: Timestamp
  name: string | null
  predecessor: string[] | null
  projectId: string | null
  publisher: string | null
  status: string | null
  successor: string[] | null
  title: string | null
  topic: string[] | null
  type: string | null
  url: string | null
  version: string | null
}

export interface PlanDefinitionHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface PlanDefinitionReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface PlanDefinitionToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface Practitioner {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  active: boolean | null
  communication: string[] | null
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

export interface PractitionerReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface PractitionerRole {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  active: boolean | null
  compartments: string[]
  content: string
  date: Timestamp | null
  deleted: Generated<boolean>
  endpoint: string[] | null
  id: string
  lastUpdated: Timestamp
  location: string[] | null
  organization: string | null
  practitioner: string | null
  projectId: string | null
  role: string[] | null
  service: string[] | null
  specialty: string[] | null
}

export interface PractitionerRoleHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface PractitionerRoleReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface PractitionerRoleToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface PractitionerToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface Procedure {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  basedOn: string[] | null
  category: string | null
  code: string | null
  compartments: string[]
  content: string
  date: Timestamp | null
  deleted: Generated<boolean>
  encounter: string | null
  id: string
  instantiatesCanonical: string[] | null
  instantiatesUri: string[] | null
  lastUpdated: Timestamp
  location: string | null
  partOf: string[] | null
  patient: string | null
  performer: string[] | null
  projectId: string | null
  reasonCode: string[] | null
  reasonReference: string[] | null
  status: string | null
  subject: string | null
}

export interface ProcedureHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface ProcedureReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface ProcedureToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface Procurement {
  batch_number: string | null
  consumable_id: number
  consumed_amount: Generated<number>
  container_size: number
  created_at: Generated<Timestamp>
  created_by: number
  expiry_date: Timestamp | null
  id: Generated<number>
  number_of_containers: number
  organization_id: string
  procured_from: number
  quantity: number
  updated_at: Generated<Timestamp>
}

export interface Procurers {
  created_at: Generated<Timestamp>
  id: Generated<number>
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

export interface ProjectMembershipReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface ProjectMembershipToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface ProjectReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface ProjectToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface Provenance {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  agent: string[] | null
  agentRole: string[] | null
  agentType: string[] | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  entity: string[] | null
  id: string
  lastUpdated: Timestamp
  location: string | null
  patient: string[] | null
  projectId: string | null
  recorded: Timestamp | null
  signatureType: string[] | null
  target: string[] | null
  when: Timestamp | null
}

export interface ProvenanceHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface ProvenanceReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface ProvenanceToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface ProviderCalendars {
  availability_set: Generated<boolean>
  created_at: Generated<Timestamp>
  gcal_appointments_calendar_id: string
  gcal_availability_calendar_id: string
  health_worker_id: number
  id: Generated<number>
  organization_id: string
  updated_at: Generated<Timestamp>
}

export interface Provinces {
  country_id: number
  id: Generated<number>
  name: string
}

export interface Questionnaire {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  code: string[] | null
  compartments: string[]
  content: string
  context: string[] | null
  contextQuantity: number[] | null
  contextType: string[] | null
  contextTypeQuantity: string[] | null
  contextTypeValue: string[] | null
  date: Timestamp | null
  definition: string[] | null
  deleted: Generated<boolean>
  description: string | null
  effective: Timestamp | null
  id: string
  jurisdiction: string[] | null
  lastUpdated: Timestamp
  name: string | null
  projectId: string | null
  publisher: string | null
  status: string | null
  subjectType: string[] | null
  title: string | null
  url: string | null
  version: string | null
}

export interface QuestionnaireHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface QuestionnaireReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface QuestionnaireResponse {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  author: string | null
  authored: Timestamp | null
  basedOn: string[] | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  encounter: string | null
  id: string
  lastUpdated: Timestamp
  partOf: string[] | null
  patient: string | null
  projectId: string | null
  questionnaire: string | null
  source: string | null
  status: string | null
  subject: string | null
}

export interface QuestionnaireResponseHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface QuestionnaireResponseReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface QuestionnaireResponseToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface QuestionnaireToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface RelatedPerson {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  active: boolean | null
  birthdate: Timestamp | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  gender: string | null
  id: string
  lastUpdated: Timestamp
  patient: string | null
  phonetic: string[] | null
  projectId: string | null
  relationship: string[] | null
}

export interface RelatedPersonHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface RelatedPersonReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface RelatedPersonToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface RequestGroup {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  author: string | null
  authored: Timestamp | null
  code: string | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  encounter: string | null
  groupIdentifier: string | null
  id: string
  instantiatesCanonical: string[] | null
  instantiatesUri: string[] | null
  intent: string | null
  lastUpdated: Timestamp
  participant: string[] | null
  patient: string | null
  priority: string | null
  priorityOrder: number | null
  projectId: string | null
  status: string | null
  subject: string | null
}

export interface RequestGroupHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface RequestGroupReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface RequestGroupToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface ResearchDefinition {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  composedOf: string[] | null
  content: string
  context: string[] | null
  contextQuantity: number[] | null
  contextType: string[] | null
  contextTypeQuantity: string[] | null
  contextTypeValue: string[] | null
  date: Timestamp | null
  deleted: Generated<boolean>
  dependsOn: string[] | null
  derivedFrom: string[] | null
  description: string | null
  effective: Timestamp | null
  id: string
  jurisdiction: string[] | null
  lastUpdated: Timestamp
  name: string | null
  predecessor: string[] | null
  projectId: string | null
  publisher: string | null
  status: string | null
  successor: string[] | null
  title: string | null
  topic: string[] | null
  url: string | null
  version: string | null
}

export interface ResearchDefinitionHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface ResearchDefinitionReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface ResearchDefinitionToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface ResearchElementDefinition {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  composedOf: string[] | null
  content: string
  context: string[] | null
  contextQuantity: number[] | null
  contextType: string[] | null
  contextTypeQuantity: string[] | null
  contextTypeValue: string[] | null
  date: Timestamp | null
  deleted: Generated<boolean>
  dependsOn: string[] | null
  derivedFrom: string[] | null
  description: string | null
  effective: Timestamp | null
  id: string
  jurisdiction: string[] | null
  lastUpdated: Timestamp
  name: string | null
  predecessor: string[] | null
  projectId: string | null
  publisher: string | null
  status: string | null
  successor: string[] | null
  title: string | null
  topic: string[] | null
  url: string | null
  version: string | null
}

export interface ResearchElementDefinitionHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface ResearchElementDefinitionReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface ResearchElementDefinitionToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface ResearchStudy {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  category: string[] | null
  compartments: string[]
  content: string
  date: Timestamp | null
  deleted: Generated<boolean>
  focus: string[] | null
  id: string
  keyword: string[] | null
  lastUpdated: Timestamp
  location: string[] | null
  partof: string[] | null
  principalinvestigator: string | null
  projectId: string | null
  protocol: string[] | null
  site: string[] | null
  sponsor: string | null
  status: string | null
  title: string | null
}

export interface ResearchStudyHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface ResearchStudyReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface ResearchStudyToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface ResearchSubject {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  date: Timestamp | null
  deleted: Generated<boolean>
  id: string
  individual: string | null
  lastUpdated: Timestamp
  patient: string | null
  projectId: string | null
  status: string | null
  study: string | null
}

export interface ResearchSubjectHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface ResearchSubjectReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface ResearchSubjectToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface RiskAssessment {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  condition: string | null
  content: string
  date: Timestamp | null
  deleted: Generated<boolean>
  encounter: string | null
  id: string
  lastUpdated: Timestamp
  method: string | null
  patient: string | null
  performer: string | null
  probability: number[] | null
  projectId: string | null
  risk: string[] | null
  subject: string | null
}

export interface RiskAssessmentHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface RiskAssessmentReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface RiskAssessmentToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface RiskEvidenceSynthesis {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  context: string[] | null
  contextQuantity: number[] | null
  contextType: string[] | null
  contextTypeQuantity: string[] | null
  contextTypeValue: string[] | null
  date: Timestamp | null
  deleted: Generated<boolean>
  description: string | null
  effective: Timestamp | null
  id: string
  jurisdiction: string[] | null
  lastUpdated: Timestamp
  name: string | null
  projectId: string | null
  publisher: string | null
  status: string | null
  title: string | null
  url: string | null
  version: string | null
}

export interface RiskEvidenceSynthesisHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface RiskEvidenceSynthesisReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface RiskEvidenceSynthesisToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface Schedule {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  active: boolean | null
  actor: string[] | null
  compartments: string[]
  content: string
  date: Timestamp | null
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  projectId: string | null
  serviceCategory: string[] | null
  serviceType: string[] | null
  specialty: string[] | null
}

export interface ScheduleHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface ScheduleReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface ScheduleToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface SearchParameter {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  base: string[] | null
  code: string | null
  compartments: string[]
  component: string[] | null
  content: string
  context: string[] | null
  contextQuantity: number[] | null
  contextType: string[] | null
  contextTypeQuantity: string[] | null
  contextTypeValue: string[] | null
  date: Timestamp | null
  deleted: Generated<boolean>
  derivedFrom: string | null
  description: string | null
  id: string
  jurisdiction: string[] | null
  lastUpdated: Timestamp
  name: string | null
  projectId: string | null
  publisher: string | null
  status: string | null
  target: string[] | null
  type: string | null
  url: string | null
  version: string | null
}

export interface SearchParameterHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface SearchParameterReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface SearchParameterToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface ServiceRequest {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  authored: Timestamp | null
  basedOn: string[] | null
  bodySite: string[] | null
  category: string[] | null
  code: string | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  encounter: string | null
  id: string
  instantiatesCanonical: string[] | null
  instantiatesUri: string[] | null
  intent: string | null
  lastUpdated: Timestamp
  occurrence: Timestamp | null
  orderDetail: Generated<string[] | null>
  patient: string | null
  performer: string[] | null
  performerType: string | null
  priority: string | null
  priorityOrder: number | null
  projectId: string | null
  replaces: string[] | null
  requester: string | null
  requisition: string | null
  specimen: string[] | null
  status: string | null
  subject: string | null
}

export interface ServiceRequestHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface ServiceRequestReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface ServiceRequestToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface Slot {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  appointmentType: string | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  projectId: string | null
  schedule: string | null
  serviceCategory: string[] | null
  serviceType: string[] | null
  specialty: string[] | null
  start: Timestamp | null
  status: string | null
}

export interface SlotHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface SlotReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface SlotToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface SmartAppLaunch {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  projectId: string | null
}

export interface SmartAppLaunchHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface SmartAppLaunchReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface SmartAppLaunchToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface SpatialRefSys {
  auth_name: string | null
  auth_srid: number | null
  proj4text: string | null
  srid: number
  srtext: string | null
}

export interface Specimen {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  accession: string | null
  bodysite: string | null
  collected: Timestamp | null
  collector: string | null
  compartments: string[]
  container: string[] | null
  containerId: string[] | null
  content: string
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  parent: string[] | null
  patient: string | null
  projectId: string | null
  status: string | null
  subject: string | null
  type: string | null
}

export interface SpecimenDefinition {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  container: string[] | null
  content: string
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  projectId: string | null
  type: string | null
}

export interface SpecimenDefinitionHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface SpecimenDefinitionReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface SpecimenDefinitionToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface SpecimenHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface SpecimenReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface SpecimenToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface StructureDefinition {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  abstract: boolean | null
  base: string | null
  basePath: string[] | null
  compartments: string[]
  content: string
  context: string[] | null
  contextQuantity: number[] | null
  contextType: string[] | null
  contextTypeQuantity: string[] | null
  contextTypeValue: string[] | null
  date: Timestamp | null
  deleted: Generated<boolean>
  derivation: string | null
  description: string | null
  experimental: boolean | null
  extContext: string[] | null
  id: string
  jurisdiction: string[] | null
  keyword: string[] | null
  kind: string | null
  lastUpdated: Timestamp
  name: string | null
  path: string[] | null
  projectId: string | null
  publisher: string | null
  status: string | null
  title: string | null
  type: string | null
  url: string | null
  valueset: string[] | null
  version: string | null
}

export interface StructureDefinitionHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface StructureDefinitionReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface StructureDefinitionToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface StructureMap {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  context: string[] | null
  contextQuantity: number[] | null
  contextType: string[] | null
  contextTypeQuantity: string[] | null
  contextTypeValue: string[] | null
  date: Timestamp | null
  deleted: Generated<boolean>
  description: string | null
  id: string
  jurisdiction: string[] | null
  lastUpdated: Timestamp
  name: string | null
  projectId: string | null
  publisher: string | null
  status: string | null
  title: string | null
  url: string | null
  version: string | null
}

export interface StructureMapHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface StructureMapReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface StructureMapToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface Subscription {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  contact: string[] | null
  content: string
  criteria: string | null
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  payload: string | null
  projectId: string | null
  status: string | null
  type: string | null
  url: string | null
}

export interface SubscriptionHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface SubscriptionReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface SubscriptionStatus {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  projectId: string | null
}

export interface SubscriptionStatusHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface SubscriptionStatusReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface SubscriptionStatusToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface SubscriptionToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface Substance {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  category: string[] | null
  code: string[] | null
  compartments: string[]
  containerIdentifier: string[] | null
  content: string
  deleted: Generated<boolean>
  expiry: Timestamp[] | null
  id: string
  lastUpdated: Timestamp
  projectId: string | null
  quantity: number[] | null
  status: string | null
  substanceReference: string[] | null
}

export interface SubstanceHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface SubstanceNucleicAcid {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  projectId: string | null
}

export interface SubstanceNucleicAcidHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface SubstanceNucleicAcidReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface SubstanceNucleicAcidToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface SubstancePolymer {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  projectId: string | null
}

export interface SubstancePolymerHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface SubstancePolymerReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface SubstancePolymerToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface SubstanceProtein {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  projectId: string | null
}

export interface SubstanceProteinHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface SubstanceProteinReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface SubstanceProteinToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface SubstanceReferenceInformation {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  projectId: string | null
}

export interface SubstanceReferenceInformationHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface SubstanceReferenceInformationReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface SubstanceReferenceInformationToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface SubstanceReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface SubstanceSourceMaterial {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  projectId: string | null
}

export interface SubstanceSourceMaterialHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface SubstanceSourceMaterialReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface SubstanceSourceMaterialToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface SubstanceSpecification {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  code: string[] | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  projectId: string | null
}

export interface SubstanceSpecificationHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface SubstanceSpecificationReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface SubstanceSpecificationToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface SubstanceToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface Suburbs {
  id: Generated<number>
  name: string
  ward_id: number
}

export interface SupplyDelivery {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  patient: string | null
  projectId: string | null
  receiver: string[] | null
  status: string | null
  supplier: string | null
}

export interface SupplyDeliveryHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface SupplyDeliveryReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface SupplyDeliveryToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface SupplyRequest {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  category: string | null
  compartments: string[]
  content: string
  date: Timestamp | null
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  projectId: string | null
  requester: string | null
  status: string | null
  subject: string | null
  supplier: string[] | null
}

export interface SupplyRequestHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface SupplyRequestReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface SupplyRequestToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface Task {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  authoredOn: Timestamp | null
  basedOn: string[] | null
  businessStatus: string | null
  code: string | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  dueDate: Timestamp | null
  encounter: string | null
  focus: string | null
  groupIdentifier: string | null
  id: string
  intent: string | null
  lastUpdated: Timestamp
  modified: Timestamp | null
  owner: string | null
  partOf: string[] | null
  patient: string | null
  performer: string[] | null
  period: Timestamp | null
  priority: string | null
  priorityOrder: number | null
  projectId: string | null
  requester: string | null
  status: string | null
  subject: string | null
}

export interface TaskHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface TaskReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface TaskToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface TerminologyCapabilities {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  context: string[] | null
  contextQuantity: number[] | null
  contextType: string[] | null
  contextTypeQuantity: string[] | null
  contextTypeValue: string[] | null
  date: Timestamp | null
  deleted: Generated<boolean>
  description: string | null
  id: string
  jurisdiction: string[] | null
  lastUpdated: Timestamp
  name: string | null
  projectId: string | null
  publisher: string | null
  status: string | null
  title: string | null
  url: string | null
  version: string | null
}

export interface TerminologyCapabilitiesHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface TerminologyCapabilitiesReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface TerminologyCapabilitiesToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface TestReport {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  id: string
  issued: Timestamp | null
  lastUpdated: Timestamp
  participant: string[] | null
  projectId: string | null
  result: string | null
  tester: string | null
  testscript: string | null
}

export interface TestReportHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface TestReportReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface TestReportToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface TestScript {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  context: string[] | null
  contextQuantity: number[] | null
  contextType: string[] | null
  contextTypeQuantity: string[] | null
  contextTypeValue: string[] | null
  date: Timestamp | null
  deleted: Generated<boolean>
  description: string | null
  id: string
  jurisdiction: string[] | null
  lastUpdated: Timestamp
  name: string | null
  projectId: string | null
  publisher: string | null
  status: string | null
  testscriptCapability: string[] | null
  title: string | null
  url: string | null
  version: string | null
}

export interface TestScriptHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface TestScriptReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface TestScriptToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
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

export interface UserConfiguration {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  name: Generated<string | null>
  projectId: string | null
}

export interface UserConfigurationHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface UserConfigurationReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface UserConfigurationToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface UserHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface UserReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface UserSecurityRequest {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  projectId: string | null
  user: string | null
}

export interface UserSecurityRequestHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface UserSecurityRequestReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface UserSecurityRequestToken {
  code: string
  index: number | null
  resourceId: string
  system: string | null
  value: string | null
}

export interface UserToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface ValueSet {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  code: string[] | null
  compartments: string[]
  content: string
  context: string[] | null
  contextQuantity: number[] | null
  contextType: string[] | null
  contextTypeQuantity: string[] | null
  contextTypeValue: string[] | null
  date: Timestamp | null
  deleted: Generated<boolean>
  description: string | null
  expansion: string | null
  id: string
  jurisdiction: string[] | null
  lastUpdated: Timestamp
  name: string | null
  projectId: string | null
  publisher: string | null
  reference: string[] | null
  status: string | null
  title: string | null
  url: string | null
  version: string | null
}

export interface ValueSetElement {
  code: string | null
  display: string | null
  index: number | null
  resourceId: string | null
  system: string | null
  valueSet: string | null
}

export interface ValueSetHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface ValueSetMembership {
  coding: Int8
  valueSet: string
}

export interface ValueSetReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface ValueSetToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface VerificationResult {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  deleted: Generated<boolean>
  id: string
  lastUpdated: Timestamp
  projectId: string | null
  target: string[] | null
}

export interface VerificationResultHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface VerificationResultReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface VerificationResultToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface VisionPrescription {
  _profile: string[] | null
  _security: string[] | null
  _source: string | null
  _tag: string[] | null
  compartments: string[]
  content: string
  datewritten: Timestamp | null
  deleted: Generated<boolean>
  encounter: string | null
  id: string
  lastUpdated: Timestamp
  patient: string | null
  prescriber: string | null
  projectId: string | null
  status: string | null
}

export interface VisionPrescriptionHistory {
  content: string
  id: string
  lastUpdated: Timestamp
  versionId: string
}

export interface VisionPrescriptionReferences {
  code: string
  resourceId: string
  targetId: string
}

export interface VisionPrescriptionToken {
  code: string
  resourceId: string
  system: string | null
  value: string | null
}

export interface WaitingRoom {
  created_at: Generated<Timestamp>
  id: Generated<number>
  organization_id: string
  patient_encounter_id: number
  updated_at: Generated<Timestamp>
}

export interface Wards {
  district_id: number
  id: Generated<number>
  name: string
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
  AccessPolicy: AccessPolicy
  AccessPolicy_History: AccessPolicyHistory
  AccessPolicy_References: AccessPolicyReferences
  AccessPolicy_Token: AccessPolicyToken
  Account: Account
  Account_History: AccountHistory
  Account_References: AccountReferences
  Account_Token: AccountToken
  ActivityDefinition: ActivityDefinition
  ActivityDefinition_History: ActivityDefinitionHistory
  ActivityDefinition_References: ActivityDefinitionReferences
  ActivityDefinition_Token: ActivityDefinitionToken
  address: Address2
  Address: Address
  AdverseEvent: AdverseEvent
  AdverseEvent_History: AdverseEventHistory
  AdverseEvent_References: AdverseEventReferences
  AdverseEvent_Token: AdverseEventToken
  Agent: Agent
  Agent_History: AgentHistory
  Agent_References: AgentReferences
  Agent_Token: AgentToken
  allergies: Allergies
  AllergyIntolerance: AllergyIntolerance
  AllergyIntolerance_History: AllergyIntoleranceHistory
  AllergyIntolerance_References: AllergyIntoleranceReferences
  AllergyIntolerance_Token: AllergyIntoleranceToken
  Appointment: Appointment
  Appointment_History: AppointmentHistory
  appointment_media: AppointmentMedia
  appointment_providers: AppointmentProviders
  Appointment_References: AppointmentReferences
  Appointment_Token: AppointmentToken
  AppointmentResponse: AppointmentResponse
  AppointmentResponse_History: AppointmentResponseHistory
  AppointmentResponse_References: AppointmentResponseReferences
  AppointmentResponse_Token: AppointmentResponseToken
  appointments: Appointments
  AsyncJob: AsyncJob
  AsyncJob_History: AsyncJobHistory
  AsyncJob_References: AsyncJobReferences
  AsyncJob_Token: AsyncJobToken
  AuditEvent: AuditEvent
  AuditEvent_History: AuditEventHistory
  AuditEvent_References: AuditEventReferences
  AuditEvent_Token: AuditEventToken
  Basic: Basic
  Basic_History: BasicHistory
  Basic_References: BasicReferences
  Basic_Token: BasicToken
  Binary: Binary
  Binary_History: BinaryHistory
  Binary_References: BinaryReferences
  Binary_Token: BinaryToken
  BiologicallyDerivedProduct: BiologicallyDerivedProduct
  BiologicallyDerivedProduct_History: BiologicallyDerivedProductHistory
  BiologicallyDerivedProduct_References: BiologicallyDerivedProductReferences
  BiologicallyDerivedProduct_Token: BiologicallyDerivedProductToken
  BodyStructure: BodyStructure
  BodyStructure_History: BodyStructureHistory
  BodyStructure_References: BodyStructureReferences
  BodyStructure_Token: BodyStructureToken
  Bot: Bot
  Bot_History: BotHistory
  Bot_References: BotReferences
  Bot_Token: BotToken
  BulkDataExport: BulkDataExport
  BulkDataExport_History: BulkDataExportHistory
  BulkDataExport_References: BulkDataExportReferences
  BulkDataExport_Token: BulkDataExportToken
  Bundle: Bundle
  Bundle_History: BundleHistory
  Bundle_References: BundleReferences
  Bundle_Token: BundleToken
  CapabilityStatement: CapabilityStatement
  CapabilityStatement_History: CapabilityStatementHistory
  CapabilityStatement_References: CapabilityStatementReferences
  CapabilityStatement_Token: CapabilityStatementToken
  CarePlan: CarePlan
  CarePlan_History: CarePlanHistory
  CarePlan_References: CarePlanReferences
  CarePlan_Token: CarePlanToken
  CareTeam: CareTeam
  CareTeam_History: CareTeamHistory
  CareTeam_References: CareTeamReferences
  CareTeam_Token: CareTeamToken
  CatalogEntry: CatalogEntry
  CatalogEntry_History: CatalogEntryHistory
  CatalogEntry_References: CatalogEntryReferences
  CatalogEntry_Token: CatalogEntryToken
  ChargeItem: ChargeItem
  ChargeItem_History: ChargeItemHistory
  ChargeItem_References: ChargeItemReferences
  ChargeItem_Token: ChargeItemToken
  ChargeItemDefinition: ChargeItemDefinition
  ChargeItemDefinition_History: ChargeItemDefinitionHistory
  ChargeItemDefinition_References: ChargeItemDefinitionReferences
  ChargeItemDefinition_Token: ChargeItemDefinitionToken
  Claim: Claim
  Claim_History: ClaimHistory
  Claim_References: ClaimReferences
  Claim_Token: ClaimToken
  ClaimResponse: ClaimResponse
  ClaimResponse_History: ClaimResponseHistory
  ClaimResponse_References: ClaimResponseReferences
  ClaimResponse_Token: ClaimResponseToken
  ClientApplication: ClientApplication
  ClientApplication_History: ClientApplicationHistory
  ClientApplication_References: ClientApplicationReferences
  ClientApplication_Token: ClientApplicationToken
  ClinicalImpression: ClinicalImpression
  ClinicalImpression_History: ClinicalImpressionHistory
  ClinicalImpression_References: ClinicalImpressionReferences
  ClinicalImpression_Token: ClinicalImpressionToken
  CodeSystem: CodeSystem
  CodeSystem_History: CodeSystemHistory
  CodeSystem_Property: CodeSystemProperty
  CodeSystem_References: CodeSystemReferences
  CodeSystem_Token: CodeSystemToken
  Coding: Coding
  Coding_Property: CodingProperty
  Communication: Communication
  Communication_History: CommunicationHistory
  Communication_References: CommunicationReferences
  Communication_Token: CommunicationToken
  CommunicationRequest: CommunicationRequest
  CommunicationRequest_History: CommunicationRequestHistory
  CommunicationRequest_References: CommunicationRequestReferences
  CommunicationRequest_Token: CommunicationRequestToken
  CompartmentDefinition: CompartmentDefinition
  CompartmentDefinition_History: CompartmentDefinitionHistory
  CompartmentDefinition_References: CompartmentDefinitionReferences
  CompartmentDefinition_Token: CompartmentDefinitionToken
  Composition: Composition
  Composition_History: CompositionHistory
  Composition_References: CompositionReferences
  Composition_Token: CompositionToken
  ConceptMap: ConceptMap
  ConceptMap_History: ConceptMapHistory
  ConceptMap_References: ConceptMapReferences
  ConceptMap_Token: ConceptMapToken
  Condition: Condition
  Condition_History: ConditionHistory
  condition_icd10_codes: ConditionIcd10Codes
  Condition_References: ConditionReferences
  Condition_Token: ConditionToken
  conditions: Conditions
  Consent: Consent
  Consent_History: ConsentHistory
  Consent_References: ConsentReferences
  Consent_Token: ConsentToken
  consumables: Consumables
  consumption: Consumption
  ContactPoint: ContactPoint
  Contract: Contract
  Contract_History: ContractHistory
  Contract_References: ContractReferences
  Contract_Token: ContractToken
  countries: Countries
  Coverage: Coverage
  Coverage_History: CoverageHistory
  Coverage_References: CoverageReferences
  Coverage_Token: CoverageToken
  CoverageEligibilityRequest: CoverageEligibilityRequest
  CoverageEligibilityRequest_History: CoverageEligibilityRequestHistory
  CoverageEligibilityRequest_References: CoverageEligibilityRequestReferences
  CoverageEligibilityRequest_Token: CoverageEligibilityRequestToken
  CoverageEligibilityResponse: CoverageEligibilityResponse
  CoverageEligibilityResponse_History: CoverageEligibilityResponseHistory
  CoverageEligibilityResponse_References: CoverageEligibilityResponseReferences
  CoverageEligibilityResponse_Token: CoverageEligibilityResponseToken
  DatabaseMigration: DatabaseMigration
  DetectedIssue: DetectedIssue
  DetectedIssue_History: DetectedIssueHistory
  DetectedIssue_References: DetectedIssueReferences
  DetectedIssue_Token: DetectedIssueToken
  Device: Device
  device_capabilities: DeviceCapabilities
  Device_History: DeviceHistory
  Device_References: DeviceReferences
  Device_Token: DeviceToken
  DeviceDefinition: DeviceDefinition
  DeviceDefinition_History: DeviceDefinitionHistory
  DeviceDefinition_References: DeviceDefinitionReferences
  DeviceDefinition_Token: DeviceDefinitionToken
  DeviceMetric: DeviceMetric
  DeviceMetric_History: DeviceMetricHistory
  DeviceMetric_References: DeviceMetricReferences
  DeviceMetric_Token: DeviceMetricToken
  DeviceRequest: DeviceRequest
  DeviceRequest_History: DeviceRequestHistory
  DeviceRequest_References: DeviceRequestReferences
  DeviceRequest_Token: DeviceRequestToken
  devices: Devices
  DeviceUseStatement: DeviceUseStatement
  DeviceUseStatement_History: DeviceUseStatementHistory
  DeviceUseStatement_References: DeviceUseStatementReferences
  DeviceUseStatement_Token: DeviceUseStatementToken
  diagnostic_tests: DiagnosticTests
  DiagnosticReport: DiagnosticReport
  DiagnosticReport_History: DiagnosticReportHistory
  DiagnosticReport_References: DiagnosticReportReferences
  DiagnosticReport_Token: DiagnosticReportToken
  districts: Districts
  doctor_review: DoctorReview
  doctor_review_requests: DoctorReviewRequests
  doctor_review_steps: DoctorReviewSteps
  doctor_reviews: DoctorReviews
  DocumentManifest: DocumentManifest
  DocumentManifest_History: DocumentManifestHistory
  DocumentManifest_References: DocumentManifestReferences
  DocumentManifest_Token: DocumentManifestToken
  DocumentReference: DocumentReference
  DocumentReference_History: DocumentReferenceHistory
  DocumentReference_References: DocumentReferenceReferences
  DocumentReference_Token: DocumentReferenceToken
  DomainConfiguration: DomainConfiguration
  DomainConfiguration_History: DomainConfigurationHistory
  DomainConfiguration_References: DomainConfigurationReferences
  DomainConfiguration_Token: DomainConfigurationToken
  drugs: Drugs
  EffectEvidenceSynthesis: EffectEvidenceSynthesis
  EffectEvidenceSynthesis_History: EffectEvidenceSynthesisHistory
  EffectEvidenceSynthesis_References: EffectEvidenceSynthesisReferences
  EffectEvidenceSynthesis_Token: EffectEvidenceSynthesisToken
  employment: Employment
  encounter: Encounter2
  Encounter: Encounter
  Encounter_History: EncounterHistory
  Encounter_References: EncounterReferences
  Encounter_Token: EncounterToken
  Endpoint: Endpoint
  Endpoint_History: EndpointHistory
  Endpoint_References: EndpointReferences
  Endpoint_Token: EndpointToken
  EnrollmentRequest: EnrollmentRequest
  EnrollmentRequest_History: EnrollmentRequestHistory
  EnrollmentRequest_References: EnrollmentRequestReferences
  EnrollmentRequest_Token: EnrollmentRequestToken
  EnrollmentResponse: EnrollmentResponse
  EnrollmentResponse_History: EnrollmentResponseHistory
  EnrollmentResponse_References: EnrollmentResponseReferences
  EnrollmentResponse_Token: EnrollmentResponseToken
  EpisodeOfCare: EpisodeOfCare
  EpisodeOfCare_History: EpisodeOfCareHistory
  EpisodeOfCare_References: EpisodeOfCareReferences
  EpisodeOfCare_Token: EpisodeOfCareToken
  EventDefinition: EventDefinition
  EventDefinition_History: EventDefinitionHistory
  EventDefinition_References: EventDefinitionReferences
  EventDefinition_Token: EventDefinitionToken
  Evidence: Evidence
  Evidence_History: EvidenceHistory
  Evidence_References: EvidenceReferences
  Evidence_Token: EvidenceToken
  EvidenceVariable: EvidenceVariable
  EvidenceVariable_History: EvidenceVariableHistory
  EvidenceVariable_References: EvidenceVariableReferences
  EvidenceVariable_Token: EvidenceVariableToken
  examination_categories: ExaminationCategories
  examination_findings: ExaminationFindings
  examinations: Examinations
  ExampleScenario: ExampleScenario
  ExampleScenario_History: ExampleScenarioHistory
  ExampleScenario_References: ExampleScenarioReferences
  ExampleScenario_Token: ExampleScenarioToken
  ExplanationOfBenefit: ExplanationOfBenefit
  ExplanationOfBenefit_History: ExplanationOfBenefitHistory
  ExplanationOfBenefit_References: ExplanationOfBenefitReferences
  ExplanationOfBenefit_Token: ExplanationOfBenefitToken
  FamilyMemberHistory: FamilyMemberHistory
  FamilyMemberHistory_History: FamilyMemberHistoryHistory
  FamilyMemberHistory_References: FamilyMemberHistoryReferences
  FamilyMemberHistory_Token: FamilyMemberHistoryToken
  Flag: Flag
  Flag_History: FlagHistory
  Flag_References: FlagReferences
  Flag_Token: FlagToken
  geography_columns: GeographyColumns
  geometry_columns: GeometryColumns
  Goal: Goal
  Goal_History: GoalHistory
  Goal_References: GoalReferences
  Goal_Token: GoalToken
  GraphDefinition: GraphDefinition
  GraphDefinition_History: GraphDefinitionHistory
  GraphDefinition_References: GraphDefinitionReferences
  GraphDefinition_Token: GraphDefinitionToken
  Group: Group
  Group_History: GroupHistory
  Group_References: GroupReferences
  Group_Token: GroupToken
  guardian_relations: GuardianRelations
  GuidanceResponse: GuidanceResponse
  GuidanceResponse_History: GuidanceResponseHistory
  GuidanceResponse_References: GuidanceResponseReferences
  GuidanceResponse_Token: GuidanceResponseToken
  health_worker_google_tokens: HealthWorkerGoogleTokens
  health_worker_invitees: HealthWorkerInvitees
  health_workers: HealthWorkers
  HealthcareService: HealthcareService
  HealthcareService_History: HealthcareServiceHistory
  HealthcareService_References: HealthcareServiceReferences
  HealthcareService_Token: HealthcareServiceToken
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
  Identifier: Identifier
  ImagingStudy: ImagingStudy
  ImagingStudy_History: ImagingStudyHistory
  ImagingStudy_References: ImagingStudyReferences
  ImagingStudy_Token: ImagingStudyToken
  Immunization: Immunization
  Immunization_History: ImmunizationHistory
  Immunization_References: ImmunizationReferences
  Immunization_Token: ImmunizationToken
  ImmunizationEvaluation: ImmunizationEvaluation
  ImmunizationEvaluation_History: ImmunizationEvaluationHistory
  ImmunizationEvaluation_References: ImmunizationEvaluationReferences
  ImmunizationEvaluation_Token: ImmunizationEvaluationToken
  ImmunizationRecommendation: ImmunizationRecommendation
  ImmunizationRecommendation_History: ImmunizationRecommendationHistory
  ImmunizationRecommendation_References: ImmunizationRecommendationReferences
  ImmunizationRecommendation_Token: ImmunizationRecommendationToken
  ImplementationGuide: ImplementationGuide
  ImplementationGuide_History: ImplementationGuideHistory
  ImplementationGuide_References: ImplementationGuideReferences
  ImplementationGuide_Token: ImplementationGuideToken
  InsurancePlan: InsurancePlan
  InsurancePlan_History: InsurancePlanHistory
  InsurancePlan_References: InsurancePlanReferences
  InsurancePlan_Token: InsurancePlanToken
  intake: Intake
  Invoice: Invoice
  Invoice_History: InvoiceHistory
  Invoice_References: InvoiceReferences
  Invoice_Token: InvoiceToken
  JsonWebKey: JsonWebKey
  JsonWebKey_History: JsonWebKeyHistory
  JsonWebKey_References: JsonWebKeyReferences
  JsonWebKey_Token: JsonWebKeyToken
  Library: Library
  Library_History: LibraryHistory
  Library_References: LibraryReferences
  Library_Token: LibraryToken
  Linkage: Linkage
  Linkage_History: LinkageHistory
  Linkage_References: LinkageReferences
  Linkage_Token: LinkageToken
  List: List
  List_History: ListHistory
  List_References: ListReferences
  List_Token: ListToken
  Location: Location
  Location_History: LocationHistory
  Location_References: LocationReferences
  Location_Token: LocationToken
  Login: Login
  Login_History: LoginHistory
  Login_References: LoginReferences
  Login_Token: LoginToken
  mailing_list: MailingList
  manufactured_medication_strengths: ManufacturedMedicationStrengths
  manufactured_medications: ManufacturedMedications
  Measure: Measure
  Measure_History: MeasureHistory
  Measure_References: MeasureReferences
  Measure_Token: MeasureToken
  measurements: Measurements
  MeasureReport: MeasureReport
  MeasureReport_History: MeasureReportHistory
  MeasureReport_References: MeasureReportReferences
  MeasureReport_Token: MeasureReportToken
  media: Media2
  Media: Media
  Media_History: MediaHistory
  Media_References: MediaReferences
  Media_Token: MediaToken
  Medication: Medication
  Medication_History: MedicationHistory
  Medication_References: MedicationReferences
  Medication_Token: MedicationToken
  MedicationAdministration: MedicationAdministration
  MedicationAdministration_History: MedicationAdministrationHistory
  MedicationAdministration_References: MedicationAdministrationReferences
  MedicationAdministration_Token: MedicationAdministrationToken
  MedicationDispense: MedicationDispense
  MedicationDispense_History: MedicationDispenseHistory
  MedicationDispense_References: MedicationDispenseReferences
  MedicationDispense_Token: MedicationDispenseToken
  MedicationKnowledge: MedicationKnowledge
  MedicationKnowledge_History: MedicationKnowledgeHistory
  MedicationKnowledge_References: MedicationKnowledgeReferences
  MedicationKnowledge_Token: MedicationKnowledgeToken
  MedicationRequest: MedicationRequest
  MedicationRequest_History: MedicationRequestHistory
  MedicationRequest_References: MedicationRequestReferences
  MedicationRequest_Token: MedicationRequestToken
  medications: Medications
  MedicationStatement: MedicationStatement
  MedicationStatement_History: MedicationStatementHistory
  MedicationStatement_References: MedicationStatementReferences
  MedicationStatement_Token: MedicationStatementToken
  MedicinalProduct: MedicinalProduct
  MedicinalProduct_History: MedicinalProductHistory
  MedicinalProduct_References: MedicinalProductReferences
  MedicinalProduct_Token: MedicinalProductToken
  MedicinalProductAuthorization: MedicinalProductAuthorization
  MedicinalProductAuthorization_History: MedicinalProductAuthorizationHistory
  MedicinalProductAuthorization_References:
    MedicinalProductAuthorizationReferences
  MedicinalProductAuthorization_Token: MedicinalProductAuthorizationToken
  MedicinalProductContraindication: MedicinalProductContraindication
  MedicinalProductContraindication_History:
    MedicinalProductContraindicationHistory
  MedicinalProductContraindication_References:
    MedicinalProductContraindicationReferences
  MedicinalProductContraindication_Token: MedicinalProductContraindicationToken
  MedicinalProductIndication: MedicinalProductIndication
  MedicinalProductIndication_History: MedicinalProductIndicationHistory
  MedicinalProductIndication_References: MedicinalProductIndicationReferences
  MedicinalProductIndication_Token: MedicinalProductIndicationToken
  MedicinalProductIngredient: MedicinalProductIngredient
  MedicinalProductIngredient_History: MedicinalProductIngredientHistory
  MedicinalProductIngredient_References: MedicinalProductIngredientReferences
  MedicinalProductIngredient_Token: MedicinalProductIngredientToken
  MedicinalProductInteraction: MedicinalProductInteraction
  MedicinalProductInteraction_History: MedicinalProductInteractionHistory
  MedicinalProductInteraction_References: MedicinalProductInteractionReferences
  MedicinalProductInteraction_Token: MedicinalProductInteractionToken
  MedicinalProductManufactured: MedicinalProductManufactured
  MedicinalProductManufactured_History: MedicinalProductManufacturedHistory
  MedicinalProductManufactured_References:
    MedicinalProductManufacturedReferences
  MedicinalProductManufactured_Token: MedicinalProductManufacturedToken
  MedicinalProductPackaged: MedicinalProductPackaged
  MedicinalProductPackaged_History: MedicinalProductPackagedHistory
  MedicinalProductPackaged_References: MedicinalProductPackagedReferences
  MedicinalProductPackaged_Token: MedicinalProductPackagedToken
  MedicinalProductPharmaceutical: MedicinalProductPharmaceutical
  MedicinalProductPharmaceutical_History: MedicinalProductPharmaceuticalHistory
  MedicinalProductPharmaceutical_References:
    MedicinalProductPharmaceuticalReferences
  MedicinalProductPharmaceutical_Token: MedicinalProductPharmaceuticalToken
  MedicinalProductUndesirableEffect: MedicinalProductUndesirableEffect
  MedicinalProductUndesirableEffect_History:
    MedicinalProductUndesirableEffectHistory
  MedicinalProductUndesirableEffect_References:
    MedicinalProductUndesirableEffectReferences
  MedicinalProductUndesirableEffect_Token:
    MedicinalProductUndesirableEffectToken
  MessageDefinition: MessageDefinition
  MessageDefinition_History: MessageDefinitionHistory
  MessageDefinition_References: MessageDefinitionReferences
  MessageDefinition_Token: MessageDefinitionToken
  MessageHeader: MessageHeader
  MessageHeader_History: MessageHeaderHistory
  MessageHeader_References: MessageHeaderReferences
  MessageHeader_Token: MessageHeaderToken
  MolecularSequence: MolecularSequence
  MolecularSequence_History: MolecularSequenceHistory
  MolecularSequence_References: MolecularSequenceReferences
  MolecularSequence_Token: MolecularSequenceToken
  NamingSystem: NamingSystem
  NamingSystem_History: NamingSystemHistory
  NamingSystem_References: NamingSystemReferences
  NamingSystem_Token: NamingSystemToken
  nurse_registration_details: NurseRegistrationDetails
  nurse_specialties: NurseSpecialties
  NutritionOrder: NutritionOrder
  NutritionOrder_History: NutritionOrderHistory
  NutritionOrder_References: NutritionOrderReferences
  NutritionOrder_Token: NutritionOrderToken
  Observation: Observation
  Observation_History: ObservationHistory
  Observation_References: ObservationReferences
  Observation_Token: ObservationToken
  ObservationDefinition: ObservationDefinition
  ObservationDefinition_History: ObservationDefinitionHistory
  ObservationDefinition_References: ObservationDefinitionReferences
  ObservationDefinition_Token: ObservationDefinitionToken
  OperationDefinition: OperationDefinition
  OperationDefinition_History: OperationDefinitionHistory
  OperationDefinition_References: OperationDefinitionReferences
  OperationDefinition_Token: OperationDefinitionToken
  OperationOutcome: OperationOutcome
  OperationOutcome_History: OperationOutcomeHistory
  OperationOutcome_References: OperationOutcomeReferences
  OperationOutcome_Token: OperationOutcomeToken
  Organization: Organization
  organization_consumables: OrganizationConsumables
  organization_devices: OrganizationDevices
  Organization_History: OrganizationHistory
  Organization_References: OrganizationReferences
  Organization_Token: OrganizationToken
  OrganizationAffiliation: OrganizationAffiliation
  OrganizationAffiliation_History: OrganizationAffiliationHistory
  OrganizationAffiliation_References: OrganizationAffiliationReferences
  OrganizationAffiliation_Token: OrganizationAffiliationToken
  Parameters: Parameters
  Parameters_History: ParametersHistory
  Parameters_References: ParametersReferences
  Parameters_Token: ParametersToken
  PasswordChangeRequest: PasswordChangeRequest
  PasswordChangeRequest_History: PasswordChangeRequestHistory
  PasswordChangeRequest_References: PasswordChangeRequestReferences
  PasswordChangeRequest_Token: PasswordChangeRequestToken
  Patient: Patient
  patient_age: PatientAge
  patient_allergies: PatientAllergies
  patient_appointment_offered_times: PatientAppointmentOfferedTimes
  patient_appointment_request_media: PatientAppointmentRequestMedia
  patient_appointment_requests: PatientAppointmentRequests
  patient_condition_medications: PatientConditionMedications
  patient_conditions: PatientConditions
  patient_encounter_providers: PatientEncounterProviders
  patient_encounter_steps: PatientEncounterSteps
  patient_encounters: PatientEncounters
  patient_examination_findings: PatientExaminationFindings
  patient_examinations: PatientExaminations
  patient_family: PatientFamily
  patient_guardians: PatientGuardians
  Patient_History: PatientHistory
  patient_intake: PatientIntake
  patient_kin: PatientKin
  patient_lifestyle: PatientLifestyle
  patient_measurements: PatientMeasurements
  patient_nearest_organizations: PatientNearestOrganizations
  patient_occupations: PatientOccupations
  Patient_References: PatientReferences
  patient_symptom_media: PatientSymptomMedia
  patient_symptoms: PatientSymptoms
  Patient_Token: PatientToken
  patients: Patients
  PaymentNotice: PaymentNotice
  PaymentNotice_History: PaymentNoticeHistory
  PaymentNotice_References: PaymentNoticeReferences
  PaymentNotice_Token: PaymentNoticeToken
  PaymentReconciliation: PaymentReconciliation
  PaymentReconciliation_History: PaymentReconciliationHistory
  PaymentReconciliation_References: PaymentReconciliationReferences
  PaymentReconciliation_Token: PaymentReconciliationToken
  Person: Person
  Person_History: PersonHistory
  Person_References: PersonReferences
  Person_Token: PersonToken
  PlanDefinition: PlanDefinition
  PlanDefinition_History: PlanDefinitionHistory
  PlanDefinition_References: PlanDefinitionReferences
  PlanDefinition_Token: PlanDefinitionToken
  Practitioner: Practitioner
  Practitioner_History: PractitionerHistory
  Practitioner_References: PractitionerReferences
  Practitioner_Token: PractitionerToken
  PractitionerRole: PractitionerRole
  PractitionerRole_History: PractitionerRoleHistory
  PractitionerRole_References: PractitionerRoleReferences
  PractitionerRole_Token: PractitionerRoleToken
  Procedure: Procedure
  Procedure_History: ProcedureHistory
  Procedure_References: ProcedureReferences
  Procedure_Token: ProcedureToken
  procurement: Procurement
  procurers: Procurers
  Project: Project
  Project_History: ProjectHistory
  Project_References: ProjectReferences
  Project_Token: ProjectToken
  ProjectMembership: ProjectMembership
  ProjectMembership_History: ProjectMembershipHistory
  ProjectMembership_References: ProjectMembershipReferences
  ProjectMembership_Token: ProjectMembershipToken
  Provenance: Provenance
  Provenance_History: ProvenanceHistory
  Provenance_References: ProvenanceReferences
  Provenance_Token: ProvenanceToken
  provider_calendars: ProviderCalendars
  provinces: Provinces
  Questionnaire: Questionnaire
  Questionnaire_History: QuestionnaireHistory
  Questionnaire_References: QuestionnaireReferences
  Questionnaire_Token: QuestionnaireToken
  QuestionnaireResponse: QuestionnaireResponse
  QuestionnaireResponse_History: QuestionnaireResponseHistory
  QuestionnaireResponse_References: QuestionnaireResponseReferences
  QuestionnaireResponse_Token: QuestionnaireResponseToken
  RelatedPerson: RelatedPerson
  RelatedPerson_History: RelatedPersonHistory
  RelatedPerson_References: RelatedPersonReferences
  RelatedPerson_Token: RelatedPersonToken
  RequestGroup: RequestGroup
  RequestGroup_History: RequestGroupHistory
  RequestGroup_References: RequestGroupReferences
  RequestGroup_Token: RequestGroupToken
  ResearchDefinition: ResearchDefinition
  ResearchDefinition_History: ResearchDefinitionHistory
  ResearchDefinition_References: ResearchDefinitionReferences
  ResearchDefinition_Token: ResearchDefinitionToken
  ResearchElementDefinition: ResearchElementDefinition
  ResearchElementDefinition_History: ResearchElementDefinitionHistory
  ResearchElementDefinition_References: ResearchElementDefinitionReferences
  ResearchElementDefinition_Token: ResearchElementDefinitionToken
  ResearchStudy: ResearchStudy
  ResearchStudy_History: ResearchStudyHistory
  ResearchStudy_References: ResearchStudyReferences
  ResearchStudy_Token: ResearchStudyToken
  ResearchSubject: ResearchSubject
  ResearchSubject_History: ResearchSubjectHistory
  ResearchSubject_References: ResearchSubjectReferences
  ResearchSubject_Token: ResearchSubjectToken
  RiskAssessment: RiskAssessment
  RiskAssessment_History: RiskAssessmentHistory
  RiskAssessment_References: RiskAssessmentReferences
  RiskAssessment_Token: RiskAssessmentToken
  RiskEvidenceSynthesis: RiskEvidenceSynthesis
  RiskEvidenceSynthesis_History: RiskEvidenceSynthesisHistory
  RiskEvidenceSynthesis_References: RiskEvidenceSynthesisReferences
  RiskEvidenceSynthesis_Token: RiskEvidenceSynthesisToken
  Schedule: Schedule
  Schedule_History: ScheduleHistory
  Schedule_References: ScheduleReferences
  Schedule_Token: ScheduleToken
  SearchParameter: SearchParameter
  SearchParameter_History: SearchParameterHistory
  SearchParameter_References: SearchParameterReferences
  SearchParameter_Token: SearchParameterToken
  ServiceRequest: ServiceRequest
  ServiceRequest_History: ServiceRequestHistory
  ServiceRequest_References: ServiceRequestReferences
  ServiceRequest_Token: ServiceRequestToken
  Slot: Slot
  Slot_History: SlotHistory
  Slot_References: SlotReferences
  Slot_Token: SlotToken
  SmartAppLaunch: SmartAppLaunch
  SmartAppLaunch_History: SmartAppLaunchHistory
  SmartAppLaunch_References: SmartAppLaunchReferences
  SmartAppLaunch_Token: SmartAppLaunchToken
  spatial_ref_sys: SpatialRefSys
  Specimen: Specimen
  Specimen_History: SpecimenHistory
  Specimen_References: SpecimenReferences
  Specimen_Token: SpecimenToken
  SpecimenDefinition: SpecimenDefinition
  SpecimenDefinition_History: SpecimenDefinitionHistory
  SpecimenDefinition_References: SpecimenDefinitionReferences
  SpecimenDefinition_Token: SpecimenDefinitionToken
  StructureDefinition: StructureDefinition
  StructureDefinition_History: StructureDefinitionHistory
  StructureDefinition_References: StructureDefinitionReferences
  StructureDefinition_Token: StructureDefinitionToken
  StructureMap: StructureMap
  StructureMap_History: StructureMapHistory
  StructureMap_References: StructureMapReferences
  StructureMap_Token: StructureMapToken
  Subscription: Subscription
  Subscription_History: SubscriptionHistory
  Subscription_References: SubscriptionReferences
  Subscription_Token: SubscriptionToken
  SubscriptionStatus: SubscriptionStatus
  SubscriptionStatus_History: SubscriptionStatusHistory
  SubscriptionStatus_References: SubscriptionStatusReferences
  SubscriptionStatus_Token: SubscriptionStatusToken
  Substance: Substance
  Substance_History: SubstanceHistory
  Substance_References: SubstanceReferences
  Substance_Token: SubstanceToken
  SubstanceNucleicAcid: SubstanceNucleicAcid
  SubstanceNucleicAcid_History: SubstanceNucleicAcidHistory
  SubstanceNucleicAcid_References: SubstanceNucleicAcidReferences
  SubstanceNucleicAcid_Token: SubstanceNucleicAcidToken
  SubstancePolymer: SubstancePolymer
  SubstancePolymer_History: SubstancePolymerHistory
  SubstancePolymer_References: SubstancePolymerReferences
  SubstancePolymer_Token: SubstancePolymerToken
  SubstanceProtein: SubstanceProtein
  SubstanceProtein_History: SubstanceProteinHistory
  SubstanceProtein_References: SubstanceProteinReferences
  SubstanceProtein_Token: SubstanceProteinToken
  SubstanceReferenceInformation: SubstanceReferenceInformation
  SubstanceReferenceInformation_History: SubstanceReferenceInformationHistory
  SubstanceReferenceInformation_References:
    SubstanceReferenceInformationReferences
  SubstanceReferenceInformation_Token: SubstanceReferenceInformationToken
  SubstanceSourceMaterial: SubstanceSourceMaterial
  SubstanceSourceMaterial_History: SubstanceSourceMaterialHistory
  SubstanceSourceMaterial_References: SubstanceSourceMaterialReferences
  SubstanceSourceMaterial_Token: SubstanceSourceMaterialToken
  SubstanceSpecification: SubstanceSpecification
  SubstanceSpecification_History: SubstanceSpecificationHistory
  SubstanceSpecification_References: SubstanceSpecificationReferences
  SubstanceSpecification_Token: SubstanceSpecificationToken
  suburbs: Suburbs
  SupplyDelivery: SupplyDelivery
  SupplyDelivery_History: SupplyDeliveryHistory
  SupplyDelivery_References: SupplyDeliveryReferences
  SupplyDelivery_Token: SupplyDeliveryToken
  SupplyRequest: SupplyRequest
  SupplyRequest_History: SupplyRequestHistory
  SupplyRequest_References: SupplyRequestReferences
  SupplyRequest_Token: SupplyRequestToken
  Task: Task
  Task_History: TaskHistory
  Task_References: TaskReferences
  Task_Token: TaskToken
  TerminologyCapabilities: TerminologyCapabilities
  TerminologyCapabilities_History: TerminologyCapabilitiesHistory
  TerminologyCapabilities_References: TerminologyCapabilitiesReferences
  TerminologyCapabilities_Token: TerminologyCapabilitiesToken
  TestReport: TestReport
  TestReport_History: TestReportHistory
  TestReport_References: TestReportReferences
  TestReport_Token: TestReportToken
  TestScript: TestScript
  TestScript_History: TestScriptHistory
  TestScript_References: TestScriptReferences
  TestScript_Token: TestScriptToken
  User: User
  User_History: UserHistory
  User_References: UserReferences
  User_Token: UserToken
  UserConfiguration: UserConfiguration
  UserConfiguration_History: UserConfigurationHistory
  UserConfiguration_References: UserConfigurationReferences
  UserConfiguration_Token: UserConfigurationToken
  UserSecurityRequest: UserSecurityRequest
  UserSecurityRequest_History: UserSecurityRequestHistory
  UserSecurityRequest_References: UserSecurityRequestReferences
  UserSecurityRequest_Token: UserSecurityRequestToken
  ValueSet: ValueSet
  ValueSet_History: ValueSetHistory
  ValueSet_Membership: ValueSetMembership
  ValueSet_References: ValueSetReferences
  ValueSet_Token: ValueSetToken
  ValueSetElement: ValueSetElement
  VerificationResult: VerificationResult
  VerificationResult_History: VerificationResultHistory
  VerificationResult_References: VerificationResultReferences
  VerificationResult_Token: VerificationResultToken
  VisionPrescription: VisionPrescription
  VisionPrescription_History: VisionPrescriptionHistory
  VisionPrescription_References: VisionPrescriptionReferences
  VisionPrescription_Token: VisionPrescriptionToken
  waiting_room: WaitingRoom
  wards: Wards
  whatsapp_messages_received: WhatsappMessagesReceived
  whatsapp_messages_sent: WhatsappMessagesSent
}
type Buffer = Uint8Array
