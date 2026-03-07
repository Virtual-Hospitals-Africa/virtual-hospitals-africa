import { WarningSign } from '../types.ts'
import { omitUndefinedProperties } from '../util/omitUndefinedProperties.ts'
import { keyBy } from '../util/keyBy.ts'
import sortBy from '../util/sortBy.ts'
import { ORDERED_PRIORITIES } from './priorities.ts'
import { normalForm } from './s_expression.ts'

type AgeGroupOrder<EmergencyType> = {
  Emergency: EmergencyType
  'Very urgent': WarningSignKey[]
  Urgent: WarningSignKey[]
}

const WARNING_SIGN_ORDER: {
  adult: AgeGroupOrder<WarningSignKey[]>
  'older child': AgeGroupOrder<Record<string, WarningSignKey[]>>
  'younger child': AgeGroupOrder<WarningSignKey[]>
} = {
  adult: {
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
  },
  'older child': {
    Emergency: {
      'Airway & Breathing': [
        'Not breathing or Reported apnoea',
        'Obstructed breathing',
        'Central cyanosis (SPO2 less than 92%)',
        'Respiratory distress (Severe)',
      ],
      'Circulation': [
        'Cold Hands',
        'Pulse weak & fast',
        'Capillary refill time (3 sec or more)',
        'Lethargic',
        'Uncontrolled bleeding (not nose bleed)',
      ],
      'Convulsions/Coma': [
        'Convulsing or Immediately Post-Ictal not alert',
        'AVPU: responds only To Pain (P)',
        'AVPU: Unresponsive (U)',
        'Confusion',
      ],
      'Dehydration': [
        'Diarrhoea or Vomiting',
        'Lethargy/ floppy infant',
        'Very sunken eyes',
        'Skin pinch very slow (2 secs or more)',
      ],
      'Other': [
        'Facial /Inhalation burn',
        'Hypoglycaemia recorded at any time',
        'Glucose less than 3mmol/L',
        'Purpuric rash',
      ],
    },
    'Very urgent': [
      'Tiny baby (Younger than 2 months)',
      'Inconsolable crying (Severe pain)',
      'Presenting complaint more sleepy than normal',
      'Poisoning or overdose',
      'Focal neurology acute',
      'Severe mechanism of injury',
      'Burn 10% or more (Circumferential, electrical, chemical)',
      'Eye Injury',
      'Fracture (Open or threatened limb)',
      'Dislocation of larger joint (not finger or toe)',
    ],
    Urgent: [
      'Some respiratory distress',
      'Some Dehydration (Diarrhoea or Diarrhoea and vomiting)',
      'Sunken eyes',
      'Restless/ irritable',
      'Thirsty/decreased urine output',
      'Dry mouth',
      'Crying without tears',
      'Skin pinch slow (Less than 2 sec)',
      'Unable to drink /feed or vomit everything',
      'Malnutrition (Visible severe wasting)',
      'Malnutrition Oedema (pitting Oedema of both feet)',
      'Unwell child with known diabetes',
      'Any other burn less than 10%',
      'Closed fracture',
      'Dislocation of finger or toe',
    ],
  },
  'younger child': {
    Emergency: [],
    'Very urgent': [],
    Urgent: [],
  },
}

const WARNING_SIGN_DEFS = [
  // ── ADULT SIGNS ──────────────────────────────────────────────────────────────
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

  // ── OLDER CHILD SIGNS ────────────────────────────────────────────────────────
  // Emergency – Airway & Breathing
  {
    key: 'Not breathing or Reported apnoea' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Apnea" "finding"))',
    name: 'Not breathing or Reported apnoea',
    description: null,
    priority: 'Emergency' as const,
    category: 'Airway & Breathing' as const,
  },
  {
    key: 'Obstructed breathing' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Respiratory obstruction" "disorder"))',
    name: 'Obstructed breathing',
    description: null,
    priority: 'Emergency' as const,
    category: 'Airway & Breathing' as const,
  },
  {
    key: 'Central cyanosis (SPO2 less than 92%)' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Central cyanosis" "disorder"))',
    name: 'Central cyanosis (SPO2 less than 92%)',
    description: null,
    priority: 'Emergency' as const,
    category: 'Airway & Breathing' as const,
  },
  {
    key: 'Respiratory distress (Severe)' as const,
    clinical_finding_s_expression:
      '(clinical_finding (snomed_concept "Acute respiratory distress" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))',
    name: 'Respiratory distress (Severe)',
    description: null,
    priority: 'Emergency' as const,
    category: 'Airway & Breathing' as const,
  },
  // Emergency – Circulation
  {
    key: 'Cold Hands' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Cold hands" "finding"))',
    name: 'Cold Hands',
    description: null,
    priority: 'Emergency' as const,
    category: 'Circulation' as const,
  },
  {
    key: 'Pulse weak & fast' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Thready pulse" "finding"))',
    name: 'Pulse weak & fast',
    description: null,
    priority: 'Emergency' as const,
    category: 'Circulation' as const,
  },
  {
    key: 'Capillary refill time (3 sec or more)' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Increased capillary filling time" "finding"))',
    name: 'Capillary refill time (3 sec or more)',
    description: null,
    priority: 'Emergency' as const,
    category: 'Circulation' as const,
  },
  {
    key: 'Lethargic' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Lethargy" "finding"))',
    name: 'Lethargic',
    description: null,
    priority: 'Emergency' as const,
    category: 'Circulation' as const,
  },
  {
    key: 'Uncontrolled bleeding (not nose bleed)' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Bleeding" "finding") (qualifier (snomed_concept "Uncontrolled" "qualifier value")))',
    name: 'Uncontrolled bleeding (not nose bleed)',
    description: null,
    priority: 'Emergency' as const,
    category: 'Circulation' as const,
  },
  // Emergency – Convulsions/Coma
  {
    key: 'Convulsing or Immediately Post-Ictal not alert' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Seizure" "finding"))',
    name: 'Convulsing or Immediately Post-Ictal not alert',
    description: null,
    priority: 'Emergency' as const,
    category: 'Convulsions/Coma' as const,
  },
  {
    key: 'AVPU: responds only To Pain (P)' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Responds to pain" "finding"))',
    name: 'AVPU: responds only To Pain (P)',
    description: null,
    priority: 'Emergency' as const,
    category: 'Convulsions/Coma' as const,
  },
  {
    key: 'AVPU: Unresponsive (U)' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Unresponsive" "finding"))',
    name: 'AVPU: Unresponsive (U)',
    description: null,
    priority: 'Emergency' as const,
    category: 'Convulsions/Coma' as const,
  },
  {
    key: 'Confusion' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Acute confusion" "finding"))',
    name: 'Confusion',
    description: null,
    priority: 'Emergency' as const,
    category: 'Convulsions/Coma' as const,
  },
  // Emergency – Dehydration
  {
    key: 'Diarrhoea or Vomiting' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Diarrhea and vomiting" "finding"))',
    name: 'Diarrhoea or Vomiting',
    description: null,
    priority: 'Emergency' as const,
    category: 'Dehydration' as const,
  },
  {
    key: 'Lethargy/ floppy infant' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Poor muscle tone" "finding"))',
    name: 'Lethargy/ floppy infant',
    description: null,
    priority: 'Emergency' as const,
    category: 'Dehydration' as const,
  },
  {
    key: 'Very sunken eyes' as const,
    clinical_finding_s_expression:
      '(clinical_finding (snomed_concept "Sunken eyes" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))',
    name: 'Very sunken eyes',
    description: null,
    priority: 'Emergency' as const,
    category: 'Dehydration' as const,
  },
  {
    key: 'Skin pinch very slow (2 secs or more)' as const,
    clinical_finding_s_expression:
      '(clinical_finding (snomed_concept "Decreased skin turgor" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))',
    name: 'Skin pinch very slow (2 secs or more)',
    description: null,
    priority: 'Emergency' as const,
    category: 'Dehydration' as const,
  },
  // Emergency – Other
  {
    key: 'Facial /Inhalation burn' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Burn of face" "disorder"))',
    name: 'Facial /Inhalation burn',
    description: null,
    priority: 'Emergency' as const,
    category: 'Other' as const,
  },
  {
    key: 'Hypoglycaemia recorded at any time' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Hypoglycemia" "disorder"))',
    name: 'Hypoglycaemia recorded at any time',
    description: null,
    priority: 'Emergency' as const,
    category: 'Other' as const,
  },
  {
    key: 'Glucose less than 3mmol/L' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Blood glucose below reference range" "finding"))',
    name: 'Glucose less than 3mmol/L',
    description: null,
    priority: 'Emergency' as const,
    category: 'Other' as const,
  },
  {
    key: 'Purpuric rash' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Purpuric rash" "disorder"))',
    name: 'Purpuric rash',
    description: null,
    priority: 'Emergency' as const,
    category: 'Other' as const,
  },
  // Older child – Very urgent
  {
    key: 'Tiny baby (Younger than 2 months)' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Neonatal underfeeding" "finding"))',
    name: 'Tiny baby (Younger than 2 months)',
    description: null,
    priority: 'Very urgent' as const,
    category: 'Very urgent' as const,
  },
  {
    key: 'Inconsolable crying (Severe pain)' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Constantly crying infant" "finding"))',
    name: 'Inconsolable crying (Severe pain)',
    description: null,
    priority: 'Very urgent' as const,
    category: 'Very urgent' as const,
  },
  {
    key: 'Presenting complaint more sleepy than normal' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))',
    name: 'Presenting complaint more sleepy than normal',
    description: null,
    priority: 'Very urgent' as const,
    category: 'Very urgent' as const,
  },
  {
    key: 'Poisoning or overdose' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Poisoning" "disorder"))',
    name: 'Poisoning or overdose',
    description: null,
    priority: 'Very urgent' as const,
    category: 'Very urgent' as const,
  },
  {
    key: 'Focal neurology acute' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Cerebrovascular accident" "disorder"))',
    name: 'Focal neurology acute',
    description: null,
    priority: 'Very urgent' as const,
    category: 'Very urgent' as const,
  },
  {
    key: 'Severe mechanism of injury' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Injury caused by causative force" "disorder"))',
    name: 'Severe mechanism of injury',
    description: null,
    priority: 'Very urgent' as const,
    category: 'Very urgent' as const,
  },
  {
    key: 'Burn 10% or more (Circumferential, electrical, chemical)' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Burns classified according to percentage of body surface involved" "disorder"))',
    name: 'Burn 10% or more (Circumferential, electrical, chemical)',
    description: null,
    priority: 'Very urgent' as const,
    category: 'Very urgent' as const,
  },
  {
    key: 'Eye Injury' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Injury of globe of eye" "disorder"))',
    name: 'Eye Injury',
    description: null,
    priority: 'Very urgent' as const,
    category: 'Very urgent' as const,
  },
  {
    key: 'Fracture (Open or threatened limb)' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Fracture, open" "morphologic abnormality"))',
    name: 'Fracture (Open or threatened limb)',
    description: null,
    priority: 'Very urgent' as const,
    category: 'Very urgent' as const,
  },
  {
    key: 'Dislocation of larger joint (not finger or toe)' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Dislocation" "morphologic abnormality"))',
    excluding_s_expression:
      '(or (finding (snomed_concept "Finding site" "attribute") (snomed_concept "Finger structure" "body structure")) (finding (snomed_concept "Finding site" "attribute") (snomed_concept "Toe structure" "body structure")))',
    name: 'Dislocation of larger joint (not finger or toe)',
    description: null,
    priority: 'Very urgent' as const,
    category: 'Very urgent' as const,
  },
  // Older child – Urgent
  {
    key: 'Some respiratory distress' as const,
    clinical_finding_s_expression:
      '(clinical_finding (snomed_concept "Respiratory distress" "finding") (qualifier (snomed_concept "Moderate (severity modifier)" "qualifier value")))',
    name: 'Some respiratory distress',
    description: null,
    priority: 'Urgent' as const,
    category: 'Urgent' as const,
  },
  {
    key: 'Some Dehydration (Diarrhoea or Diarrhoea and vomiting)' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Moderate dehydration" "disorder"))',
    name: 'Some Dehydration (Diarrhoea or Diarrhoea and vomiting)',
    description: null,
    priority: 'Urgent' as const,
    category: 'Urgent' as const,
  },
  {
    key: 'Sunken eyes' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Sunken eyes" "finding"))',
    name: 'Sunken eyes',
    description: null,
    priority: 'Urgent' as const,
    category: 'Urgent' as const,
  },
  {
    key: 'Restless/ irritable' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Restlessness" "finding"))',
    name: 'Restless/ irritable',
    description: null,
    priority: 'Urgent' as const,
    category: 'Urgent' as const,
  },
  {
    key: 'Thirsty/decreased urine output' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Decreased urine output" "finding"))',
    name: 'Thirsty/decreased urine output',
    description: null,
    priority: 'Urgent' as const,
    category: 'Urgent' as const,
  },
  {
    key: 'Dry mouth' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Xerostomia" "finding"))',
    name: 'Dry mouth',
    description: null,
    priority: 'Urgent' as const,
    category: 'Urgent' as const,
  },
  {
    key: 'Crying without tears' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Crying infant" "finding"))',
    name: 'Crying without tears',
    description: null,
    priority: 'Urgent' as const,
    category: 'Urgent' as const,
  },
  {
    key: 'Skin pinch slow (Less than 2 sec)' as const,
    clinical_finding_s_expression:
      '(clinical_finding (snomed_concept "Decreased skin turgor" "finding") (qualifier (snomed_concept "Moderate (severity modifier)" "qualifier value")))',
    name: 'Skin pinch slow (Less than 2 sec)',
    description: null,
    priority: 'Urgent' as const,
    category: 'Urgent' as const,
  },
  {
    key: 'Unable to drink /feed or vomit everything' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Unable to drink" "finding"))',
    name: 'Unable to drink /feed or vomit everything',
    description: null,
    priority: 'Urgent' as const,
    category: 'Urgent' as const,
  },
  {
    key: 'Malnutrition (Visible severe wasting)' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Nutritional wasting" "disorder"))',
    name: 'Malnutrition (Visible severe wasting)',
    description: null,
    priority: 'Urgent' as const,
    category: 'Urgent' as const,
  },
  {
    key: 'Malnutrition Oedema (pitting Oedema of both feet)' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Edema of bilateral feet" "finding"))',
    name: 'Malnutrition Oedema (pitting Oedema of both feet)',
    description: null,
    priority: 'Urgent' as const,
    category: 'Urgent' as const,
  },
  {
    key: 'Unwell child with known diabetes' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Diabetes mellitus" "disorder"))',
    name: 'Unwell child with known diabetes',
    description: null,
    priority: 'Urgent' as const,
    category: 'Urgent' as const,
  },
  {
    key: 'Any other burn less than 10%' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Burn" "disorder"))',
    excluding_s_expression:
      '(or (clinical_finding (snomed_concept "Burn" "disorder") (qualifier (snomed_concept "Circumferential" "qualifier value"))) (clinical_finding (snomed_concept "Inhalation burn due to hot gas" "disorder")) (clinical_finding (snomed_concept "Chemical burn" "disorder")) (clinical_finding (snomed_concept "Burn of face" "disorder")))',
    name: 'Any other burn less than 10%',
    description: null,
    priority: 'Urgent' as const,
    category: 'Urgent' as const,
  },
  {
    key: 'Dislocation of finger or toe' as const,
    clinical_finding_s_expression: '(clinical_finding (snomed_concept "Dislocation of joint of finger" "disorder"))',
    name: 'Dislocation of finger or toe',
    description: null,
    priority: 'Urgent' as const,
    category: 'Urgent' as const,
  },
]

export type WarningSignKey = typeof WARNING_SIGN_DEFS[number]['key']

function buildNormalizedSign<T extends typeof WARNING_SIGN_DEFS[number]>(
  sign: T,
  overrides: { priority: 'Emergency' | 'Very urgent' | 'Urgent'; category: string; subcategory?: string },
) {
  return omitUndefinedProperties({
    ...sign,
    ...overrides,
    clinical_finding_s_expression: normalForm(sign.clinical_finding_s_expression),
    excluding_s_expression: sign.excluding_s_expression && normalForm(sign.excluding_s_expression),
    prompt_when_s_expression: sign.prompt_when_s_expression && normalForm(sign.prompt_when_s_expression),
  }) as WarningSign
}

const KEYED_DEFS = keyBy(WARNING_SIGN_DEFS, 'key')

function buildAdultSigns(): WarningSign[] {
  const order = WARNING_SIGN_ORDER.adult
  const all_keys = [
    ...order.Emergency.map((key) => ({ key, priority: 'Emergency' as const, category: 'Emergency' })),
    ...order['Very urgent'].map((key) => ({ key, priority: 'Very urgent' as const, category: 'Very urgent' })),
    ...order.Urgent.map((key) => ({ key, priority: 'Urgent' as const, category: 'Urgent' })),
  ]
  return sortBy(
    all_keys.map(({ key, priority, category }) => buildNormalizedSign(KEYED_DEFS[key], { priority, category })),
    (sign) => ORDERED_PRIORITIES.indexOf(sign.priority),
    (sign) => {
      const priority = sign.priority as 'Emergency' | 'Very urgent' | 'Urgent'
      return order[priority].indexOf(sign.key as WarningSignKey)
    },
  )
}

function buildOlderChildSigns(): WarningSign[] {
  const order = WARNING_SIGN_ORDER['older child']

  const emergency_signs = Object.entries(order.Emergency).flatMap(([subcategory, keys]) =>
    keys.map((key) => buildNormalizedSign(KEYED_DEFS[key], { priority: 'Emergency', category: 'Emergency', subcategory }))
  )

  const vu_signs = order['Very urgent'].map((key) => buildNormalizedSign(KEYED_DEFS[key], { priority: 'Very urgent', category: 'Very urgent' }))

  const urgent_signs = order.Urgent.map((key) => {
    const sign = buildNormalizedSign(KEYED_DEFS[key], { priority: 'Urgent', category: 'Urgent' })
    // Older child closed fracture doesn't show the adult description
    if (key === 'Closed fracture') return { ...sign, description: null }
    return sign
  })

  return [...emergency_signs, ...vu_signs, ...urgent_signs]
}

export const WARNING_SIGNS: {
  adult: WarningSign[]
  'older child': WarningSign[]
  'younger child': WarningSign[]
} = {
  adult: buildAdultSigns(),
  'older child': buildOlderChildSigns(),
  'younger child': [],
}

export const KEYED_WARNING_SIGNS = keyBy(WARNING_SIGNS.adult, 'key')

export function findingQueryExpression(
  { excluding_s_expression, clinical_finding_s_expression }: WarningSign,
): string {
  if (!excluding_s_expression) return clinical_finding_s_expression
  return `(and ${clinical_finding_s_expression} (not ${excluding_s_expression}))`
}
