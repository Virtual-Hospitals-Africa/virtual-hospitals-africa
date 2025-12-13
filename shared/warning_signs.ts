import { KeyedWarningSign, WarningSign } from '../types.ts'
import entries from '../util/entries.ts'

export const WARNING_SIGNS = {
  'Obstructed airway': {
    'clinical_finding_s_expression': '(finding 404684003 (qualifier 79688008))',
    'sats_primary_name': 'Obstructed airway',
    'sats_secondary_text': 'Not breathing',
    'sats_priority': 'Emergency',
  },
  'Seizure': {
    'clinical_finding_s_expression':
      '(finding 404684003 (qualifier 91175000 (qualifier 15240007)))',
    'sats_primary_name': 'Seizure',
    'sats_secondary_text': 'Current',
    'sats_priority': 'Emergency',
  },
  'Burn Facial': {
    'clinical_finding_s_expression':
      '(finding 404684003 (qualifier 262582004))',
    'sats_primary_name': 'Burn',
    'sats_secondary_text': 'Facial',
    'sats_priority': 'Emergency',
  },
  'Burn Inhalation': {
    'clinical_finding_s_expression':
      '(finding 404684003 (qualifier 425082000))',
    'sats_primary_name': 'Burn',
    'sats_secondary_text': 'Inhalation',
    'sats_priority': 'Emergency',
  },
  'Cardiac arrest': {
    'clinical_finding_s_expression':
      '(finding 404684003 (qualifier 410429000))',
    'sats_primary_name': 'Cardiac arrest',
    'sats_secondary_text': null,
    'sats_priority': 'Emergency',
  },
  // 400209005 |Injury caused by causative force (disorder)|
  'High energy transfer': {
    'clinical_finding_s_expression':
      '(finding 404684003 (qualifier 400209005))',
    'sats_primary_name': 'High energy transfer',
    'sats_secondary_text': 'Severe mechanism of injury',
    'sats_priority': 'Very urgent',
  },
  'Focal neurology — acute': {
    'clinical_finding_s_expression':
      '(finding 404684003 (qualifier 230690007))',
    'sats_primary_name': 'Focal neurology — acute',
    'sats_secondary_text': 'Stroke',
    'sats_priority': 'Very urgent',
  },
  'Burn Circumferential': {
    'clinical_finding_s_expression':
      '(finding 404684003 (qualifier 125666000 (qualifier 255593009)))',
    'sats_primary_name': 'Burn',
    'sats_secondary_text': 'Circumferential',
    'sats_priority': 'Very urgent',
  },
  'Shortness of breath - acute': {
    'clinical_finding_s_expression':
      '(finding 404684003 (qualifier 267036007 (qualifier 24484000)))',
    'sats_primary_name': 'Shortness of breath - acute',
    'sats_secondary_text': null,
    'sats_priority': 'Very urgent',
  },
  'Aggression': {
    'clinical_finding_s_expression': '(finding 404684003 (qualifier 61372001))',
    'sats_primary_name': 'Aggression',
    'sats_secondary_text': null,
    'sats_priority': 'Very urgent',
  },
  'Burn Chemical': {
    'clinical_finding_s_expression':
      '(finding 404684003 (qualifier 426284001))',
    'sats_primary_name': 'Burn',
    'sats_secondary_text': 'Chemical',
    'sats_priority': 'Very urgent',
  },
  'Threatened limb': {
    'clinical_finding_s_expression':
      '(finding 404684003 (qualifier 21631000119105))',
    'sats_primary_name': 'Threatened limb',
    'sats_secondary_text': null,
    'sats_priority': 'Very urgent',
  },
  'Poisoning': {
    'clinical_finding_s_expression': '(finding 404684003 (qualifier 75478009))',
    'sats_primary_name': 'Poisoning',
    'sats_secondary_text': null,
    'sats_priority': 'Very urgent',
  },
  'Overdose': {
    'clinical_finding_s_expression':
      '(finding 404684003 (qualifier 1149222004))',
    'sats_primary_name': 'Overdose',
    'sats_secondary_text': null,
    'sats_priority': 'Very urgent',
  },
  'Coughing blood': {
    'clinical_finding_s_expression': '(finding 404684003 (qualifier 66857006))',
    'sats_primary_name': 'Coughing blood',
    'sats_secondary_text': null,
    'sats_priority': 'Very urgent',
  },
  'Eye injury': {
    'clinical_finding_s_expression':
      '(finding 404684003 (qualifier 231794000))',
    'sats_primary_name': 'Eye injury',
    'sats_secondary_text': null,
    'sats_priority': 'Very urgent',
  },
  'Chest pain': {
    'clinical_finding_s_expression': '(finding 404684003 (qualifier 29857009))',
    'sats_primary_name': 'Chest pain',
    'sats_secondary_text': null,
    'sats_priority': 'Very urgent',
  },
  'Dislocation of larger joint': {
    'clinical_finding_s_expression':
      '(finding 404684003 (qualifier 87642003) (not (qualifier 363698007 7569003)) (not (qualifier 363698007 29707007)))',
    'sats_primary_name': 'Dislocation of larger joint',
    'sats_secondary_text': 'not finger or toe',
    'sats_priority': 'Very urgent',
  },
  'Vomiting fresh blood': {
    'clinical_finding_s_expression':
      '(finding 404684003 (qualifier 267051003))',
    'sats_primary_name': 'Vomiting fresh blood',
    'sats_secondary_text': null,
    'sats_priority': 'Very urgent',
  },
  'Stabbed neck': {
    'clinical_finding_s_expression':
      '(finding 404684003 (qualifier 283457003))',
    'sats_primary_name': 'Stabbed neck',
    'sats_secondary_text': null,
    'sats_priority': 'Very urgent',
  },
  'Fractured - compound': {
    'clinical_finding_s_expression': '(finding 404684003 (qualifier 52329006))',
    'sats_primary_name': 'Fractured - compound',
    'sats_secondary_text': 'with a break in skin',
    'sats_priority': 'Very urgent',
  },
  'Pregnancy and abdominal trauma': {
    'clinical_finding_s_expression':
      '(finding 404684003 (qualifier 417746004))',
    // TODO support multiple qualifiers
    // '(qualifier 417746004 (qualifier 363698007 818983003))',
    'sats_primary_name': 'Pregnancy and abdominal trauma',
    'sats_secondary_text': null,
    'sats_priority': 'Very urgent',
    'prompt_when_s_expression': '(active_condition 77386006)',
  },
  'Pregnancy and abdominal pain': {
    'clinical_finding_s_expression': '(finding 404684003 (qualifier 21522001))',
    'sats_primary_name': 'Pregnancy and abdominal pain',
    'sats_secondary_text': null,
    'sats_priority': 'Very urgent',
    'prompt_when_s_expression': '(active_condition 77386006)',
  },
  'Hemorrhage Uncontrolled': {
    'clinical_finding_s_expression':
      '(finding 404684003 (qualifier 131148009 (qualifier 19032002)))',
    'sats_primary_name': 'Hemorrhage Uncontrolled',
    'sats_secondary_text': 'arterial bleed',
    'sats_priority': 'Very urgent',
  },
  // Burn over 20% will be handled with a special burn chart
  // {
  //   'clinical_finding_s_expression': '(finding 404684003 (qualifier 212049006))',
  //   'qualifer_relationship_snomed_concept_id': '276140008',
  //   'qualifer_value_snomed_concept_id': null,
  //   'qualifer_value_concrete': '20',
  //   'sats_primary_name': 'Burn over 20%',
  //   'sats_secondary_text': null,
  //   'sats_priority': 'Very urgent',
  // },
  'Seizure - post ictal': {
    'clinical_finding_s_expression': '(finding 404684003 (qualifier 31758001))',
    'sats_primary_name': 'Seizure - post ictal',
    'sats_secondary_text': null,
    'sats_priority': 'Very urgent',
  },
  'Severe pain': {
    'clinical_finding_s_expression': '(finding 404684003 (qualifier 76948002))',
    'sats_primary_name': 'Severe pain',
    'sats_secondary_text': null,
    'sats_priority': 'Very urgent',
  },
  'Burn Moderate severity': {
    'clinical_finding_s_expression':
      '(finding 404684003 (qualifier 284549007 (qualifier 6736007)))',
    'sats_primary_name': 'Burn',
    'sats_secondary_text': 'Moderate severity',
    'sats_priority': 'Very urgent',
  },
  'Haemorrhage Controlled': {
    'clinical_finding_s_expression':
      '(finding 404684003 (qualifier 131148009 (qualifier 31509003)))',
    'sats_primary_name': 'Haemorrhage',
    'sats_secondary_text': 'Controlled',
    'sats_priority': 'Urgent',
  },
  'Dislocation of finger': {
    'clinical_finding_s_expression':
      '(finding 404684003 (qualifier 827108008))',
    'sats_primary_name': 'Dislocation of finger',
    'sats_secondary_text': null,
    'sats_priority': 'Urgent',
  },
  'Dislocation of toe joint': {
    'clinical_finding_s_expression':
      '(finding 404684003 (qualifier 263030002))',
    'sats_primary_name': 'Dislocation of toe joint',
    'sats_secondary_text': null,
    'sats_priority': 'Urgent',
  },
  'Fracture': {
    'clinical_finding_s_expression':
      '(finding 404684003 (qualifier 423125000))',
    'sats_primary_name': 'Fracture',
    'sats_secondary_text': 'Closed (no break in the skin)',
    'sats_priority': 'Urgent',
  },
  'Burn Other': {
    'clinical_finding_s_expression':
      '(finding 404684003 (qualifier 125666000) (not (qualifier 262582004)) (not (qualifier 425082000)) (not (qualifier 255593009)))',
    'sats_primary_name': 'Burn',
    'sats_secondary_text': 'Other',
    'sats_priority': 'Urgent',
  },
  'Abdominal pain': {
    'clinical_finding_s_expression': '(finding 404684003 (qualifier 21522001))',
    'sats_primary_name': 'Abdominal pain',
    'sats_secondary_text': null,
    'sats_priority': 'Urgent',
    'prompt_when_s_expression': '(not (active_condition 77386006))',
  },
  'Persistent vomiting': {
    'clinical_finding_s_expression':
      '(finding 404684003 (qualifier 196746003))',
    'sats_primary_name': 'Persistent vomiting',
    'sats_secondary_text': null,
    'sats_priority': 'Urgent',
  },
  'Moderate pain': {
    'clinical_finding_s_expression': '(finding 404684003 (qualifier 50415004))',
    'sats_primary_name': 'Moderate pain',
    'sats_secondary_text': null,
    'sats_priority': 'Urgent',
  },
} satisfies Record<string, WarningSign>

export const KEYED_WARNING_SIGNS: KeyedWarningSign[] = entries(WARNING_SIGNS)
  .map(([key, sign]) => ({
    key,
    ...sign,
  }))
