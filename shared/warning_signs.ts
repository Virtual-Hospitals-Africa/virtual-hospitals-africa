import { WarningSign } from '../types.ts'
import { omitUndefinedProperties } from '../util/omitUndefinedProperties.ts'
import { keyBy } from '../util/keyBy.ts'
import sortBy from '../util/sortBy.ts'
import { ORDERED_PRIORITIES } from './priorities.ts'
import { normalForm } from './s_expression.ts'

const WARNING_SIGN_ORDER: {
  [Priority in 'Emergency' | 'Very urgent' | 'Urgent']: WarningSignKey[]
} = {
  'Emergency': [
    'Obstructed airway',
    'Cardiac arrest',
    'Seizure',
    'Burn Facial',
    'Burn Inhalation',
  ],
  'Very urgent': [
    'Acute shortness of breath',
    'Chest pain',
    'Seizure - post ictal',
    'Focal neurology',
    'Burn Chemical',
    'Coughing blood',
    'Poisoning',
    'Aggression',
    'Severe limb ischemia',
    'Burn Circumferential',
    'Vomiting fresh blood',
    'High energy transfer',
    'Stabbed neck',
    'Eye injury',
    'Burn Over 20%',
    'Haemorrhage Uncontrolled',
    'Dislocation of larger joint',
    'Compound Fracture',
    'Severe pain',
    'Burn Moderate severity',
    'Pregnancy and abdominal trauma',
    'Pregnancy and abdominal pain',
  ],
  Urgent: [
    'Persistent vomiting',
    'Dislocation of finger',
    'Closed fracture',
    'Moderate pain',
    'Burn Other',
    'Haemorrhage Controlled',
    'Dislocation of toe joint',
    'Abdominal pain',
  ],
}

const WARNING_SIGN_DEFS = [
  {
    key: 'Obstructed airway' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Respiratory obstruction" "disorder"))',
    primary_name: 'Obstructed airway',
    secondary_text: 'Not breathing',
    sats_priority: 'Emergency' as const,
    category: 'Emergency' as const,
  },
  {
    key: 'Cardiac arrest' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Cardiac arrest" "disorder"))',
    primary_name: 'Cardiac arrest',
    secondary_text: 'Heart attack',
    sats_priority: 'Emergency' as const,
    category: 'Emergency' as const,
  },
  {
    key: 'Seizure' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Seizure" "finding"))',
    primary_name: 'Seizure',
    secondary_text: 'Current',
    sats_priority: 'Emergency' as const,
    category: 'Emergency' as const,
  },
  {
    key: 'Burn Facial' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Burn of face" "disorder"))',
    primary_name: 'Burn',
    secondary_text: 'Facial',
    sats_priority: 'Emergency' as const,
    category: 'Emergency' as const,
  },
  {
    key: 'Burn Inhalation' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Inhalation burn due to hot gas" "disorder"))',
    primary_name: 'Burn',
    secondary_text: 'Inhalation',
    sats_priority: 'Emergency' as const,
    category: 'Emergency' as const,
  },
  {
    key: 'Acute shortness of breath' as const,
    clinical_finding_s_expression:
      '(clinical_finding (snomed_concept "Dyspnea" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))',
    primary_name: 'Shortness of breath',
    secondary_text: 'acute',
    sats_priority: 'Very urgent' as const,
    category: 'Very urgent' as const,
  },
  {
    key: 'Chest pain' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Chest pain" "finding"))',
    primary_name: 'Chest pain',
    secondary_text: null,
    sats_priority: 'Very urgent' as const,
    category: 'Very urgent' as const,
  },
  {
    key: 'Seizure - post ictal' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Post-ictal state" "finding"))',
    primary_name: 'Seizure',
    secondary_text: 'Post ictal',
    sats_priority: 'Very urgent' as const,
    category: 'Very urgent' as const,
  },
  {
    key: 'Focal neurology' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Cerebrovascular accident" "disorder"))',
    primary_name: 'Focal neurology',
    secondary_text: 'acute; Stroke',
    sats_priority: 'Very urgent' as const,
    category: 'Very urgent' as const,
  },

  {
    key: 'Burn Chemical' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Chemical burn" "disorder"))',
    primary_name: 'Burn',
    secondary_text: 'Chemical',
    sats_priority: 'Very urgent' as const,
    category: 'Very urgent' as const,
  },
  {
    key: 'Poisoning' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Poisoning" "disorder"))',
    primary_name: 'Poisoning',
    secondary_text: 'Overdose',
    sats_priority: 'Very urgent' as const,
    category: 'Very urgent' as const,
  },
  {
    key: 'Aggression' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Aggressive behavior" "finding"))',
    primary_name: 'Aggression',
    secondary_text: null,
    sats_priority: 'Very urgent' as const,
    category: 'Very urgent' as const,
  },

  {
    key: 'Dislocation of larger joint' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Dislocation" "morphologic abnormality"))',
    excluding_s_expression:
      '(or (finding (snomed_concept "Finding site" "attribute") (snomed_concept "Finger structure" "body structure")) (finding (snomed_concept "Finding site" "attribute") (snomed_concept "Toe structure" "body structure")))',
    primary_name: 'Dislocation of larger joint',
    secondary_text: 'not finger or toe',
    sats_priority: 'Very urgent' as const,
    category: 'Very urgent' as const,
  },
  {
    key: 'Severe limb ischemia' as const,
    clinical_finding_s_expression:
      '(clinical_finding (snomed_concept "Limb ischemia" "disorder") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))',
    primary_name: 'Severe limb ischemia',
    secondary_text: 'Threatened limb',
    sats_priority: 'Very urgent' as const,
    category: 'Very urgent' as const,
  },

  {
    key: 'Burn Circumferential' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Burn" "disorder") (qualifier (snomed_concept "Circumferential" "qualifier value")))',
    primary_name: 'Burn',
    secondary_text: 'Circumferential',
    sats_priority: 'Very urgent' as const,
    category: 'Very urgent' as const,
  },
  {
    key: 'Vomiting fresh blood' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Vomiting blood - fresh" "disorder"))',
    primary_name: 'Vomiting fresh blood',
    secondary_text: null,
    sats_priority: 'Very urgent' as const,
    category: 'Very urgent' as const,
  },
  {
    key: 'Coughing blood' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Hemoptysis" "finding"))',
    primary_name: 'Coughing blood',
    secondary_text: null,
    sats_priority: 'Very urgent' as const,
    category: 'Very urgent' as const,
  },
  {
    key: 'Stabbed neck' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Stab wound of neck" "disorder"))',
    primary_name: 'Stabbed neck',
    secondary_text: null,
    sats_priority: 'Very urgent' as const,
    category: 'Very urgent' as const,
  },
  {
    key: 'Eye injury' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Injury of globe of eye" "disorder"))',
    primary_name: 'Eye injury',
    secondary_text: null,
    sats_priority: 'Very urgent' as const,
    category: 'Very urgent' as const,
  },
  {
    key: 'Burn Over 20%' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Burns classified according to percentage of body surface involved" "disorder"))',
    primary_name: 'Burn',
    secondary_text: 'Over 20%',
    sats_priority: 'Very urgent' as const,
    category: 'Very urgent' as const,
  },

  {
    key: 'High energy transfer' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Injury caused by causative force" "disorder"))',
    primary_name: 'High energy transfer',
    secondary_text: 'Severe mechanism of injury',
    sats_priority: 'Very urgent' as const,
    category: 'Very urgent' as const,
  },
  {
    key: 'Haemorrhage Uncontrolled' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Bleeding" "finding") (qualifier (snomed_concept "Uncontrolled" "qualifier value")))',
    primary_name: 'Haemorrhage',
    secondary_text: 'Uncontrolled',
    sats_priority: 'Very urgent' as const,
    category: 'Very urgent' as const,
  },
  {
    key: 'Compound Fracture' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Fracture, open" "morphologic abnormality"))',
    primary_name: 'Compound fracture',
    secondary_text: 'with a break in the skin',
    sats_priority: 'Very urgent' as const,
    category: 'Very urgent' as const,
  },
  {
    key: 'Severe pain' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Severe pain" "finding"))',
    primary_name: 'Severe pain',
    secondary_text: null,
    sats_priority: 'Very urgent' as const,
    category: 'Very urgent' as const,
  },
  {
    key: 'Burn Moderate severity' as const,
    clinical_finding_s_expression:
      '(clinical_finding (snomed_concept "Burn" "disorder") (qualifier (snomed_concept "Moderate (severity modifier)" "qualifier value")))',
    primary_name: 'Burn',
    secondary_text: 'Moderate severity',
    sats_priority: 'Very urgent' as const,
    category: 'Very urgent' as const,
  },
  {
    key: 'Pregnancy and abdominal trauma' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Traumatic injury" "disorder"))',
    primary_name: 'Pregnancy and abdominal trauma',
    secondary_text: null,
    prompt_when_s_expression: '(active_condition (snomed_concept "Pregnancy" "finding"))',
    sats_priority: 'Very urgent' as const,
    category: 'Very urgent' as const,
  },
  {
    key: 'Pregnancy and abdominal pain' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Abdominal pain" "finding"))',
    primary_name: 'Pregnancy and abdominal pain',
    secondary_text: null,
    prompt_when_s_expression: '(active_condition (snomed_concept "Pregnancy" "finding"))',
    sats_priority: 'Very urgent' as const,
    category: 'Very urgent' as const,
  },
  {
    key: 'Persistent vomiting' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Persistent vomiting" "disorder"))',
    primary_name: 'Persistent vomiting',
    secondary_text: null,
    sats_priority: 'Urgent' as const,
    category: 'Urgent' as const,
  },
  {
    key: 'Dislocation of finger' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Dislocation of digit of hand" "disorder"))',
    primary_name: 'Dislocation of finger',
    secondary_text: null,
    sats_priority: 'Urgent' as const,
    category: 'Urgent' as const,
  },
  {
    key: 'Dislocation of toe joint' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Dislocation of toe joint" "disorder"))',
    primary_name: 'Dislocation of toe joint',
    secondary_text: null,
    sats_priority: 'Urgent' as const,
    category: 'Urgent' as const,
  },
  {
    key: 'Moderate pain' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Moderate pain" "finding"))',
    primary_name: 'Moderate pain',
    secondary_text: null,
    sats_priority: 'Urgent' as const,
    category: 'Urgent' as const,
  },
  {
    key: 'Burn Other' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Burn" "disorder"))',
    excluding_s_expression:
      '(or (clinical_finding (snomed_concept "Burn" "disorder") (qualifier (snomed_concept "Circumferential" "qualifier value"))) (clinical_finding (snomed_concept "Inhalation burn due to hot gas" "disorder")) (clinical_finding (snomed_concept "Chemical burn" "disorder")) (clinical_finding (snomed_concept "Burn of face" "disorder")))',
    primary_name: 'Burn',
    secondary_text: 'Other',
    sats_priority: 'Urgent' as const,
    category: 'Urgent' as const,
  },
  {
    key: 'Haemorrhage Controlled' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Bleeding" "finding") (qualifier (snomed_concept "Controlled" "qualifier value")))',
    primary_name: 'Haemorrhage',
    secondary_text: 'Controlled',
    sats_priority: 'Urgent' as const,
    category: 'Urgent' as const,
  },
  {
    key: 'Closed fracture' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Closed fracture of bone" "disorder"))',
    primary_name: 'Closed fracture',
    secondary_text: 'no break in the skin',
    sats_priority: 'Urgent' as const,
    category: 'Urgent' as const,
  },
  {
    key: 'Abdominal pain' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Abdominal pain" "finding"))',
    primary_name: 'Abdominal pain',
    secondary_text: null,
    sats_priority: 'Urgent' as const,
    prompt_when_s_expression: '(not (active_condition (snomed_concept "Pregnancy" "finding")))',
    category: 'Urgent' as const,
  },
]

export type WarningSignKey = typeof WARNING_SIGN_DEFS[number]['key']

export const WARNING_SIGNS: WarningSign[] = sortBy(
  WARNING_SIGN_DEFS.map((sign) =>
    omitUndefinedProperties({
      ...sign,
      category: sign.sats_priority,
      clinical_finding_s_expression: normalForm(sign.clinical_finding_s_expression),
      excluding_s_expression: sign.excluding_s_expression && normalForm(sign.excluding_s_expression),
      prompt_when_s_expression: sign.prompt_when_s_expression && normalForm(sign.prompt_when_s_expression),
    })
  ),
  (sign) => ORDERED_PRIORITIES.indexOf(sign.sats_priority),
  (sign) => WARNING_SIGN_ORDER[sign.sats_priority].indexOf(sign.key),
)

export const KEYED_WARNING_SIGNS = keyBy(WARNING_SIGNS, 'key')

export function findingQueryExpression(
  { excluding_s_expression, clinical_finding_s_expression }: WarningSign,
): string {
  if (!excluding_s_expression) return clinical_finding_s_expression
  return `(and ${clinical_finding_s_expression} (not ${excluding_s_expression}))`
}
