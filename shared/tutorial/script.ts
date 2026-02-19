// =============================================================================
// FILE: /shared/tutorial/script.ts
// Complete tutorial script - single source of truth for all dialogue and actions
// =============================================================================

import type { ScriptItem, TutorialStep } from './types.ts'
import { TUTORIAL_TARGETS } from './targets.ts'

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
    text: 'Our mission is to make sure that patients who need it can get the care they need that day.',
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: "My name is Lindiwe Nkosi and I'll be guiding you through this tutorial of our digital health platform.",
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: "You'll play the role of a triage nurse: the front line assessing patients to ensure those with urgent cases are seen quickly.",
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: "We'll start at the Open Encounters view.",
    highlight: TUTORIAL_TARGETS.WAITING_ROOM_TABLE,
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
    text: "why they're here...",
    highlight: '[data-column="reason-for-visit"]',
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: 'Here you can see all patients currently at the facility, where they are, and what stage of care they are in.',
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: 'We have two patients in consultation with providers, one in triage with a colleague, and Duduzile here who just arrived and is awaiting triage.',
    highlight: TUTORIAL_TARGETS.WAITING_ROOM_ROW_DUDUZILE,
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: "Let's start her triage now. Click the 'Start Triage' button.",
  },
  {
    type: 'wait_click',
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
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: "The first step of triage is to ask for the patient's chief complaint and check for warning signs based on the South African Triage Scale.",
    highlight: TUTORIAL_TARGETS.WARNING_SIGNS_PANEL,
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: 'The most serious signs are emergencies in red, requiring immediate treatment.',
    highlight: TUTORIAL_TARGETS.WARNING_SIGNS_EMERGENCY,
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: 'Very urgent signs in orange have a target time for treatment of ten minutes.',
    highlight: TUTORIAL_TARGETS.WARNING_SIGNS_VERY_URGENT,
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: 'Urgent signs have a target time for treatment of one hour.',
    highlight: TUTORIAL_TARGETS.WARNING_SIGNS_URGENT,
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text:
      "Other common symptoms are listed below. These aren't urgent by themselves but are helpful context and can prompt for other findings and measurements we may want to check for.",
    highlight: TUTORIAL_TARGETS.WARNING_SIGNS_COMMON_SYMPTOMS,
    guidePosition: 'top-left',
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: 'For other symptoms we can search. We use the SNOMED coding system so general findings can be further refined later in the visit.',
    highlight: TUTORIAL_TARGETS.WARNING_SIGNS_SEARCH,
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text:
      'If at the end of triage the patient shows no warning signs and has normal vitals, we will prioritize their case as routine with a target treatment time within four hours.',
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: 'We still want to see these patients, but others needing more urgent care will be prioritized ahead of them.',
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: "Let's check what's wrong with Duduzile today.",
  },
  {
    type: 'dialogue',
    speaker: 'patient',
    text: "I've had a bad cough that seems to be getting worse.",
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: "Click 'Cough' in Common Symptoms to record it.",
  },
  {
    type: 'wait_click',
    target: TUTORIAL_TARGETS.COUGH_CHECKBOX,
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: 'Well done! Look at the Patient Drawer on the right.',
    highlight: TUTORIAL_TARGETS.PATIENT_DRAWER,
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: "The 'This Visit' section shows all findings recorded during this encounter. The cough you selected now appears here.",
    highlight: TUTORIAL_TARGETS.PATIENT_DRAWER_THIS_VISIT,
  },

  // =========================================================================
  // SECTION 3: BRIEF HISTORY (STEP TRANSITION)
  // =========================================================================
  {
    type: 'step_transition',
    to_step: 'brief_history',
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: 'Next is the Brief History. Here we quickly check for conditions that affect treatment.',
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: "I've already filled this in for Duduzile. Let me show you the key points.",
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: 'Pregnancy is always asked - it affects vital sign interpretation and medication choices.',
    highlight: TUTORIAL_TARGETS.BRIEF_HISTORY_PREGNANCY,
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: 'Same with Diabetes - it can affect treatment decisions.',
    highlight: TUTORIAL_TARGETS.BRIEF_HISTORY_DIABETES,
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: 'Notice Duduzile has asthma. This is very relevant given her cough - respiratory conditions need extra attention.',
    highlight: TUTORIAL_TARGETS.BRIEF_HISTORY_ASTHMA,
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: "The history is now visible in the Patient Drawer, building a complete picture of Duduzile's health.",
    highlight: TUTORIAL_TARGETS.PATIENT_DRAWER_THIS_VISIT,
  },

  // =========================================================================
  // SECTION 4: HEIGHT & WEIGHT MENTION (STEP TRANSITION)
  // =========================================================================
  {
    type: 'step_transition',
    to_step: 'vitals',
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: "Height and weight were measured when Duduzile arrived. You can see them in the Patient Drawer - she's 165cm and 62kg.",
    highlight: TUTORIAL_TARGETS.PATIENT_DRAWER_THIS_VISIT,
  },

  // =========================================================================
  // SECTION 5: MEASURE VITALS
  // =========================================================================
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
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: 'Walking normally.',
    highlight: TUTORIAL_TARGETS.VITAL_MOBILITY,
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: 'No trauma.',
    highlight: TUTORIAL_TARGETS.VITAL_TRAUMA,
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: "Temperature is 39 degrees. That's a fever and 2 points on the Triage Early Warning Scale.",
    highlight: TUTORIAL_TARGETS.VITAL_TEMPERATURE,
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: "She's breathing quickly too: respiratory rate is 32 bpm which is 3 points on the Triage Early Warning Scale.",
    highlight: TUTORIAL_TARGETS.VITAL_RESPIRATORY_RATE,
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: 'Heart rate: 95 - within the normal range.',
    highlight: TUTORIAL_TARGETS.VITAL_HEART_RATE,
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: 'Blood pressure is 120/80 - within the normal range.',
    highlight: TUTORIAL_TARGETS.VITAL_BLOOD_PRESSURE,
  },
  {
    type: 'dialogue',
    speaker: 'guide',
    text: 'Blood oxygen saturation is at 98%. Lower than 95% would have prompted for oxygen therapy, but this is normal.',
    highlight: TUTORIAL_TARGETS.VITAL_SPO2,
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
