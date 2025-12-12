import entries from '../util/entries.ts'

export type WarningSign = {
  clinical_finding_s_expression: string
  sats_primary_name: string
  sats_secondary_text: string | null
  sats_priority_snomed_concept_id: string
  prompt_when_s_expression?: string
}

export type KeyedWarningSign = {
  key: string
} & WarningSign

export const WARNING_SIGNS = {
  'Obstructed airway': {
    'clinical_finding_s_expression': '(qualifier 79688008)',
    'sats_primary_name': 'Obstructed airway',
    'sats_secondary_text': 'Not breathing',
    'sats_priority_snomed_concept_id': '25876001',
  },
  'Seizure': {
    'clinical_finding_s_expression':
      // TODO, support nested qualifiers in insertions
      '(qualifier 91175000 (qualifier 15240007))',
    'sats_primary_name': 'Seizure',
    'sats_secondary_text': 'Current',
    'sats_priority_snomed_concept_id': '25876001',
  },
  'Burn Facial': {
    'clinical_finding_s_expression': '(qualifier 262582004)',
    'sats_primary_name': 'Burn',
    'sats_secondary_text': 'Facial',
    'sats_priority_snomed_concept_id': '25876001',
  },
  'Burn Inhalation': {
    'clinical_finding_s_expression': '(qualifier 425082000)',
    'sats_primary_name': 'Burn',
    'sats_secondary_text': 'Inhalation',
    'sats_priority_snomed_concept_id': '25876001',
  },
  'Cardiac arrest': {
    'clinical_finding_s_expression': '(qualifier 410429000)',
    'sats_primary_name': 'Cardiac arrest',
    'sats_secondary_text': null,
    'sats_priority_snomed_concept_id': '25876001',
  },
  // 400209005 |Injury caused by causative force (disorder)|
  'High energy transfer': {
    'clinical_finding_s_expression': '(qualifier 400209005)',
    'sats_primary_name': 'High energy transfer',
    'sats_secondary_text': 'Severe mechanism of injury',
    'sats_priority_snomed_concept_id': '1356878002',
  },
  'Focal neurology — acute': {
    'clinical_finding_s_expression': '(qualifier 230690007)',
    'sats_primary_name': 'Focal neurology — acute',
    'sats_secondary_text': 'Stroke',
    'sats_priority_snomed_concept_id': '1356878002',
  },
  'Burn Circumferential': {
    'clinical_finding_s_expression':
      '(qualifier 125666000 (qualifier 255593009))',
    'sats_primary_name': 'Burn',
    'sats_secondary_text': 'Circumferential',
    'sats_priority_snomed_concept_id': '1356878002',
  },
  'Shortness of breath - acute': {
    'clinical_finding_s_expression':
      '(qualifier 267036007 (qualifier 24484000))',
    'sats_primary_name': 'Shortness of breath - acute',
    'sats_secondary_text': null,
    'sats_priority_snomed_concept_id': '1356878002',
  },
  'Aggression': {
    'clinical_finding_s_expression': '(qualifier 61372001)',
    'sats_primary_name': 'Aggression',
    'sats_secondary_text': null,
    'sats_priority_snomed_concept_id': '1356878002',
  },
  'Burn Chemical': {
    'clinical_finding_s_expression': '(qualifier 426284001)',
    'sats_primary_name': 'Burn',
    'sats_secondary_text': 'Chemical',
    'sats_priority_snomed_concept_id': '1356878002',
  },
  'Threatened limb': {
    'clinical_finding_s_expression': '(qualifier 21631000119105)',
    'sats_primary_name': 'Threatened limb',
    'sats_secondary_text': null,
    'sats_priority_snomed_concept_id': '1356878002',
  },
  'Poisoning': {
    'clinical_finding_s_expression': '(qualifier 75478009)',
    'sats_primary_name': 'Poisoning',
    'sats_secondary_text': null,
    'sats_priority_snomed_concept_id': '1356878002',
  },
  'Overdose': {
    'clinical_finding_s_expression': '(qualifier 1149222004)',
    'sats_primary_name': 'Overdose',
    'sats_secondary_text': null,
    'sats_priority_snomed_concept_id': '1356878002',
  },
  'Coughing blood': {
    'clinical_finding_s_expression': '(qualifier 66857006)',
    'sats_primary_name': 'Coughing blood',
    'sats_secondary_text': null,
    'sats_priority_snomed_concept_id': '1356878002',
  },
  'Eye injury': {
    'clinical_finding_s_expression': '(qualifier 231794000)',
    'sats_primary_name': 'Eye injury',
    'sats_secondary_text': null,
    'sats_priority_snomed_concept_id': '1356878002',
  },
  'Chest pain': {
    'clinical_finding_s_expression': '(qualifier 29857009)',
    'sats_primary_name': 'Chest pain',
    'sats_secondary_text': null,
    'sats_priority_snomed_concept_id': '1356878002',
  },
  'Dislocation of larger joint': {
    'clinical_finding_s_expression':
      '(qualifier 87642003 (not (qualifier 363698007 7569003)) (not (qualifier 363698007 29707007)))',
    'sats_primary_name': 'Dislocation of larger joint',
    'sats_secondary_text': 'not finger or toe',
    'sats_priority_snomed_concept_id': '1356878002',
  },
  'Vomiting fresh blood': {
    'clinical_finding_s_expression': '(qualifier 267051003)',
    'sats_primary_name': 'Vomiting fresh blood',
    'sats_secondary_text': null,
    'sats_priority_snomed_concept_id': '1356878002',
  },
  'Stabbed neck': {
    'clinical_finding_s_expression': '(qualifier 283457003)',
    'sats_primary_name': 'Stabbed neck',
    'sats_secondary_text': null,
    'sats_priority_snomed_concept_id': '1356878002',
  },
  'Fractured - compound': {
    'clinical_finding_s_expression': '(qualifier 52329006)',
    'sats_primary_name': 'Fractured - compound',
    'sats_secondary_text': 'with a break in skin',
    'sats_priority_snomed_concept_id': '1356878002',
  },
  'Pregnancy and abdominal trauma': {
    'clinical_finding_s_expression':
      // TODO support multiple qualifiers
      // '(qualifier 417746004 (qualifier 363698007 818983003))',
      '(qualifier 417746004)',
    'sats_primary_name': 'Pregnancy and abdominal trauma',
    'sats_secondary_text': null,
    'sats_priority_snomed_concept_id': '1356878002',
    'prompt_when_s_expression': '(active_condition 77386006)',
  },
  'Pregnancy and abdominal pain': {
    'clinical_finding_s_expression': '(qualifier 21522001)',
    'sats_primary_name': 'Pregnancy and abdominal pain',
    'sats_secondary_text': null,
    'sats_priority_snomed_concept_id': '1356878002',
    'prompt_when_s_expression': '(active_condition 77386006)',
  },
  'Hemorrhage Uncontrolled': {
    'clinical_finding_s_expression':
      '(qualifier 131148009 (qualifier 19032002))',
    'sats_primary_name': 'Hemorrhage Uncontrolled',
    'sats_secondary_text': 'arterial bleed',
    'sats_priority_snomed_concept_id': '1356878002',
  },
  // Burn over 20% will be handled with a special burn chart
  // {
  //   'clinical_finding_s_expression': '(qualifier 212049006)',
  //   'qualifer_relationship_snomed_concept_id': '276140008',
  //   'qualifer_value_snomed_concept_id': null,
  //   'qualifer_value_concrete': '20',
  //   'sats_primary_name': 'Burn over 20%',
  //   'sats_secondary_text': null,
  //   'sats_priority_snomed_concept_id': '1356878002',
  // },
  'Seizure - post ictal': {
    'clinical_finding_s_expression': '(qualifier 31758001)',
    'sats_primary_name': 'Seizure - post ictal',
    'sats_secondary_text': null,
    'sats_priority_snomed_concept_id': '1356878002',
  },
  'Severe pain': {
    'clinical_finding_s_expression': '(qualifier 76948002)',
    'sats_primary_name': 'Severe pain',
    'sats_secondary_text': null,
    'sats_priority_snomed_concept_id': '1356878002',
  },
  'Burn Moderate severity': {
    'clinical_finding_s_expression':
      '(qualifier 284549007 (qualifier 6736007))',
    'sats_primary_name': 'Burn',
    'sats_secondary_text': 'Moderate severity',
    'sats_priority_snomed_concept_id': '1356878002',
  },
  'Haemorrhage Controlled': {
    'clinical_finding_s_expression':
      '(qualifier 131148009 (qualifier 31509003))',
    'sats_primary_name': 'Haemorrhage',
    'sats_secondary_text': 'Controlled',
    'sats_priority_snomed_concept_id': '103391001',
  },
  'Dislocation of finge': {
    'clinical_finding_s_expression': '(qualifier 827108008)',
    'sats_primary_name': 'Dislocation of finge',
    'sats_secondary_text': null,
    'sats_priority_snomed_concept_id': '103391001',
  },
  'Dislocation of toe joint': {
    'clinical_finding_s_expression': '(qualifier 263030002)',
    'sats_primary_name': 'Dislocation of toe joint',
    'sats_secondary_text': null,
    'sats_priority_snomed_concept_id': '103391001',
  },
  'Fracture': {
    'clinical_finding_s_expression': '(qualifier 423125000)',
    'sats_primary_name': 'Fracture',
    'sats_secondary_text': 'Closed (no break in the skin)',
    'sats_priority_snomed_concept_id': '103391001',
  },
  'Burn Other': {
    'clinical_finding_s_expression': '(qualifier 125666000)',
    'sats_primary_name': 'Burn',
    'sats_secondary_text': 'Other',
    'sats_priority_snomed_concept_id': '103391001',
  },
  'Abdominal pain': {
    'clinical_finding_s_expression': '(qualifier 21522001)',
    'sats_primary_name': 'Abdominal pain',
    'sats_secondary_text': null,
    'sats_priority_snomed_concept_id': '103391001',
    'prompt_when_s_expression': '(not (active_condition 77386006))',
  },
  'Persistent vomiting': {
    'clinical_finding_s_expression': '(qualifier 196746003)',
    'sats_primary_name': 'Persistent vomiting',
    'sats_secondary_text': null,
    'sats_priority_snomed_concept_id': '103391001',
  },
  'Moderate pain': {
    'clinical_finding_s_expression': '(qualifier 50415004)',
    'sats_primary_name': 'Moderate pain',
    'sats_secondary_text': null,
    'sats_priority_snomed_concept_id': '103391001',
  },
} satisfies Record<string, WarningSign>

export const KEYED_WARNING_SIGNS: KeyedWarningSign[] = entries(WARNING_SIGNS)
  .map(([key, sign]) => ({
    key,
    ...sign,
  }))
