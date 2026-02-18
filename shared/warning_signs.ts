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
    name: 'Obstructed airway',
    description: 'Not breathing',
    priority: 'Emergency' as const,
    category: 'Emergency' as const,
  },
  {
    key: 'Cardiac arrest' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Cardiac arrest" "disorder"))',
    name: 'Cardiac arrest',
    description: 'Heart attack',
    priority: 'Emergency' as const,
    category: 'Emergency' as const,
  },
  {
    key: 'Seizure' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Seizure" "finding"))',
    name: 'Seizure',
    description: 'Current',
    priority: 'Emergency' as const,
    category: 'Emergency' as const,
  },
  {
    key: 'Burn Facial' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Burn of face" "disorder"))',
    name: 'Burn',
    description: 'Facial',
    priority: 'Emergency' as const,
    category: 'Emergency' as const,
  },
  {
    key: 'Burn Inhalation' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Inhalation burn due to hot gas" "disorder"))',
    name: 'Burn',
    description: 'Inhalation',
    priority: 'Emergency' as const,
    category: 'Emergency' as const,
  },
  {
    key: 'Acute shortness of breath' as const,
    clinical_finding_s_expression:
      '(clinical_finding (snomed_concept "Dyspnea" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))',
    name: 'Shortness of breath',
    description: 'acute',
    priority: 'Very urgent' as const,
    category: 'Very urgent' as const,
  },
  {
    key: 'Chest pain' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Chest pain" "finding"))',
    name: 'Chest pain',
    description: null,
    priority: 'Very urgent' as const,
    category: 'Very urgent' as const,
  },
  {
    key: 'Seizure - post ictal' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Post-ictal state" "finding"))',
    name: 'Seizure',
    description: 'Post ictal',
    priority: 'Very urgent' as const,
    category: 'Very urgent' as const,
  },
  {
    key: 'Focal neurology' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Cerebrovascular accident" "disorder"))',
    name: 'Focal neurology',
    description: 'acute; Stroke',
    priority: 'Very urgent' as const,
    category: 'Very urgent' as const,
  },

  {
    key: 'Burn Chemical' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Chemical burn" "disorder"))',
    name: 'Burn',
    description: 'Chemical',
    priority: 'Very urgent' as const,
    category: 'Very urgent' as const,
  },
  {
    key: 'Poisoning' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Poisoning" "disorder"))',
    name: 'Poisoning',
    description: 'Overdose',
    priority: 'Very urgent' as const,
    category: 'Very urgent' as const,
  },
  {
    key: 'Aggression' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Aggressive behavior" "finding"))',
    name: 'Aggression',
    description: null,
    priority: 'Very urgent' as const,
    category: 'Very urgent' as const,
  },

  {
    key: 'Dislocation of larger joint' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Dislocation" "morphologic abnormality"))',
    excluding_s_expression:
      '(or (finding (snomed_concept "Finding site" "attribute") (snomed_concept "Finger structure" "body structure")) (finding (snomed_concept "Finding site" "attribute") (snomed_concept "Toe structure" "body structure")))',
    name: 'Dislocation of larger joint',
    description: 'not finger or toe',
    priority: 'Very urgent' as const,
    category: 'Very urgent' as const,
  },
  {
    key: 'Severe limb ischemia' as const,
    clinical_finding_s_expression:
      '(clinical_finding (snomed_concept "Limb ischemia" "disorder") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))',
    name: 'Severe limb ischemia',
    description: 'Threatened limb',
    priority: 'Very urgent' as const,
    category: 'Very urgent' as const,
  },

  {
    key: 'Burn Circumferential' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Burn" "disorder") (qualifier (snomed_concept "Circumferential" "qualifier value")))',
    name: 'Burn',
    description: 'Circumferential',
    priority: 'Very urgent' as const,
    category: 'Very urgent' as const,
  },
  {
    key: 'Vomiting fresh blood' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Vomiting blood - fresh" "disorder"))',
    name: 'Vomiting fresh blood',
    description: null,
    priority: 'Very urgent' as const,
    category: 'Very urgent' as const,
  },
  {
    key: 'Coughing blood' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Hemoptysis" "finding"))',
    name: 'Coughing blood',
    description: null,
    priority: 'Very urgent' as const,
    category: 'Very urgent' as const,
  },
  {
    key: 'Stabbed neck' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Stab wound of neck" "disorder"))',
    name: 'Stabbed neck',
    description: null,
    priority: 'Very urgent' as const,
    category: 'Very urgent' as const,
  },
  {
    key: 'Eye injury' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Injury of globe of eye" "disorder"))',
    name: 'Eye injury',
    description: null,
    priority: 'Very urgent' as const,
    category: 'Very urgent' as const,
  },
  {
    key: 'Burn Over 20%' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Burns classified according to percentage of body surface involved" "disorder"))',
    name: 'Burn',
    description: 'Over 20%',
    priority: 'Very urgent' as const,
    category: 'Very urgent' as const,
  },

  {
    key: 'High energy transfer' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Injury caused by causative force" "disorder"))',
    name: 'High energy transfer',
    description: 'Severe mechanism of injury',
    priority: 'Very urgent' as const,
    category: 'Very urgent' as const,
  },
  {
    key: 'Haemorrhage Uncontrolled' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Bleeding" "finding") (qualifier (snomed_concept "Uncontrolled" "qualifier value")))',
    name: 'Haemorrhage',
    description: 'Uncontrolled',
    priority: 'Very urgent' as const,
    category: 'Very urgent' as const,
  },
  {
    key: 'Compound Fracture' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Fracture, open" "morphologic abnormality"))',
    name: 'Compound fracture',
    description: 'with a break in the skin',
    priority: 'Very urgent' as const,
    category: 'Very urgent' as const,
  },
  {
    key: 'Severe pain' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Severe pain" "finding"))',
    name: 'Severe pain',
    description: null,
    priority: 'Very urgent' as const,
    category: 'Very urgent' as const,
  },
  {
    key: 'Burn Moderate severity' as const,
    clinical_finding_s_expression:
      '(clinical_finding (snomed_concept "Burn" "disorder") (qualifier (snomed_concept "Moderate (severity modifier)" "qualifier value")))',
    name: 'Burn',
    description: 'Moderate severity',
    priority: 'Very urgent' as const,
    category: 'Very urgent' as const,
  },
  {
    key: 'Pregnancy and abdominal trauma' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Traumatic injury" "disorder"))',
    name: 'Pregnancy and abdominal trauma',
    description: null,
    prompt_when_s_expression: '(active_condition (snomed_concept "Pregnancy" "finding"))',
    priority: 'Very urgent' as const,
    category: 'Very urgent' as const,
  },
  {
    key: 'Pregnancy and abdominal pain' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Abdominal pain" "finding"))',
    name: 'Pregnancy and abdominal pain',
    description: null,
    prompt_when_s_expression: '(active_condition (snomed_concept "Pregnancy" "finding"))',
    priority: 'Very urgent' as const,
    category: 'Very urgent' as const,
  },
  {
    key: 'Persistent vomiting' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Persistent vomiting" "disorder"))',
    name: 'Persistent vomiting',
    description: null,
    priority: 'Urgent' as const,
    category: 'Urgent' as const,
  },
  {
    key: 'Dislocation of finger' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Dislocation of digit of hand" "disorder"))',
    name: 'Dislocation of finger',
    description: null,
    priority: 'Urgent' as const,
    category: 'Urgent' as const,
  },
  {
    key: 'Dislocation of toe joint' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Dislocation of toe joint" "disorder"))',
    name: 'Dislocation of toe joint',
    description: null,
    priority: 'Urgent' as const,
    category: 'Urgent' as const,
  },
  {
    key: 'Moderate pain' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Moderate pain" "finding"))',
    name: 'Moderate pain',
    description: null,
    priority: 'Urgent' as const,
    category: 'Urgent' as const,
  },
  {
    key: 'Burn Other' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Burn" "disorder"))',
    excluding_s_expression:
      '(or (clinical_finding (snomed_concept "Burn" "disorder") (qualifier (snomed_concept "Circumferential" "qualifier value"))) (clinical_finding (snomed_concept "Inhalation burn due to hot gas" "disorder")) (clinical_finding (snomed_concept "Chemical burn" "disorder")) (clinical_finding (snomed_concept "Burn of face" "disorder")))',
    name: 'Burn',
    description: 'Other',
    priority: 'Urgent' as const,
    category: 'Urgent' as const,
  },
  {
    key: 'Haemorrhage Controlled' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Bleeding" "finding") (qualifier (snomed_concept "Controlled" "qualifier value")))',
    name: 'Haemorrhage',
    description: 'Controlled',
    priority: 'Urgent' as const,
    category: 'Urgent' as const,
  },
  {
    key: 'Closed fracture' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Closed fracture of bone" "disorder"))',
    name: 'Closed fracture',
    description: 'no break in the skin',
    priority: 'Urgent' as const,
    category: 'Urgent' as const,
  },
  {
    key: 'Abdominal pain' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Abdominal pain" "finding"))',
    name: 'Abdominal pain',
    description: null,
    priority: 'Urgent' as const,
    prompt_when_s_expression: '(not (active_condition (snomed_concept "Pregnancy" "finding")))',
    category: 'Urgent' as const,
  },
]

export type WarningSignKey = typeof WARNING_SIGN_DEFS[number]['key']

export const WARNING_SIGNS: WarningSign[] = sortBy(
  WARNING_SIGN_DEFS.map((sign) =>
    omitUndefinedProperties({
      ...sign,
      category: sign.priority,
      clinical_finding_s_expression: normalForm(sign.clinical_finding_s_expression),
      excluding_s_expression: sign.excluding_s_expression && normalForm(sign.excluding_s_expression),
      prompt_when_s_expression: sign.prompt_when_s_expression && normalForm(sign.prompt_when_s_expression),
    })
  ),
  (sign) => ORDERED_PRIORITIES.indexOf(sign.priority),
  (sign) => WARNING_SIGN_ORDER[sign.priority].indexOf(sign.key),
)

export const KEYED_WARNING_SIGNS = keyBy(WARNING_SIGNS, 'key')

export function findingQueryExpression(
  { excluding_s_expression, clinical_finding_s_expression }: WarningSign,
): string {
  if (!excluding_s_expression) return clinical_finding_s_expression
  return `(and ${clinical_finding_s_expression} (not ${excluding_s_expression}))`
}
