// =============================================================================
// FILE: /shared/tutorial/script.ts
// Complete tutorial script - single source of truth for all dialogue and actions
// =============================================================================

import type { ScriptItem, TutorialStep } from './types.ts'
import { TUTORIAL_TARGETS } from './targets.ts'
import { TUTORIAL_ASSESSMENT_VALUES, TUTORIAL_VITAL_VALUES } from './mock-data.ts'

/**
 * The complete tutorial script as a flat array.
 *
 * Flow:
 * 1. Welcome & Waiting Room (8 items) - intro, mission, waiting room overview
 * 2. Warning Signs (16 items) - patient intro, category-by-category walkthrough, wait_click for Cough
 * 3. Brief History (6 items) - pre-filled, explains asthma connection
 * 4. Height/Weight mention (2 items) - "already measured"
 * 5. Vitals (13 items) - SpO2 prompt, step-by-step vital values with TEWS explanations
 * 6. Additional Tasks (4 items) - drawer vitals preview, respiratory check-for
 * 7. Assign Priority (3 items) - TEWS score and priority
 * 8. Route Patient (4 items) - Bongani consultation, modal notification
 * 9. Completion (3 items)
 *
 * Total: ~60 items
 */
export const TUTORIAL_SCRIPT: ScriptItem[] = [
  // =========================================================================
  // SECTION 1: WELCOME & WAITING ROOM
  // =========================================================================
  {
    type: 'dialogue',
    speaker: 'guide',
    text: 'Howzit and welcome to Virtual Hospitals Africa!',
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: "My name is Lindiwe Nkosi and I'll guide you through a brief tour of our digital health platform.",
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: "You'll play the role of a triage nurse at a rural clinic: the front line in assessing patients to make sure urgent cases are escalated.",
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: "We'll start at the Open Encounters view.",
    highlight: 'h1, ' + TUTORIAL_TARGETS.WAITING_ROOM_TABLE,
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: 'Here you can see all patients present at the clinic...',
    highlight: '[data-column="patient"]',
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: "why they're here...",
    highlight: '[data-column="reason-for-visit"]',
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: 'and their status including who is with them at present.',
    highlight: '[data-column="location"], [data-column="status"], [data-column="employees"]',
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: 'Patients are prioritized based on the urgency of their case using the South African Triage Scale.',
    link: {
      title: 'Learn more',
      href: '/blog/sats',
    },
    highlight: '[data-column="priority"], [data-column="target-time"], [data-column="arrived"]',
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: "Duduzile just arrived and is awaiting triage. Let's see her now.",
    highlight: TUTORIAL_TARGETS.WAITING_ROOM_ROW_DUDUZILE,
  },
  {
    type: 'wait_click',
    text: 'Click the "Start Triage" button',
    target: TUTORIAL_TARGETS.WAITING_ROOM_START_TRIAGE_BUTTON,
  },
  {
    type: 'step_transition',
    to_step: 'warning_signs',
  },

  // =========================================================================
  // SECTION 2: WARNING SIGNS
  // =========================================================================
  {
    type: 'dialogue',
    speaker: 'patient',
    text: "Hello - I'm not feeling well today so I appreciate your seeing me.",
    position: 'bottom-right',
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: "The first step of triage is to ask for the patient's chief complaint and check for warning signs.",
    highlight: TUTORIAL_TARGETS.WARNING_SIGNS_PANEL,
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: '<span class="text-red-700">Emergency</span> signs require immediate treatment.',
    dangerousHTML: true,
    highlight: TUTORIAL_TARGETS.WARNING_SIGNS_EMERGENCY,
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: '<span class="text-orange-700">Very urgent</span> signs should be treated within ten minutes.',
    dangerousHTML: true,
    highlight: TUTORIAL_TARGETS.WARNING_SIGNS_VERY_URGENT,
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: '<span class="text-yellow-600">Urgent</span> signs should be treated within one hour.',
    dangerousHTML: true,
    highlight: TUTORIAL_TARGETS.WARNING_SIGNS_URGENT,
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: 'Common symptoms are listed here',
    highlight: TUTORIAL_TARGETS.WARNING_SIGNS_COMMON_SYMPTOMS,
    position: 'top-left',
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: 'and we can search for any other finding.',
    highlight: TUTORIAL_TARGETS.WARNING_SIGNS_SEARCH,
    link: {
      title: 'Learn about our precise medical note-taking technology backed by SNOMED',
      href: '/blog/snomed',
    },
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: `Let's ask, "Duduzile what brings you in today?"`,
  },
  {
    type: 'dialogue',
    speaker: 'patient',
    text: "I've had a bad cough that seems to be getting worse.",
    position: 'bottom-right',
  },
  {
    type: 'wait_click',
    target: TUTORIAL_TARGETS.COUGH_CHECKBOX,
    text: 'Click "Cough" under Common Symptoms to record it.',
    position: 'top-left',
  },
  {
    type: 'wait_click',
    target: 'button#triage-submit',
    text: 'And "Next" to continue to measure vitals',
    position: 'top-left',
  },
  {
    type: 'step_transition',
    to_step: 'vitals',
  },
  // =========================================================================
  // SECTION 3: BRIEF HISTORY (STEP TRANSITION)
  // =========================================================================
  // {
  //   type: 'dialogue',
  //   speaker: 'guide',
  //   text: 'Next is the Brief History. Here we quickly check for conditions that affect treatment.',
  // },
  // {
  //   type: 'dialogue',
  //   speaker: 'guide',
  //   text: "I've already filled this in for Duduzile. Let me show you the key points.",
  // },
  // {
  //   type: 'dialogue',
  //   speaker: 'guide',
  //   text: 'Pregnancy is always asked - it affects vital sign interpretation and medication choices.',
  //   highlight: TUTORIAL_TARGETS.BRIEF_HISTORY_PREGNANCY,
  // },
  // {
  //   type: 'dialogue',
  //   speaker: 'guide',
  //   text: 'Same with Diabetes - it can affect treatment decisions.',
  //   highlight: TUTORIAL_TARGETS.BRIEF_HISTORY_DIABETES,
  // },
  // {
  //   type: 'dialogue',
  //   speaker: 'guide',
  //   text: 'Notice Duduzile has asthma. This is very relevant given her cough - respiratory conditions need extra attention.',
  //   highlight: TUTORIAL_TARGETS.BRIEF_HISTORY_ASTHMA,
  // },
  // {
  //   type: 'dialogue',
  //   speaker: 'guide',
  //   text: "The history is now visible in the Patient Drawer, building a complete picture of Duduzile's health.",
  //   highlight: TUTORIAL_TARGETS.PATIENT_DRAWER_THIS_VISIT,
  // },

  // =========================================================================
  // SECTION 4: HEIGHT & WEIGHT MENTION (STEP TRANSITION)
  // =========================================================================
  // {
  //   type: 'step_transition',
  //   to_step: 'vitals',
  // },
  // {
  //   type: 'dialogue',
  //   speaker: 'guide',
  //   text: "Height and weight were measured when Duduzile arrived. You can see them in the Patient Drawer - she's 165cm and 62kg.",
  //   highlight: TUTORIAL_TARGETS.PATIENT_DRAWER_THIS_VISIT,
  // },

  // =========================================================================
  // SECTION 5: MEASURE VITALS
  // =========================================================================
  {
    type: 'dialogue',
    speaker: 'guide',
    text: `Well done! Now it's time to measure vitals. But first, let's have a look at the patient drawer on the right.`,
    dangerousHTML: true,
    highlight: TUTORIAL_TARGETS.PATIENT_DRAWER,
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: "'This Visit' shows all findings from this encounter including the cough you just recorded.",
    highlight: TUTORIAL_TARGETS.PATIENT_DRAWER_THIS_VISIT,
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: "'History' shows records from past visits. Duduzile is a returning patient we are able to skip taking her history, height, and weight.",
    highlight: [TUTORIAL_TARGETS.PATIENT_DRAWER_HISTORY, '#sidebar-list-item-brief-history, #sidebar-list-item-height-weight'],
  },
  {
    type: 'wait_click',
    text: "We can click findings to learn more and speak with the health workers who originally recorded them. Click 'Allergy to peanut' as an example",
    target: '#record-chip-allergy-to-peanut > button',
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text:
      "The health worker who originally recorded the finding is shown and we can message or video call them. In this case there's no need, but doctors may want to message us about cases we escalate to them.",
    highlight: '[data-floating-ui-focusable]',
    click_target_on_advance: '.record-chip button[aria-expanded="true"]',
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text:
      "Now it's time to take Duduzile's vitals. For adult patients this always consists of assessing her consciousness, mobility, trauma and measuring her blood pressure, temperature, heart rate and respiratory rate.",
    highlight: TUTORIAL_TARGETS.VITALS_FORM,
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text:
      'When vitals deviate from the normal reference range they get a positive score. If multiple vitals are out of range that can result in a prioritization of urgent, very urgent, or an emergency just as with the warning signs.',
    highlight: TUTORIAL_TARGETS.VITALS_FORM,
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text:
      "We also see that due to the cough we're prompted to measure blood oxygen saturation. Throughout triage the system will prompt to check for other findings or make additional measurements based on standard treatment protocols.",
    highlight: TUTORIAL_TARGETS.VITAL_SPO2,
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: "Let's fill this in.",
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: 'She is Alert.',
    highlight: TUTORIAL_TARGETS.VITAL_CONSCIOUSNESS,
    input: { field: "[name='assessments.consciousness.s_expression']", value: TUTORIAL_ASSESSMENT_VALUES['assessments.consciousness.s_expression'] },
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: 'Walking normally.',
    highlight: TUTORIAL_TARGETS.VITAL_MOBILITY,
    input: {
      field: "[name='assessments.mobility_assessment.s_expression']",
      value: TUTORIAL_ASSESSMENT_VALUES['assessments.mobility_assessment.s_expression'],
    },
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: 'No trauma.',
    highlight: TUTORIAL_TARGETS.VITAL_TRAUMA,
    input: { field: "[name='assessments.trauma_presence.s_expression']", value: TUTORIAL_ASSESSMENT_VALUES['assessments.trauma_presence.s_expression'] },
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: "Temperature is 39 degrees. That's a fever and 2 points on the Triage Early Warning Scale.",
    highlight: TUTORIAL_TARGETS.VITAL_TEMPERATURE,
    input: { field: "[name='measurements.temperature.value']", value: TUTORIAL_VITAL_VALUES['measurements.temperature.value'] },
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: "She's breathing quickly too: respiratory rate is 32 bpm which is 3 points on the Triage Early Warning Scale.",
    highlight: TUTORIAL_TARGETS.VITAL_RESPIRATORY_RATE,
    input: { field: "[name='measurements.respiratory_rate.value']", value: TUTORIAL_VITAL_VALUES['measurements.respiratory_rate.value'] },
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: 'Heart rate: 95 - within the normal range.',
    highlight: TUTORIAL_TARGETS.VITAL_HEART_RATE,
    input: { field: "[name='measurements.heart_rate.value']", value: TUTORIAL_VITAL_VALUES['measurements.heart_rate.value'] },
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: 'Blood pressure is 120/80 - within the normal range.',
    highlight: TUTORIAL_TARGETS.VITAL_BLOOD_PRESSURE,
    input: [
      { field: "[name='measurements.blood_pressure_systolic.value']", value: TUTORIAL_VITAL_VALUES['measurements.blood_pressure_systolic.value'] },
      { field: "[name='measurements.blood_pressure_diastolic.value']", value: TUTORIAL_VITAL_VALUES['measurements.blood_pressure_diastolic.value'] },
    ],
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: 'Blood oxygen saturation is at 98%. Lower than 95% would have prompted for oxygen therapy, but this is normal.',
    highlight: TUTORIAL_TARGETS.VITAL_SPO2,
    input: { field: "[name='measurements.blood_oxygen_saturation.value']", value: TUTORIAL_VITAL_VALUES['measurements.blood_oxygen_saturation.value'] },
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: "Let's continue.",
  },

  // =========================================================================
  // SECTION 6: ADDITIONAL TASKS
  // =========================================================================
  {
    type: 'step_transition',
    to_step: 'additional_tasks',
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: 'Once measurements have been taken, they appear in the Patient Drawer with the other findings.',
    highlight: TUTORIAL_TARGETS.PATIENT_DRAWER_MEASURE_VITALS,
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text:
      "Now let's check for other findings related to coughing. The presence of any of these and we would want to refer the case urgently because they would point to something more serious.",
    highlight: TUTORIAL_TARGETS.ADDITIONAL_TASKS_PANEL,
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: "Since none apply here, let's continue.",
  },

  // =========================================================================
  // SECTION 7: ASSIGN PRIORITY
  // =========================================================================
  {
    type: 'step_transition',
    to_step: 'assign_priority',
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: "Here we can see a summary of everything we've learned from this visit and a final prioritization for Duduzile's case.",
    highlight: TUTORIAL_TARGETS.ASSIGN_PRIORITY_TABLE,
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text:
      "Because of her fever and very high respiratory rate, she got a Triage Early Warning Score of 5 meaning her case is Very Urgent. Let's route her accordingly so she can be seen as soon as possible.",
  },

  // =========================================================================
  // SECTION 8: ROUTE PATIENT
  // =========================================================================
  {
    type: 'step_transition',
    to_step: 'route_patient',
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: "Our senior primary care nurse Bongani Sibeko is on call today and is currently handling a routine case. Let's route the case to him.",
    highlight: TUTORIAL_TARGETS.ROUTE_PATIENT_PANEL,
  },
  {
    type: 'dialogue',
    speaker: 'nurse',
    text: "Hm, fever and breathing very heavy. Everything else looks normal. Let's start her on ceftriaxone in case this is severe bacterial pneumonia.",
  },
  {
    type: 'modal',
    message: 'Please bring the patient to primary care room 102 for treatment.',
    buttonText: "I'm on my way",
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
    text: 'Thank you for taking care of me!',
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text:
      "You've completed the triage tutorial! You learned to record warning signs, review history, measure vitals, check for additional findings, assign priority, and route the patient.",
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: "You're ready to help real patients. Every assessment you do makes a difference in someone's life.",
    is_final: true,
  },
]

/**
 * Get the step that should be active at a given script index.
 * Used for validating state and debugging.
 */
export function getStepAtIndex(idx: number): TutorialStep {
  let current_step: TutorialStep = 'waiting_room'

  for (let i = 0; i <= idx && i < TUTORIAL_SCRIPT.length; i++) {
    const item = TUTORIAL_SCRIPT[i]
    if (item.type === 'step_transition') {
      current_step = item.to_step
    }
  }

  return current_step
}
