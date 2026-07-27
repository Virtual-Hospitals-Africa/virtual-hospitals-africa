export const CONSULTATION_TARGETS = {
  // Overview / Waiting room
  WAITING_ROOM_TABLE: "[data-tutorial='consultation-waiting-room-table']",
  WAITING_ROOM_ROW: "[data-tutorial='consultation-waiting-room-table'] tbody tr:first-child",
  WAITING_ROOM_START_BUTTON: "[data-tutorial='consultation-waiting-room-table'] tbody tr:first-child a",

  // Registration / Insurance
  INSURANCE_SECTION: "[data-tutorial='insurance-section']",
  INSURANCE_PROVIDER: "div:has(> [name='insurance.insurance_provider'])",
  INSURANCE_PLAN: "div:has(> [name='insurance.plan_name'])",
  INSURANCE_MEMBERSHIP: "div:has(> [name='insurance.membership_number'])",

  // Triage summary
  TRIAGE_SUMMARY: "[data-tutorial='triage-summary']",
  TRIAGE_SYMPTOMS: "[data-tutorial='triage-symptoms']",
  TRIAGE_VITALS: "[data-tutorial='triage-vitals']",
  TRIAGE_PRIORITY: "[data-tutorial='triage-priority']",

  // Consultation sidebar
  SIDEBAR_STEPS: "[data-tutorial='consultation-sidebar']",
  SIDEBAR_COMPLETED_STEPS: "[data-tutorial='sidebar-completed-steps']",

  // Examinations
  EXAM_FINDINGS: "[data-tutorial='exam-findings']",
  EXAM_MUSCLE_TENDERNESS: "[data-tutorial='exam-muscle-tenderness']",
  EXAM_PROXIMAL_WEAKNESS: "[data-tutorial='exam-proximal-weakness']",

  // Diagnostic tests
  LAB_RESULTS: "[data-tutorial='lab-results']",
  LAB_CALCIUM: "[data-tutorial='lab-calcium']",
  LAB_PTH: "[data-tutorial='lab-pth']",
  LAB_PHOSPHATE: "[data-tutorial='lab-phosphate']",

  // Patient drawer
  PATIENT_DRAWER: '#patient-drawer',
  PATIENT_DRAWER_THIS_VISIT: '#patient-drawer-this-visit',
  PATIENT_DRAWER_HISTORY: '#patient-drawer-history',

  // Diagnoses
  DIAGNOSIS_PANEL: "[data-tutorial='diagnosis-panel']",
  DIAGNOSIS_HYPERPARATHYROIDISM: "[data-tutorial='diagnosis-hyperparathyroidism']",

  // Referral
  REFERRAL_PANEL: "[data-tutorial='referral-panel']",
  REFERRAL_SPECIALIST: "[data-tutorial='referral-specialist']",
  REFERRAL_REASON: "[data-tutorial='referral-reason']",

  // Billing
  BILLING_PANEL: "[data-tutorial='billing-panel']",
  BILLING_LINE_ITEMS: "[data-tutorial='billing-line-items']",
  BILLING_CONSULTATION_FEE: "[data-tutorial='billing-consultation-fee']",
  BILLING_COPAYMENT: "[data-tutorial='billing-copayment']",
  BILLING_TOTAL: "[data-tutorial='billing-total']",
  BILLING_INSURER_LIABLE: "[data-tutorial='billing-insurer-liable']",
  BILLING_SUBMIT_BUTTON: "[data-tutorial='billing-submit']",
  BILLING_STATUS: "[data-tutorial='billing-status']",
} as const
