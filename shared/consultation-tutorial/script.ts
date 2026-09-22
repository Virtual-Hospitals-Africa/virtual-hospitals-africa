import type { ScriptItem } from '../tutorial/types.ts'
import { CONSULTATION_TARGETS } from './targets.ts'

export const CONSULTATION_SCRIPT: ScriptItem[] = [
  // =========================================================================
  // SECTION 1: OVERVIEW
  // =========================================================================
  {
    type: 'dialogue',
    speaker: 'guide',
    text: 'Howzit and welcome back to Virtual Hospitals Africa!',
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: "I'm Lindiwe Nkosi. In this tutorial, we'll walk through a patient consultation, playing the role of Dr. Lufuno Zungu, a primary care doctor.",
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: "Along the way we'll see how we can connect with labs, specialists, and insurers all seamlessly through a shared digital health system.",
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: "Let's start at the Open Encounters view. Here you can see patients waiting to be seen.",
    highlight: CONSULTATION_TARGETS.WAITING_ROOM_TABLE,
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: 'Nomsa Ndlovu is a 52-year-old woman presenting with fatigue and bone pain. She has already been triaged and is waiting for her consultation.',
    highlight: CONSULTATION_TARGETS.WAITING_ROOM_ROW,
  },
  {
    type: 'wait_click',
    target: CONSULTATION_TARGETS.WAITING_ROOM_START_BUTTON,
    text: 'Click "Start Consultation" to begin seeing Nomsa.',
  },

  // =========================================================================
  // SECTION 2: REGISTRATION + INSURANCE
  // =========================================================================
  {
    type: 'step_transition',
    to_step: 'registration',
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: 'Before the consultation begins, our receptionist registers the patient and captures their insurance details.',
    highlight: '#current-insurance'
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: "The system can keep track of covered services under that private and/or public insurer and bill accordingly, as we'll see later",
    highlight: '#current-insurance'
  },

  // =========================================================================
  // SECTION 3: TRIAGE — WARNING SIGNS
  // =========================================================================
  {
    type: 'step_transition',
    to_step: 'triage_warning_signs',
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: 'Prior to the consultation, the triage nurse conducted triage, recording the patient\u2019s presenting symptoms.',
    highlight: '#warning-signs',
    link: {
      title: 'See our tutorial outlining the whole triage process.',
      href: '/tutorial',
    },
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: 'Nomsa reported fatigue, bone pain, polyuria, and muscle weakness. These have been recorded as her chief complaint.',
    highlight: '#warning-signs-selected-chips',
  },

  // =========================================================================
  // SECTION 4: EXAMINATIONS
  // =========================================================================
  {
    type: 'step_transition',
    to_step: 'examinations',
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text:
      "We're now in the consultation workflow where the doctor can enter anything related to the visit.",
    highlight: CONSULTATION_TARGETS.EXAM_FINDINGS,
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: 'The Patient Drawer on the right shows all findings collected so far, including what was recorded during triage.',
    highlight: CONSULTATION_TARGETS.PATIENT_DRAWER,
    position: 'bottom-left',
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: 'You can click on any finding in the drawer to see its details \u2014 including which facility and clinician recorded it.',
    highlight: CONSULTATION_TARGETS.PATIENT_DRAWER_THIS_VISIT,
    position: 'bottom-left',
  },
  {
    type: 'dialogue',
    speaker: 'doctor',
    text: "I've examined Nomsa. She has diffuse muscle tenderness and decreased proximal muscle strength.",
    highlight: CONSULTATION_TARGETS.EXAM_FINDINGS,
  },
  {
    type: 'dialogue',
    speaker: 'doctor',
    text: 'She struggled to rise from a seated position without using her arms for support \u2014 classic proximal weakness.',
    highlight: CONSULTATION_TARGETS.EXAM_PROXIMAL_WEAKNESS,
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: "Based on her symptoms and exam, Dr. Zungu has ordered blood tests. Let's see the results.",
  },

  // =========================================================================
  // SECTION 5: DIAGNOSTIC TESTS
  // =========================================================================
  {
    type: 'step_transition',
    to_step: 'diagnostic_tests',
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: 'Lab results have come back. Several values are outside the normal range.',
    highlight: CONSULTATION_TARGETS.LAB_RESULTS,
  },
  {
    type: 'dialogue',
    speaker: 'doctor',
    text: 'Serum calcium is significantly elevated at 3.1 mmol/L \u2014 the normal range is 2.2 to 2.6.',
    highlight: CONSULTATION_TARGETS.LAB_CALCIUM,
  },
  {
    type: 'dialogue',
    speaker: 'doctor',
    text: 'Parathyroid hormone is also elevated at 12.5 pmol/L \u2014 almost double the upper limit of normal.',
    highlight: CONSULTATION_TARGETS.LAB_PTH,
  },
  {
    type: 'dialogue',
    speaker: 'doctor',
    text: 'Phosphate is low at 0.7 mmol/L. This triad \u2014 high calcium, high PTH, low phosphate \u2014 is the classic pattern.',
    highlight: CONSULTATION_TARGETS.LAB_PHOSPHATE,
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text:
      "Notice the Patient Drawer now shows Nomsa's history from other facilities. A calcium test from Johannesburg District Lab 6 months ago already showed a borderline elevated result.",
    highlight: CONSULTATION_TARGETS.PATIENT_DRAWER_HISTORY,
    position: 'bottom-left',
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text:
      'Having access to results from other facilities helps clinicians see patterns that might otherwise be missed. This calcium has been rising over time.',
    position: 'bottom-left',
  },

  // =========================================================================
  // SECTION 6: DIAGNOSES
  // =========================================================================
  {
    type: 'step_transition',
    to_step: 'diagnoses',
  },
  {
    type: 'dialogue',
    speaker: 'doctor',
    text: 'The combination of elevated calcium and elevated PTH, together with low phosphate and her symptoms, points clearly to primary hyperparathyroidism.',
    highlight: CONSULTATION_TARGETS.DIAGNOSIS_HYPERPARATHYROIDISM,
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: 'Diagnoses are coded using SNOMED CT, which ensures consistent terminology across the health system.',
    highlight: CONSULTATION_TARGETS.DIAGNOSIS_PANEL,
  },
  {
    type: 'dialogue',
    speaker: 'doctor',
    text: 'Primary hyperparathyroidism needs specialist management. I will refer Nomsa to an endocrinologist.',
  },

  // =========================================================================
  // SECTION 7: REFERRAL
  // =========================================================================
  {
    type: 'step_transition',
    to_step: 'referral',
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: 'You can refer patients within your facility or to an external specialist.',
    highlight: CONSULTATION_TARGETS.REFERRAL_PANEL,
  },
  {
    type: 'dialogue',
    speaker: 'doctor',
    text: "I'm referring Nomsa to Dr. Amahle Dlamini, an endocrinologist who specialises in parathyroid conditions.",
    highlight: CONSULTATION_TARGETS.REFERRAL_SPECIALIST,
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: 'The referral includes the reason, supporting evidence, and urgency level \u2014 so the specialist has everything they need.',
    highlight: CONSULTATION_TARGETS.REFERRAL_REASON,
  },
  {
    type: 'modal',
    message: 'Referral sent to Dr. Amahle Dlamini, Endocrinologist',
    buttonText: 'Continue',
  },
  {
    type: 'dialogue',
    speaker: 'endocrinologist',
    text: "Thank you, Dr. Zungu. I'll review Nomsa's chart and see her within the next two weeks.",
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: "Now let's look at something exciting \u2014 automatic billing.",
  },

  // =========================================================================
  // SECTION 8: BILLING
  // =========================================================================
  {
    type: 'step_transition',
    to_step: 'billing',
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: 'The billing summary is automatically generated from the procedures recorded during the encounter.',
    highlight: CONSULTATION_TARGETS.BILLING_PANEL,
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: 'Each procedure \u2014 the consultation, blood tests, and other diagnostics \u2014 is listed with its fee.',
    highlight: CONSULTATION_TARGETS.BILLING_LINE_ITEMS,
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: "Nomsa's GP consultation has a co-payment of R150, which is collected from the patient at reception.",
    position: 'top-right',
    highlight: CONSULTATION_TARGETS.BILLING_COPAYMENT,
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: 'The remaining R1,720 is the insurer\u2019s liability and will be claimed from First Mutual Life.',
    highlight: CONSULTATION_TARGETS.BILLING_INSURER_LIABLE,
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: 'Organisation admins can create a fee schedule so that the system can automatically calculate co-payments and bill insurers appropriately.',
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text:
      'The same workflow works for cash-paying patients, private insurance, National Health Insurance, and even government-funded facilities that zero-rate their procedures.',
  },
  {
    type: 'wait_click',
    target: CONSULTATION_TARGETS.BILLING_SUBMIT_BUTTON,
    text: 'Click "Submit to Insurer" to send the claim to First Mutual Life.',
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: 'The claim has been submitted! The status will update as the insurer processes it \u2014 from Submitted to Accepted to Paid.',
    highlight: CONSULTATION_TARGETS.BILLING_STATUS,
  },

  // =========================================================================
  // SECTION 9: COMPLETION
  // =========================================================================
  {
    type: 'step_transition',
    to_step: 'complete',
  },
  {
    type: 'dialogue',
    speaker: 'patient',
    text: 'Thank you for your thorough care, Dr. Zungu. I feel much better knowing what is going on.',
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text:
      "You've completed the consultation tutorial! You've seen how VHA handles registration, consultation, referrals, and billing \u2014 all in one seamless workflow.",
    is_final: true,
  },
]
