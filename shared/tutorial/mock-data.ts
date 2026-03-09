// =============================================================================
// FILE: /shared/tutorial/mock-data.ts
// Static mock data for tutorial (no database calls needed)
// =============================================================================

import type {
  Existence,
  MostRecentBriefHistoryFindings,
  Priority,
  RenderedBriefHistoryRelativeToHealthWorker,
  RenderedEmployee,
  RenderedFindingRelativeToHealthWorker,
  RenderedPatientCompletedRegistration,
  RenderedSidebarWorkflow,
  RenderedTask,
  RenderedWaitingRoom,
  TaskGroup,
  TriageAssignPriorityTableRow,
  VitalAssessmentFormInputDefition,
  VitalMeasurementFormInputDefition,
  WarningSignWithMaybeRecord,
} from '../../types.ts'
import type { TutorialStep } from './types.ts'
import { isStepCompleted } from './state.ts'
import { COMMON_CONDITIONS, CommonConditionKey } from '../brief_history.ts'
import { assessmentOptionSExpression, measureVitalsInputDefinitions, VITAL_MEASUREMENTS_SNOMED_CONCEPTS, VITAL_MEASUREMENTS_UNITS } from '../vitals.ts'
import { WARNING_SIGNS } from '../warning_signs.ts'
import { COMMON_SYMPTOMS } from '../common_symptoms.ts'

// =============================================================================
// PATIENT & EMPLOYEE
// =============================================================================

/**
 * Mock patient for tutorial - Duduzile Langa
 */
export const TUTORIAL_PATIENT: RenderedPatientCompletedRegistration = {
  id: 'tutorial-patient-001',
  sex: 'female',
  gender: null,
  national_id_number: null,
  completed_registration: true,
  date_of_birth: '1990-06-20',
  dob_formatted: '20 June 1990',
  name: 'Duduzile Langa',
  names: {
    name: 'Duduzile Langa',
    first_names: 'Duduzile',
    surname: 'Langa',
    preferred_name: 'Duduzile',
  },
  description: 'female • 20 June 1990',
  age_display: '34 years',
  age_years: 34,
  age_days: 12410,
  avatar_url: '/duduzile.png',
  preferred_language_code_iso_639_2_b: 'eng',
  most_recent_height_cm_measurement: '165',
}

/**
 * Mock employee (health worker) for tutorial
 */
export const TUTORIAL_EMPLOYEE: RenderedEmployee = {
  name: 'Thandiwe Gumede',
  first_names: 'Thandiwe',
  surname: 'Gumede',
  preferred_name: 'Thandiwe',
  email: 'tutorial@virtualhospitals.africa',
  avatar_url: '/images/avatars/random/female/6.png',
  phone_number: null,
  id: 'tutorial-hw-001',
  demographics: {
    sex: null,
    gender: null,
    date_of_birth: null,
  },
  contact_details: {
    mobile_phone_number: null,
    address: null,
  },
  ever_licensed_as_doctor: 0,
  organizations: [
    {
      id: 'tutorial-org-001',
      name: 'Tutorial Clinic',
      country: 'ZA',
      category: 'clinic',
      ownership: null,
      location: null,
      is_test: true,
      inactive_reason: null,
      formatted_address: null,
      most_common_language_code: 'eng',
      waiting_room_id: null,
      reception_id: null,
      employment_id: 'tutorial-emp-001',
      role: 'nurse',
      is_admin: false,
      in_departments: [],
      active_licences: [{
        licence_number: 'NMC-2024-001',
        regulatory_agency: {
          name: 'South African Nursing Council',
          acronym: 'SANC',
          country: 'ZA',
        },
        profession: 'Nurse',
        specialty: 'Primary care',
        subspecialty: null,
        start_date: '2024-01-01',
        expiry_date: '2027-01-01',
        status: 'active',
        revoked: null,
      }],
      hrefs: {
        regulator_view: '/tutorial',
        health_worker_view: '/tutorial',
      },
    },
  ],
  organization_id: 'tutorial-org-001',
  employee_id: 'tutorial-emp-001',
  role: 'nurse',
  is_admin: false,
  href: '/tutorial',
}

export const TUTORIAL_OTHER_EMPLOYEE: RenderedEmployee = {
  name: 'Sipho Makhanya',
  first_names: 'Sipho',
  surname: 'Makhanya',
  preferred_name: 'Sipho',
  email: 'tutorial@virtualhospitals.africa',
  avatar_url: '/images/avatars/random/male/6.png',
  phone_number: null,
  id: 'tutorial-hw-001',
  demographics: {
    sex: null,
    gender: null,
    date_of_birth: null,
  },
  contact_details: {
    mobile_phone_number: null,
    address: null,
  },
  ever_licensed_as_doctor: 0,
  organizations: [
    {
      id: 'tutorial-org-001',
      name: 'Tutorial Clinic',
      country: 'ZA',
      category: 'clinic',
      ownership: null,
      location: null,
      is_test: true,
      inactive_reason: null,
      formatted_address: null,
      most_common_language_code: 'eng',
      waiting_room_id: null,
      reception_id: null,
      employment_id: 'tutorial-emp-001',
      role: 'nurse',
      is_admin: false,
      in_departments: [],
      active_licences: [{
        licence_number: 'NMC-2024-001',
        regulatory_agency: {
          name: 'South African Nursing Council',
          acronym: 'SANC',
          country: 'ZA',
        },
        profession: 'Nurse',
        specialty: 'Primary care',
        subspecialty: null,
        start_date: '2024-01-01',
        expiry_date: '2027-01-01',
        status: 'active',
        revoked: null,
      }],
      hrefs: {
        regulator_view: '/tutorial',
        health_worker_view: '/tutorial',
      },
    },
  ],
  organization_id: 'tutorial-org-001',
  employee_id: 'tutorial-emp-001',
  role: 'nurse',
  is_admin: false,
  href: '/tutorial',
}

const MOCK_PROVIDER_IS_ME = {
  ...TUTORIAL_EMPLOYEE,
  is_me: 1 as const,
}

const MOCK_PROVIDER_OTHER = {
  ...TUTORIAL_OTHER_EMPLOYEE,
  is_me: 0 as const,
}

// =============================================================================
// WAITING ROOM - Mock patients at the clinic
// =============================================================================

/**
 * Helper to create mock employee for waiting room display.
 * Includes full organization data required by employeeDisplay().
 */
function makeMockWaitingRoomEmployee(data: {
  id: string
  employee_id: string
  name: string
  first_names: string
  surname: string
  avatar_url: string
  role: 'nurse' | 'doctor'
  specialty: string
}) {
  const is_doctor = data.role === 'doctor'
  return {
    ...data,
    preferred_name: data.first_names,
    email: null,
    phone_number: null,
    demographics: { sex: null, gender: null, date_of_birth: null },
    contact_details: { mobile_phone_number: null, address: null },
    ever_licensed_as_doctor: is_doctor ? (1 as const) : (0 as const),
    organizations: [
      {
        id: 'tutorial-org-001',
        name: 'Tutorial Clinic',
        country: 'ZA',
        category: 'clinic' as const,
        ownership: null,
        location: null,
        is_test: true,
        inactive_reason: null,
        formatted_address: null,
        most_common_language_code: 'eng',
        waiting_room_id: null,
        reception_id: null,
        employment_id: data.employee_id,
        role: data.role,
        is_admin: false,
        in_departments: [],
        active_licences: [{
          licence_number: `LIC-${data.employee_id}`,
          regulatory_agency: {
            name: is_doctor ? 'Health Professions Council of South Africa' : 'South African Nursing Council',
            acronym: is_doctor ? 'HPCSA' : 'SANC',
            country: 'ZA',
          },
          profession: is_doctor ? 'Doctor' : 'Nurse',
          specialty: data.specialty,
          subspecialty: null,
          start_date: '2024-01-01',
          expiry_date: '2027-01-01',
          status: 'active' as const,
          revoked: null,
        }],
        hrefs: {
          regulator_view: '/tutorial',
          health_worker_view: '/tutorial',
        },
      },
    ],
    organization_id: 'tutorial-org-001',
    is_admin: false,
    href: '/tutorial',
    patient_encounter_employee_id: `${data.employee_id}-encounter`,
    seen_at: new Date(),
  }
}

/**
 * Mock waiting room data for tutorial.
 * Shows 4 patients at different stages:
 * - Duduzile: Awaiting Triage (top of list - our tutorial patient)
 * - Themba: In Triage (another nurse is triaging)
 * - Nomvula: In Consultation (with a doctor)
 * - Sibusiso: In Consultation (with a nurse)
 */
export const TUTORIAL_WAITING_ROOM: RenderedWaitingRoom[] = [
  // Duduzile - Awaiting Triage (top priority for tutorial)
  {
    patient_encounter_id: 'tutorial-encounter-duduzile',
    patient: {
      id: 'tutorial-patient-001',
      name: 'Duduzile Langa',
      avatar_url: '/duduzile.png',
      description: 'female • 20 June 1990',
    },
    room: {
      id: 'tutorial-room-waiting',
      name: 'Waiting Room',
    },
    actions: [{
      text: 'Start Triage',
      href: '#step=warning_signs&index=0&action=tutorial',
    }],
    reason: null,
    workflow_status_display: 'Awaiting Triage',
    arrived_timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    arrived_ago_display: '5 minutes ago',
    target_treatment_time: null,
    department_name: 'Primary care',
    priority: null,
    present_employees: [],
  },
  // Themba - In Triage (another nurse handling)
  {
    patient_encounter_id: 'tutorial-encounter-themba',
    patient: {
      id: 'tutorial-patient-002',
      name: 'Themba Ndlovu',
      avatar_url: '/images/avatars/random/male/3.png',
      description: 'male • 15 March 1980',
    },
    room: {
      id: 'tutorial-room-triage-1',
      name: 'Triage Room 1',
    },
    actions: [{
      text: 'View',
      href: '#',
    }],
    reason: 'seeking treatment',
    workflow_status_display: 'Awaiting Consultation',
    arrived_timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    arrived_ago_display: '22 minutes ago',
    target_treatment_time: null,
    department_name: 'Primary care',
    priority: {
      name: 'Non-urgent',
      value_snomed_concept_id: '394848005',
      target_treatment_time: new Date(Date.now() + 15 * 60 * 1000),
      record_ids: [],
    },
    present_employees: [],
  },
  // Themba - In Triage (another nurse handling)
  {
    patient_encounter_id: 'tutorial-encounter-themba',
    patient: {
      id: 'tutorial-patient-002',
      name: 'Themba Ndlovu',
      avatar_url: '/images/avatars/random/male/3.png',
      description: 'male • 15 March 1980',
    },
    room: {
      id: 'tutorial-room-triage-1',
      name: 'Triage Room 1',
    },
    actions: [{
      text: 'View',
      href: '#',
    }],
    reason: 'seeking treatment',
    workflow_status_display: 'In Triage',
    arrived_timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    arrived_ago_display: '15 minutes ago',
    target_treatment_time: null,
    department_name: 'Primary care',
    priority: null,
    present_employees: [makeMockWaitingRoomEmployee({
      id: 'tutorial-hw-003',
      employee_id: 'tutorial-emp-003',
      name: 'Zanele Dlamini',
      first_names: 'Zanele',
      surname: 'Dlamini',
      avatar_url: '/images/avatars/random/female/4.png',
      role: 'nurse',
      specialty: 'Primary care',
    })],
  },
  {
    patient_encounter_id: 'tutorial-encounter-nomvula',
    patient: {
      id: 'tutorial-patient-003',
      name: 'Nomvula Zulu',
      avatar_url: '/images/avatars/random/female/2.png',
      description: 'female • 8 November 1997',
    },
    room: {
      id: 'tutorial-room-consult-1',
      name: 'Consultation Room 1',
    },
    actions: [{
      text: 'View',
      href: '#',
    }],
    reason: 'maternity',
    workflow_status_display: 'In Consultation',
    arrived_timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    arrived_ago_display: '45 minutes ago',
    target_treatment_time: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
    department_name: 'Primary care',
    priority: {
      name: 'Non-urgent',
      value_snomed_concept_id: '394848005',
      target_treatment_time: new Date(Date.now() + 15 * 60 * 1000),
      record_ids: [],
    },
    present_employees: [makeMockWaitingRoomEmployee({
      id: 'tutorial-hw-004',
      employee_id: 'tutorial-emp-004',
      name: 'Mandisa Khumalo',
      first_names: 'Mandisa',
      surname: 'Khumalo',
      avatar_url: '/images/avatars/random/female/5.png',
      role: 'nurse',
      specialty: 'Family Medicine',
    })],
  },
  // Sibusiso - In Consultation (with senior nurse - Very Urgent)
  {
    patient_encounter_id: 'tutorial-encounter-sibusiso',
    patient: {
      id: 'tutorial-patient-004',
      name: 'Sibusiso Mthembu',
      avatar_url: '/images/avatars/random/male/7.png',
      description: 'male • 3 July 1963',
    },
    room: {
      id: 'tutorial-room-consult-2',
      name: 'Consultation Room 2',
    },
    actions: [{
      text: 'View',
      href: '#',
    }],
    reason: 'seeking treatment',
    workflow_status_display: 'In Consultation',
    arrived_timestamp: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
    arrived_ago_display: '25 minutes ago',
    target_treatment_time: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes overdue
    department_name: 'Primary care',
    priority: {
      name: 'Non-urgent',
      value_snomed_concept_id: '24484000',
      target_treatment_time: new Date(Date.now() - 15 * 60 * 1000),
      record_ids: [],
    },
    present_employees: [makeMockWaitingRoomEmployee({
      id: 'tutorial-hw-005',
      employee_id: 'tutorial-emp-005',
      name: 'Bongani Sibeko',
      first_names: 'Bongani',
      surname: 'Sibeko',
      avatar_url: '/bongani.png',
      role: 'nurse',
      specialty: 'Primary care',
    })],
  },
]

// =============================================================================
// WARNING SIGNS
// =============================================================================

/**
 * Warning signs for tutorial - includes "Cough" which triggers SpO2 requirement
 */
export const TUTORIAL_WARNING_SIGNS: WarningSignWithMaybeRecord[] = [
  ...WARNING_SIGNS.adult.filter((sign) => !sign.name.includes('Pregnancy')),
  ...COMMON_SYMPTOMS,
]

// =============================================================================
// BRIEF HISTORY - Pre-filled for Duduzile
// =============================================================================

/**
 * Factory for creating brief history finding records.
 */
function makeBriefHistoryFinding(
  conditionKey: CommonConditionKey,
  existence: Existence,
): RenderedBriefHistoryRelativeToHealthWorker {
  const condition = COMMON_CONDITIONS.find((c) => c.key === conditionKey)!

  return {
    type: 'finding',
    id: `tutorial-brief-history-${conditionKey}`,
    created_at: new Date(),
    patient_encounter_id: 'tutorial-encounter-001',
    root_snomed_concept_id: '404684003',
    root_snomed_concept_name: 'Clinical finding',
    root_snomed_concept_category: 'finding',
    specific_snomed_concept_id: condition.id,
    specific_snomed_concept_name: condition.label,
    specific_snomed_concept_category: 'finding',
    value: null,
    modifiers: [],
    attributes: [],
    displays: {
      finding: condition.label,
      value: existence,
      full: `${condition.label}: ${existence}`,
    },
    evaluations: [],
    destination_relations: [],
    priority: null,
    score: null,
    existence,
    provider: MOCK_PROVIDER_OTHER,
    as_part_of_procedure: {
      id: 'tutorial-brief-history-procedure',
      root_snomed_concept_id: '225390008',
      root_snomed_concept_name: 'Triage',
      root_snomed_concept_category: 'procedure',
      specific_snomed_concept_id: '225390008',
      specific_snomed_concept_name: 'Triage',
      specific_snomed_concept_category: 'procedure',
      workflow_step_name: 'Brief History',
    },
    pertaining_to_key: conditionKey,
  }
}

/**
 * Duduzile's medical history:
 * - Has asthma (relevant for respiratory symptoms)
 * - No diabetes
 * - Not pregnant
 */
export const TUTORIAL_BRIEF_HISTORY_COMMON_CONDITIONS: MostRecentBriefHistoryFindings = {
  pregnancy: makeBriefHistoryFinding('pregnancy', 'No'),
  diabetes: makeBriefHistoryFinding('diabetes', 'No'),
  asthma: makeBriefHistoryFinding('asthma', 'No'),
  tuberculosis: undefined,
  hiv: undefined,
  copd: undefined,
  covid19: undefined,
  heart_disease: undefined,
  mental_disorder: undefined,
  epilepsy: undefined,
  arthritis: undefined,
  cancer: undefined,
}

export const TUTORIAL_BRIEF_HISTORY_ALLERGIES: RenderedFindingRelativeToHealthWorker[] = [
  {
    id: '991a6ffe-7827-4ba0-9a43-626a9c5e902e',
    created_at: '2026-02-18T01:04:56.114Z',
    patient_encounter_id: '6331adcd-44f9-453f-b718-f80c738ef1d0',
    root_snomed_concept_id: '404684003',
    root_snomed_concept_name: 'Clinical finding',
    root_snomed_concept_category: 'finding',
    specific_snomed_concept_id: '91935009',
    specific_snomed_concept_name: 'Allergy to peanut',
    specific_snomed_concept_category: 'finding',
    existence: 'Yes',
    value: null,
    evaluations: [],
    priority: null,
    destination_relations: [],
    type: 'finding',
    as_part_of_procedure: {
      id: '5188e75d-a10e-48cb-8c9e-f51b23ba4f13',
      root_snomed_concept_id: '71388002',
      root_snomed_concept_name: 'Procedure',
      root_snomed_concept_category: 'procedure',
      specific_snomed_concept_id: '203421005',
      specific_snomed_concept_name: 'History taking, limited',
      specific_snomed_concept_category: 'procedure',
      workflow_step_name: 'brief_history',
    },
    score: null,
    attributes: [],
    displays: {
      value: null,
      finding: 'Allergy to peanut',
      full: 'Allergy to peanut',
    },
    modifiers: [],
    provider: MOCK_PROVIDER_OTHER,
  },
]

// =============================================================================
// VITALS - Height, Weight, and Measurements
// =============================================================================

/**
 * Pre-recorded height measurement.
 */
const TUTORIAL_HEIGHT: RenderedFindingRelativeToHealthWorker = {
  type: 'finding',
  id: 'tutorial-height-001',
  created_at: new Date(),
  patient_encounter_id: 'tutorial-encounter-001',
  root_snomed_concept_id: VITAL_MEASUREMENTS_SNOMED_CONCEPTS.height.id,
  root_snomed_concept_name: 'Body height measure',
  root_snomed_concept_category: 'observable entity',
  specific_snomed_concept_id: VITAL_MEASUREMENTS_SNOMED_CONCEPTS.height.id,
  specific_snomed_concept_name: 'Body height measure',
  specific_snomed_concept_category: 'observable entity',
  value: { type: 'measurement', value: '165', units: 'cm' },
  modifiers: [],
  attributes: [],
  displays: {
    finding: 'Height',
    value: '165 cm',
    full: 'Height: 165 cm',
  },
  evaluations: [],
  destination_relations: [],
  priority: null,
  score: null,
  existence: 'Yes',
  provider: MOCK_PROVIDER_IS_ME,
  as_part_of_procedure: {
    id: 'tutorial-height-weight-procedure',
    root_snomed_concept_id: '225390008',
    root_snomed_concept_name: 'Triage',
    root_snomed_concept_category: 'procedure',
    specific_snomed_concept_id: '225390008',
    specific_snomed_concept_name: 'Triage',
    specific_snomed_concept_category: 'procedure',
    workflow_step_name: 'Height and Weight',
  },
}

/**
 * Pre-recorded weight measurement.
 */
const TUTORIAL_WEIGHT: RenderedFindingRelativeToHealthWorker = {
  type: 'finding',
  id: 'tutorial-weight-001',
  created_at: new Date(),
  patient_encounter_id: 'tutorial-encounter-001',
  root_snomed_concept_id: VITAL_MEASUREMENTS_SNOMED_CONCEPTS.weight.id,
  root_snomed_concept_name: 'Body weight',
  root_snomed_concept_category: 'observable entity',
  specific_snomed_concept_id: VITAL_MEASUREMENTS_SNOMED_CONCEPTS.weight.id,
  specific_snomed_concept_name: 'Body weight',
  specific_snomed_concept_category: 'observable entity',
  value: { type: 'measurement', value: '62', units: 'kg' },
  modifiers: [],
  attributes: [],
  displays: {
    finding: 'Weight',
    value: '62 kg',
    full: 'Weight: 62 kg',
  },
  evaluations: [],
  destination_relations: [],
  priority: null,
  score: null,
  existence: 'Yes',
  provider: MOCK_PROVIDER_IS_ME,
  as_part_of_procedure: {
    id: 'tutorial-height-weight-procedure',
    root_snomed_concept_id: '225390008',
    root_snomed_concept_name: 'Triage',
    root_snomed_concept_category: 'procedure',
    specific_snomed_concept_id: '225390008',
    specific_snomed_concept_name: 'Triage',
    specific_snomed_concept_category: 'procedure',
    workflow_step_name: 'Height and Weight',
  },
}

/**
 * Combined height and weight measurements.
 */
export const TUTORIAL_HEIGHT_WEIGHT: RenderedFindingRelativeToHealthWorker[] = [
  TUTORIAL_HEIGHT,
  TUTORIAL_WEIGHT,
]

/**
 * Sidebar vital measurements - shown after vitals step is complete.
 * Combines systolic/diastolic into single "Blood pressure" display like real app.
 */
const TUTORIAL_SIDEBAR_VITALS: RenderedFindingRelativeToHealthWorker[] = [
  // Respiratory rate (TEWS 3)
  {
    type: 'finding',
    id: 'tutorial-sidebar-respiratory-rate',
    created_at: new Date(),
    patient_encounter_id: 'tutorial-encounter-001',
    root_snomed_concept_id: VITAL_MEASUREMENTS_SNOMED_CONCEPTS.respiratory_rate.id,
    root_snomed_concept_name: 'Respiratory rate',
    root_snomed_concept_category: 'observable entity',
    specific_snomed_concept_id: VITAL_MEASUREMENTS_SNOMED_CONCEPTS.respiratory_rate.id,
    specific_snomed_concept_name: 'Respiratory rate',
    specific_snomed_concept_category: 'observable entity',
    value: { type: 'measurement', value: '32', units: 'bpm' },
    modifiers: [],
    attributes: [],
    displays: {
      finding: 'Respiratory rate',
      value: '32 bpm',
      full: 'Respiratory rate: 32 bpm',
    },
    evaluations: [],
    destination_relations: [],
    priority: null,
    score: 3,
    existence: 'Yes',
    provider: MOCK_PROVIDER_IS_ME,
    as_part_of_procedure: {
      id: 'tutorial-vitals-procedure',
      root_snomed_concept_id: '225390008',
      root_snomed_concept_name: 'Triage',
      root_snomed_concept_category: 'procedure',
      specific_snomed_concept_id: '225390008',
      specific_snomed_concept_name: 'Triage',
      specific_snomed_concept_category: 'procedure',
      workflow_step_name: 'Measure Vitals',
    },
  },
  // Heart rate (TEWS 0)
  {
    type: 'finding',
    id: 'tutorial-sidebar-heart-rate',
    created_at: new Date(),
    patient_encounter_id: 'tutorial-encounter-001',
    root_snomed_concept_id: VITAL_MEASUREMENTS_SNOMED_CONCEPTS.heart_rate.id,
    root_snomed_concept_name: 'Heart rate',
    root_snomed_concept_category: 'observable entity',
    specific_snomed_concept_id: VITAL_MEASUREMENTS_SNOMED_CONCEPTS.heart_rate.id,
    specific_snomed_concept_name: 'Heart rate',
    specific_snomed_concept_category: 'observable entity',
    value: { type: 'measurement', value: '95', units: 'bpm' },
    modifiers: [],
    attributes: [],
    displays: {
      finding: 'Heart rate',
      value: '95 bpm',
      full: 'Heart rate: 95 bpm',
    },
    evaluations: [],
    destination_relations: [],
    priority: null,
    score: 0,
    existence: 'Yes',
    provider: MOCK_PROVIDER_IS_ME,
    as_part_of_procedure: {
      id: 'tutorial-vitals-procedure',
      root_snomed_concept_id: '225390008',
      root_snomed_concept_name: 'Triage',
      root_snomed_concept_category: 'procedure',
      specific_snomed_concept_id: '225390008',
      specific_snomed_concept_name: 'Triage',
      specific_snomed_concept_category: 'procedure',
      workflow_step_name: 'Measure Vitals',
    },
  },
  // Blood pressure (combined systolic/diastolic display)
  {
    type: 'finding',
    id: 'tutorial-sidebar-blood-pressure',
    created_at: new Date(),
    patient_encounter_id: 'tutorial-encounter-001',
    root_snomed_concept_id: VITAL_MEASUREMENTS_SNOMED_CONCEPTS.blood_pressure_systolic.id,
    root_snomed_concept_name: 'Systolic blood pressure',
    root_snomed_concept_category: 'observable entity',
    specific_snomed_concept_id: VITAL_MEASUREMENTS_SNOMED_CONCEPTS.blood_pressure_systolic.id,
    specific_snomed_concept_name: 'Systolic blood pressure',
    specific_snomed_concept_category: 'observable entity',
    value: { type: 'measurement', value: '120', units: 'mmHg' },
    modifiers: [],
    attributes: [],
    displays: {
      finding: 'Blood pressure',
      value: '120/80 mmHg',
      full: 'Blood pressure: 120/80 mmHg',
    },
    evaluations: [],
    destination_relations: [],
    priority: null,
    score: 0,
    existence: 'Yes',
    provider: MOCK_PROVIDER_IS_ME,
    as_part_of_procedure: {
      id: 'tutorial-vitals-procedure',
      root_snomed_concept_id: '225390008',
      root_snomed_concept_name: 'Triage',
      root_snomed_concept_category: 'procedure',
      specific_snomed_concept_id: '225390008',
      specific_snomed_concept_name: 'Triage',
      specific_snomed_concept_category: 'procedure',
      workflow_step_name: 'Measure Vitals',
    },
  },
  // Temperature (TEWS 2)
  {
    type: 'finding',
    id: 'tutorial-sidebar-temperature',
    created_at: new Date(),
    patient_encounter_id: 'tutorial-encounter-001',
    root_snomed_concept_id: VITAL_MEASUREMENTS_SNOMED_CONCEPTS.temperature.id,
    root_snomed_concept_name: 'Body temperature',
    root_snomed_concept_category: 'observable entity',
    specific_snomed_concept_id: VITAL_MEASUREMENTS_SNOMED_CONCEPTS.temperature.id,
    specific_snomed_concept_name: 'Body temperature',
    specific_snomed_concept_category: 'observable entity',
    value: { type: 'measurement', value: '39', units: '°C' },
    modifiers: [],
    attributes: [],
    displays: {
      finding: 'Temperature',
      value: '39 °C',
      full: 'Temperature: 39 °C',
    },
    evaluations: [],
    destination_relations: [],
    priority: null,
    score: 2,
    existence: 'Yes',
    provider: MOCK_PROVIDER_IS_ME,
    as_part_of_procedure: {
      id: 'tutorial-vitals-procedure',
      root_snomed_concept_id: '225390008',
      root_snomed_concept_name: 'Triage',
      root_snomed_concept_category: 'procedure',
      specific_snomed_concept_id: '225390008',
      specific_snomed_concept_name: 'Triage',
      specific_snomed_concept_category: 'procedure',
      workflow_step_name: 'Measure Vitals',
    },
  },
  // SpO2 (oxygen saturation)
  {
    type: 'finding',
    id: 'tutorial-sidebar-spo2',
    created_at: new Date(),
    patient_encounter_id: 'tutorial-encounter-001',
    root_snomed_concept_id: VITAL_MEASUREMENTS_SNOMED_CONCEPTS.blood_oxygen_saturation.id,
    root_snomed_concept_name: 'Oxygen saturation',
    root_snomed_concept_category: 'observable entity',
    specific_snomed_concept_id: VITAL_MEASUREMENTS_SNOMED_CONCEPTS.blood_oxygen_saturation.id,
    specific_snomed_concept_name: 'Oxygen saturation',
    specific_snomed_concept_category: 'observable entity',
    value: { type: 'measurement', value: '98', units: '%' },
    modifiers: [],
    attributes: [],
    displays: {
      finding: 'SpO2',
      value: '98%',
      full: 'SpO2: 98%',
    },
    evaluations: [],
    destination_relations: [],
    priority: null,
    score: null,
    existence: 'Yes',
    provider: MOCK_PROVIDER_IS_ME,
    as_part_of_procedure: {
      id: 'tutorial-vitals-procedure',
      root_snomed_concept_id: '225390008',
      root_snomed_concept_name: 'Triage',
      root_snomed_concept_category: 'procedure',
      specific_snomed_concept_id: '225390008',
      specific_snomed_concept_name: 'Triage',
      specific_snomed_concept_category: 'procedure',
      workflow_step_name: 'Measure Vitals',
    },
  },
]

/**
 * Get vitals input definitions for adult patient.
 * Includes SpO2 since patient has respiratory symptom (cough + asthma).
 */
export function getTutorialVitalsDefinitions(): {
  measurements: VitalMeasurementFormInputDefition[]
  assessments: VitalAssessmentFormInputDefition[]
} {
  const { measurements, assessments } = measureVitalsInputDefinitions({
    age_determination: 'adult',
    has_diabetes: false,
  })

  // Add SpO2 as required due to respiratory symptoms (cough + asthma)
  const has_sp_o2 = measurements.some((m) => m.vital === 'blood_oxygen_saturation')
  if (!has_sp_o2) {
    measurements.push({
      vital: 'blood_oxygen_saturation',
      snomed_concept_id: VITAL_MEASUREMENTS_SNOMED_CONCEPTS.blood_oxygen_saturation.id,
      required: true,
      units: VITAL_MEASUREMENTS_UNITS.blood_oxygen_saturation,
    })
  }

  return { measurements, assessments }
}

/**
 * Mock vital values for form auto-fill.
 * Values produce TEWS=5 (Very Urgent) for teaching:
 * - Respiratory rate 32 bpm (>30 = 3 points)
 * - Temperature 39°C (>38.5 = 2 points)
 * - Total = 5 points = Very Urgent
 */
export const TUTORIAL_VITAL_VALUES: Record<string, string> = {
  'measurements.respiratory_rate.value': '32',
  'measurements.heart_rate.value': '95',
  'measurements.temperature.value': '39',
  'measurements.blood_pressure_systolic.value': '120',
  'measurements.blood_pressure_diastolic.value': '80',
  'measurements.blood_oxygen_saturation.value': '98',
}

/**
 * Mock assessment values for form auto-fill.
 * Uses assessmentOptionSExpression to get s_expression values.
 * All TEWS 0 for assessments (Alert, Walking, No trauma).
 */
export const TUTORIAL_ASSESSMENT_VALUES: Record<string, string> = {
  'assessments.consciousness.s_expression': assessmentOptionSExpression('consciousness', 'Alert'),
  'assessments.mobility_assessment.s_expression': assessmentOptionSExpression('mobility_assessment', 'Walking'),
  'assessments.trauma_presence.s_expression': assessmentOptionSExpression('trauma_presence', 'No'),
}

// =============================================================================
// ADDITIONAL TASKS - Respiratory check-for tasks (all answered "No")
// =============================================================================

/**
 * Respiratory symptoms to check for when patient has cough + asthma.
 * All answered "No" for Duduzile - none of the serious conditions apply.
 */
const RESPIRATORY_CHECK_FOR_CONDITIONS = [
  { key: 'wheezing', label: 'Wheezing', snomed_id: '56018004' },
  { key: 'tight_chest', label: 'Tight Chest', snomed_id: '23924001' },
  { key: 'breathing_worse_lying_flat', label: 'Breathing worse lying flat', snomed_id: '62744007' },
  { key: 'leg_swelling', label: 'Leg swelling', snomed_id: '102572006' },
  { key: 'confused', label: 'Confused', snomed_id: '40917007' },
  { key: 'agitated', label: 'Agitated', snomed_id: '24199005' },
  { key: 'breathless_at_rest', label: 'Breathless at rest', snomed_id: '161941007' },
  { key: 'breathless_while_talking', label: 'Breathless while talking', snomed_id: '60845006' },
  { key: 'swelling_pain_one_calf', label: 'Swelling and pain in one calf', snomed_id: '449614009' },
  { key: 'sudden_breathlessness', label: 'Sudden breathlessness', snomed_id: '267036007' },
  { key: 'more_resonant_breath_sounds', label: 'More resonant breath sounds', snomed_id: '65503000' },
  { key: 'decreased_breath_sounds', label: 'Decreased breath sounds', snomed_id: '48348007' },
  { key: 'pain_on_1_side', label: 'Pain on 1 side', snomed_id: '274667000' },
  { key: 'deviated_trachea', label: 'Deviated trachea', snomed_id: '249987002' },
] as const

/**
 * Factory for creating check-for tasks (all completed with "No" answer).
 */
function makeCheckForTask(condition: typeof RESPIRATORY_CHECK_FOR_CONDITIONS[number]): RenderedTask {
  const s_expression = `(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "${condition.label}" "finding"))`

  return {
    atom: 'finding',
    root_snomed_concept: {
      atom: 'snomed_concept',
      name: 'Clinical finding',
      category: 'finding',
    },
    specific_snomed_concept: {
      atom: 'snomed_concept',
      name: condition.label,
      category: 'finding',
    },
    value_snomed_concept: null,
    qualifiers: [],
    attributes: [],
    exact: false,
    history: false,
    existence: 'No' as Existence,
    displays: {
      finding: condition.label,
      value: 'No',
      full: `${condition.label}: No`,
    },
    s_expression,
    existing_finding: {
      type: 'finding',
      id: `tutorial-check-finding-${condition.key}`,
      created_at: new Date(),
      patient_encounter_id: 'tutorial-encounter-001',
      root_snomed_concept_id: '404684003',
      root_snomed_concept_name: 'Clinical finding',
      root_snomed_concept_category: 'finding',
      specific_snomed_concept_id: condition.snomed_id,
      specific_snomed_concept_name: condition.label,
      specific_snomed_concept_category: 'finding',
      value: null,
      modifiers: [],
      attributes: [],
      displays: {
        finding: condition.label,
        value: 'No',
        full: `${condition.label}: No`,
      },
      evaluations: [],
      destination_relations: [],
      priority: null,
      score: null,
      existence: 'No' as Existence,
      provider: MOCK_PROVIDER_IS_ME,
      as_part_of_procedure: {
        id: 'tutorial-check-procedure',
        root_snomed_concept_id: '386053000',
        root_snomed_concept_name: 'Evaluation procedure',
        root_snomed_concept_category: 'procedure',
        specific_snomed_concept_id: '386053000',
        specific_snomed_concept_name: 'Evaluation procedure',
        specific_snomed_concept_category: 'procedure',
        workflow_step_name: 'Additional Tasks',
      },
    },
  }
}

/**
 * Task groups for additional tasks step.
 * Due to cough + asthma, we check for respiratory conditions.
 */
export function getTutorialTaskGroups(): TaskGroup[] {
  return [
    {
      due_to: [makeCoughFinding()], // Due to cough
      tasks: RESPIRATORY_CHECK_FOR_CONDITIONS.map(makeCheckForTask),
    },
  ]
}

// =============================================================================
// ASSIGN PRIORITY - TEWS scoring and priority table
// =============================================================================

/**
 * Mock vitals data for assign priority table.
 * TEWS = 5 (Very Urgent):
 * - Respiratory rate: 32 bpm (score 3)
 * - Temperature: 39°C (score 2)
 * - Heart rate: 95 bpm (score 0)
 * - Blood pressure: 120/80 (score 0)
 * - Mobility: Walking (score 0)
 * - Consciousness: Alert (score 0)
 * - Trauma: No (score 0)
 */
export function getTutorialAssignPriorityData(): {
  vitals: TriageAssignPriorityTableRow[]
  with_triage_level_findings: RenderedFindingRelativeToHealthWorker[]
  total_score: number
  priority: Priority
} {
  const vitals: TriageAssignPriorityTableRow[] = [
    // Assessments first
    {
      type: 'assessment',
      organization_id: 'tutorial-org-001',
      finding: {
        type: 'finding',
        id: 'tutorial-assessment-mobility',
        created_at: new Date(),
        patient_encounter_id: 'tutorial-encounter-001',
        root_snomed_concept_id: '301438001',
        root_snomed_concept_name: 'Ability to mobilize',
        root_snomed_concept_category: 'observable entity',
        specific_snomed_concept_id: '165245003',
        specific_snomed_concept_name: 'Able to walk',
        specific_snomed_concept_category: 'finding',
        value: null,
        modifiers: [],
        attributes: [],
        displays: {
          finding: 'Mobility',
          value: 'Walking',
          full: 'Mobility: Walking',
        },
        evaluations: [{
          id: 'tutorial-eval-mobility',
          created_at: new Date(),
          patient_encounter_id: 'tutorial-encounter-001',
          root_snomed_concept_id: '301438001',
          root_snomed_concept_name: 'Assessment of mobility',
          root_snomed_concept_category: 'observable entity',
          specific_snomed_concept_id: '301438001',
          specific_snomed_concept_name: 'Assessment of mobility',
          specific_snomed_concept_category: 'observable entity',
          value: { type: 'score', value: 0 },
          displays: { finding: 'Mobility', value: '0', full: 'Mobility: 0' },
        }],
        destination_relations: [],
        priority: null,
        score: 0,
        existence: 'Yes',
        provider: MOCK_PROVIDER_IS_ME,
        as_part_of_procedure: {
          id: 'tutorial-vitals-procedure',
          root_snomed_concept_id: '225390008',
          root_snomed_concept_name: 'Triage',
          root_snomed_concept_category: 'procedure',
          specific_snomed_concept_id: '225390008',
          specific_snomed_concept_name: 'Triage',
          specific_snomed_concept_category: 'procedure',
          workflow_step_name: 'Measure Vitals',
        },
      },
      previous: null,
    },
    {
      type: 'assessment',
      organization_id: 'tutorial-org-001',
      finding: {
        type: 'finding',
        id: 'tutorial-assessment-consciousness',
        created_at: new Date(),
        patient_encounter_id: 'tutorial-encounter-001',
        root_snomed_concept_id: '365933000',
        root_snomed_concept_name: 'Level of consciousness',
        root_snomed_concept_category: 'observable entity',
        specific_snomed_concept_id: '248234008',
        specific_snomed_concept_name: 'Mentally alert',
        specific_snomed_concept_category: 'finding',
        value: null,
        modifiers: [],
        attributes: [],
        displays: {
          finding: 'Consciousness',
          value: 'Alert',
          full: 'Consciousness: Alert',
        },
        evaluations: [{
          id: 'tutorial-eval-consciousness',
          created_at: new Date(),
          patient_encounter_id: 'tutorial-encounter-001',
          root_snomed_concept_id: '365933000',
          root_snomed_concept_name: 'ACVPU scale score',
          root_snomed_concept_category: 'observable entity',
          specific_snomed_concept_id: '365933000',
          specific_snomed_concept_name: 'ACVPU scale score',
          specific_snomed_concept_category: 'observable entity',
          value: { type: 'score', value: 0 },
          displays: { finding: 'Consciousness', value: '0', full: 'Consciousness: 0' },
        }],
        destination_relations: [],
        priority: null,
        score: 0,
        existence: 'Yes',
        provider: MOCK_PROVIDER_IS_ME,
        as_part_of_procedure: {
          id: 'tutorial-vitals-procedure',
          root_snomed_concept_id: '225390008',
          root_snomed_concept_name: 'Triage',
          root_snomed_concept_category: 'procedure',
          specific_snomed_concept_id: '225390008',
          specific_snomed_concept_name: 'Triage',
          specific_snomed_concept_category: 'procedure',
          workflow_step_name: 'Measure Vitals',
        },
      },
      previous: null,
    },
    {
      type: 'assessment',
      organization_id: 'tutorial-org-001',
      finding: {
        type: 'finding',
        id: 'tutorial-assessment-trauma',
        created_at: new Date(),
        patient_encounter_id: 'tutorial-encounter-001',
        root_snomed_concept_id: '404684003',
        root_snomed_concept_name: 'Clinical finding',
        root_snomed_concept_category: 'finding',
        specific_snomed_concept_id: '110259009',
        specific_snomed_concept_name: 'No traumatic injury',
        specific_snomed_concept_category: 'finding',
        value: null,
        modifiers: [],
        attributes: [],
        displays: {
          finding: 'Trauma',
          value: 'No',
          full: 'Trauma: No',
        },
        evaluations: [{
          id: 'tutorial-eval-trauma',
          created_at: new Date(),
          patient_encounter_id: 'tutorial-encounter-001',
          root_snomed_concept_id: '404684003',
          root_snomed_concept_name: 'Trauma score',
          root_snomed_concept_category: 'observable entity',
          specific_snomed_concept_id: '404684003',
          specific_snomed_concept_name: 'Trauma score',
          specific_snomed_concept_category: 'observable entity',
          value: { type: 'score', value: 0 },
          displays: { finding: 'Trauma', value: '0', full: 'Trauma: 0' },
        }],
        destination_relations: [],
        priority: null,
        score: 0,
        existence: 'Yes',
        provider: MOCK_PROVIDER_IS_ME,
        as_part_of_procedure: {
          id: 'tutorial-vitals-procedure',
          root_snomed_concept_id: '225390008',
          root_snomed_concept_name: 'Triage',
          root_snomed_concept_category: 'procedure',
          specific_snomed_concept_id: '225390008',
          specific_snomed_concept_name: 'Triage',
          specific_snomed_concept_category: 'procedure',
          workflow_step_name: 'Measure Vitals',
        },
      },
      previous: null,
    },
    // TEWS measurements
    {
      type: 'measurement',
      organization_id: 'tutorial-org-001',
      finding: {
        type: 'finding',
        id: 'tutorial-vital-respiratory-rate',
        created_at: new Date(),
        patient_encounter_id: 'tutorial-encounter-001',
        root_snomed_concept_id: VITAL_MEASUREMENTS_SNOMED_CONCEPTS.respiratory_rate.id,
        root_snomed_concept_name: 'Respiratory rate',
        root_snomed_concept_category: 'observable entity',
        specific_snomed_concept_id: VITAL_MEASUREMENTS_SNOMED_CONCEPTS.respiratory_rate.id,
        specific_snomed_concept_name: 'Respiratory rate',
        specific_snomed_concept_category: 'observable entity',
        value: { type: 'measurement', value: '32', units: 'bpm' },
        modifiers: [],
        attributes: [],
        displays: {
          finding: 'Respiratory rate',
          value: '32 bpm',
          full: 'Respiratory rate: 32 bpm',
        },
        evaluations: [],
        destination_relations: [],
        priority: null,
        score: 3, // >30 bpm = 3 points
        existence: 'Yes',
        provider: MOCK_PROVIDER_IS_ME,
        as_part_of_procedure: {
          id: 'tutorial-vitals-procedure',
          root_snomed_concept_id: '225390008',
          root_snomed_concept_name: 'Triage',
          root_snomed_concept_category: 'procedure',
          specific_snomed_concept_id: '225390008',
          specific_snomed_concept_name: 'Triage',
          specific_snomed_concept_category: 'procedure',
          workflow_step_name: 'Measure Vitals',
        },
      },
      previous: null,
      reference_ranges: [
        { low: 0, high: 9, color: 'orange' },
        { low: 9, high: 15, color: 'green' },
        { low: 15, high: 21, color: 'yellow' },
        { low: 21, high: 30, color: 'orange' },
        { low: 30, high: 60, color: 'red' },
      ],
    },
    {
      type: 'measurement',
      organization_id: 'tutorial-org-001',
      finding: {
        type: 'finding',
        id: 'tutorial-vital-heart-rate',
        created_at: new Date(),
        patient_encounter_id: 'tutorial-encounter-001',
        root_snomed_concept_id: VITAL_MEASUREMENTS_SNOMED_CONCEPTS.heart_rate.id,
        root_snomed_concept_name: 'Heart rate',
        root_snomed_concept_category: 'observable entity',
        specific_snomed_concept_id: VITAL_MEASUREMENTS_SNOMED_CONCEPTS.heart_rate.id,
        specific_snomed_concept_name: 'Heart rate',
        specific_snomed_concept_category: 'observable entity',
        value: { type: 'measurement', value: '95', units: 'bpm' },
        modifiers: [],
        attributes: [],
        displays: {
          finding: 'Heart rate',
          value: '95 bpm',
          full: 'Heart rate: 95 bpm',
        },
        evaluations: [],
        destination_relations: [],
        priority: null,
        score: 0, // 51-101 = 0 points
        existence: 'Yes',
        provider: MOCK_PROVIDER_IS_ME,
        as_part_of_procedure: {
          id: 'tutorial-vitals-procedure',
          root_snomed_concept_id: '225390008',
          root_snomed_concept_name: 'Triage',
          root_snomed_concept_category: 'procedure',
          specific_snomed_concept_id: '225390008',
          specific_snomed_concept_name: 'Triage',
          specific_snomed_concept_category: 'procedure',
          workflow_step_name: 'Measure Vitals',
        },
      },
      previous: null,
      reference_ranges: [
        { low: 0, high: 41, color: 'orange' },
        { low: 41, high: 51, color: 'yellow' },
        { low: 51, high: 101, color: 'green' },
        { low: 101, high: 111, color: 'yellow' },
        { low: 111, high: 130, color: 'orange' },
        { low: 130, high: 250, color: 'red' },
      ],
    },
    {
      type: 'measurement',
      organization_id: 'tutorial-org-001',
      finding: {
        type: 'finding',
        id: 'tutorial-vital-bp-systolic',
        created_at: new Date(),
        patient_encounter_id: 'tutorial-encounter-001',
        root_snomed_concept_id: VITAL_MEASUREMENTS_SNOMED_CONCEPTS.blood_pressure_systolic.id,
        root_snomed_concept_name: 'Systolic blood pressure',
        root_snomed_concept_category: 'observable entity',
        specific_snomed_concept_id: VITAL_MEASUREMENTS_SNOMED_CONCEPTS.blood_pressure_systolic.id,
        specific_snomed_concept_name: 'Systolic blood pressure',
        specific_snomed_concept_category: 'observable entity',
        value: { type: 'measurement', value: '120', units: 'mmHg' },
        modifiers: [],
        attributes: [],
        displays: {
          finding: 'Systolic BP',
          value: '120 mmHg',
          full: 'Systolic BP: 120 mmHg',
        },
        evaluations: [],
        destination_relations: [],
        priority: null,
        score: 0, // 101-200 = 0 points
        existence: 'Yes',
        provider: MOCK_PROVIDER_IS_ME,
        as_part_of_procedure: {
          id: 'tutorial-vitals-procedure',
          root_snomed_concept_id: '225390008',
          root_snomed_concept_name: 'Triage',
          root_snomed_concept_category: 'procedure',
          specific_snomed_concept_id: '225390008',
          specific_snomed_concept_name: 'Triage',
          specific_snomed_concept_category: 'procedure',
          workflow_step_name: 'Measure Vitals',
        },
      },
      previous: null,
      reference_ranges: [
        { low: 0, high: 71, color: 'red' },
        { low: 71, high: 81, color: 'orange' },
        { low: 81, high: 101, color: 'yellow' },
        { low: 101, high: 200, color: 'green' },
        { low: 200, high: 300, color: 'orange' },
      ],
    },
    {
      type: 'measurement',
      organization_id: 'tutorial-org-001',
      finding: {
        type: 'finding',
        id: 'tutorial-vital-temperature',
        created_at: new Date(),
        patient_encounter_id: 'tutorial-encounter-001',
        root_snomed_concept_id: VITAL_MEASUREMENTS_SNOMED_CONCEPTS.temperature.id,
        root_snomed_concept_name: 'Body temperature',
        root_snomed_concept_category: 'observable entity',
        specific_snomed_concept_id: VITAL_MEASUREMENTS_SNOMED_CONCEPTS.temperature.id,
        specific_snomed_concept_name: 'Body temperature',
        specific_snomed_concept_category: 'observable entity',
        value: { type: 'measurement', value: '39', units: '°C' },
        modifiers: [],
        attributes: [],
        displays: {
          finding: 'Temperature',
          value: '39 °C',
          full: 'Temperature: 39 °C',
        },
        evaluations: [],
        destination_relations: [],
        priority: null,
        score: 2, // >38.5 = 2 points
        existence: 'Yes',
        provider: MOCK_PROVIDER_IS_ME,
        as_part_of_procedure: {
          id: 'tutorial-vitals-procedure',
          root_snomed_concept_id: '225390008',
          root_snomed_concept_name: 'Triage',
          root_snomed_concept_category: 'procedure',
          specific_snomed_concept_id: '225390008',
          specific_snomed_concept_name: 'Triage',
          specific_snomed_concept_category: 'procedure',
          workflow_step_name: 'Measure Vitals',
        },
      },
      previous: null,
      reference_ranges: [
        { low: 30, high: 35, color: 'orange' },
        { low: 35, high: 38.5, color: 'green' },
        { low: 38.5, high: 42, color: 'orange' },
      ],
    },
    // Other measurements (no TEWS score)
    {
      type: 'measurement',
      organization_id: 'tutorial-org-001',
      finding: {
        type: 'finding',
        id: 'tutorial-vital-bp-diastolic',
        created_at: new Date(),
        patient_encounter_id: 'tutorial-encounter-001',
        root_snomed_concept_id: VITAL_MEASUREMENTS_SNOMED_CONCEPTS.blood_pressure_diastolic.id,
        root_snomed_concept_name: 'Diastolic blood pressure',
        root_snomed_concept_category: 'observable entity',
        specific_snomed_concept_id: VITAL_MEASUREMENTS_SNOMED_CONCEPTS.blood_pressure_diastolic.id,
        specific_snomed_concept_name: 'Diastolic blood pressure',
        specific_snomed_concept_category: 'observable entity',
        value: { type: 'measurement', value: '80', units: 'mmHg' },
        modifiers: [],
        attributes: [],
        displays: {
          finding: 'Diastolic BP',
          value: '80 mmHg',
          full: 'Diastolic BP: 80 mmHg',
        },
        evaluations: [],
        destination_relations: [],
        priority: null,
        score: null,
        existence: 'Yes',
        provider: MOCK_PROVIDER_IS_ME,
        as_part_of_procedure: {
          id: 'tutorial-vitals-procedure',
          root_snomed_concept_id: '225390008',
          root_snomed_concept_name: 'Triage',
          root_snomed_concept_category: 'procedure',
          specific_snomed_concept_id: '225390008',
          specific_snomed_concept_name: 'Triage',
          specific_snomed_concept_category: 'procedure',
          workflow_step_name: 'Measure Vitals',
        },
      },
      previous: null,
      reference_ranges: [
        { low: 40, high: 60, color: 'yellow' },
        { low: 60, high: 90, color: 'green' },
        { low: 90, high: 120, color: 'yellow' },
      ],
    },
    {
      type: 'measurement',
      organization_id: 'tutorial-org-001',
      finding: {
        type: 'finding',
        id: 'tutorial-vital-spo2',
        created_at: new Date(),
        patient_encounter_id: 'tutorial-encounter-001',
        root_snomed_concept_id: VITAL_MEASUREMENTS_SNOMED_CONCEPTS.blood_oxygen_saturation.id,
        root_snomed_concept_name: 'Oxygen saturation',
        root_snomed_concept_category: 'observable entity',
        specific_snomed_concept_id: VITAL_MEASUREMENTS_SNOMED_CONCEPTS.blood_oxygen_saturation.id,
        specific_snomed_concept_name: 'Oxygen saturation',
        specific_snomed_concept_category: 'observable entity',
        value: { type: 'measurement', value: '98', units: '%' },
        modifiers: [],
        attributes: [],
        displays: {
          finding: 'SpO2',
          value: '98%',
          full: 'SpO2: 98%',
        },
        evaluations: [],
        destination_relations: [],
        priority: null,
        score: null,
        existence: 'Yes',
        provider: MOCK_PROVIDER_IS_ME,
        as_part_of_procedure: {
          id: 'tutorial-vitals-procedure',
          root_snomed_concept_id: '225390008',
          root_snomed_concept_name: 'Triage',
          root_snomed_concept_category: 'procedure',
          specific_snomed_concept_id: '225390008',
          specific_snomed_concept_name: 'Triage',
          specific_snomed_concept_category: 'procedure',
          workflow_step_name: 'Measure Vitals',
        },
      },
      previous: null,
      reference_ranges: [
        { low: 80, high: 92, color: 'red' },
        { low: 92, high: 95, color: 'yellow' },
        { low: 95, high: 100, color: 'green' },
      ],
    },
  ]

  // Warning sign finding (cough) for the "with_triage_level_findings"
  const with_triage_level_findings: RenderedFindingRelativeToHealthWorker[] = [
    makeCoughFinding(),
  ]

  return {
    vitals,
    with_triage_level_findings,
    total_score: 5, // 3 (respiratory) + 2 (temperature)
    priority: 'Very urgent',
  }
}

// =============================================================================
// SIDEBAR HELPERS
// =============================================================================

/**
 * Convert selected warning signs to sidebar finding records.
 */
function makeCoughFinding(): RenderedFindingRelativeToHealthWorker {
  return {
    type: 'finding',
    id: 'tutorial-finding-cough',
    created_at: new Date(),
    patient_encounter_id: 'tutorial-encounter-001',
    root_snomed_concept_id: '404684003',
    root_snomed_concept_name: 'Clinical finding',
    root_snomed_concept_category: 'finding',
    specific_snomed_concept_id: 'tutorial-snomed-cough',
    specific_snomed_concept_name: 'Cough',
    specific_snomed_concept_category: 'finding',
    value: null,
    modifiers: [],
    attributes: [],
    displays: {
      finding: 'Cough',
      value: null,
      full: 'Cough',
    },
    evaluations: [],
    destination_relations: [],
    priority: null,
    score: null,
    existence: 'Yes',
    provider: MOCK_PROVIDER_IS_ME,
    as_part_of_procedure: {
      id: 'tutorial-triage-001',
      root_snomed_concept_id: '225390008',
      root_snomed_concept_name: 'Triage',
      root_snomed_concept_category: 'procedure',
      specific_snomed_concept_id: '225390008',
      specific_snomed_concept_name: 'Triage',
      specific_snomed_concept_category: 'procedure',
      workflow_step_name: 'Warning Signs',
    },
  }
}

/**
 * Convert brief history findings to sidebar records.
 */
// function makeBriefHistoryRecords(): RenderedFindingRelativeToHealthWorker[] {
//   return Object.values(TUTORIAL_BRIEF_HISTORY_COMMON_CONDITIONS).filter(
//     (f): f is RenderedBriefHistoryRelativeToHealthWorker => f !== undefined,
//   )
// }

/**
 * Build sidebar findings based on current tutorial step.
 * Each step accumulates findings from previous steps.
 */
export function buildSidebarFindings(
  currentStep: TutorialStep,
  hasSelectedCough: boolean,
): RenderedSidebarWorkflow[] {
  const steps: RenderedSidebarWorkflow['steps'] = []

  // Warning signs step
  if (currentStep === 'warning_signs') {
    steps.push({
      workflow_step: 'warning_signs',
      title: 'Warning Signs',
      status: 'in progress',
      records: hasSelectedCough ? [makeCoughFinding()] : [],
    })
  } else if (isStepCompleted(currentStep, 'warning_signs')) {
    steps.push({
      workflow_step: 'warning_signs',
      title: 'Warning Signs',
      status: 'completed',
      records: [makeCoughFinding()],
    })
  }

  // // Brief history step
  // if (currentStep === 'brief_history') {
  //   steps.push({
  //     workflow_step: 'brief_history',
  //     title: 'Brief History',
  //     status: 'in progress',
  //     records: makeBriefHistoryRecords(),
  //   })
  // } else if (isStepCompleted(currentStep, 'brief_history')) {
  //   steps.push({
  //     workflow_step: 'brief_history',
  //     title: 'Brief History',
  //     status: 'completed',
  //     records: makeBriefHistoryRecords(),
  //   })
  // }

  // // Height and weight (shown from vitals step onward)
  // if (isStepCompleted(currentStep, 'brief_history') || currentStep === 'vitals') {
  //   steps.push({
  //     workflow_step: 'height_and_weight',
  //     title: 'Height and Weight',
  //     status: 'completed',
  //     records: TUTORIAL_HEIGHT_WEIGHT,
  //   })
  // }

  // Vitals step
  if (currentStep === 'vitals') {
    steps.push({
      workflow_step: 'measure_vitals',
      title: 'Measure Vitals',
      status: 'in progress',
      records: [],
    })
  } else if (isStepCompleted(currentStep, 'vitals')) {
    steps.push({
      workflow_step: 'measure_vitals',
      title: 'Measure Vitals',
      status: 'completed',
      records: TUTORIAL_SIDEBAR_VITALS,
    })
  }

  // Additional tasks step
  if (currentStep === 'additional_tasks') {
    steps.push({
      workflow_step: 'additional_tasks',
      title: 'Additional Tasks',
      status: 'in progress',
      records: [],
    })
  } else if (isStepCompleted(currentStep, 'additional_tasks')) {
    steps.push({
      workflow_step: 'additional_tasks',
      title: 'Additional Tasks',
      status: 'completed',
      records: [],
    })
  }

  // Assign priority step
  if (currentStep === 'assign_priority') {
    steps.push({
      workflow_step: 'assign_priority',
      title: 'Assign Priority',
      status: 'in progress',
      records: [],
    })
  } else if (isStepCompleted(currentStep, 'assign_priority')) {
    steps.push({
      workflow_step: 'assign_priority',
      title: 'Assign Priority',
      status: 'completed',
      records: [],
    })
  }

  // Route patient step
  if (currentStep === 'route_patient') {
    steps.push({
      workflow_step: 'route_patient',
      title: 'Route Patient',
      status: 'in progress',
      records: [],
    })
  } else if (isStepCompleted(currentStep, 'route_patient')) {
    steps.push({
      workflow_step: 'route_patient',
      title: 'Route Patient',
      status: 'completed',
      records: [],
    })
  }

  return [
    {
      workflow: 'triage',
      status: currentStep === 'complete' ? 'completed' : 'in progress',
      steps,
    },
  ]
}

// =============================================================================
// ROUTE PATIENT - Mock data for routing after triage
// =============================================================================

/**
 * Get props for RegistrationRoutePatientSection.
 * Pre-configured with Duduzile's info and Bongani as senior health worker.
 */
export function getTutorialRoutePatientData() {
  return {
    this_visit: {
      reason: 'seeking treatment' as const,
      notes: null as string | null | undefined,
    },
    patient_names: TUTORIAL_PATIENT.names,
    can_do_triage: true,
    senior_health_worker_name: 'Bongani Sibeko',
  }
}

// =============================================================================
// EMPTY PATIENT HISTORY (for layout)
// =============================================================================

export const EMPTY_PATIENT_HISTORY = {
  pre_existing_conditions: [],
  allergies: TUTORIAL_BRIEF_HISTORY_ALLERGIES,
  family_history: [],
  major_surgeries: [],
  medications: [],
  lifestyle: [],
}
