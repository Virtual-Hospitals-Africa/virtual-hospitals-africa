import { WarningSign } from '../types.ts'
import findMatching from '../util/findMatching.ts'
import { keyBy } from '../util/keyBy.ts'
import sortBy from '../util/sortBy.ts'
import { ORDERED_PRIORITIES } from './priorities.ts'
import { normalForm } from './s_expression.ts'
import { asConcept, CLINICAL_FINDING } from './snomed_concepts.ts'

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

export const KEYED_WARNING_SIGNS = sortBy(
  [
    {
      'key': 'Obstructed airway' as const,
      'clinical_finding_s_expression':
        `(finding ${CLINICAL_FINDING.s_expression} ${
          sExpressionById('79688008')
        })`,
      'sats_primary_name': 'Obstructed airway',
      'sats_secondary_text': 'Not breathing',
      'sats_priority': 'Emergency' as const,
    },
    {
      'key': 'Seizure' as const,
      'clinical_finding_s_expression':
        `(finding ${CLINICAL_FINDING.s_expression} ${
          sExpressionById('91175000')
        } (qualifier ${sExpressionById('15240007')}))`,
      'sats_primary_name': 'Seizure',
      'sats_secondary_text': 'Current',
      'sats_priority': 'Emergency' as const,
    },
    {
      'key': 'Burn Facial' as const,
      'clinical_finding_s_expression':
        `(finding ${CLINICAL_FINDING.s_expression} ${
          sExpressionById('262582004')
        })`,
      'sats_primary_name': 'Burn',
      'sats_secondary_text': 'Facial',
      'sats_priority': 'Emergency' as const,
    },
    {
      'key': 'Burn Inhalation' as const,
      'clinical_finding_s_expression':
        `(finding ${CLINICAL_FINDING.s_expression} ${
          sExpressionById('425082000')
        })`,
      'sats_primary_name': 'Burn',
      'sats_secondary_text': 'Inhalation',
      'sats_priority': 'Emergency' as const,
    },
    {
      'key': 'Cardiac arrest' as const,
      'clinical_finding_s_expression':
        `(finding ${CLINICAL_FINDING.s_expression} ${
          sExpressionById('410429000')
        })`,
      'sats_primary_name': 'Cardiac arrest',
      'sats_secondary_text': null,
      'sats_priority': 'Emergency' as const,
    },
    // ${sExpressionById('400209005')} |Injury caused by causative force (disorder)|
    {
      'key': 'High energy transfer' as const,
      'clinical_finding_s_expression':
        `(finding ${CLINICAL_FINDING.s_expression} ${
          sExpressionById('400209005')
        })`,
      'sats_primary_name': 'High energy transfer',
      'sats_secondary_text': 'Severe mechanism of injury',
      'sats_priority': 'Very urgent' as const,
    },
    {
      'key': 'Focal neurology — acute' as const,
      'clinical_finding_s_expression':
        `(finding ${CLINICAL_FINDING.s_expression} ${
          sExpressionById('230690007')
        })`,
      'sats_primary_name': 'Focal neurology — acute',
      'sats_secondary_text': 'Stroke',
      'sats_priority': 'Very urgent' as const,
    },
    {
      'key': 'Burn Circumferential' as const,
      'clinical_finding_s_expression':
        `(finding ${CLINICAL_FINDING.s_expression} ${
          sExpressionById('125666000')
        } (qualifier ${sExpressionById('255593009')}))`,
      'sats_primary_name': 'Burn',
      'sats_secondary_text': 'Circumferential',
      'sats_priority': 'Very urgent' as const,
    },
    {
      'key': 'Shortness of breath - acute' as const,
      'clinical_finding_s_expression':
        `(finding ${CLINICAL_FINDING.s_expression} ${
          sExpressionById('267036007')
        } (qualifier ${sExpressionById('24484000')}))`,
      'sats_primary_name': 'Shortness of breath - acute',
      'sats_secondary_text': null,
      'sats_priority': 'Very urgent' as const,
    },
    {
      'key': 'Aggression' as const,
      'clinical_finding_s_expression':
        `(finding ${CLINICAL_FINDING.s_expression} ${
          sExpressionById('61372001')
        })`,
      'sats_primary_name': 'Aggression',
      'sats_secondary_text': null,
      'sats_priority': 'Very urgent' as const,
    },
    {
      'key': 'Burn Chemical' as const,
      'clinical_finding_s_expression':
        `(finding ${CLINICAL_FINDING.s_expression} ${
          sExpressionById('426284001')
        })`,
      'sats_primary_name': 'Burn',
      'sats_secondary_text': 'Chemical',
      'sats_priority': 'Very urgent' as const,
    },
    {
      'key': 'Threatened limb' as const,
      'clinical_finding_s_expression':
        `(finding ${CLINICAL_FINDING.s_expression} ${
          sExpressionById('21631000119105')
        })`,
      'sats_primary_name': 'Threatened limb',
      'sats_secondary_text': null,
      'sats_priority': 'Very urgent' as const,
    },
    {
      'key': 'Poisoning' as const,
      'clinical_finding_s_expression':
        `(finding ${CLINICAL_FINDING.s_expression} ${
          sExpressionById('75478009')
        })`,
      'excluding_s_expression': `(finding ${CLINICAL_FINDING.s_expression} ${
        sExpressionById('1149222004')
      })`,
      'sats_primary_name': 'Poisoning',
      'sats_secondary_text': null,
      'sats_priority': 'Very urgent' as const,
    },
    {
      'key': 'Overdose' as const,
      'clinical_finding_s_expression':
        `(finding ${CLINICAL_FINDING.s_expression} ${
          sExpressionById('1149222004')
        })`,
      'sats_primary_name': 'Overdose',
      'sats_secondary_text': null,
      'sats_priority': 'Very urgent' as const,
    },
    {
      'key': 'Coughing blood' as const,
      'clinical_finding_s_expression':
        `(finding ${CLINICAL_FINDING.s_expression} ${
          sExpressionById('66857006')
        })`,
      'sats_primary_name': 'Coughing blood',
      'sats_secondary_text': null,
      'sats_priority': 'Very urgent' as const,
    },
    {
      'key': 'Eye injury' as const,
      'clinical_finding_s_expression':
        `(finding ${CLINICAL_FINDING.s_expression} ${
          sExpressionById('231794000')
        })`,
      'sats_primary_name': 'Eye injury',
      'sats_secondary_text': null,
      'sats_priority': 'Very urgent' as const,
    },
    {
      'key': 'Chest pain' as const,
      'clinical_finding_s_expression':
        `(finding ${CLINICAL_FINDING.s_expression} ${
          sExpressionById('29857009')
        })`,
      'sats_primary_name': 'Chest pain',
      'sats_secondary_text': null,
      'sats_priority': 'Very urgent' as const,
    },
    {
      'key': 'Dislocation of larger joint' as const,
      'clinical_finding_s_expression':
        `(finding ${CLINICAL_FINDING.s_expression} ${
          sExpressionById('87642003')
        })`,
      'excluding_s_expression': `
      (or (finding ${sExpressionById('363698007')} ${
        sExpressionById('7569003')
      })
           (finding ${sExpressionById('363698007')} ${
        sExpressionById('29707007')
      }))
    `,
      'sats_primary_name': 'Dislocation of larger joint',
      'sats_secondary_text': 'not finger or toe',
      'sats_priority': 'Very urgent' as const,
    },
    {
      'key': 'Vomiting fresh blood' as const,
      'clinical_finding_s_expression':
        `(finding ${CLINICAL_FINDING.s_expression} ${
          sExpressionById('267051003')
        })`,
      'sats_primary_name': 'Vomiting fresh blood',
      'sats_secondary_text': null,
      'sats_priority': 'Very urgent' as const,
    },
    {
      'key': 'Stabbed neck' as const,
      'clinical_finding_s_expression':
        `(finding ${CLINICAL_FINDING.s_expression} ${
          sExpressionById('283457003')
        })`,
      'sats_primary_name': 'Stabbed neck',
      'sats_secondary_text': null,
      'sats_priority': 'Very urgent' as const,
    },
    {
      'key': 'Fractured - compound' as const,
      'clinical_finding_s_expression':
        `(finding ${CLINICAL_FINDING.s_expression} ${
          sExpressionById('52329006')
        })`,
      'sats_primary_name': 'Fractured - compound',
      'sats_secondary_text': 'with a break in skin',
      'sats_priority': 'Very urgent' as const,
    },
    {
      'key': 'Pregnancy and abdominal trauma' as const,
      'clinical_finding_s_expression':
        `(finding ${CLINICAL_FINDING.s_expression} ${
          sExpressionById('417746004')
        })`,
      'sats_primary_name': 'Pregnancy and abdominal trauma',
      'sats_secondary_text': null,
      'sats_priority': 'Very urgent' as const,
      'prompt_when_s_expression': `(active_condition ${
        sExpressionById('77386006')
      })`,
    },
    {
      'key': 'Pregnancy and abdominal pain' as const,
      'clinical_finding_s_expression':
        `(finding ${CLINICAL_FINDING.s_expression} ${
          sExpressionById('21522001')
        })`,
      'sats_primary_name': 'Pregnancy and abdominal pain',
      'sats_secondary_text': null,
      'sats_priority': 'Very urgent' as const,
      'prompt_when_s_expression': `(active_condition ${
        sExpressionById('77386006')
      })`,
    },
    {
      'key': 'Hemorrhage Uncontrolled' as const,
      'clinical_finding_s_expression':
        `(finding ${CLINICAL_FINDING.s_expression} ${
          sExpressionById('131148009')
        } (qualifier ${sExpressionById('19032002')}))`,
      'sats_primary_name': 'Hemorrhage Uncontrolled',
      'sats_secondary_text': 'arterial bleed',
      'sats_priority': 'Very urgent' as const,
    },
    // Burn over ${sExpressionById('20')}% will be handled with a special burn chart
    // {
    //   'clinical_finding_s_expression': `(finding ${CLINICAL_FINDING.s_expression} ${sExpressionById('212049006')})`,
    //   'qualifer_relationship_snomed_concept_id': '${sExpressionById('276140008')}',
    //   'qualifer_value_snomed_concept_id': null,
    //   'qualifer_value_concrete': '${sExpressionById('20')}',
    //   'sats_primary_name': 'Burn over ${sExpressionById('20')}%',
    //   'sats_secondary_text': null,
    //   'sats_priority': 'Very urgent' as const,
    // },
    {
      'key': 'Seizure - post ictal' as const,
      'clinical_finding_s_expression':
        `(finding ${CLINICAL_FINDING.s_expression} ${
          sExpressionById('31758001')
        })`,
      'sats_primary_name': 'Seizure - post ictal',
      'sats_secondary_text': null,
      'sats_priority': 'Very urgent' as const,
    },
    {
      'key': 'Severe pain' as const,
      'clinical_finding_s_expression':
        `(finding ${CLINICAL_FINDING.s_expression} ${
          sExpressionById('76948002')
        })`,
      'sats_primary_name': 'Severe pain',
      'sats_secondary_text': null,
      'sats_priority': 'Very urgent' as const,
    },
    {
      'key': 'Burn Moderate severity' as const,
      'clinical_finding_s_expression':
        `(finding ${CLINICAL_FINDING.s_expression} ${
          sExpressionById('284549007')
        } (qualifier ${sExpressionById('6736007')}))`,
      'sats_primary_name': 'Burn',
      'sats_secondary_text': 'Moderate severity',
      'sats_priority': 'Very urgent' as const,
    },
    {
      'key': 'Haemorrhage Controlled' as const,
      'clinical_finding_s_expression':
        `(finding ${CLINICAL_FINDING.s_expression} ${
          sExpressionById('131148009')
        } (qualifier ${sExpressionById('31509003')}))`,
      'sats_primary_name': 'Haemorrhage',
      'sats_secondary_text': 'Controlled',
      'sats_priority': 'Urgent' as const,
    },
    {
      'key': 'Dislocation of finger' as const,
      'clinical_finding_s_expression':
        `(finding ${CLINICAL_FINDING.s_expression} ${
          sExpressionById('827108008')
        })`,
      'sats_primary_name': 'Dislocation of finger',
      'sats_secondary_text': null,
      'sats_priority': 'Urgent' as const,
    },
    {
      'key': 'Dislocation of toe joint' as const,
      'clinical_finding_s_expression':
        `(finding ${CLINICAL_FINDING.s_expression} ${
          sExpressionById('263030002')
        })`,
      'sats_primary_name': 'Dislocation of toe joint',
      'sats_secondary_text': null,
      'sats_priority': 'Urgent' as const,
    },
    {
      'key': 'Fracture' as const,
      'clinical_finding_s_expression':
        `(finding ${CLINICAL_FINDING.s_expression} ${
          sExpressionById('423125000')
        })`,
      'sats_primary_name': 'Fracture',
      'sats_secondary_text': 'Closed (no break in the skin)',
      'sats_priority': 'Urgent' as const,
    },
    {
      'key': 'Burn Other' as const,
      'clinical_finding_s_expression': `
      (finding ${CLINICAL_FINDING.s_expression} ${sExpressionById('125666000')})
    `,
      'excluding_s_expression': `
      (or
        (finding ${CLINICAL_FINDING.s_expression} ${
        sExpressionById('125666000')
      } (qualifier ${sExpressionById('255593009')}))
        (finding ${CLINICAL_FINDING.s_expression} ${
        sExpressionById('425082000')
      })
        (finding ${CLINICAL_FINDING.s_expression} ${
        sExpressionById('426284001')
      })
        (finding ${CLINICAL_FINDING.s_expression} ${
        sExpressionById('262582004')
      }))
    `,
      'sats_primary_name': 'Burn',
      'sats_secondary_text': 'Other',
      'sats_priority': 'Urgent' as const,
    },
    {
      'key': 'Abdominal pain' as const,
      'clinical_finding_s_expression':
        `(finding ${CLINICAL_FINDING.s_expression} ${
          sExpressionById('21522001')
        })`,
      'sats_primary_name': 'Abdominal pain',
      'sats_secondary_text': null,
      'sats_priority': 'Urgent' as const,
      'prompt_when_s_expression': `(not (active_condition ${
        sExpressionById('77386006')
      }))`,
    },
    {
      'key': 'Persistent vomiting' as const,
      'clinical_finding_s_expression':
        `(finding ${CLINICAL_FINDING.s_expression} ${
          sExpressionById('196746003')
        })`,
      'sats_primary_name': 'Persistent vomiting',
      'sats_secondary_text': null,
      'sats_priority': 'Urgent' as const,
    },
    {
      'key': 'Moderate pain' as const,
      'clinical_finding_s_expression':
        `(finding ${CLINICAL_FINDING.s_expression} (snomed_concept "Moderate pain" "finding"))`,
      'sats_primary_name': 'Moderate pain',
      'sats_secondary_text': null,
      'sats_priority': 'Urgent' as const,
    },
  ].map(({ clinical_finding_s_expression, ...sign }) => ({
    ...sign,
    clinical_finding_s_expression: normalForm(clinical_finding_s_expression),
  })),
  (sign) => ORDERED_PRIORITIES.indexOf(sign.sats_priority),
)

export const WARNING_SIGNS = keyBy(KEYED_WARNING_SIGNS, 'key')

export function findingQueryExpression(
  { excluding_s_expression, clinical_finding_s_expression }: WarningSign,
): string {
  if (!excluding_s_expression) return clinical_finding_s_expression
  return `(and ${clinical_finding_s_expression}
            (not ${excluding_s_expression}))`
}
