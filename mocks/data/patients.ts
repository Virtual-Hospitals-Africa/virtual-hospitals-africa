// =============================================================================
// FILE: /mocks/data/patients.ts
// Mock patient data for populating DrawerV4 with diverse patient profiles
// =============================================================================

import type {
  Priority,
  RecordValueLink,
  RenderedCareTeamHealthWorker,
  RenderedFindingRelativeToHealthWorker,
  RenderedPatientCompletedRegistration,
  RenderedPatientHistory,
  RenderedRecordProvider,
  RenderedSidebarWorkflow,
} from '../../types.ts'

// =============================================================================
// HELPER: Mock providers for findings
// =============================================================================

function createMockOrganization(
  employment_id: string,
  role: 'doctor' | 'nurse',
  specialty: string,
  profession: string,
  licence_number: string,
) {
  return {
    id: 'mock-org-001',
    name: 'Virtual Hospitals Africa Demo Clinic',
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
    employment_id,
    role,
    is_admin: false,
    in_departments: [],
    active_licences: [{
      licence_number,
      regulatory_agency: {
        name: role === 'doctor' ? 'Health Professions Council of South Africa' : 'South African Nursing Council',
        acronym: role === 'doctor' ? 'HPCSA' : 'SANC',
        country: 'ZA',
      },
      profession,
      specialty,
      subspecialty: null,
      start_date: '2024-01-01',
      expiry_date: '2027-01-01',
      status: 'active' as const,
      revoked: null,
    }],
    hrefs: {
      regulator_view: '/mock',
      health_worker_view: '/mock',
    },
  }
}

// Primary care Nurse - handles triage and general assessments
const NURSE_PRIMARY_CARE: RenderedRecordProvider = {
  id: 'mock-hw-001',
  name: 'Thandiwe Gumede',
  first_names: 'Thandiwe',
  surname: 'Gumede',
  preferred_name: 'Thandiwe',
  email: 'thandiwe.gumede@vha.africa',
  avatar_url: '/images/avatars/random/female/6.png',
  phone_number: null,
  demographics: { sex: null, gender: null, date_of_birth: null },
  contact_details: { mobile_phone_number: null, address: null },
  ever_licensed_as_doctor: 0,
  organizations: [createMockOrganization('mock-emp-001', 'nurse', 'Primary care', 'Nurse', 'SANC-2024-001')],
  organization_id: 'mock-org-001',
  employee_id: 'mock-emp-001',
  role: 'nurse',
  is_admin: false,
  href: '/mock',
  is_me: 0,
}

// Oncology Nurse - handles cancer-related records
const NURSE_ONCOLOGY: RenderedRecordProvider = {
  id: 'mock-hw-002',
  name: 'Nomvula Khumalo',
  first_names: 'Nomvula',
  surname: 'Khumalo',
  preferred_name: 'Nomvula',
  email: 'nomvula.khumalo@vha.africa',
  avatar_url: '/images/avatars/random/female/3.png',
  phone_number: null,
  demographics: { sex: null, gender: null, date_of_birth: null },
  contact_details: { mobile_phone_number: null, address: null },
  ever_licensed_as_doctor: 0,
  organizations: [createMockOrganization('mock-emp-002', 'nurse', 'Oncology', 'Nurse', 'SANC-2024-002')],
  organization_id: 'mock-org-001',
  employee_id: 'mock-emp-002',
  role: 'nurse',
  is_admin: false,
  href: '/mock',
  is_me: 0,
}

// Maternal Health Nurse - handles pregnancy-related records
const NURSE_MATERNAL: RenderedRecordProvider = {
  id: 'mock-hw-003',
  name: 'Lindiwe Dlamini',
  first_names: 'Lindiwe',
  surname: 'Dlamini',
  preferred_name: 'Lindiwe',
  email: 'lindiwe.dlamini@vha.africa',
  avatar_url: '/images/avatars/random/female/4.png',
  phone_number: null,
  demographics: { sex: null, gender: null, date_of_birth: null },
  contact_details: { mobile_phone_number: null, address: null },
  ever_licensed_as_doctor: 0,
  organizations: [createMockOrganization('mock-emp-003', 'nurse', 'Maternal Health', 'Nurse', 'SANC-2024-003')],
  organization_id: 'mock-org-001',
  employee_id: 'mock-emp-003',
  role: 'nurse',
  is_admin: false,
  href: '/mock',
  is_me: 0,
}

// Community Health Nurse - handles chronic disease management
const NURSE_COMMUNITY: RenderedRecordProvider = {
  id: 'mock-hw-004',
  name: 'Sipho Makhanya',
  first_names: 'Sipho',
  surname: 'Makhanya',
  preferred_name: 'Sipho',
  email: 'sipho.makhanya@vha.africa',
  avatar_url: '/images/avatars/random/male/6.png',
  phone_number: null,
  demographics: { sex: null, gender: null, date_of_birth: null },
  contact_details: { mobile_phone_number: null, address: null },
  ever_licensed_as_doctor: 0,
  organizations: [createMockOrganization('mock-emp-004', 'nurse', 'Community Health', 'Nurse', 'SANC-2024-004')],
  organization_id: 'mock-org-001',
  employee_id: 'mock-emp-004',
  role: 'nurse',
  is_admin: false,
  href: '/mock',
  is_me: 0,
}

// Pediatric Nurse - handles children's records
const NURSE_PEDIATRIC: RenderedRecordProvider = {
  id: 'mock-hw-005',
  name: 'Zanele Sithole',
  first_names: 'Zanele',
  surname: 'Sithole',
  preferred_name: 'Zanele',
  email: 'zanele.sithole@vha.africa',
  avatar_url: '/images/avatars/random/female/5.png',
  phone_number: null,
  demographics: { sex: null, gender: null, date_of_birth: null },
  contact_details: { mobile_phone_number: null, address: null },
  ever_licensed_as_doctor: 0,
  organizations: [createMockOrganization('mock-emp-005', 'nurse', 'Pediatrics', 'Nurse', 'SANC-2024-005')],
  organization_id: 'mock-org-001',
  employee_id: 'mock-emp-005',
  role: 'nurse',
  is_admin: false,
  href: '/mock',
  is_me: 0,
}

// Default provider for general use
const MOCK_PROVIDER = NURSE_PRIMARY_CARE

// =============================================================================
// HELPER: Date utilities for varied record times
// =============================================================================

function daysAgo(days: number): Date {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date
}

function weeksAgo(weeks: number): Date {
  return daysAgo(weeks * 7)
}

function monthsAgo(months: number): Date {
  const date = new Date()
  date.setMonth(date.getMonth() - months)
  return date
}

const MOCK_PROCEDURE = {
  id: 'mock-procedure-001',
  root_snomed_concept_id: '71388002',
  root_snomed_concept_name: 'Procedure',
  root_snomed_concept_category: 'procedure' as const,
  specific_snomed_concept_id: '225390008',
  specific_snomed_concept_name: 'Triage',
  specific_snomed_concept_category: 'procedure' as const,
  workflow_step_name: 'History',
}

// =============================================================================
// HELPER: Create findings
// =============================================================================

type FindingOptions = {
  provider?: RenderedRecordProvider
  created_at?: Date
}

function createFinding(
  id: string,
  snomed_id: string,
  name: string,
  existence: 'Yes' | 'No' | 'Unknown' = 'Yes',
  value: RenderedFindingRelativeToHealthWorker['value'] = null,
  displays?: { finding: string; value: string | null; full: string },
  options: FindingOptions = {},
): RenderedFindingRelativeToHealthWorker {
  return {
    type: 'finding',
    id,
    created_at: options.created_at ?? new Date(),
    patient_encounter_id: 'mock-encounter-001',
    root_snomed_concept_id: '404684003',
    root_snomed_concept_name: 'Clinical finding',
    root_snomed_concept_category: 'finding',
    specific_snomed_concept_id: snomed_id,
    specific_snomed_concept_name: name,
    specific_snomed_concept_category: 'finding',
    existence,
    value,
    evaluations: [],
    priority: null,
    destination_relations: [],
    as_part_of_procedure: MOCK_PROCEDURE,
    score: null,
    attributes: [],
    displays: displays ?? {
      value: null,
      finding: name,
      full: name,
    },
    modifiers: [],
    provider: options.provider ?? MOCK_PROVIDER,
  }
}

function createDocument(
  id: string,
  title: string,
  href: string,
  thumbnail_href: string | null = null,
  options: FindingOptions = {},
): RenderedFindingRelativeToHealthWorker {
  const link_value: RecordValueLink = {
    type: 'link',
    title,
    href,
    thumbnail_href,
  }
  return {
    type: 'finding',
    id,
    created_at: options.created_at ?? new Date(),
    patient_encounter_id: 'mock-encounter-001',
    root_snomed_concept_id: '308639001',
    root_snomed_concept_name: 'Document',
    root_snomed_concept_category: 'finding',
    specific_snomed_concept_id: '308639001',
    specific_snomed_concept_name: title,
    specific_snomed_concept_category: 'finding',
    existence: 'Yes',
    value: link_value,
    evaluations: [],
    priority: null,
    destination_relations: [],
    as_part_of_procedure: MOCK_PROCEDURE,
    score: null,
    attributes: [],
    displays: {
      value: title,
      finding: 'Document',
      full: title,
    },
    modifiers: [],
    provider: options.provider ?? MOCK_PROVIDER,
  }
}

function createLabResult(
  id: string,
  test_name: string,
  value: string,
  units: string,
  snomed_id: string,
  reference_range?: string,
  options: FindingOptions = {},
): RenderedFindingRelativeToHealthWorker {
  const display_value = reference_range ? `${value} ${units} (Ref: ${reference_range})` : `${value} ${units}`
  return {
    type: 'finding',
    id,
    created_at: options.created_at ?? new Date(),
    patient_encounter_id: 'mock-encounter-001',
    root_snomed_concept_id: '386053000',
    root_snomed_concept_name: 'Laboratory test result',
    root_snomed_concept_category: 'finding',
    specific_snomed_concept_id: snomed_id,
    specific_snomed_concept_name: test_name,
    specific_snomed_concept_category: 'finding',
    existence: 'Yes',
    value: { type: 'measurement', value, units },
    evaluations: [],
    priority: null,
    destination_relations: [],
    as_part_of_procedure: {
      ...MOCK_PROCEDURE,
      specific_snomed_concept_id: '15220000',
      specific_snomed_concept_name: 'Laboratory test',
      workflow_step_name: 'Lab Results',
    },
    score: null,
    attributes: [],
    displays: {
      value: display_value,
      finding: test_name,
      full: `${test_name}: ${display_value}`,
    },
    modifiers: [],
    provider: options.provider ?? MOCK_PROVIDER,
  }
}

// =============================================================================
// PATIENT PROFILES
// =============================================================================

export type MockPatientCase = {
  key: string
  patient: RenderedPatientCompletedRegistration
  priority: Priority | null
  patient_history: RenderedPatientHistory
  care_team: RenderedCareTeamHealthWorker[]
  this_visit_findings: RenderedSidebarWorkflow[]
  description: string
}

// -----------------------------------------------------------------------------
// Case 1: Breast Cancer Patient with Recent Mammogram
// -----------------------------------------------------------------------------
const BREAST_CANCER_PATIENT: MockPatientCase = {
  key: 'breast_cancer_48f',
  description: '48-year-old female with breast cancer undergoing treatment, recent mammogram results',
  patient: {
    id: 'patient-breast-cancer-001',
    sex: 'female',
    gender: null,
    national_id_number: null,
    completed_registration: true,
    date_of_birth: '1977-08-15',
    dob_formatted: '15 August 1977',
    name: 'Thandiwe Molefe',
    names: {
      name: 'Thandiwe Molefe',
      first_names: 'Thandiwe',
      surname: 'Molefe',
      preferred_name: 'Thandiwe',
    },
    description: 'female • 15 August 1977',
    age_display: '48 years',
    age_years: 48,
    age_days: 17532,
    avatar_url: '/images/avatars/random/female/8.png',
    preferred_language_code_iso_639_2_b: 'eng',
    most_recent_height_cm_measurement: '162',
  },
  priority: 'Urgent',
  patient_history: {
    pre_existing_conditions: [
      createFinding('bc-condition-1', '254837009', 'Breast cancer', 'Yes', null, undefined, { provider: NURSE_ONCOLOGY, created_at: monthsAgo(8) }),
      createFinding('bc-condition-2', '38341003', 'Hypertension', 'Yes', null, undefined, { provider: NURSE_PRIMARY_CARE, created_at: monthsAgo(24) }),
    ],
    allergies: [
      createFinding('bc-allergy-1', '294505008', 'Allergy to penicillin', 'Yes', null, undefined, { provider: NURSE_PRIMARY_CARE, created_at: monthsAgo(36) }),
    ],
    family_history: [
      createFinding('bc-family-1', '429740004', 'Family history of breast cancer', 'Yes', null, undefined, {
        provider: NURSE_ONCOLOGY,
        created_at: monthsAgo(8),
      }),
      createFinding('bc-family-2', '160357008', 'Family history of ovarian cancer', 'Yes', null, undefined, {
        provider: NURSE_ONCOLOGY,
        created_at: monthsAgo(8),
      }),
    ],
    major_surgeries: [
      createFinding('bc-surgery-1', '392021009', 'Lumpectomy', 'Yes', null, undefined, { provider: NURSE_ONCOLOGY, created_at: monthsAgo(6) }),
    ],
    medications: [
      createFinding('bc-med-1', '372756006', 'Tamoxifen', 'Yes', { type: 'measurement', value: '20', units: 'mg daily' }, undefined, {
        provider: NURSE_ONCOLOGY,
        created_at: monthsAgo(6),
      }),
      createFinding('bc-med-2', '387458008', 'Aspirin', 'Yes', { type: 'measurement', value: '81', units: 'mg daily' }, undefined, {
        provider: NURSE_PRIMARY_CARE,
        created_at: monthsAgo(12),
      }),
    ],
    lifestyle: [
      createFinding('bc-lifestyle-1', '8392000', 'Non-smoker', 'Yes', null, undefined, { provider: NURSE_PRIMARY_CARE, created_at: monthsAgo(24) }),
      createFinding('bc-lifestyle-2', '228276006', 'Occasional alcohol use', 'Yes', null, undefined, {
        provider: NURSE_PRIMARY_CARE,
        created_at: monthsAgo(24),
      }),
    ],
    documents: [
      createDocument('bc-doc-1', 'Mammogram Report - Feb 2026', '/documents/mammogram-feb-2026.pdf', null, {
        provider: NURSE_ONCOLOGY,
        created_at: weeksAgo(2),
      }),
      createDocument('bc-doc-2', 'Oncology Consultation Notes', '/documents/oncology-notes.pdf', null, { provider: NURSE_ONCOLOGY, created_at: monthsAgo(1) }),
      createDocument('bc-doc-3', 'Pathology Report', '/documents/pathology-report.pdf', null, { provider: NURSE_ONCOLOGY, created_at: monthsAgo(6) }),
    ],
    lab_results: [
      createLabResult('bc-lab-1', 'CA 15-3', '28', 'U/mL', '313549000', '0-30', { provider: NURSE_ONCOLOGY, created_at: weeksAgo(2) }),
      createLabResult('bc-lab-2', 'CEA', '3.2', 'ng/mL', '396577007', '0-5', { provider: NURSE_ONCOLOGY, created_at: weeksAgo(2) }),
      createLabResult('bc-lab-3', 'Hemoglobin', '11.2', 'g/dL', '718-7', '12-16', { provider: NURSE_PRIMARY_CARE, created_at: weeksAgo(1) }),
    ],
  },
  care_team: [
    {
      employment_id: 'emp-oncologist-001',
      health_worker_id: 'hw-oncologist-001',
      name: 'Dr. Nomsa Khumalo',
      role: 'doctor',
      specialty: 'Oncology',
      avatar_url: '/images/avatars/random/female/3.png',
      last_visit_relative_to_now: '2 weeks ago',
      organization: { id: 'org-001', name: 'Johannesburg Oncology Centre' },
    },
  ],
  this_visit_findings: [],
}

// -----------------------------------------------------------------------------
// Case 2: Diabetic Patient with Foot Ulcer
// -----------------------------------------------------------------------------
const DIABETIC_FOOT_PATIENT: MockPatientCase = {
  key: 'diabetic_foot_62m',
  description: '62-year-old male with Type 2 diabetes presenting with non-healing foot ulcer',
  patient: {
    id: 'patient-diabetic-001',
    sex: 'male',
    gender: null,
    national_id_number: null,
    completed_registration: true,
    date_of_birth: '1963-03-22',
    dob_formatted: '22 March 1963',
    name: 'Bongani Nkosi',
    names: {
      name: 'Bongani Nkosi',
      first_names: 'Bongani',
      surname: 'Nkosi',
      preferred_name: 'Bongani',
    },
    description: 'male • 22 March 1963',
    age_display: '62 years',
    age_years: 62,
    age_days: 22645,
    avatar_url: '/images/avatars/random/male/5.png',
    preferred_language_code_iso_639_2_b: 'zul',
    most_recent_height_cm_measurement: '175',
  },
  priority: 'Very urgent',
  patient_history: {
    pre_existing_conditions: [
      createFinding('df-condition-1', '44054006', 'Type 2 diabetes mellitus', 'Yes', null, undefined, { provider: NURSE_COMMUNITY, created_at: monthsAgo(60) }),
      createFinding('df-condition-2', '38341003', 'Hypertension', 'Yes', null, undefined, { provider: NURSE_COMMUNITY, created_at: monthsAgo(48) }),
      createFinding('df-condition-3', '127014009', 'Diabetic peripheral neuropathy', 'Yes', null, undefined, {
        provider: NURSE_COMMUNITY,
        created_at: monthsAgo(18),
      }),
    ],
    allergies: [],
    family_history: [
      createFinding('df-family-1', '160303001', 'Family history of diabetes', 'Yes', null, undefined, {
        provider: NURSE_PRIMARY_CARE,
        created_at: monthsAgo(60),
      }),
    ],
    major_surgeries: [],
    medications: [
      createFinding('df-med-1', '109081006', 'Metformin', 'Yes', { type: 'measurement', value: '1000', units: 'mg twice daily' }, undefined, {
        provider: NURSE_COMMUNITY,
        created_at: monthsAgo(48),
      }),
      createFinding('df-med-2', '96367001', 'Lisinopril', 'Yes', { type: 'measurement', value: '10', units: 'mg daily' }, undefined, {
        provider: NURSE_COMMUNITY,
        created_at: monthsAgo(36),
      }),
    ],
    lifestyle: [
      createFinding('df-lifestyle-1', '77176002', 'Former smoker', 'Yes', null, undefined, { provider: NURSE_PRIMARY_CARE, created_at: monthsAgo(60) }),
      createFinding('df-lifestyle-2', '160573003', 'Sedentary lifestyle', 'Yes', null, undefined, { provider: NURSE_COMMUNITY, created_at: monthsAgo(12) }),
    ],
    documents: [
      createDocument('df-doc-1', 'Wound Care Plan', '/documents/wound-care-plan.pdf', null, { provider: NURSE_COMMUNITY, created_at: daysAgo(5) }),
      createDocument('df-doc-2', 'Diabetic Foot Assessment', '/documents/foot-assessment.pdf', null, { provider: NURSE_COMMUNITY, created_at: daysAgo(5) }),
    ],
    lab_results: [
      createLabResult('df-lab-1', 'HbA1c', '9.2', '%', '4548-4', '4.0-5.6', { provider: NURSE_COMMUNITY, created_at: weeksAgo(3) }),
      createLabResult('df-lab-2', 'Fasting Glucose', '186', 'mg/dL', '1558-6', '70-100', { provider: NURSE_PRIMARY_CARE, created_at: daysAgo(2) }),
      createLabResult('df-lab-3', 'Creatinine', '1.4', 'mg/dL', '2160-0', '0.7-1.3', { provider: NURSE_COMMUNITY, created_at: weeksAgo(3) }),
      createLabResult('df-lab-4', 'eGFR', '52', 'mL/min', '33914-3', '>60', { provider: NURSE_COMMUNITY, created_at: weeksAgo(3) }),
    ],
  },
  care_team: [
    {
      employment_id: 'emp-endo-001',
      health_worker_id: 'hw-endo-001',
      name: 'Dr. Themba Mabaso',
      role: 'doctor',
      specialty: 'Endocrinology',
      avatar_url: '/images/avatars/random/male/2.png',
      last_visit_relative_to_now: '1 month ago',
      organization: { id: 'org-001', name: 'Durban Diabetes Clinic' },
    },
  ],
  this_visit_findings: [],
}

// -----------------------------------------------------------------------------
// Case 3: Pregnant Patient - High Risk
// -----------------------------------------------------------------------------
const HIGH_RISK_PREGNANCY_PATIENT: MockPatientCase = {
  key: 'pregnancy_high_risk_32f',
  description: '32-year-old female, 28 weeks pregnant with gestational diabetes and preeclampsia',
  patient: {
    id: 'patient-pregnancy-001',
    sex: 'female',
    gender: null,
    national_id_number: null,
    completed_registration: true,
    date_of_birth: '1993-11-08',
    dob_formatted: '8 November 1993',
    name: 'Lindiwe Dlamini',
    names: {
      name: 'Lindiwe Dlamini',
      first_names: 'Lindiwe',
      surname: 'Dlamini',
      preferred_name: 'Lindiwe',
    },
    description: 'female • 8 November 1993',
    age_display: '32 years',
    age_years: 32,
    age_days: 11684,
    avatar_url: '/images/avatars/random/female/4.png',
    preferred_language_code_iso_639_2_b: 'eng',
    most_recent_height_cm_measurement: '158',
  },
  priority: 'Very urgent',
  patient_history: {
    pre_existing_conditions: [
      createFinding('preg-condition-1', '11687002', 'Gestational diabetes mellitus', 'Yes', null, undefined, {
        provider: NURSE_MATERNAL,
        created_at: weeksAgo(6),
      }),
      createFinding('preg-condition-2', '398254007', 'Pre-eclampsia', 'Yes', null, undefined, { provider: NURSE_MATERNAL, created_at: weeksAgo(2) }),
    ],
    allergies: [
      createFinding('preg-allergy-1', '91936005', 'Allergy to penicillin', 'Yes', null, undefined, { provider: NURSE_PRIMARY_CARE, created_at: monthsAgo(24) }),
    ],
    family_history: [
      createFinding('preg-family-1', '160303001', 'Family history of diabetes', 'Yes', null, undefined, { provider: NURSE_MATERNAL, created_at: weeksAgo(20) }),
      createFinding('preg-family-2', '160357008', 'Family history of hypertension', 'Yes', null, undefined, {
        provider: NURSE_MATERNAL,
        created_at: weeksAgo(20),
      }),
    ],
    major_surgeries: [],
    medications: [
      createFinding('preg-med-1', '412246000', 'Insulin', 'Yes', { type: 'measurement', value: '10', units: 'units before meals' }, undefined, {
        provider: NURSE_MATERNAL,
        created_at: weeksAgo(4),
      }),
      createFinding('preg-med-2', '387174006', 'Methyldopa', 'Yes', { type: 'measurement', value: '250', units: 'mg three times daily' }, undefined, {
        provider: NURSE_MATERNAL,
        created_at: weeksAgo(2),
      }),
      createFinding('preg-med-3', '63718003', 'Folic acid', 'Yes', { type: 'measurement', value: '5', units: 'mg daily' }, undefined, {
        provider: NURSE_MATERNAL,
        created_at: weeksAgo(28),
      }),
    ],
    lifestyle: [
      createFinding('preg-lifestyle-1', '8392000', 'Non-smoker', 'Yes', null, undefined, { provider: NURSE_MATERNAL, created_at: weeksAgo(28) }),
      createFinding('preg-lifestyle-2', '105539002', 'Non-drinker', 'Yes', null, undefined, { provider: NURSE_MATERNAL, created_at: weeksAgo(28) }),
    ],
    documents: [
      createDocument('preg-doc-1', 'Ultrasound Report - 28 weeks', '/documents/ultrasound-28wk.pdf', null, {
        provider: NURSE_MATERNAL,
        created_at: daysAgo(3),
      }),
      createDocument('preg-doc-2', 'Antenatal Care Record', '/documents/anc-record.pdf', null, { provider: NURSE_MATERNAL, created_at: weeksAgo(20) }),
      createDocument('preg-doc-3', 'High Risk Pregnancy Plan', '/documents/hrp-plan.pdf', null, { provider: NURSE_MATERNAL, created_at: weeksAgo(2) }),
    ],
    lab_results: [
      createLabResult('preg-lab-1', 'Fasting Glucose', '142', 'mg/dL', '1558-6', '70-95', { provider: NURSE_MATERNAL, created_at: daysAgo(3) }),
      createLabResult('preg-lab-2', 'Protein/Creatinine Ratio', '0.42', 'mg/mg', '2890-2', '<0.3', { provider: NURSE_MATERNAL, created_at: daysAgo(3) }),
      createLabResult('preg-lab-3', 'Hemoglobin', '10.8', 'g/dL', '718-7', '11-14', { provider: NURSE_PRIMARY_CARE, created_at: weeksAgo(1) }),
      createLabResult('preg-lab-4', 'Platelet Count', '142', 'x10^9/L', '777-3', '150-400', { provider: NURSE_PRIMARY_CARE, created_at: weeksAgo(1) }),
    ],
  },
  care_team: [
    {
      employment_id: 'emp-obgyn-001',
      health_worker_id: 'hw-obgyn-001',
      name: 'Dr. Precious Zulu',
      role: 'doctor',
      specialty: 'Obstetrics & Gynecology',
      avatar_url: '/images/avatars/random/female/7.png',
      last_visit_relative_to_now: '3 days ago',
      organization: { id: 'org-001', name: 'Pretoria Maternity Hospital' },
    },
  ],
  this_visit_findings: [],
}

// -----------------------------------------------------------------------------
// Case 4: HIV Patient on ART
// -----------------------------------------------------------------------------
const HIV_ART_PATIENT: MockPatientCase = {
  key: 'hiv_art_35m',
  description: '35-year-old male living with HIV, on antiretroviral therapy, routine follow-up',
  patient: {
    id: 'patient-hiv-001',
    sex: 'male',
    gender: null,
    national_id_number: null,
    completed_registration: true,
    date_of_birth: '1990-07-14',
    dob_formatted: '14 July 1990',
    name: 'Sipho Mkhize',
    names: {
      name: 'Sipho Mkhize',
      first_names: 'Sipho',
      surname: 'Mkhize',
      preferred_name: 'Sipho',
    },
    description: 'male • 14 July 1990',
    age_display: '35 years',
    age_years: 35,
    age_days: 12780,
    avatar_url: '/images/avatars/random/male/4.png',
    preferred_language_code_iso_639_2_b: 'zul',
    most_recent_height_cm_measurement: '178',
  },
  priority: 'Non-urgent',
  patient_history: {
    pre_existing_conditions: [
      createFinding('hiv-condition-1', '86406008', 'HIV infection', 'Yes', null, undefined, { provider: NURSE_COMMUNITY, created_at: monthsAgo(36) }),
    ],
    allergies: [],
    family_history: [],
    major_surgeries: [],
    medications: [
      createFinding(
        'hiv-med-1',
        '713464000',
        'TLD (Tenofovir/Lamivudine/Dolutegravir)',
        'Yes',
        { type: 'measurement', value: '1', units: 'tablet daily' },
        undefined,
        { provider: NURSE_COMMUNITY, created_at: monthsAgo(24) },
      ),
    ],
    lifestyle: [
      createFinding('hiv-lifestyle-1', '8392000', 'Non-smoker', 'Yes', null, undefined, { provider: NURSE_PRIMARY_CARE, created_at: monthsAgo(36) }),
      createFinding('hiv-lifestyle-2', '228276006', 'Occasional alcohol use', 'Yes', null, undefined, {
        provider: NURSE_PRIMARY_CARE,
        created_at: monthsAgo(36),
      }),
      createFinding('hiv-lifestyle-3', '102894008', 'Regular exercise', 'Yes', null, undefined, { provider: NURSE_COMMUNITY, created_at: monthsAgo(6) }),
    ],
    documents: [
      createDocument('hiv-doc-1', 'ART Adherence Report', '/documents/art-adherence.pdf', null, { provider: NURSE_COMMUNITY, created_at: monthsAgo(1) }),
      createDocument('hiv-doc-2', 'Viral Load History', '/documents/viral-load-history.pdf', null, { provider: NURSE_COMMUNITY, created_at: monthsAgo(3) }),
    ],
    lab_results: [
      createLabResult('hiv-lab-1', 'CD4 Count', '650', 'cells/mm³', '24467-3', '>500', { provider: NURSE_COMMUNITY, created_at: monthsAgo(3) }),
      createLabResult('hiv-lab-2', 'Viral Load', '<50', 'copies/mL', '20447-9', '<50', { provider: NURSE_COMMUNITY, created_at: monthsAgo(3) }),
      createLabResult('hiv-lab-3', 'Creatinine', '0.9', 'mg/dL', '2160-0', '0.7-1.3', { provider: NURSE_PRIMARY_CARE, created_at: weeksAgo(2) }),
    ],
  },
  care_team: [
    {
      employment_id: 'emp-id-001',
      health_worker_id: 'hw-id-001',
      name: 'Dr. Lerato Motaung',
      role: 'doctor',
      specialty: 'Infectious Disease',
      avatar_url: '/images/avatars/random/female/6.png',
      last_visit_relative_to_now: '3 months ago',
      organization: { id: 'org-001', name: 'Cape Town HIV Clinic' },
    },
  ],
  this_visit_findings: [],
}

// -----------------------------------------------------------------------------
// Case 5: Pediatric Asthma Patient
// -----------------------------------------------------------------------------
const PEDIATRIC_ASTHMA_PATIENT: MockPatientCase = {
  key: 'asthma_pediatric_8m',
  description: '8-year-old male with severe persistent asthma, presenting with acute exacerbation',
  patient: {
    id: 'patient-asthma-001',
    sex: 'male',
    gender: null,
    national_id_number: null,
    completed_registration: true,
    date_of_birth: '2017-09-03',
    dob_formatted: '3 September 2017',
    name: 'Lebo Mokoena',
    names: {
      name: 'Lebo Mokoena',
      first_names: 'Lebo',
      surname: 'Mokoena',
      preferred_name: 'Lebo',
    },
    description: 'male • 3 September 2017',
    age_display: '8 years',
    age_years: 8,
    age_days: 2920,
    avatar_url: '/images/avatars/random/male/1.png',
    preferred_language_code_iso_639_2_b: 'sot',
    most_recent_height_cm_measurement: '128',
  },
  priority: 'Emergency',
  patient_history: {
    pre_existing_conditions: [
      createFinding('asthma-condition-1', '195967001', 'Severe persistent asthma', 'Yes', null, undefined, {
        provider: NURSE_PEDIATRIC,
        created_at: monthsAgo(18),
      }),
      createFinding('asthma-condition-2', '21719001', 'Allergic rhinitis', 'Yes', null, undefined, { provider: NURSE_PEDIATRIC, created_at: monthsAgo(24) }),
    ],
    allergies: [
      createFinding('asthma-allergy-1', '232350006', 'Allergy to dust mite', 'Yes', null, undefined, { provider: NURSE_PEDIATRIC, created_at: monthsAgo(24) }),
      createFinding('asthma-allergy-2', '418689008', 'Allergy to grass pollen', 'Yes', null, undefined, {
        provider: NURSE_PEDIATRIC,
        created_at: monthsAgo(24),
      }),
    ],
    family_history: [
      createFinding('asthma-family-1', '160377001', 'Family history of asthma', 'Yes', null, undefined, {
        provider: NURSE_PEDIATRIC,
        created_at: monthsAgo(24),
      }),
    ],
    major_surgeries: [],
    medications: [
      createFinding('asthma-med-1', '372687004', 'Budesonide inhaler', 'Yes', { type: 'measurement', value: '200', units: 'mcg twice daily' }, undefined, {
        provider: NURSE_PEDIATRIC,
        created_at: monthsAgo(12),
      }),
      createFinding('asthma-med-2', '372580007', 'Salbutamol inhaler', 'Yes', { type: 'measurement', value: '100', units: 'mcg as needed' }, undefined, {
        provider: NURSE_PEDIATRIC,
        created_at: monthsAgo(18),
      }),
      createFinding('asthma-med-3', '373492002', 'Cetirizine', 'Yes', { type: 'measurement', value: '5', units: 'mg daily' }, undefined, {
        provider: NURSE_PEDIATRIC,
        created_at: monthsAgo(24),
      }),
    ],
    lifestyle: [],
    documents: [
      createDocument('asthma-doc-1', 'Asthma Action Plan', '/documents/asthma-action-plan.pdf', null, { provider: NURSE_PEDIATRIC, created_at: monthsAgo(2) }),
      createDocument('asthma-doc-2', 'Allergy Test Results', '/documents/allergy-tests.pdf', null, { provider: NURSE_PEDIATRIC, created_at: monthsAgo(24) }),
    ],
    lab_results: [
      createLabResult('asthma-lab-1', 'Peak Flow', '180', 'L/min', '313193002', '250-300', { provider: NURSE_PEDIATRIC, created_at: daysAgo(1) }),
      createLabResult('asthma-lab-2', 'IgE Total', '520', 'IU/mL', '19113-0', '<100', { provider: NURSE_PEDIATRIC, created_at: monthsAgo(6) }),
    ],
  },
  care_team: [
    {
      employment_id: 'emp-peds-001',
      health_worker_id: 'hw-peds-001',
      name: 'Dr. Amanda Sithole',
      role: 'doctor',
      specialty: 'Pediatric Pulmonology',
      avatar_url: '/images/avatars/random/female/2.png',
      last_visit_relative_to_now: '2 months ago',
      organization: { id: 'org-001', name: "Johannesburg Children's Hospital" },
    },
  ],
  this_visit_findings: [],
}

// -----------------------------------------------------------------------------
// Case 6: Elderly Patient with Multiple Comorbidities
// -----------------------------------------------------------------------------
const ELDERLY_MULTIMORBID_PATIENT: MockPatientCase = {
  key: 'elderly_multimorbid_78f',
  description: '78-year-old female with heart failure, COPD, and chronic kidney disease',
  patient: {
    id: 'patient-elderly-001',
    sex: 'female',
    gender: null,
    national_id_number: null,
    completed_registration: true,
    date_of_birth: '1947-12-25',
    dob_formatted: '25 December 1947',
    name: 'Gogo Mathebula',
    names: {
      name: 'Grace Mathebula',
      first_names: 'Grace',
      surname: 'Mathebula',
      preferred_name: 'Gogo',
    },
    description: 'female • 25 December 1947',
    age_display: '78 years',
    age_years: 78,
    age_days: 28490,
    avatar_url: '/images/avatars/random/female/9.png',
    preferred_language_code_iso_639_2_b: 'tsn',
    most_recent_height_cm_measurement: '155',
  },
  priority: 'Urgent',
  patient_history: {
    pre_existing_conditions: [
      createFinding('elderly-condition-1', '84114007', 'Heart failure', 'Yes', null, undefined, { provider: NURSE_COMMUNITY, created_at: monthsAgo(48) }),
      createFinding('elderly-condition-2', '13645005', 'Chronic obstructive pulmonary disease', 'Yes', null, undefined, {
        provider: NURSE_COMMUNITY,
        created_at: monthsAgo(60),
      }),
      createFinding('elderly-condition-3', '709044004', 'Chronic kidney disease stage 3', 'Yes', null, undefined, {
        provider: NURSE_COMMUNITY,
        created_at: monthsAgo(24),
      }),
      createFinding('elderly-condition-4', '38341003', 'Hypertension', 'Yes', null, undefined, { provider: NURSE_PRIMARY_CARE, created_at: monthsAgo(120) }),
      createFinding('elderly-condition-5', '49436004', 'Atrial fibrillation', 'Yes', null, undefined, { provider: NURSE_COMMUNITY, created_at: monthsAgo(36) }),
    ],
    allergies: [
      createFinding('elderly-allergy-1', '294505008', 'Allergy to penicillin', 'Yes', null, undefined, {
        provider: NURSE_PRIMARY_CARE,
        created_at: monthsAgo(120),
      }),
      createFinding('elderly-allergy-2', '293963004', 'Allergy to sulfonamides', 'Yes', null, undefined, {
        provider: NURSE_PRIMARY_CARE,
        created_at: monthsAgo(120),
      }),
    ],
    family_history: [],
    major_surgeries: [
      createFinding('elderly-surgery-1', '232717009', 'Coronary artery bypass graft', 'Yes', null, undefined, {
        provider: NURSE_COMMUNITY,
        created_at: monthsAgo(96),
      }),
    ],
    medications: [
      createFinding('elderly-med-1', '318475005', 'Furosemide', 'Yes', { type: 'measurement', value: '40', units: 'mg daily' }, undefined, {
        provider: NURSE_COMMUNITY,
        created_at: monthsAgo(36),
      }),
      createFinding('elderly-med-2', '318475005', 'Carvedilol', 'Yes', { type: 'measurement', value: '12.5', units: 'mg twice daily' }, undefined, {
        provider: NURSE_COMMUNITY,
        created_at: monthsAgo(36),
      }),
      createFinding('elderly-med-3', '372756006', 'Warfarin', 'Yes', { type: 'measurement', value: '5', units: 'mg daily' }, undefined, {
        provider: NURSE_COMMUNITY,
        created_at: monthsAgo(36),
      }),
      createFinding('elderly-med-4', '387458008', 'Tiotropium inhaler', 'Yes', { type: 'measurement', value: '18', units: 'mcg daily' }, undefined, {
        provider: NURSE_COMMUNITY,
        created_at: monthsAgo(48),
      }),
      createFinding('elderly-med-5', '387458008', 'Atorvastatin', 'Yes', { type: 'measurement', value: '20', units: 'mg daily' }, undefined, {
        provider: NURSE_PRIMARY_CARE,
        created_at: monthsAgo(60),
      }),
    ],
    lifestyle: [
      createFinding('elderly-lifestyle-1', '8392000', 'Non-smoker', 'Yes', null, undefined, { provider: NURSE_PRIMARY_CARE, created_at: monthsAgo(120) }),
      createFinding('elderly-lifestyle-2', '105539002', 'Non-drinker', 'Yes', null, undefined, { provider: NURSE_PRIMARY_CARE, created_at: monthsAgo(120) }),
      createFinding('elderly-lifestyle-3', '129006008', 'Uses walking aid', 'Yes', null, undefined, { provider: NURSE_COMMUNITY, created_at: monthsAgo(12) }),
    ],
    documents: [
      createDocument('elderly-doc-1', 'Echocardiogram Report', '/documents/echo-report.pdf', null, { provider: NURSE_COMMUNITY, created_at: monthsAgo(3) }),
      createDocument('elderly-doc-2', 'Medication List', '/documents/medication-list.pdf', null, { provider: NURSE_COMMUNITY, created_at: weeksAgo(1) }),
      createDocument('elderly-doc-3', 'Advance Directive', '/documents/advance-directive.pdf', null, { provider: NURSE_COMMUNITY, created_at: monthsAgo(12) }),
    ],
    lab_results: [
      createLabResult('elderly-lab-1', 'BNP', '580', 'pg/mL', '33762-6', '<100', { provider: NURSE_COMMUNITY, created_at: weeksAgo(1) }),
      createLabResult('elderly-lab-2', 'Creatinine', '1.8', 'mg/dL', '2160-0', '0.6-1.2', { provider: NURSE_COMMUNITY, created_at: weeksAgo(1) }),
      createLabResult('elderly-lab-3', 'INR', '2.4', '', '5895-7', '2.0-3.0', { provider: NURSE_COMMUNITY, created_at: daysAgo(2) }),
      createLabResult('elderly-lab-4', 'Potassium', '4.8', 'mEq/L', '2823-3', '3.5-5.0', { provider: NURSE_COMMUNITY, created_at: weeksAgo(1) }),
    ],
  },
  care_team: [
    {
      employment_id: 'emp-geri-001',
      health_worker_id: 'hw-geri-001',
      name: 'Dr. Peter van der Merwe',
      role: 'doctor',
      specialty: 'Geriatric Medicine',
      avatar_url: '/images/avatars/random/male/8.png',
      last_visit_relative_to_now: '1 week ago',
      organization: { id: 'org-001', name: 'Bloemfontein General Hospital' },
    },
    {
      employment_id: 'emp-nurse-001',
      health_worker_id: 'hw-nurse-001',
      name: 'Sister Thandi Mabena',
      role: 'nurse',
      specialty: 'Community Health',
      avatar_url: '/images/avatars/random/female/5.png',
      last_visit_relative_to_now: '2 days ago',
      organization: { id: 'org-001', name: 'Bloemfontein Home Care' },
    },
  ],
  this_visit_findings: [],
}

// -----------------------------------------------------------------------------
// Case 7: Mental Health Patient
// -----------------------------------------------------------------------------
const MENTAL_HEALTH_PATIENT: MockPatientCase = {
  key: 'mental_health_28f',
  description: '28-year-old female with bipolar disorder, presenting for medication review',
  patient: {
    id: 'patient-mental-001',
    sex: 'female',
    gender: null,
    national_id_number: null,
    completed_registration: true,
    date_of_birth: '1997-04-18',
    dob_formatted: '18 April 1997',
    name: 'Zanele Mthethwa',
    names: {
      name: 'Zanele Mthethwa',
      first_names: 'Zanele',
      surname: 'Mthethwa',
      preferred_name: 'Zanele',
    },
    description: 'female • 18 April 1997',
    age_display: '28 years',
    age_years: 28,
    age_days: 10224,
    avatar_url: '/images/avatars/random/female/10.png',
    preferred_language_code_iso_639_2_b: 'eng',
    most_recent_height_cm_measurement: '165',
  },
  priority: 'Non-urgent',
  patient_history: {
    pre_existing_conditions: [
      createFinding('mh-condition-1', '13746004', 'Bipolar I disorder'),
      createFinding('mh-condition-2', '197480006', 'Anxiety disorder'),
    ],
    allergies: [],
    family_history: [
      createFinding('mh-family-1', '160381005', 'Family history of depression'),
    ],
    major_surgeries: [],
    medications: [
      createFinding('mh-med-1', '387562000', 'Lithium', 'Yes', { type: 'measurement', value: '900', units: 'mg daily' }),
      createFinding('mh-med-2', '372767007', 'Quetiapine', 'Yes', { type: 'measurement', value: '200', units: 'mg at bedtime' }),
    ],
    lifestyle: [
      createFinding('mh-lifestyle-1', '8392000', 'Non-smoker'),
      createFinding('mh-lifestyle-2', '105539002', 'Non-drinker'),
      createFinding('mh-lifestyle-3', '266948004', 'Regular sleep schedule'),
    ],
    documents: [
      createDocument('mh-doc-1', 'Psychiatric Assessment', '/documents/psych-assessment.pdf'),
      createDocument('mh-doc-2', 'Mood Chart', '/documents/mood-chart.pdf'),
    ],
    lab_results: [
      createLabResult('mh-lab-1', 'Lithium Level', '0.8', 'mEq/L', '14334-7', '0.6-1.2'),
      createLabResult('mh-lab-2', 'TSH', '2.1', 'mIU/L', '3016-3', '0.4-4.0'),
      createLabResult('mh-lab-3', 'Creatinine', '0.8', 'mg/dL', '2160-0', '0.6-1.2'),
    ],
  },
  care_team: [
    {
      employment_id: 'emp-psych-001',
      health_worker_id: 'hw-psych-001',
      name: 'Dr. Nomvula Radebe',
      role: 'doctor',
      specialty: 'Psychiatry',
      avatar_url: '/images/avatars/random/female/1.png',
      last_visit_relative_to_now: '1 month ago',
      organization: { id: 'org-001', name: 'Tara Hospital Psychiatric Unit' },
    },
  ],
  this_visit_findings: [],
}

// -----------------------------------------------------------------------------
// Case 8: Tuberculosis Patient
// -----------------------------------------------------------------------------
const TUBERCULOSIS_PATIENT: MockPatientCase = {
  key: 'tuberculosis_45m',
  description: '45-year-old male with drug-sensitive pulmonary TB, on treatment for 2 months',
  patient: {
    id: 'patient-tb-001',
    sex: 'male',
    gender: null,
    national_id_number: null,
    completed_registration: true,
    date_of_birth: '1980-06-30',
    dob_formatted: '30 June 1980',
    name: 'Mandla Ngcobo',
    names: {
      name: 'Mandla Ngcobo',
      first_names: 'Mandla',
      surname: 'Ngcobo',
      preferred_name: 'Mandla',
    },
    description: 'male • 30 June 1980',
    age_display: '45 years',
    age_years: 45,
    age_days: 16436,
    avatar_url: '/images/avatars/random/male/6.png',
    preferred_language_code_iso_639_2_b: 'zul',
    most_recent_height_cm_measurement: '172',
  },
  priority: 'Non-urgent',
  patient_history: {
    pre_existing_conditions: [
      createFinding('tb-condition-1', '154283005', 'Pulmonary tuberculosis'),
    ],
    allergies: [],
    family_history: [],
    major_surgeries: [],
    medications: [
      createFinding('tb-med-1', '387174006', 'RHZE (Fixed-dose combination)', 'Yes', { type: 'measurement', value: '4', units: 'tablets daily' }),
    ],
    lifestyle: [
      createFinding('tb-lifestyle-1', '77176002', 'Former smoker'),
      createFinding('tb-lifestyle-2', '228276006', 'Occasional alcohol use'),
    ],
    documents: [
      createDocument('tb-doc-1', 'Chest X-ray Report', '/documents/cxr-report.pdf'),
      createDocument('tb-doc-2', 'TB Treatment Card', '/documents/tb-treatment-card.pdf'),
      createDocument('tb-doc-3', 'Contact Tracing Report', '/documents/contact-tracing.pdf'),
    ],
    lab_results: [
      createLabResult('tb-lab-1', 'Sputum AFB Smear', 'Negative', '', '11545-1', 'Negative'),
      createLabResult('tb-lab-2', 'GeneXpert MTB/RIF', 'MTB Detected, Rif Sensitive', '', '85362-2', 'MTB Not Detected'),
      createLabResult('tb-lab-3', 'ALT', '42', 'U/L', '1742-6', '7-56'),
      createLabResult('tb-lab-4', 'Creatinine', '1.0', 'mg/dL', '2160-0', '0.7-1.3'),
    ],
  },
  care_team: [
    {
      employment_id: 'emp-tb-001',
      health_worker_id: 'hw-tb-001',
      name: 'Dr. James Moyo',
      role: 'doctor',
      specialty: 'Pulmonology',
      avatar_url: '/images/avatars/random/male/3.png',
      last_visit_relative_to_now: '2 weeks ago',
      organization: { id: 'org-001', name: 'King Dinuzulu Hospital' },
    },
  ],
  this_visit_findings: [],
}

// -----------------------------------------------------------------------------
// Case 9: Post-Surgical Follow-up
// -----------------------------------------------------------------------------
const POST_SURGICAL_PATIENT: MockPatientCase = {
  key: 'post_surgical_55m',
  description: '55-year-old male, 1 week post laparoscopic cholecystectomy, follow-up',
  patient: {
    id: 'patient-surgical-001',
    sex: 'male',
    gender: null,
    national_id_number: null,
    completed_registration: true,
    date_of_birth: '1970-02-14',
    dob_formatted: '14 February 1970',
    name: 'Johannes Botha',
    names: {
      name: 'Johannes Botha',
      first_names: 'Johannes',
      surname: 'Botha',
      preferred_name: 'Johan',
    },
    description: 'male • 14 February 1970',
    age_display: '55 years',
    age_years: 55,
    age_days: 20093,
    avatar_url: '/images/avatars/random/male/7.png',
    preferred_language_code_iso_639_2_b: 'afr',
    most_recent_height_cm_measurement: '180',
  },
  priority: 'Non-urgent',
  patient_history: {
    pre_existing_conditions: [
      createFinding('surg-condition-1', '235919008', 'Cholelithiasis (resolved)'),
    ],
    allergies: [],
    family_history: [],
    major_surgeries: [
      createFinding('surg-surgery-1', '45595009', 'Laparoscopic cholecystectomy'),
    ],
    medications: [
      createFinding('surg-med-1', '387207008', 'Paracetamol', 'Yes', { type: 'measurement', value: '1000', units: 'mg as needed' }),
    ],
    lifestyle: [
      createFinding('surg-lifestyle-1', '8392000', 'Non-smoker'),
      createFinding('surg-lifestyle-2', '228276006', 'Occasional alcohol use'),
    ],
    documents: [
      createDocument('surg-doc-1', 'Operative Report', '/documents/operative-report.pdf'),
      createDocument('surg-doc-2', 'Discharge Summary', '/documents/discharge-summary.pdf'),
      createDocument('surg-doc-3', 'Post-op Care Instructions', '/documents/post-op-instructions.pdf'),
    ],
    lab_results: [
      createLabResult('surg-lab-1', 'WBC', '8.2', 'x10^9/L', '6690-2', '4.5-11.0'),
      createLabResult('surg-lab-2', 'CRP', '12', 'mg/L', '1988-5', '<10'),
    ],
  },
  care_team: [
    {
      employment_id: 'emp-surg-001',
      health_worker_id: 'hw-surg-001',
      name: 'Dr. Pieter de Villiers',
      role: 'doctor',
      specialty: 'General Surgery',
      avatar_url: '/images/avatars/random/male/9.png',
      last_visit_relative_to_now: '1 week ago',
      organization: { id: 'org-001', name: 'Netcare Milpark Hospital' },
    },
  ],
  this_visit_findings: [],
}

// -----------------------------------------------------------------------------
// Case 10: Trauma Patient
// -----------------------------------------------------------------------------
const TRAUMA_PATIENT: MockPatientCase = {
  key: 'trauma_22m',
  description: '22-year-old male with road traffic accident injuries, multiple fractures',
  patient: {
    id: 'patient-trauma-001',
    sex: 'male',
    gender: null,
    national_id_number: null,
    completed_registration: true,
    date_of_birth: '2003-10-05',
    dob_formatted: '5 October 2003',
    name: 'Thabo Mahlangu',
    names: {
      name: 'Thabo Mahlangu',
      first_names: 'Thabo',
      surname: 'Mahlangu',
      preferred_name: 'Thabo',
    },
    description: 'male • 5 October 2003',
    age_display: '22 years',
    age_years: 22,
    age_days: 8035,
    avatar_url: '/images/avatars/random/male/10.png',
    preferred_language_code_iso_639_2_b: 'nso',
    most_recent_height_cm_measurement: '176',
  },
  priority: 'Emergency',
  patient_history: {
    pre_existing_conditions: [],
    allergies: [],
    family_history: [],
    major_surgeries: [],
    medications: [],
    lifestyle: [
      createFinding('trauma-lifestyle-1', '8392000', 'Non-smoker'),
    ],
    documents: [
      createDocument('trauma-doc-1', 'CT Scan Report', '/documents/ct-scan-report.pdf'),
      createDocument('trauma-doc-2', 'X-ray Images', '/documents/xray-images.pdf'),
      createDocument('trauma-doc-3', 'Trauma Assessment', '/documents/trauma-assessment.pdf'),
    ],
    lab_results: [
      createLabResult('trauma-lab-1', 'Hemoglobin', '9.8', 'g/dL', '718-7', '13-17'),
      createLabResult('trauma-lab-2', 'Hematocrit', '30', '%', '4544-3', '40-54'),
      createLabResult('trauma-lab-3', 'Blood Type', 'O+', '', '883-9', ''),
      createLabResult('trauma-lab-4', 'Lactate', '3.2', 'mmol/L', '2524-7', '0.5-2.0'),
    ],
  },
  care_team: [
    {
      employment_id: 'emp-trauma-001',
      health_worker_id: 'hw-trauma-001',
      name: 'Dr. Sibongile Masuku',
      role: 'doctor',
      specialty: 'Trauma Surgery',
      avatar_url: '/images/avatars/random/female/11.png',
      last_visit_relative_to_now: 'Now',
      organization: { id: 'org-001', name: 'Chris Hani Baragwanath Hospital' },
    },
    {
      employment_id: 'emp-ortho-001',
      health_worker_id: 'hw-ortho-001',
      name: 'Dr. David Mogale',
      role: 'doctor',
      specialty: 'Orthopedic Surgery',
      avatar_url: '/images/avatars/random/male/11.png',
      last_visit_relative_to_now: 'Now',
      organization: { id: 'org-001', name: 'Chris Hani Baragwanath Hospital' },
    },
  ],
  this_visit_findings: [],
}

// =============================================================================
// EXPORT ALL MOCK PATIENTS
// =============================================================================

export const MOCK_PATIENTS: MockPatientCase[] = [
  BREAST_CANCER_PATIENT,
  DIABETIC_FOOT_PATIENT,
  HIGH_RISK_PREGNANCY_PATIENT,
  HIV_ART_PATIENT,
  PEDIATRIC_ASTHMA_PATIENT,
  ELDERLY_MULTIMORBID_PATIENT,
  MENTAL_HEALTH_PATIENT,
  TUBERCULOSIS_PATIENT,
  POST_SURGICAL_PATIENT,
  TRAUMA_PATIENT,
]

export const MOCK_PATIENTS_BY_KEY: Record<string, MockPatientCase> = Object.fromEntries(
  MOCK_PATIENTS.map((p) => [p.key, p]),
)

export function getMockPatientByKey(key: string): MockPatientCase | undefined {
  return MOCK_PATIENTS_BY_KEY[key]
}
