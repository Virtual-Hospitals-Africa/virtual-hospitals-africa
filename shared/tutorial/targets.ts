// =============================================================================
// FILE: /shared/tutorial/targets.ts
// CSS selectors for tutorial spotlight targets - single source of truth
// =============================================================================

export const TUTORIAL_TARGETS = {
  // Waiting room targets - use CSS selectors based on DOM structure
  // since we're reusing the existing WaitingRoomView component
  WAITING_ROOM_TABLE: "[data-tutorial='waiting-room-table']",
  WAITING_ROOM_ROW_DUDUZILE: "[data-tutorial='waiting-room-table'] tbody tr:first-child",
  WAITING_ROOM_START_TRIAGE_BUTTON: "[data-tutorial='waiting-room-table'] tbody tr:first-child a",

  // From original components (DO NOT MODIFY original components)
  WARNING_SIGNS_PANEL: '#warning-signs',
  WARNING_SIGNS_EMERGENCY: '#priority-table-emergency',
  WARNING_SIGNS_VERY_URGENT: '#priority-table-very-urgent',
  WARNING_SIGNS_URGENT: '#priority-table-urgent',
  WARNING_SIGNS_COMMON_SYMPTOMS: '#priority-table-common-symptoms',
  WARNING_SIGNS_SEARCH: '#warning-signs-search',
  COUGH_CHECKBOX: 'label:has(#common-symptoms-cough)', // from uniqueIdentifier() in WarningSigns
  PATIENT_DRAWER: '#patient-drawer',
  PATIENT_DRAWER_THIS_VISIT: '#patient-drawer-this-visit',
  PATIENT_DRAWER_MEASURE_VITALS: '#patient-drawer-workflow-step-triage-measure-vitals',
  SPO2_INPUT: "[name='measurements.blood_oxygen_saturation.value']",

  // Brief history - condition rows (via label ID selector)
  BRIEF_HISTORY_PREGNANCY: 'div:has(> label#pregnancy\\.existence-label)',
  BRIEF_HISTORY_DIABETES: 'div:has(> label#diabetes\\.existence-label)',
  BRIEF_HISTORY_ASTHMA: 'div:has(> label#asthma\\.existence-label)',
  VITALS_FORM: "[data-tutorial='vitals-form']",

  // Vitals - Assessments (row container via label for= selector)
  VITAL_CONSCIOUSNESS: 'div:has(> div > label[for="assessments.consciousness"])',
  VITAL_MOBILITY: 'div:has(> div > label[for="assessments.mobility_assessment"])',
  VITAL_TRAUMA: 'div:has(> div > label[for="assessments.trauma_presence"])',

  // Vitals - Measurements (row container via label for= selector)
  VITAL_TEMPERATURE: 'div:has(> div > label[for="measurements.temperature"])',
  VITAL_RESPIRATORY_RATE: 'div:has(> div > label[for="measurements.respiratory_rate"])',
  VITAL_HEART_RATE: 'div:has(> div > label[for="measurements.heart_rate"])',
  VITAL_BLOOD_PRESSURE: 'div:has(> div > label[for="measurements.blood_pressure_systolic"])',
  VITAL_SPO2: 'div:has(> div > label[for="measurements.blood_oxygen_saturation"])',

  // Additional Tasks step
  ADDITIONAL_TASKS_PANEL: "[data-tutorial='additional-tasks']",
  CHECK_FOR_GRID: "[data-tutorial='check-for-grid']",

  // Assign Priority step
  ASSIGN_PRIORITY_TABLE: "[data-tutorial='assign-priority-table']",
  PRIORITY_CONCLUSION: "[data-tutorial='priority-conclusion']",

  // Route Patient step
  ROUTE_PATIENT_PANEL: "[data-tutorial='route-patient']",
} as const

export type TutorialTarget = (typeof TUTORIAL_TARGETS)[keyof typeof TUTORIAL_TARGETS]
