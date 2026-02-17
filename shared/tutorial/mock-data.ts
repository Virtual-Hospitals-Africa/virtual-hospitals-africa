// =============================================================================
// FILE: /shared/tutorial/mock-data.ts
// Static mock data for tutorial (no database calls needed)
// =============================================================================

import type {
  CheckForTask,
  Existence,
  MostRecentBriefHistoryFindings,
  Priority,
  RenderedBriefHistoryRelativeToHealthWorker,
  RenderedEmployee,
  RenderedFindingRelativeToHealthWorker,
  RenderedPatient,
  RenderedSidebarWorkflow,
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

// =============================================================================
// PATIENT & EMPLOYEE
// =============================================================================

/**
 * Mock patient for tutorial - Duduzile Langa
 */
export const TUTORIAL_PATIENT: RenderedPatient = {
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
  description: '34 years old, Female',
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
  name: 'Tutorial Nurse',
  first_names: 'Tutorial',
  surname: 'Nurse',
  preferred_name: 'Tutorial',
  email: 'tutorial@virtualhospitals.africa',
  avatar_url: null,
  phone_number: null,
  id: 'tutorial-hw-001',
  organizations: [
    {
      id: 'tutorial-org-001',
      name: 'Tutorial Clinic',
      country: 'ZM',
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
      specialty: 'Primary care',
      profession: 'nurse',
      is_admin: false,
      in_departments: [],
    },
  ],
  organization_id: 'tutorial-org-001',
  employee_id: 'tutorial-emp-001',
  profession: 'nurse',
  is_admin: false,
  specialty: 'Primary care',
  href: '/tutorial',
}

const MOCK_PROVIDER = {
  ...TUTORIAL_EMPLOYEE,
  is_me: 1 as const,
}

// =============================================================================
// WARNING SIGNS
// =============================================================================

/**
 * Warning signs for tutorial - includes "Cough" which triggers SpO2 requirement
 */
export const TUTORIAL_WARNING_SIGNS: WarningSignWithMaybeRecord[] = [
  // Emergency signs
  {
    key: 'Obstructed airway',
    clinical_finding_s_expression: '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Respiratory obstruction" "disorder"))',
    primary_name: 'Obstructed airway',
    secondary_text: 'Not breathing',
    sats_priority: 'Emergency',
    category: 'Emergency',
  },
  {
    key: 'Cardiac arrest',
    clinical_finding_s_expression: '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Cardiac arrest" "disorder"))',
    primary_name: 'Cardiac arrest',
    secondary_text: 'Heart attack',
    sats_priority: 'Emergency',
    category: 'Emergency',
  },
  {
    key: 'Seizure',
    clinical_finding_s_expression: '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Seizure" "finding"))',
    primary_name: 'Seizure',
    secondary_text: 'Current',
    sats_priority: 'Emergency',
    category: 'Emergency',
  },

  // Very Urgent signs
  {
    key: 'Acute shortness of breath',
    clinical_finding_s_expression:
      '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Dyspnea" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))',
    primary_name: 'Shortness of breath',
    secondary_text: 'acute',
    sats_priority: 'Very urgent',
    category: 'Very urgent',
  },
  {
    key: 'Chest pain',
    clinical_finding_s_expression: '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Chest pain" "finding"))',
    primary_name: 'Chest pain',
    secondary_text: null,
    sats_priority: 'Very urgent',
    category: 'Very urgent',
  },
  {
    key: 'Severe pain',
    clinical_finding_s_expression:
      '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Pain" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))',
    primary_name: 'Severe pain',
    secondary_text: null,
    sats_priority: 'Very urgent',
    category: 'Very urgent',
  },

  // Urgent signs
  {
    key: 'Moderate pain',
    clinical_finding_s_expression:
      '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Pain" "finding") (qualifier (snomed_concept "Moderate (severity modifier)" "qualifier value")))',
    primary_name: 'Moderate pain',
    secondary_text: null,
    sats_priority: 'Urgent',
    category: 'Urgent',
  },
  {
    key: 'Persistent vomiting',
    clinical_finding_s_expression: '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Persistent vomiting" "disorder"))',
    primary_name: 'Persistent vomiting',
    secondary_text: null,
    sats_priority: 'Urgent',
    category: 'Urgent',
  },
  {
    key: 'Abdominal pain',
    clinical_finding_s_expression: '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Abdominal pain" "finding"))',
    primary_name: 'Abdominal pain',
    secondary_text: null,
    sats_priority: 'Urgent',
    category: 'Urgent',
  },

  // Common Symptoms - including Cough (tutorial target)
  {
    key: 'Cough',
    clinical_finding_s_expression: '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Cough" "finding"))',
    primary_name: 'Cough',
    secondary_text: null,
    category: 'Common Symptoms',
  },
  {
    key: 'Headache',
    clinical_finding_s_expression: '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Headache" "finding"))',
    primary_name: 'Headache',
    secondary_text: null,
    category: 'Common Symptoms',
  },
  {
    key: 'Fatigue',
    clinical_finding_s_expression: '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Fatigue" "finding"))',
    primary_name: 'Fatigue',
    secondary_text: null,
    category: 'Common Symptoms',
  },
  {
    key: 'Fever',
    clinical_finding_s_expression: '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Fever" "finding"))',
    primary_name: 'Fever',
    secondary_text: 'feeling hot',
    category: 'Common Symptoms',
  },
  {
    key: 'Sore throat',
    clinical_finding_s_expression: '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Sore throat" "finding"))',
    primary_name: 'Sore throat',
    secondary_text: null,
    category: 'Common Symptoms',
  },
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
    priority: null,
    score: null,
    existence,
    provider: MOCK_PROVIDER,
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
export const TUTORIAL_BRIEF_HISTORY: MostRecentBriefHistoryFindings = {
  pregnancy: makeBriefHistoryFinding('pregnancy', 'No'),
  diabetes: makeBriefHistoryFinding('diabetes', 'No'),
  asthma: makeBriefHistoryFinding('asthma', 'Yes'), // Relevant to cough
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
  priority: null,
  score: null,
  existence: 'Yes',
  provider: MOCK_PROVIDER,
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
  priority: null,
  score: null,
  existence: 'Yes',
  provider: MOCK_PROVIDER,
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
    priority: null,
    score: 3,
    existence: 'Yes',
    provider: MOCK_PROVIDER,
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
    priority: null,
    score: 0,
    existence: 'Yes',
    provider: MOCK_PROVIDER,
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
    priority: null,
    score: 0,
    existence: 'Yes',
    provider: MOCK_PROVIDER,
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
    priority: null,
    score: 2,
    existence: 'Yes',
    provider: MOCK_PROVIDER,
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
    priority: null,
    score: null,
    existence: 'Yes',
    provider: MOCK_PROVIDER,
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
  const hasSpO2 = measurements.some((m) => m.vital === 'blood_oxygen_saturation')
  if (!hasSpO2) {
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
function makeCheckForTask(condition: typeof RESPIRATORY_CHECK_FOR_CONDITIONS[number]): CheckForTask {
  // S-expression for the finding with "Known absent" qualifier (410516002)
  const s_expression = `(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "${condition.label}" "finding") (qualifier 410516002))`

  return {
    procedure: {
      type: 'procedure',
      id: `tutorial-check-${condition.key}`,
      created_at: new Date(),
      patient_encounter_id: 'tutorial-encounter-001',
      root_snomed_concept_id: '386053000',
      root_snomed_concept_name: 'Evaluation procedure',
      root_snomed_concept_category: 'procedure',
      specific_snomed_concept_id: '386053000',
      specific_snomed_concept_name: 'Evaluation procedure',
      specific_snomed_concept_category: 'procedure',
      modifiers: [],
      attributes: [],
      evaluations: [],
      displays: {
        finding: condition.label,
        value: condition.label,
        full: `Check for: ${condition.label}`,
      },
      value: {
        type: 's_expression',
        s_expression,
        node: {
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
        },
      },
    },
    completed: true, // All answered "No"
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
        priority: null,
        score: 0,
        existence: 'Yes',
        provider: MOCK_PROVIDER,
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
        priority: null,
        score: 0,
        existence: 'Yes',
        provider: MOCK_PROVIDER,
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
        priority: null,
        score: 0,
        existence: 'Yes',
        provider: MOCK_PROVIDER,
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
        priority: null,
        score: 3, // >30 bpm = 3 points
        existence: 'Yes',
        provider: MOCK_PROVIDER,
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
        priority: null,
        score: 0, // 51-101 = 0 points
        existence: 'Yes',
        provider: MOCK_PROVIDER,
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
        priority: null,
        score: 0, // 101-200 = 0 points
        existence: 'Yes',
        provider: MOCK_PROVIDER,
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
        priority: null,
        score: 2, // >38.5 = 2 points
        existence: 'Yes',
        provider: MOCK_PROVIDER,
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
        priority: null,
        score: null,
        existence: 'Yes',
        provider: MOCK_PROVIDER,
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
        priority: null,
        score: null,
        existence: 'Yes',
        provider: MOCK_PROVIDER,
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
    priority: null,
    score: null,
    existence: 'Yes',
    provider: MOCK_PROVIDER,
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
function makeBriefHistoryRecords(): RenderedFindingRelativeToHealthWorker[] {
  return Object.values(TUTORIAL_BRIEF_HISTORY).filter(
    (f): f is RenderedBriefHistoryRelativeToHealthWorker => f !== undefined,
  )
}

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

  // Brief history step
  if (currentStep === 'brief_history') {
    steps.push({
      workflow_step: 'brief_history',
      title: 'Brief History',
      status: 'in progress',
      records: makeBriefHistoryRecords(),
    })
  } else if (isStepCompleted(currentStep, 'brief_history')) {
    steps.push({
      workflow_step: 'brief_history',
      title: 'Brief History',
      status: 'completed',
      records: makeBriefHistoryRecords(),
    })
  }

  // Height and weight (shown from vitals step onward)
  if (isStepCompleted(currentStep, 'brief_history') || currentStep === 'vitals') {
    steps.push({
      workflow_step: 'height_and_weight',
      title: 'Height and Weight',
      status: 'completed',
      records: TUTORIAL_HEIGHT_WEIGHT,
    })
  }

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
    patient_names: TUTORIAL_PATIENT.names!,
    can_do_triage: true,
    senior_health_worker_name: 'Bongani Sibeko',
  }
}

// =============================================================================
// EMPTY PATIENT HISTORY (for layout)
// =============================================================================

export const EMPTY_PATIENT_HISTORY = {
  pre_existing_conditions: [],
  allergies: [],
  family_history: [],
  major_surgeries: [],
  medications: [],
  lifestyle: [],
}
