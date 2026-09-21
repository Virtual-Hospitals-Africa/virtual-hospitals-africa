import type { Priority } from '../priorities.ts'
import type {
  RenderedCareTeamHealthWorker,
  RenderedEmployee,
  RenderedEvaluationRelativeToHealthWorker,
  RenderedFindingRelativeToHealthWorker,
  RenderedPatientCompletedRegistration,
  RenderedPatientHistory,
  RenderedSidebarWorkflow,
  RenderedWaitingRoom,
  TriageAssignPriorityTableRow,
  WarningSignWithMaybeRecord,
} from '../../types.ts'
import type { ConsultationTutorialStep } from './types.ts'
import { isStepCompleted } from './state.ts'
import type { BillingClaim } from './billing.ts'
import { WARNING_SIGNS } from '../warning_signs.ts'
import { COMMON_SYMPTOMS } from '../common_symptoms.ts'
import { normalForm } from '../s_expression.ts'

// =============================================================================
// ORGANIZATION
// =============================================================================

const TUTORIAL_ORG = {
  id: 'consult-tutorial-org-001',
  name: 'Pretoria East Medical Centre',
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
}

// =============================================================================
// PATIENT
// =============================================================================

export const CONSULTATION_PATIENT: RenderedPatientCompletedRegistration = {
  id: 'consult-patient-001',
  sex: 'female',
  gender: null,
  national_id_number: null,
  completed_registration: true,
  date_of_birth: '1974-03-15',
  dob_formatted: '15 March 1974',
  name: 'Nomsa Ndlovu',
  names: {
    name: 'Nomsa Ndlovu',
    first_names: 'Nomsa',
    surname: 'Ndlovu',
    preferred_name: 'Nomsa',
  },
  description: 'female \u2022 15 March 1974',
  age_display: '52 years',
  age_years: 52,
  age_days: 19125,
  avatar_url: '/ndlovu.png',
  preferred_language_code_iso_639_2_b: 'eng',
  most_recent_height: { cm: '162', taken_at: '2025-06-01T00:00:00.000Z' },
  most_recent_weight: { kg: '71', taken_at: '2025-06-01T00:00:00.000Z' },
}

// =============================================================================
// EMPLOYEE (Primary Care Doctor)
// =============================================================================

export const CONSULTATION_EMPLOYEE: RenderedEmployee = {
  name: 'Dr. Lufuno Zungu',
  first_names: 'Lufuno',
  surname: 'Zungu',
  preferred_name: 'Lufuno',
  email: 'lufuno@virtualhospitals.africa',
  avatar_url: '/lufuno.png',
  phone_number: null,
  id: 'consult-hw-001',
  demographics: {
    sex: null,
    gender: null,
    date_of_birth: null,
  },
  contact_details: {
    mobile_phone_number: null,
    address: null,
  },
  ever_licensed_as_doctor: 1,
  organizations: [{
    ...TUTORIAL_ORG,
    employment_id: 'consult-emp-001',
    seniority_order: 1,
    role: 'doctor',
    is_admin: false,
    in_departments: [],
    active_licences: [{
      id: 'consult-licence-001',
      created_at: new Date(),
      updated_at: '2025-01-01T00:00:00.000Z',
      licence_number: 'MP-2020-12345',
      regulatory_agency: {
        name: 'Health Professions Council of South Africa',
        acronym: 'HPCSA',
        country: 'ZA',
      },
      profession: 'Doctor',
      specialty: 'General Practice',
      subspecialty: null,
      start_date: '2020-01-01',
      expiry_date: '2027-01-01',
      status: 'active',
      revoked: null,
    }],
    hrefs: {
      regulator_view: '/consultation-tutorial',
      health_worker_view: '/consultation-tutorial',
    },
  }],
  organization_id: TUTORIAL_ORG.id,
  seniority_order: 1,
  employee_id: 'consult-emp-001',
  role: 'doctor',
  is_admin: false,
  href: '/consultation-tutorial',
}

const MOCK_PROVIDER_IS_ME = {
  ...CONSULTATION_EMPLOYEE,
  is_me: 1 as const,
}

const EXTERNAL_ORG_BASE = {
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
  seniority_order: 1,
  is_admin: false,
  role: 'doctor',
  in_departments: [] as { id: string; name: string }[],
  active_licences: [] as RenderedFindingRelativeToHealthWorker['provider']['organizations'][0]['active_licences'],
  hrefs: { regulator_view: '#', health_worker_view: '#' },
}

const MOCK_PROVIDER_EXTERNAL_LAB: RenderedFindingRelativeToHealthWorker['provider'] = {
  ...CONSULTATION_EMPLOYEE,
  id: 'ext-hw-001',
  name: 'Dr. T. Mokoena',
  first_names: 'Thabiso',
  surname: 'Mokoena',
  preferred_name: 'Thabiso',
  avatar_url: '/images/avatars/random/male/5.png',
  organizations: [{
    ...EXTERNAL_ORG_BASE,
    id: 'ext-org-lab',
    name: 'Johannesburg District Lab',
    employment_id: 'ext-emp-001',
  }],
  organization_id: 'ext-org-lab',
  employee_id: 'ext-emp-001',
  is_me: 0 as const,
}

const MOCK_PROVIDER_EXTERNAL_HOSPITAL: RenderedFindingRelativeToHealthWorker['provider'] = {
  ...CONSULTATION_EMPLOYEE,
  id: 'ext-hw-002',
  name: 'Dr. N. Sithole',
  first_names: 'Nompumelelo',
  surname: 'Sithole',
  preferred_name: 'Nompumelelo',
  avatar_url: '/images/avatars/random/female/7.png',
  organizations: [{
    ...EXTERNAL_ORG_BASE,
    id: 'ext-org-hospital',
    name: 'Central Hospital Pretoria',
    employment_id: 'ext-emp-002',
  }],
  organization_id: 'ext-org-hospital',
  employee_id: 'ext-emp-002',
  is_me: 0 as const,
}

// =============================================================================
// CARE TEAM
// =============================================================================

export const CONSULTATION_CARE_TEAM: RenderedCareTeamHealthWorker[] = [
  {
    employment_id: 'consult-emp-001',
    health_worker_id: 'consult-hw-001',
    name: 'Dr. Lufuno Zungu',
    role: 'doctor',
    specialty: 'General Practice',
    avatar_url: '/lufuno.png',
    last_visit_relative_to_now: null,
    organization: { id: TUTORIAL_ORG.id, name: TUTORIAL_ORG.name },
  },
]

// =============================================================================
// INSURANCE
// =============================================================================

export const CONSULTATION_INSURANCE = {
  id: 'consult-insurance-001',
  insurance_provider: 'Discovery Health',
  plan_name: 'KeyCare Plus',
  membership_number: 'DH-2024-889012',
  valid_from: '2024-01-01',
  expire_date: '2025-12-31',
  is_dependent: false,
}

// =============================================================================
// WAITING ROOM
// =============================================================================

export const CONSULTATION_WAITING_ROOM: RenderedWaitingRoom[] = [
  {
    patient_encounter_id: 'consult-encounter-nomsa',
    patient: {
      id: 'consult-patient-001',
      name: 'Nomsa Ndlovu',
      avatar_url: '/ndlovu.png',
      description: 'female \u2022 15 March 1974',
    },
    room: {
      id: 'consult-room-waiting',
      name: 'Waiting Room',
    },
    actions: [{
      text: 'Start Consultation',
      href: '#step=registration&index=0&action=tutorial',
    }],
    reason: 'seeking treatment',
    workflow_status_display: 'Awaiting Consultation',
    arrived_timestamp: new Date(Date.now() - 12 * 60 * 1000),
    arrived_ago_display: '12 minutes ago',
    target_treatment_time: null,
    department_name: 'Primary care',
    priority: {
      name: 'Non-urgent',
      value_snomed_concept_id: '17621005',
      target_treatment_time: null,
      records: [],
      created_at: new Date(),
      based_on_system_priority_evaluation_description: null,
    },
    present_employees: [],
  },
  {
    patient_encounter_id: 'consult-encounter-sibusiso',
    patient: {
      id: 'consult-patient-002',
      name: 'Sibusiso Khumalo',
      avatar_url: '/images/avatars/random/male/2.png',
      description: 'male \u2022 22 August 1988',
    },
    room: {
      id: 'consult-room-1',
      name: 'Consultation Room 1',
    },
    actions: [{ text: 'View', href: '#' }],
    reason: 'follow up',
    workflow_status_display: 'In Consultation',
    arrived_timestamp: new Date(Date.now() - 30 * 60 * 1000),
    arrived_ago_display: '30 minutes ago',
    target_treatment_time: null,
    department_name: 'Primary care',
    priority: {
      name: 'Non-urgent',
      value_snomed_concept_id: '394848005',
      target_treatment_time: null,
      records: [],
      created_at: new Date(),
      based_on_system_priority_evaluation_description: null,
    },
    present_employees: [],
  },
  {
    patient_encounter_id: 'consult-encounter-zanele',
    patient: {
      id: 'consult-patient-003',
      name: 'Zanele Mthembu',
      avatar_url: '/images/avatars/random/female/8.png',
      description: 'female \u2022 3 December 1995',
    },
    room: {
      id: 'consult-room-waiting',
      name: 'Waiting Room',
    },
    actions: [{ text: 'View', href: '#' }],
    reason: 'seeking treatment',
    workflow_status_display: 'Awaiting Triage',
    arrived_timestamp: new Date(Date.now() - 8 * 60 * 1000),
    arrived_ago_display: '8 minutes ago',
    target_treatment_time: null,
    department_name: 'Primary care',
    priority: null,
    present_employees: [],
  },
]

// =============================================================================
// FINDINGS — This Visit
// =============================================================================

const CONSULTATION_PROCEDURE = {
  id: 'consult-procedure-001',
  root_snomed_concept_id: '185349003',
  root_snomed_concept_name: 'Encounter for problem',
  root_snomed_concept_category: 'procedure' as const,
  specific_snomed_concept_id: '185349003',
  specific_snomed_concept_name: 'Encounter for problem',
  specific_snomed_concept_category: 'procedure' as const,
  workflow_step_name: null,
}

function make_finding(overrides: {
  id: string
  name: string
  snomed_id: string
  display_value?: string | null
  workflow_step_name?: string
  provider?: RenderedFindingRelativeToHealthWorker['provider']
}): RenderedFindingRelativeToHealthWorker {
  const display_full = overrides.display_value ? `${overrides.name}: ${overrides.display_value}` : overrides.name
  return {
    type: 'finding',
    id: overrides.id,
    created_at: new Date(),
    patient_encounter_id: 'consult-encounter-nomsa',
    root_snomed_concept_id: '404684003',
    root_snomed_concept_name: 'Clinical finding',
    root_snomed_concept_category: 'finding' as const,
    specific_snomed_concept_id: overrides.snomed_id,
    specific_snomed_concept_name: overrides.name,
    specific_snomed_concept_category: 'finding' as const,
    value: overrides.display_value
      ? {
        type: 'measurement' as const,
        value: overrides.display_value,
        units: '',
      }
      : null,
    modifiers: [],
    attributes: [],
    displays: {
      finding: overrides.name,
      value: overrides.display_value ?? null,
      full: display_full,
    },
    evaluations: [],
    destination_relations: [],
    priority: null,
    score: null,
    existence: 'Yes',
    provider: overrides.provider ?? MOCK_PROVIDER_IS_ME,
    as_part_of_procedure: {
      ...CONSULTATION_PROCEDURE,
      workflow_step_name: overrides.workflow_step_name ?? null,
    },
  }
}

// Chief complaint findings (from triage)
const FINDING_FATIGUE = make_finding({
  id: 'consult-finding-fatigue',
  name: 'Fatigue',
  snomed_id: '84229001',
  workflow_step_name: 'Chief Complaint',
})

const FINDING_BONE_PAIN = make_finding({
  id: 'consult-finding-bone-pain',
  name: 'Bone pain',
  snomed_id: '12584003',
  workflow_step_name: 'Chief Complaint',
})

const FINDING_POLYURIA = make_finding({
  id: 'consult-finding-polyuria',
  name: 'Polyuria',
  snomed_id: '56574000',
  workflow_step_name: 'Chief Complaint',
})

const FINDING_MUSCLE_WEAKNESS = make_finding({
  id: 'consult-finding-muscle-weakness',
  name: 'Muscle weakness',
  snomed_id: '26544005',
  workflow_step_name: 'Chief Complaint',
})

// Vitals findings (from triage)
const FINDING_BP = make_finding({
  id: 'consult-finding-bp',
  name: 'Blood pressure',
  snomed_id: '75367002',
  display_value: '145/92 mmHg',
  workflow_step_name: 'Measure Vitals',
})

const FINDING_HR = make_finding({
  id: 'consult-finding-hr',
  name: 'Heart rate',
  snomed_id: '364075005',
  display_value: '78 bpm',
  workflow_step_name: 'Measure Vitals',
})

const FINDING_TEMP = make_finding({
  id: 'consult-finding-temp',
  name: 'Temperature',
  snomed_id: '386725007',
  display_value: '36.8 \u00b0C',
  workflow_step_name: 'Measure Vitals',
})

const FINDING_SPO2 = make_finding({
  id: 'consult-finding-spo2',
  name: 'Oxygen saturation',
  snomed_id: '431314004',
  display_value: '98%',
  workflow_step_name: 'Measure Vitals',
})

// Examination findings (from consultation)
const FINDING_MUSCLE_TENDERNESS = make_finding({
  id: 'consult-finding-muscle-tenderness',
  name: 'Muscle tenderness',
  snomed_id: '68962001',
  workflow_step_name: 'Examinations',
})

const FINDING_PROXIMAL_WEAKNESS = make_finding({
  id: 'consult-finding-proximal-weakness',
  name: 'Decreased proximal muscle strength',
  snomed_id: '249937002',
  workflow_step_name: 'Examinations',
})

// Lab results
const FINDING_CALCIUM = make_finding({
  id: 'consult-finding-calcium',
  name: 'Serum calcium',
  snomed_id: '271236005',
  display_value: '3.1 mmol/L (elevated)',
  workflow_step_name: 'Diagnostic Tests',
})

const FINDING_PTH = make_finding({
  id: 'consult-finding-pth',
  name: 'Parathyroid hormone',
  snomed_id: '4076007',
  display_value: '12.5 pmol/L (elevated)',
  workflow_step_name: 'Diagnostic Tests',
})

const FINDING_PHOSPHATE = make_finding({
  id: 'consult-finding-phosphate',
  name: 'Serum phosphate',
  snomed_id: '271241001',
  display_value: '0.7 mmol/L (low)',
  workflow_step_name: 'Diagnostic Tests',
})

const FINDING_VITAMIN_D = make_finding({
  id: 'consult-finding-vitd',
  name: 'Vitamin D (25-OH)',
  snomed_id: '104208005',
  display_value: '45 nmol/L (normal)',
  workflow_step_name: 'Diagnostic Tests',
})

const FINDING_CREATININE = make_finding({
  id: 'consult-finding-creatinine',
  name: 'Serum creatinine',
  snomed_id: '70901006',
  display_value: '85 \u00b5mol/L (normal)',
  workflow_step_name: 'Diagnostic Tests',
})

const FINDING_EGFR = make_finding({
  id: 'consult-finding-egfr',
  name: 'eGFR',
  snomed_id: '80274001',
  display_value: '72 mL/min (mildly reduced)',
  workflow_step_name: 'Diagnostic Tests',
})

// =============================================================================
// FINDINGS — Cross-Facility (Patient History)
// =============================================================================

const HISTORY_CALCIUM_EXTERNAL = make_finding({
  id: 'consult-history-calcium',
  name: 'Serum calcium',
  snomed_id: '271236005',
  display_value: '2.9 mmol/L (borderline elevated)',
  provider: MOCK_PROVIDER_EXTERNAL_LAB,
})

const HISTORY_CREATININE_EXTERNAL = make_finding({
  id: 'consult-history-creatinine',
  name: 'Serum creatinine',
  snomed_id: '70901006',
  display_value: '82 \u00b5mol/L (normal)',
  provider: MOCK_PROVIDER_EXTERNAL_HOSPITAL,
})

// Override created_at for history items
HISTORY_CALCIUM_EXTERNAL.created_at = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) // 6 months ago
HISTORY_CREATININE_EXTERNAL.created_at = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // 1 year ago

// =============================================================================
// DIAGNOSIS
// =============================================================================

export const CONSULTATION_DIAGNOSIS: RenderedEvaluationRelativeToHealthWorker = {
  type: 'evaluation',
  id: 'consult-diagnosis-001',
  created_at: new Date(),
  patient_encounter_id: 'consult-encounter-nomsa',
  root_snomed_concept_id: '64572001',
  root_snomed_concept_name: 'Disease',
  root_snomed_concept_category: 'disorder' as const,
  specific_snomed_concept_id: '36348003',
  specific_snomed_concept_name: 'Primary hyperparathyroidism',
  specific_snomed_concept_category: 'disorder' as const,
  value: null,
  modifiers: [],
  attributes: [],
  displays: {
    finding: 'Primary hyperparathyroidism',
    value: null,
    full: 'Primary hyperparathyroidism',
  },
  evaluations: [],
  destination_relations: [],
  priority: null,
  employment_id: 'consult-emp-001',
  provider: MOCK_PROVIDER_IS_ME,
  as_part_of_procedure: CONSULTATION_PROCEDURE,
}

// =============================================================================
// PATIENT HISTORY
// =============================================================================

export const CONSULTATION_PATIENT_HISTORY: RenderedPatientHistory = {
  pre_existing_conditions: [],
  allergies: [],
  family_history: [],
  major_surgeries: [],
  medications: [],
  lifestyle: [],
  lab_results: [HISTORY_CALCIUM_EXTERNAL, HISTORY_CREATININE_EXTERNAL],
}

export const EMPTY_CONSULTATION_HISTORY: RenderedPatientHistory = {
  pre_existing_conditions: [],
  allergies: [],
  family_history: [],
  major_surgeries: [],
  medications: [],
  lifestyle: [],
  lab_results: [],
}

// =============================================================================
// SIDEBAR BUILDERS
// =============================================================================

const TRIAGE_FINDINGS = [FINDING_FATIGUE, FINDING_BONE_PAIN, FINDING_POLYURIA, FINDING_MUSCLE_WEAKNESS]
const VITAL_FINDINGS = [FINDING_BP, FINDING_HR, FINDING_TEMP, FINDING_SPO2]
const EXAM_FINDINGS = [FINDING_MUSCLE_TENDERNESS, FINDING_PROXIMAL_WEAKNESS]
const LAB_FINDINGS = [FINDING_CALCIUM, FINDING_PTH, FINDING_PHOSPHATE, FINDING_VITAMIN_D, FINDING_CREATININE, FINDING_EGFR]

/**
 * Build sidebar findings for the consultation tutorial based on current step.
 * Earlier steps (chief complaint, vitals, symptoms, history) are shown as completed from triage.
 * Consultation-specific steps show progress.
 */
export function buildSidebarFindings(
  current_step: ConsultationTutorialStep,
): RenderedSidebarWorkflow[] {
  const steps: RenderedSidebarWorkflow['steps'] = []

  // Steps carried over from triage (always completed once we're in consultation)
  const past_triage = current_step !== 'overview' && current_step !== 'registration' &&
    current_step !== 'triage_warning_signs' && current_step !== 'triage_assign_priority'

  if (past_triage) {
    steps.push({
      workflow_step: 'chief_complaint',
      title: 'Chief Complaint',
      status: 'completed',
      records: TRIAGE_FINDINGS,
    })

    steps.push({
      workflow_step: 'vitals',
      title: 'Vitals',
      status: 'completed',
      records: VITAL_FINDINGS,
    })

    steps.push({
      workflow_step: 'symptoms',
      title: 'Symptoms',
      status: 'completed',
      records: [],
    })

    steps.push({
      workflow_step: 'history',
      title: 'History',
      status: 'completed',
      records: [],
    })
  }

  // Examinations
  if (current_step === 'examinations') {
    steps.push({
      workflow_step: 'examinations',
      title: 'Examinations',
      status: 'in progress',
      records: EXAM_FINDINGS,
    })
  } else if (isStepCompleted(current_step, 'examinations')) {
    steps.push({
      workflow_step: 'examinations',
      title: 'Examinations',
      status: 'completed',
      records: EXAM_FINDINGS,
    })
  }

  // Diagnostic tests
  if (current_step === 'diagnostic_tests') {
    steps.push({
      workflow_step: 'diagnostic_tests',
      title: 'Diagnostic Tests',
      status: 'in progress',
      records: LAB_FINDINGS,
    })
  } else if (isStepCompleted(current_step, 'diagnostic_tests')) {
    steps.push({
      workflow_step: 'diagnostic_tests',
      title: 'Diagnostic Tests',
      status: 'completed',
      records: LAB_FINDINGS,
    })
  }

  // Diagnoses
  if (current_step === 'diagnoses') {
    steps.push({
      workflow_step: 'diagnoses',
      title: 'Diagnoses',
      status: 'in progress',
      records: [],
    })
  } else if (isStepCompleted(current_step, 'diagnoses')) {
    steps.push({
      workflow_step: 'diagnoses',
      title: 'Diagnoses',
      status: 'completed',
      records: [],
    })
  }

  if (!past_triage) return []

  return [{
    workflow: 'consultation',
    status: current_step === 'complete' ? 'completed' : 'in progress',
    steps,
  }]
}

/**
 * Build sidebar diagnoses based on current step.
 */
export function buildSidebarDiagnoses(
  current_step: ConsultationTutorialStep,
): RenderedEvaluationRelativeToHealthWorker[] {
  if (isStepCompleted(current_step, 'diagnoses') || current_step === 'diagnoses') {
    return [CONSULTATION_DIAGNOSIS]
  }
  return []
}

// =============================================================================
// BILLING MOCK DATA
// =============================================================================

// =============================================================================
// TRIAGE — Warning Signs (pre-filled for Nomsa)
// =============================================================================

/**
 * Warning signs list with Nomsa's symptoms pre-selected.
 * Uses the full adult warning signs + common symptoms list, with existing_record
 * set for the four presenting symptoms.
 */
export function getConsultationWarningSignsData(): WarningSignWithMaybeRecord[] {
  const symptoms_to_check = new Set(['Fatigue', 'Bone pain', 'Polyuria', 'Muscle weakness'])

  const base_signs: WarningSignWithMaybeRecord[] = [
    ...WARNING_SIGNS.adult.filter((sign) => !sign.name.includes('Pregnancy')),
    ...COMMON_SYMPTOMS,
  ]

  // Add custom symptoms that may not be in standard lists
  const custom_symptoms: WarningSignWithMaybeRecord[] = [...symptoms_to_check].filter(
    (name) => !base_signs.some((s) => s.name === name),
  ).map((name) => ({
    clinical_finding_s_expression: normalForm(`(clinical_finding (snomed_concept "${name}" "finding"))`),
    name,
    description: null,
    category: 'Common Symptoms' as const,
  }))

  const all_signs = [...base_signs, ...custom_symptoms]

  return all_signs.map((sign) => {
    if (symptoms_to_check.has(sign.name)) {
      return {
        ...sign,
        existing_record: {
          id: `consult-warning-${sign.name.toLowerCase().replace(/\s+/g, '-')}`,
          existence: 'Yes' as const,
        },
      }
    }
    return sign
  })
}

// =============================================================================
// TRIAGE — Assign Priority (Non-urgent for Nomsa)
// =============================================================================

export function getConsultationAssignPriorityData(): {
  vitals: TriageAssignPriorityTableRow[]
  total_score: number
  priority: Priority
} {
  // Non-urgent: all vitals within normal or mildly abnormal range, TEWS score = 1
  const vitals: TriageAssignPriorityTableRow[] = [
    {
      type: 'measurement',
      organization_id: TUTORIAL_ORG.id,
      finding: FINDING_HR,
      previous: null,
    },
    {
      type: 'measurement',
      organization_id: TUTORIAL_ORG.id,
      finding: FINDING_BP,
      previous: null,
    },
    {
      type: 'measurement',
      organization_id: TUTORIAL_ORG.id,
      finding: FINDING_TEMP,
      previous: null,
    },
    {
      type: 'measurement',
      organization_id: TUTORIAL_ORG.id,
      finding: FINDING_SPO2,
      previous: null,
    },
  ]

  return {
    vitals,
    total_score: 1,
    priority: 'Non-urgent' as Priority,
  }
}

// =============================================================================
// BILLING MOCK DATA
// =============================================================================

export const CONSULTATION_BILLING_CLAIM: BillingClaim = {
  id: 'consult-claim-001',
  patient_name: 'Nomsa Ndlovu',
  encounter_date: new Date().toISOString().split('T')[0],
  insurance_provider: 'Discovery Health',
  plan_name: 'KeyCare Plus',
  membership_number: 'DH-2024-889012',
  status: 'ready_for_review',
  line_items: [
    {
      id: 'bill-001',
      icd10_code: 'Z00.0',
      description: 'GP Consultation',
      category: 'consultation',
      quantity: 1,
      unit_fee_zar: 450,
      total_fee_zar: 450,
      co_payment_zar: 150,
      insurer_liable_zar: 300,
      requires_pre_auth: false,
    },
    {
      id: 'bill-002',
      icd10_code: 'R79.0',
      description: 'Serum calcium',
      category: 'diagnostic',
      quantity: 1,
      unit_fee_zar: 220,
      total_fee_zar: 220,
      co_payment_zar: 0,
      insurer_liable_zar: 220,
      requires_pre_auth: false,
    },
    {
      id: 'bill-003',
      icd10_code: null,
      description: 'Parathyroid hormone assay',
      category: 'diagnostic',
      quantity: 1,
      unit_fee_zar: 380,
      total_fee_zar: 380,
      co_payment_zar: 0,
      insurer_liable_zar: 380,
      requires_pre_auth: false,
    },
    {
      id: 'bill-004',
      icd10_code: null,
      description: 'Serum phosphate',
      category: 'diagnostic',
      quantity: 1,
      unit_fee_zar: 120,
      total_fee_zar: 120,
      co_payment_zar: 0,
      insurer_liable_zar: 120,
      requires_pre_auth: false,
    },
    {
      id: 'bill-005',
      icd10_code: null,
      description: 'Vitamin D (25-OH)',
      category: 'diagnostic',
      quantity: 1,
      unit_fee_zar: 450,
      total_fee_zar: 450,
      co_payment_zar: 0,
      insurer_liable_zar: 450,
      requires_pre_auth: false,
    },
    {
      id: 'bill-006',
      icd10_code: null,
      description: 'Renal function panel',
      category: 'diagnostic',
      quantity: 1,
      unit_fee_zar: 250,
      total_fee_zar: 250,
      co_payment_zar: 0,
      insurer_liable_zar: 250,
      requires_pre_auth: false,
    },
  ],
  subtotal_zar: 1870,
  total_co_payment_zar: 150,
  total_insurer_liable_zar: 1720,
}
