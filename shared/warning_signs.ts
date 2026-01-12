import { WarningSign } from '../types.ts'
import { omitUndefinedProperties } from '../util/omitUndefinedProperties.ts'
import findMatching from '../util/findMatching.ts'
import { keyBy } from '../util/keyBy.ts'
import sortBy from '../util/sortBy.ts'
import { ORDERED_PRIORITIES } from './priorities.ts'
import { normalForm } from './s_expression.ts'
import { asConcept } from './snomed_concepts.ts'

export const WARNING_SIGN_SNOMED_CONCEPTS = [
  {
    'id': '212049006',
    'name': 'Burns classified according to percentage of body surface involved',
    'category': 'disorder' as const,
  },
  {
    'id': '284549007',
    'name': 'Laceration of hand',
    'category': 'disorder' as const,
  },
  {
    'id': '29857009',
    'name': 'Chest pain',
    'category': 'finding' as const,
  },
  {
    'id': '31758001',
    'name': 'Post-ictal state',
    'category': 'finding' as const,
  },
  {
    'id': '52329006',
    'name': 'Fracture, open',
    'category': 'morphologic abnormality' as const,
  },
  {
    'id': '91175000',
    'name': 'Seizure',
    'category': 'finding' as const,
  },
  {
    'id': '410429000',
    'name': 'Cardiac arrest',
    'category': 'disorder' as const,
  },
  {
    'id': '1149222004',
    'name': 'Overdose',
    'category': 'disorder' as const,
  },
  {
    'id': '21631000119105',
    'name': 'Limb ischemia',
    'category': 'disorder' as const,
  },
  {
    'id': '196746003',
    'name': 'Persistent vomiting',
    'category': 'disorder' as const,
  },
  {
    'id': '230690007',
    'name': 'Cerebrovascular accident',
    'category': 'disorder' as const,
  },
  {
    'id': '231794000',
    'name': 'Injury of globe of eye',
    'category': 'disorder' as const,
  },
  {
    'id': '131148009',
    'name': 'Bleeding',
    'category': 'finding' as const,
  },
  {
    'id': '426284001',
    'name': 'Chemical burn',
    'category': 'disorder' as const,
  },
  {
    'id': '400209005',
    'name': 'Injury caused by causative force',
    'category': 'disorder' as const,
  },
  {
    'id': '125666000',
    'name': 'Burn',
    'category': 'disorder' as const,
  },
  {
    'id': '6736007',
    'name': 'Moderate (severity modifier)',
    'category': 'qualifier value' as const,
  },
  {
    'id': '15240007',
    'name': 'Current',
    'category': 'qualifier value' as const,
  },
  {
    'id': '19032002',
    'name': 'Uncontrolled',
    'category': 'qualifier value' as const,
  },
  {
    'id': '24484000',
    'name': 'Severe (severity modifier)',
    'category': 'qualifier value' as const,
  },
  {
    'id': '31509003',
    'name': 'Controlled',
    'category': 'qualifier value' as const,
  },
  {
    'id': '255593009',
    'name': 'Circumferential',
    'category': 'qualifier value' as const,
  },
  {
    'id': '79688008',
    'name': 'Respiratory obstruction',
    'category': 'disorder' as const,
  },
  {
    'id': '263030002',
    'name': 'Dislocation of toe joint',
    'category': 'disorder' as const,
  },
  {
    'id': '66857006',
    'name': 'Hemoptysis',
    'category': 'finding' as const,
  },
  {
    'id': '423125000',
    'name': 'Closed fracture of bone',
    'category': 'disorder' as const,
  },
  {
    'id': '77386006',
    'name': 'Pregnancy',
    'category': 'finding' as const,
  },
  {
    'id': '267036007',
    'name': 'Dyspnea',
    'category': 'finding' as const,
  },
  {
    'id': '267051003',
    'name': 'Vomiting blood - fresh',
    'category': 'disorder' as const,
  },
  {
    'id': '283457003',
    'name': 'Stab wound of neck',
    'category': 'disorder' as const,
  },
  {
    'id': '21522001',
    'name': 'Abdominal pain',
    'category': 'finding' as const,
  },
  {
    'id': '29707007',
    'name': 'Toe structure',
    'category': 'body structure' as const,
  },
  {
    'id': '363698007',
    'name': 'Finding site',
    'category': 'attribute' as const,
  },
  {
    'id': '61372001',
    'name': 'Aggressive behavior',
    'category': 'finding' as const,
  },
  {
    'id': '75478009',
    'name': 'Poisoning',
    'category': 'disorder' as const,
  },
  {
    'id': '7569003',
    'name': 'Finger structure',
    'category': 'body structure' as const,
  },
  {
    'id': '76948002',
    'name': 'Severe pain',
    'category': 'finding' as const,
  },
  {
    'id': '87642003',
    'name': 'Dislocation',
    'category': 'morphologic abnormality' as const,
  },
  {
    'id': '417746004',
    'name': 'Traumatic injury',
    'category': 'disorder' as const,
  },
  {
    'id': '262582004',
    'name': 'Burn of face',
    'category': 'disorder' as const,
  },
  {
    'id': '425082000',
    'name': 'Inhalation burn due to hot gas',
    'category': 'disorder' as const,
  },
  {
    'id': '827108008',
    'name': 'Dislocation of digit of hand',
    'category': 'disorder' as const,
  },
].map(asConcept)

function sExpressionById(id: string): string {
  return findMatching(WARNING_SIGN_SNOMED_CONCEPTS, { id }).s_expression
}

const WARNING_SIGN_DEFS = [
  {
    'key': 'Obstructed airway' as const,
    'clinical_finding_s_expression': `(clinical_finding ${sExpressionById('79688008')})`,
    'primary_name': 'Obstructed airway',
    'secondary_text': 'Not breathing',
    'sats_priority': 'Emergency' as const,
  },
  {
    'key': 'Seizure' as const,
    'clinical_finding_s_expression': `(clinical_finding ${sExpressionById('91175000')})`,
    'primary_name': 'Seizure',
    'secondary_text': 'Current',
    'sats_priority': 'Emergency' as const,
  },
  {
    'key': 'Burn Facial' as const,
    'clinical_finding_s_expression': `(clinical_finding ${sExpressionById('262582004')})`,
    'primary_name': 'Burn',
    'secondary_text': 'Facial',
    'sats_priority': 'Emergency' as const,
  },
  {
    'key': 'Burn Inhalation' as const,
    'clinical_finding_s_expression': `(clinical_finding ${sExpressionById('425082000')})`,
    'primary_name': 'Burn',
    'secondary_text': 'Inhalation',
    'sats_priority': 'Emergency' as const,
  },
  {
    'key': 'Cardiac arrest' as const,
    'clinical_finding_s_expression': `(clinical_finding ${sExpressionById('410429000')})`,
    'primary_name': 'Cardiac arrest',
    'secondary_text': null,
    'sats_priority': 'Emergency' as const,
  },
  // ${sExpressionById('400209005')} |Injury caused by causative force (disorder)|
  {
    'key': 'High energy transfer' as const,
    'clinical_finding_s_expression': `(clinical_finding ${sExpressionById('400209005')})`,
    'primary_name': 'High energy transfer',
    'secondary_text': 'Severe mechanism of injury',
    'sats_priority': 'Very urgent' as const,
  },
  {
    'key': 'Focal neurology — acute' as const,
    'clinical_finding_s_expression': `(clinical_finding ${sExpressionById('230690007')})`,
    'primary_name': 'Focal neurology — acute',
    'secondary_text': 'Stroke',
    'sats_priority': 'Very urgent' as const,
  },
  {
    'key': 'Burn Circumferential' as const,
    'clinical_finding_s_expression': `(clinical_finding ${sExpressionById('125666000')} (qualifier ${sExpressionById('255593009')}))`,
    'primary_name': 'Burn',
    'secondary_text': 'Circumferential',
    'sats_priority': 'Very urgent' as const,
  },
  {
    'key': 'Shortness of breath - acute' as const,
    'clinical_finding_s_expression': `(clinical_finding ${sExpressionById('267036007')} (qualifier ${sExpressionById('24484000')}))`,
    'primary_name': 'Shortness of breath - acute',
    'secondary_text': null,
    'sats_priority': 'Very urgent' as const,
  },
  {
    'key': 'Aggression' as const,
    'clinical_finding_s_expression': `(clinical_finding ${sExpressionById('61372001')})`,
    'primary_name': 'Aggression',
    'secondary_text': null,
    'sats_priority': 'Very urgent' as const,
  },
  {
    'key': 'Burn Chemical' as const,
    'clinical_finding_s_expression': `(clinical_finding ${sExpressionById('426284001')})`,
    'primary_name': 'Burn',
    'secondary_text': 'Chemical',
    'sats_priority': 'Very urgent' as const,
  },
  {
    'key': 'Threatened limb' as const,
    'clinical_finding_s_expression': `(clinical_finding ${sExpressionById('21631000119105')})`,
    'primary_name': 'Threatened limb',
    'secondary_text': null,
    'sats_priority': 'Very urgent' as const,
  },
  {
    'key': 'Poisoning' as const,
    'clinical_finding_s_expression': `(clinical_finding ${sExpressionById('75478009')})`,
    'excluding_s_expression': `(clinical_finding ${sExpressionById('1149222004')})`,
    'primary_name': 'Poisoning',
    'secondary_text': null,
    'sats_priority': 'Very urgent' as const,
  },
  {
    'key': 'Overdose' as const,
    'clinical_finding_s_expression': `(clinical_finding ${sExpressionById('1149222004')})`,
    'primary_name': 'Overdose',
    'secondary_text': null,
    'sats_priority': 'Very urgent' as const,
  },
  {
    'key': 'Coughing blood' as const,
    'clinical_finding_s_expression': `(clinical_finding ${sExpressionById('66857006')})`,
    'primary_name': 'Coughing blood',
    'secondary_text': null,
    'sats_priority': 'Very urgent' as const,
  },
  {
    'key': 'Eye injury' as const,
    'clinical_finding_s_expression': `(clinical_finding ${sExpressionById('231794000')})`,
    'primary_name': 'Eye injury',
    'secondary_text': null,
    'sats_priority': 'Very urgent' as const,
  },
  {
    'key': 'Chest pain' as const,
    'clinical_finding_s_expression': `(clinical_finding ${sExpressionById('29857009')})`,
    'primary_name': 'Chest pain',
    'secondary_text': null,
    'sats_priority': 'Very urgent' as const,
  },
  {
    'key': 'Dislocation of larger joint' as const,
    'clinical_finding_s_expression': `(clinical_finding ${sExpressionById('87642003')})`,
    'excluding_s_expression': `
    (or (finding ${sExpressionById('363698007')} ${sExpressionById('7569003')})
          (finding ${sExpressionById('363698007')} ${sExpressionById('29707007')}))
  `,
    'primary_name': 'Dislocation of larger joint',
    'secondary_text': 'not finger or toe',
    'sats_priority': 'Very urgent' as const,
  },
  {
    'key': 'Vomiting fresh blood' as const,
    'clinical_finding_s_expression': `(clinical_finding ${sExpressionById('267051003')})`,
    'primary_name': 'Vomiting fresh blood',
    'secondary_text': null,
    'sats_priority': 'Very urgent' as const,
  },
  {
    'key': 'Stabbed neck' as const,
    'clinical_finding_s_expression': `(clinical_finding ${sExpressionById('283457003')})`,
    'primary_name': 'Stabbed neck',
    'secondary_text': null,
    'sats_priority': 'Very urgent' as const,
  },
  {
    'key': 'Fractured - compound' as const,
    'clinical_finding_s_expression': `(clinical_finding ${sExpressionById('52329006')})`,
    'primary_name': 'Fractured - compound',
    'secondary_text': 'with a break in skin',
    'sats_priority': 'Very urgent' as const,
  },
  {
    'key': 'Pregnancy and abdominal trauma' as const,
    'clinical_finding_s_expression': `(clinical_finding ${sExpressionById('417746004')})`,
    'primary_name': 'Pregnancy and abdominal trauma',
    'secondary_text': null,
    'sats_priority': 'Very urgent' as const,
    'prompt_when_s_expression': `(active_condition ${sExpressionById('77386006')})`,
  },
  {
    'key': 'Pregnancy and abdominal pain' as const,
    'clinical_finding_s_expression': `(clinical_finding ${sExpressionById('21522001')})`,
    'primary_name': 'Pregnancy and abdominal pain',
    'secondary_text': null,
    'sats_priority': 'Very urgent' as const,
    'prompt_when_s_expression': `(active_condition ${sExpressionById('77386006')})`,
  },
  {
    'key': 'Hemorrhage Uncontrolled' as const,
    'clinical_finding_s_expression': `(clinical_finding ${sExpressionById('131148009')} (qualifier ${sExpressionById('19032002')}))`,
    'primary_name': 'Hemorrhage Uncontrolled',
    'secondary_text': 'arterial bleed',
    'sats_priority': 'Very urgent' as const,
  },
  // Burn over ${sExpressionById('20')}% will be handled with a special burn chart
  // {
  //   'clinical_finding_s_expression': `(clinical_finding ${sExpressionById('212049006')})`,
  //   'qualifer_relationship_snomed_concept_id': '${sExpressionById('276140008')}',
  //   'qualifer_value_snomed_concept_id': null,
  //   'qualifer_value_concrete': '${sExpressionById('20')}',
  //   'primary_name': 'Burn over ${sExpressionById('20')}%',
  //   'secondary_text': null,
  //   'sats_priority': 'Very urgent' as const,
  // },
  {
    'key': 'Seizure - post ictal' as const,
    'clinical_finding_s_expression': `(clinical_finding ${sExpressionById('31758001')})`,
    'primary_name': 'Seizure - post ictal',
    'secondary_text': null,
    'sats_priority': 'Very urgent' as const,
  },
  {
    'key': 'Severe pain' as const,
    'clinical_finding_s_expression': `(clinical_finding ${sExpressionById('76948002')})`,
    'primary_name': 'Severe pain',
    'secondary_text': null,
    'sats_priority': 'Very urgent' as const,
  },
  {
    'key': 'Burn Moderate severity' as const,
    'clinical_finding_s_expression': `(clinical_finding ${sExpressionById('284549007')} (qualifier ${sExpressionById('6736007')}))`,
    'primary_name': 'Burn',
    'secondary_text': 'Moderate severity',
    'sats_priority': 'Very urgent' as const,
  },
  {
    'key': 'Haemorrhage Controlled' as const,
    'clinical_finding_s_expression': `(clinical_finding ${sExpressionById('131148009')} (qualifier ${sExpressionById('31509003')}))`,
    'primary_name': 'Haemorrhage',
    'secondary_text': 'Controlled',
    'sats_priority': 'Urgent' as const,
  },
  {
    'key': 'Dislocation of finger' as const,
    'clinical_finding_s_expression': `(clinical_finding ${sExpressionById('827108008')})`,
    'primary_name': 'Dislocation of finger',
    'secondary_text': null,
    'sats_priority': 'Urgent' as const,
  },
  {
    'key': 'Dislocation of toe joint' as const,
    'clinical_finding_s_expression': `(clinical_finding ${sExpressionById('263030002')})`,
    'primary_name': 'Dislocation of toe joint',
    'secondary_text': null,
    'sats_priority': 'Urgent' as const,
  },
  {
    'key': 'Fracture' as const,
    'clinical_finding_s_expression': `(clinical_finding ${sExpressionById('423125000')})`,
    'primary_name': 'Fracture',
    'secondary_text': 'Closed (no break in the skin)',
    'sats_priority': 'Urgent' as const,
  },
  {
    'key': 'Burn Other' as const,
    'clinical_finding_s_expression': `
    (clinical_finding ${sExpressionById('125666000')})
  `,
    'excluding_s_expression': `
    (or
      (clinical_finding ${sExpressionById('125666000')} (qualifier ${sExpressionById('255593009')}))
      (clinical_finding ${sExpressionById('425082000')})
      (clinical_finding ${sExpressionById('426284001')})
      (clinical_finding ${sExpressionById('262582004')}))
  `,
    'primary_name': 'Burn',
    'secondary_text': 'Other',
    'sats_priority': 'Urgent' as const,
  },
  {
    'key': 'Abdominal pain' as const,
    'clinical_finding_s_expression': `(clinical_finding ${sExpressionById('21522001')})`,
    'primary_name': 'Abdominal pain',
    'secondary_text': null,
    'sats_priority': 'Urgent' as const,
    'prompt_when_s_expression': `(not (active_condition ${sExpressionById('77386006')}))`,
  },
  {
    'key': 'Persistent vomiting' as const,
    'clinical_finding_s_expression': `(clinical_finding ${sExpressionById('196746003')})`,
    'primary_name': 'Persistent vomiting',
    'secondary_text': null,
    'sats_priority': 'Urgent' as const,
  },
  {
    'key': 'Moderate pain' as const,
    'clinical_finding_s_expression': `(clinical_finding (snomed_concept "Moderate pain" "finding"))`,
    'primary_name': 'Moderate pain',
    'secondary_text': null,
    'sats_priority': 'Urgent' as const,
  },
]

export type WarningSignKey = typeof WARNING_SIGN_DEFS[number]['key']

export const KEYED_WARNING_SIGNS: WarningSign[] = sortBy(
  WARNING_SIGN_DEFS.map((sign) =>
    omitUndefinedProperties({
      ...sign,
      clinical_finding_s_expression: normalForm(sign.clinical_finding_s_expression),
      excluding_s_expression: sign.excluding_s_expression && normalForm(sign.excluding_s_expression),
      prompt_when_s_expression: sign.prompt_when_s_expression && normalForm(sign.prompt_when_s_expression),
    })
  ),
  (sign) => ORDERED_PRIORITIES.indexOf(sign.sats_priority),
)

export const WARNING_SIGNS = keyBy(KEYED_WARNING_SIGNS, 'key')

export function findingQueryExpression(
  { excluding_s_expression, clinical_finding_s_expression }: WarningSign,
): string {
  if (!excluding_s_expression) return clinical_finding_s_expression
  return `(and ${clinical_finding_s_expression} (not ${excluding_s_expression}))`
}
