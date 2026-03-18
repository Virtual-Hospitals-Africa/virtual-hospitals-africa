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
 * 2. Warning Signs (16 items) - patient intro, category-by-category walkthrough, wait_click for Insect bite
 * 3. Brief History (6 items) - pre-filled, allergy context
 * 4. Height/Weight mention (2 items) - "already measured"
 * 5. Vitals (12 items) - step-by-step vital values with TEWS explanations (low BP + tachycardia)
 * 6. Additional Tasks (4 items) - drawer vitals preview, anaphylaxis check-for
 * 7. Assign Priority (3 items) - TEWS score and priority
 * 8. Route Patient (7 items) - Bongani consultation, Dr. Mokoena confirms, pharmacist fills, modal notification
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
    text: "You'll play the role of a triage nurse at a rural clinic: the front line in making sure patients get the care they need.",
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
    text: "and we can search for any other finding that isn't a warning sign",
    highlight: [TUTORIAL_TARGETS.WARNING_SIGNS_SEARCH, '#priority-table-search-results'],
    input: {
      field: 'input[aria-label="findings search"]',
      value: 'migraine',
    },
    link: {
      title: 'Learn about our precise medical note-taking technology backed by SNOMED',
      href: '/blog/snomed',
    },
    onArrive() {
      dispatchEvent(
        new CustomEvent('@@triage-tutorial-search-migraine'),
      )
    },
    onLeave() {
      dispatchEvent(
        new CustomEvent('@@triage-tutorial-clear-search'),
      )
    },
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: `Let's ask, "Duduzile what brings you in today?"`,
    input: {
      field: 'input[aria-label="findings search"]',
      value: '',
    },
  },
  {
    type: 'dialogue',
    speaker: 'patient',
    text: "I was stung by an insect about 30 minutes ago and I'm not feeling well.",
    position: 'bottom-right',
  },
  {
    type: 'wait_click',
    target: TUTORIAL_TARGETS.INSECT_BITE_CHECKBOX,
    text: 'Click "Insect bite" under Common Symptoms to record it.',
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
    to_step: 'measure_vitals',
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
    text: "'This Visit' shows all findings from this encounter including the insect bite you just recorded.",
    highlight: TUTORIAL_TARGETS.PATIENT_DRAWER_THIS_VISIT,
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: "'History' shows records from past visits. Duduzile is a returning patient so we can skip taking her history, height, and weight.",
    highlight: [TUTORIAL_TARGETS.PATIENT_DRAWER_HISTORY, '#sidebar-list-item-brief-history, #sidebar-list-item-height-weight'],
    click_target_on_advance: '#record-chip-allergy-to-peanut > button',
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: "Findings can be inspected for more details and we can message the health worker who originally recorded them.",
    highlight: '#record-chip-allergy-to-peanut > button, .record-chip [data-open]',
    click_target_on_advance: '.record-chip button[aria-expanded="true"]',
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text:
      "Now it's time to take Duduzile's vitals. For adult patients this consists of assessing her consciousness, mobility, and trauma presence as well as measuring her blood pressure, temperature, heart rate, and respiratory rate.",
    highlight: TUTORIAL_TARGETS.VITALS_FORM,
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text:
      `Vitals that deviate from the reference range get a positive score. If several are out of range the patient's case will be marked <span class="text-yellow-600">Urgent</span>, <span class="text-orange-700">Very urgent</span>, or an <span class="text-red-700">Emergency</span> based on the total score.`,
    dangerousHTML: true,
    highlight: TUTORIAL_TARGETS.VITALS_FORM,
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: "Let's fill this in.",
    highlight: TUTORIAL_TARGETS.VITALS_FORM,
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
    text: 'Temperature is 36.8 degrees - within the normal range.',
    highlight: TUTORIAL_TARGETS.VITAL_TEMPERATURE,
    input: { field: "[name='measurements.temperature.value']", value: TUTORIAL_VITAL_VALUES['measurements.temperature.value'] },
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: 'Respiratory rate is 12 - also normal.',
    highlight: TUTORIAL_TARGETS.VITAL_RESPIRATORY_RATE,
    input: { field: "[name='measurements.respiratory_rate.value']", value: TUTORIAL_VITAL_VALUES['measurements.respiratory_rate.value'] },
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: 'Heart rate is at 62 bpm - a bit low, but in the normal range.',
    highlight: TUTORIAL_TARGETS.VITAL_HEART_RATE,
    input: { field: "[name='measurements.heart_rate.value']", value: TUTORIAL_VITAL_VALUES['measurements.heart_rate.value'] },
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: "Blood pressure is low at 85/55 mmHg. That's 1 point on the Triage Early Warning Scale.",
    highlight: TUTORIAL_TARGETS.VITAL_BLOOD_PRESSURE,
    input: [
      { field: "[name='measurements.blood_pressure_systolic.value']", value: TUTORIAL_VITAL_VALUES['measurements.blood_pressure_systolic.value'] },
      { field: "[name='measurements.blood_pressure_diastolic.value']", value: TUTORIAL_VITAL_VALUES['measurements.blood_pressure_diastolic.value'] },
    ],
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
    to_step: 'additional_tasks_and_investigations',
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
    position: 'bottom-right',
    dangerousHTML: true,
    text:
      `Additional tasks and investigations may be required. In this case we are prompted to check for signs related to the reported insect bite that would be <span class="text-yellow-600">urgent</span> if present`,
    highlight: '.task-group-card[data-due-to="insect-bite-wound"]',
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    position: 'bottom-right',
    // dangerousHTML: true,
    text: 'The low blood pressure also could indicate anaphylaxis, which the system flagged as a possible diagnosis.',
    highlight: '.task-group-card[data-due-to="anaphylaxis-diagnosis-possible-diagnosis"]',
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    position: 'bottom-right',
    // dangerousHTML: true,
    text: 'The low blood pressure also could indicate anaphylaxis, which the system flagged as a possible diagnosis.',
    highlight: '.task-group-card[data-due-to="anaphylaxis-diagnosis-possible-diagnosis"]',
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    position: 'bottom-left',
    // dangerousHTML: true,
    text: 'Relevant pages of reference documents are immediately available',
    highlight: '#reference-docs > *',
    portal: true,
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    position: 'bottom-right',
    // dangerousHTML: true,
    text: 'The system records negative findings, which can help narrow the investigation and save time instead of asking the same questions multiple times.',
    highlight:
      '.yes-no-question-label[data-question="check_for.finding-dizziness.existence"], .yes-no-question-input[data-question="check_for.finding-dizziness.existence"]',
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    position: 'bottom-right',
    // dangerousHTML: true,
    text: "Duduzile didn't report being dizzy when we were taking her chief complaint, but let's ask her now specifically.",
    highlight:
      '.yes-no-question-label[data-question="check_for.finding-dizziness.existence"], .yes-no-question-input[data-question="check_for.finding-dizziness.existence"]',
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    position: 'bottom-left',
    // dangerousHTML: true,
    text: `"Duduzile are you feeling dizzy, short of breath? Any rash at the bite?"`,
    highlight:
      '.yes-no-question-label[data-question="check_for.finding-dizziness.existence"], .yes-no-question-input[data-question="check_for.finding-dizziness.existence"]',
  },
  {
    type: 'dialogue',
    speaker: 'patient',
    position: 'bottom-right',
    // dangerousHTML: true,
    text: `Yes I'm quite light headed and it is getting hard to breathe. And yes the bite is getting very itchy.`,
    highlight:
      '.yes-no-question-label[data-question="check_for.finding-dizziness.existence"], .yes-no-question-input[data-question="check_for.finding-dizziness.existence"]',
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    position: 'top-right',
    text: `We'll check "Yes" for dizziness`,
    highlight:
      '.yes-no-question-label[data-question="check_for.finding-dizziness.existence"], .yes-no-question-input[data-question="check_for.finding-dizziness.existence"]',
    input: {
      field: '.yes-no-question-input[data-question="check_for.finding-dizziness.existence"][data-existence="Yes"]',
      value: 'Yes'
    }
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    position: 'top-right',
    text: '"Yes" for difficulty breathing',
    highlight: '.yes-no-question-label[data-question="check_for.finding-difficulty-breathing.existence"], .yes-no-question-input[data-question="check_for.finding-difficulty-breathing.existence"]',
    input: {
      field: '.yes-no-question-input[data-question="check_for.finding-difficulty-breathing.existence"][data-existence="Yes"]',
      value: 'Yes'
    }
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    position: 'top-right',
    text: '"Yes" for sudden onset itching',
    highlight: '.yes-no-question-label[data-question="check_for.finding-sudden-onset-itching.existence"], .yes-no-question-input[data-question="check_for.finding-sudden-onset-itching.existence"]',
    input: {
      field: '.yes-no-question-input[data-question="check_for.finding-sudden-onset-itching.existence"][data-existence="Yes"]',
      value: 'Yes'
    }
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    position: 'top-right',
    text: 'and "Yes" for sudden onset eruption (rash)',
    highlight: '.yes-no-question-label[data-question="check_for.finding-sudden-onset-eruption.existence"], .yes-no-question-input[data-question="check_for.finding-sudden-onset-eruption.existence"]',
    input: {
      field: '.yes-no-question-input[data-question="check_for.finding-sudden-onset-eruption.existence"][data-existence="Yes"]',
      value: 'Yes'
    },
    click_target_on_advance: 'button.yes-no-header[data-existence="No"]',
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    position: 'top-right',
    text: `We'll click "No" at the top to fill in "No" for all the remaining unanswered questions`,
    highlight: '.task-group-card[data-due-to="anaphylaxis-diagnosis-possible-diagnosis"] button.yes-no-header[data-existence="No"], .task-group-card[data-due-to="anaphylaxis-diagnosis-possible-diagnosis"] .yes-no-question-input[data-existence="No"]',
  },

  {
    type: 'dialogue',
    speaker: 'guide',
    text: "Let's continue.",
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
    onLeave() {
      const button = document.querySelector('tr:nth-child(1) > td:nth-child(2) button') as HTMLButtonElement
      button.click()
    },
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: 'Based on the evidence collected, an anaphylaxis diagnosis is now probable',
    highlight: 'tr:nth-child(1) > td:nth-child(1), tr:nth-child(1) > td:nth-child(2)',
    click_target_on_advance: '.record-chip button[aria-expanded="true"]',
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: 'Numeric measurements are plotted against their reference ranges',
    highlight: `
      tr:nth-child(6) > td:nth-child(3), 
      tr:nth-child(7) > td:nth-child(3), 
      tr:nth-child(8) > td:nth-child(3), 
      tr:nth-child(9) > td:nth-child(3)
    `,
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    position: 'top-left',
    highlight: ['th:nth-child(4), td:nth-child(4)', '.conclusion-row'],
    dangerousHTML: true,
    text:
      `She got a Triage Early Warning Score of 1 as her other vitals were fine despite her blood pressure being low, but the probable anaphylaxis makes her case <span class="text-yellow-600">Urgent</span>`,
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
    text:
      'Hm, blood pressure very low and heart rate high. Insect sting and known peanut allergy - this looks like anaphylaxis. Let me get Dr. Mokoena to confirm the diagnosis.',
  },
  {
    type: 'dialogue',
    speaker: 'doctor',
    text: "Confirmed - this is anaphylaxis. I'm prescribing adrenaline immediately, plus sodium chloride 0.9% IV until blood pressure stabilises.",
  },
  {
    type: 'dialogue',
    speaker: 'nurse',
    text: "Thank you, Dr. Mokoena. I'll send the prescription through to Lazarus in the pharmacy now.",
  },
  {
    type: 'dialogue',
    speaker: 'pharmacist',
    text: 'Got it, Bongani. Adrenaline and sodium chloride 0.9% - filling it now.',
  },
  {
    type: 'modal',
    message: 'Please bring the patient to the stabilization room for treatment.',
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
