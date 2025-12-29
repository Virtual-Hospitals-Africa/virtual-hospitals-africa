import { assertEquals } from 'std/assert/assert_equals.ts'
import { describe, it } from 'std/testing/bdd.ts'
import { KEYED_WARNING_SIGNS } from '../../shared/warning_signs.ts'
import { parseExpression } from '../../shared/s_expression.ts'

describe('shared/warning_signs.ts', () => {
  describe('parsing signs', () => {
    it('works', () => {
      const warning_signs = []
      for (
        const {
          clinical_finding_s_expression,
          prompt_when_s_expression,
          ...sign
        } of KEYED_WARNING_SIGNS
      ) {
        try {
          warning_signs.push({
            ...sign,
            clinical_finding: parseExpression(clinical_finding_s_expression),
            prompt_when: prompt_when_s_expression
              ? parseExpression(prompt_when_s_expression)
              : null,
          })
        } catch (err) {
          console.log(sign)
          throw err
        }
      }

      assertEquals(warning_signs, [
        {
          'key': 'Obstructed airway',
          'sats_primary_name': 'Obstructed airway',
          'sats_secondary_text': 'Not breathing',
          'sats_priority': 'Emergency',
          'clinical_finding': {
            'atom': 'finding',
            'snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '404684003',
            },
            'finding_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '79688008',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'not_findings': [],
          },
          'prompt_when': null,
        },
        {
          'key': 'Seizure',
          'sats_primary_name': 'Seizure',
          'sats_secondary_text': 'Current',
          'sats_priority': 'Emergency',
          'clinical_finding': {
            'atom': 'finding',
            'snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '404684003',
            },
            'finding_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '91175000',
            },
            'value_snomed_concept': null,
            'qualifiers': [
              {
                'atom': 'qualifier',
                'snomed_concept': {
                  'atom': 'snomed_concept',
                  'type': 'id',
                  'id': '15240007',
                },
                'value_snomed_concept': null,
                'qualifiers': [],
              },
            ],
            'attributes': [],
            'not_findings': [],
          },
          'prompt_when': null,
        },
        {
          'key': 'Burn Facial',
          'sats_primary_name': 'Burn',
          'sats_secondary_text': 'Facial',
          'sats_priority': 'Emergency',
          'clinical_finding': {
            'atom': 'finding',
            'snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '404684003',
            },
            'finding_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '262582004',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'not_findings': [],
          },
          'prompt_when': null,
        },
        {
          'key': 'Burn Inhalation',
          'sats_primary_name': 'Burn',
          'sats_secondary_text': 'Inhalation',
          'sats_priority': 'Emergency',
          'clinical_finding': {
            'atom': 'finding',
            'snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '404684003',
            },
            'finding_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '425082000',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'not_findings': [],
          },
          'prompt_when': null,
        },
        {
          'key': 'Cardiac arrest',
          'sats_primary_name': 'Cardiac arrest',
          'sats_secondary_text': null,
          'sats_priority': 'Emergency',
          'clinical_finding': {
            'atom': 'finding',
            'snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '404684003',
            },
            'finding_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '410429000',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'not_findings': [],
          },
          'prompt_when': null,
        },
        {
          'key': 'High energy transfer',
          'sats_primary_name': 'High energy transfer',
          'sats_secondary_text': 'Severe mechanism of injury',
          'sats_priority': 'Very urgent',
          'clinical_finding': {
            'atom': 'finding',
            'snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '404684003',
            },
            'finding_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '400209005',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'not_findings': [],
          },
          'prompt_when': null,
        },
        {
          'key': 'Focal neurology — acute',
          'sats_primary_name': 'Focal neurology — acute',
          'sats_secondary_text': 'Stroke',
          'sats_priority': 'Very urgent',
          'clinical_finding': {
            'atom': 'finding',
            'snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '404684003',
            },
            'finding_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '230690007',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'not_findings': [],
          },
          'prompt_when': null,
        },
        {
          'key': 'Burn Circumferential',
          'sats_primary_name': 'Burn',
          'sats_secondary_text': 'Circumferential',
          'sats_priority': 'Very urgent',
          'clinical_finding': {
            'atom': 'finding',
            'snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '404684003',
            },
            'finding_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '125666000',
            },
            'value_snomed_concept': null,
            'qualifiers': [
              {
                'atom': 'qualifier',
                'snomed_concept': {
                  'atom': 'snomed_concept',
                  'type': 'id',
                  'id': '255593009',
                },
                'value_snomed_concept': null,
                'qualifiers': [],
              },
            ],
            'attributes': [],
            'not_findings': [],
          },
          'prompt_when': null,
        },
        {
          'key': 'Shortness of breath - acute',
          'sats_primary_name': 'Shortness of breath - acute',
          'sats_secondary_text': null,
          'sats_priority': 'Very urgent',
          'clinical_finding': {
            'atom': 'finding',
            'snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '404684003',
            },
            'finding_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '267036007',
            },
            'value_snomed_concept': null,
            'qualifiers': [
              {
                'atom': 'qualifier',
                'snomed_concept': {
                  'atom': 'snomed_concept',
                  'type': 'id',
                  'id': '24484000',
                },
                'value_snomed_concept': null,
                'qualifiers': [],
              },
            ],
            'attributes': [],
            'not_findings': [],
          },
          'prompt_when': null,
        },
        {
          'key': 'Aggression',
          'sats_primary_name': 'Aggression',
          'sats_secondary_text': null,
          'sats_priority': 'Very urgent',
          'clinical_finding': {
            'atom': 'finding',
            'snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '404684003',
            },
            'finding_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '61372001',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'not_findings': [],
          },
          'prompt_when': null,
        },
        {
          'key': 'Burn Chemical',
          'sats_primary_name': 'Burn',
          'sats_secondary_text': 'Chemical',
          'sats_priority': 'Very urgent',
          'clinical_finding': {
            'atom': 'finding',
            'snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '404684003',
            },
            'finding_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '426284001',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'not_findings': [],
          },
          'prompt_when': null,
        },
        {
          'key': 'Threatened limb',
          'sats_primary_name': 'Threatened limb',
          'sats_secondary_text': null,
          'sats_priority': 'Very urgent',
          'clinical_finding': {
            'atom': 'finding',
            'snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '404684003',
            },
            'finding_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '21631000119105',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'not_findings': [],
          },
          'prompt_when': null,
        },
        {
          'key': 'Poisoning',
          'sats_primary_name': 'Poisoning',
          'sats_secondary_text': null,
          'sats_priority': 'Very urgent',
          'clinical_finding': {
            'atom': 'finding',
            'snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '404684003',
            },
            'finding_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '75478009',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'not_findings': [
              {
                'atom': 'not_finding',
                'finding_snomed_concept': {
                  'atom': 'snomed_concept',
                  'type': 'id',
                  'id': '1149222004',
                },
                'value_snomed_concept': null,
                'qualifiers': [],
              },
            ],
          },
          'prompt_when': null,
        },
        {
          'key': 'Overdose',
          'sats_primary_name': 'Overdose',
          'sats_secondary_text': null,
          'sats_priority': 'Very urgent',
          'clinical_finding': {
            'atom': 'finding',
            'snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '404684003',
            },
            'finding_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '1149222004',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'not_findings': [],
          },
          'prompt_when': null,
        },
        {
          'key': 'Coughing blood',
          'sats_primary_name': 'Coughing blood',
          'sats_secondary_text': null,
          'sats_priority': 'Very urgent',
          'clinical_finding': {
            'atom': 'finding',
            'snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '404684003',
            },
            'finding_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '66857006',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'not_findings': [],
          },
          'prompt_when': null,
        },
        {
          'key': 'Eye injury',
          'sats_primary_name': 'Eye injury',
          'sats_secondary_text': null,
          'sats_priority': 'Very urgent',
          'clinical_finding': {
            'atom': 'finding',
            'snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '404684003',
            },
            'finding_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '231794000',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'not_findings': [],
          },
          'prompt_when': null,
        },
        {
          'key': 'Chest pain',
          'sats_primary_name': 'Chest pain',
          'sats_secondary_text': null,
          'sats_priority': 'Very urgent',
          'clinical_finding': {
            'atom': 'finding',
            'snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '404684003',
            },
            'finding_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '29857009',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'not_findings': [],
          },
          'prompt_when': null,
        },
        {
          'key': 'Dislocation of larger joint',
          'sats_primary_name': 'Dislocation of larger joint',
          'sats_secondary_text': 'not finger or toe',
          'sats_priority': 'Very urgent',
          'clinical_finding': {
            'atom': 'finding',
            'snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '404684003',
            },
            'finding_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '87642003',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'not_findings': [
              {
                'atom': 'not_finding',
                'finding_snomed_concept': {
                  'atom': 'snomed_concept',
                  'type': 'id',
                  'id': '363698007',
                },
                'value_snomed_concept': {
                  'atom': 'snomed_concept',
                  'type': 'id',
                  'id': '7569003',
                },
                'qualifiers': [],
              },
              {
                'atom': 'not_finding',
                'finding_snomed_concept': {
                  'atom': 'snomed_concept',
                  'type': 'id',
                  'id': '363698007',
                },
                'value_snomed_concept': {
                  'atom': 'snomed_concept',
                  'type': 'id',
                  'id': '29707007',
                },
                'qualifiers': [],
              },
            ],
          },
          'prompt_when': null,
        },
        {
          'key': 'Vomiting fresh blood',
          'sats_primary_name': 'Vomiting fresh blood',
          'sats_secondary_text': null,
          'sats_priority': 'Very urgent',
          'clinical_finding': {
            'atom': 'finding',
            'snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '404684003',
            },
            'finding_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '267051003',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'not_findings': [],
          },
          'prompt_when': null,
        },
        {
          'key': 'Stabbed neck',
          'sats_primary_name': 'Stabbed neck',
          'sats_secondary_text': null,
          'sats_priority': 'Very urgent',
          'clinical_finding': {
            'atom': 'finding',
            'snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '404684003',
            },
            'finding_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '283457003',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'not_findings': [],
          },
          'prompt_when': null,
        },
        {
          'key': 'Fractured - compound',
          'sats_primary_name': 'Fractured - compound',
          'sats_secondary_text': 'with a break in skin',
          'sats_priority': 'Very urgent',
          'clinical_finding': {
            'atom': 'finding',
            'snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '404684003',
            },
            'finding_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '52329006',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'not_findings': [],
          },
          'prompt_when': null,
        },
        {
          'key': 'Pregnancy and abdominal trauma',
          'sats_primary_name': 'Pregnancy and abdominal trauma',
          'sats_secondary_text': null,
          'sats_priority': 'Very urgent',
          'clinical_finding': {
            'atom': 'finding',
            'snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '404684003',
            },
            'finding_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '417746004',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'not_findings': [],
          },
          'prompt_when': {
            'atom': 'active_condition',
            'snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '77386006',
            },
          },
        },
        {
          'key': 'Pregnancy and abdominal pain',
          'sats_primary_name': 'Pregnancy and abdominal pain',
          'sats_secondary_text': null,
          'sats_priority': 'Very urgent',
          'clinical_finding': {
            'atom': 'finding',
            'snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '404684003',
            },
            'finding_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '21522001',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'not_findings': [],
          },
          'prompt_when': {
            'atom': 'active_condition',
            'snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '77386006',
            },
          },
        },
        {
          'key': 'Hemorrhage Uncontrolled',
          'sats_primary_name': 'Hemorrhage Uncontrolled',
          'sats_secondary_text': 'arterial bleed',
          'sats_priority': 'Very urgent',
          'clinical_finding': {
            'atom': 'finding',
            'snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '404684003',
            },
            'finding_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '131148009',
            },
            'value_snomed_concept': null,
            'qualifiers': [
              {
                'atom': 'qualifier',
                'snomed_concept': {
                  'atom': 'snomed_concept',
                  'type': 'id',
                  'id': '19032002',
                },
                'value_snomed_concept': null,
                'qualifiers': [],
              },
            ],
            'attributes': [],
            'not_findings': [],
          },
          'prompt_when': null,
        },
        {
          'key': 'Seizure - post ictal',
          'sats_primary_name': 'Seizure - post ictal',
          'sats_secondary_text': null,
          'sats_priority': 'Very urgent',
          'clinical_finding': {
            'atom': 'finding',
            'snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '404684003',
            },
            'finding_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '31758001',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'not_findings': [],
          },
          'prompt_when': null,
        },
        {
          'key': 'Severe pain',
          'sats_primary_name': 'Severe pain',
          'sats_secondary_text': null,
          'sats_priority': 'Very urgent',
          'clinical_finding': {
            'atom': 'finding',
            'snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '404684003',
            },
            'finding_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '76948002',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'not_findings': [],
          },
          'prompt_when': null,
        },
        {
          'key': 'Burn Moderate severity',
          'sats_primary_name': 'Burn',
          'sats_secondary_text': 'Moderate severity',
          'sats_priority': 'Very urgent',
          'clinical_finding': {
            'atom': 'finding',
            'snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '404684003',
            },
            'finding_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '284549007',
            },
            'value_snomed_concept': null,
            'qualifiers': [
              {
                'atom': 'qualifier',
                'snomed_concept': {
                  'atom': 'snomed_concept',
                  'type': 'id',
                  'id': '6736007',
                },
                'value_snomed_concept': null,
                'qualifiers': [],
              },
            ],
            'attributes': [],
            'not_findings': [],
          },
          'prompt_when': null,
        },
        {
          'key': 'Haemorrhage Controlled',
          'sats_primary_name': 'Haemorrhage',
          'sats_secondary_text': 'Controlled',
          'sats_priority': 'Urgent',
          'clinical_finding': {
            'atom': 'finding',
            'snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '404684003',
            },
            'finding_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '131148009',
            },
            'value_snomed_concept': null,
            'qualifiers': [
              {
                'atom': 'qualifier',
                'snomed_concept': {
                  'atom': 'snomed_concept',
                  'type': 'id',
                  'id': '31509003',
                },
                'value_snomed_concept': null,
                'qualifiers': [],
              },
            ],
            'attributes': [],
            'not_findings': [],
          },
          'prompt_when': null,
        },
        {
          'key': 'Dislocation of finger',
          'sats_primary_name': 'Dislocation of finger',
          'sats_secondary_text': null,
          'sats_priority': 'Urgent',
          'clinical_finding': {
            'atom': 'finding',
            'snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '404684003',
            },
            'finding_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '827108008',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'not_findings': [],
          },
          'prompt_when': null,
        },
        {
          'key': 'Dislocation of toe joint',
          'sats_primary_name': 'Dislocation of toe joint',
          'sats_secondary_text': null,
          'sats_priority': 'Urgent',
          'clinical_finding': {
            'atom': 'finding',
            'snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '404684003',
            },
            'finding_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '263030002',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'not_findings': [],
          },
          'prompt_when': null,
        },
        {
          'key': 'Fracture',
          'sats_primary_name': 'Fracture',
          'sats_secondary_text': 'Closed (no break in the skin)',
          'sats_priority': 'Urgent',
          'clinical_finding': {
            'atom': 'finding',
            'snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '404684003',
            },
            'finding_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '423125000',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'not_findings': [],
          },
          'prompt_when': null,
        },
        {
          'key': 'Burn Other',
          'sats_primary_name': 'Burn',
          'sats_secondary_text': 'Other',
          'sats_priority': 'Urgent',
          'clinical_finding': {
            'atom': 'finding',
            'snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '404684003',
            },
            'finding_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '125666000',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'not_findings': [
              {
                'atom': 'not_finding',
                'finding_snomed_concept': {
                  'atom': 'snomed_concept',
                  'type': 'id',
                  'id': '125666000',
                },
                'value_snomed_concept': null,
                'qualifiers': [
                  {
                    'atom': 'qualifier',
                    'snomed_concept': {
                      'atom': 'snomed_concept',
                      'type': 'id',
                      'id': '255593009',
                    },
                    'value_snomed_concept': null,
                    'qualifiers': [],
                  },
                ],
              },
              {
                'atom': 'not_finding',
                'finding_snomed_concept': {
                  'atom': 'snomed_concept',
                  'type': 'id',
                  'id': '425082000',
                },
                'value_snomed_concept': null,
                'qualifiers': [],
              },
              {
                'atom': 'not_finding',
                'finding_snomed_concept': {
                  'atom': 'snomed_concept',
                  'type': 'id',
                  'id': '426284001',
                },
                'value_snomed_concept': null,
                'qualifiers': [],
              },
              {
                'atom': 'not_finding',
                'finding_snomed_concept': {
                  'atom': 'snomed_concept',
                  'type': 'id',
                  'id': '262582004',
                },
                'value_snomed_concept': null,
                'qualifiers': [],
              },
            ],
          },
          'prompt_when': null,
        },
        {
          'key': 'Abdominal pain',
          'sats_primary_name': 'Abdominal pain',
          'sats_secondary_text': null,
          'sats_priority': 'Urgent',
          'clinical_finding': {
            'atom': 'finding',
            'snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '404684003',
            },
            'finding_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '21522001',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'not_findings': [],
          },
          'prompt_when': {
            'atom': 'not',
            'expression': {
              'atom': 'active_condition',
              'snomed_concept': {
                'atom': 'snomed_concept',
                'type': 'id',
                'id': '77386006',
              },
            },
          },
        },
        {
          'key': 'Persistent vomiting',
          'sats_primary_name': 'Persistent vomiting',
          'sats_secondary_text': null,
          'sats_priority': 'Urgent',
          'clinical_finding': {
            'atom': 'finding',
            'snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '404684003',
            },
            'finding_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '196746003',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'not_findings': [],
          },
          'prompt_when': null,
        },
        {
          'key': 'Moderate pain',
          'sats_primary_name': 'Moderate pain',
          'sats_secondary_text': null,
          'sats_priority': 'Urgent',
          'clinical_finding': {
            'atom': 'finding',
            'snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'id',
              'id': '404684003',
            },
            'finding_snomed_concept': {
              'atom': 'snomed_concept',
              'category': "finding",
              'name': "Moderate pain",
              'type': "name_and_category",
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'not_findings': [],
          },
          'prompt_when': null,
        },
      ])
    })
  })
})
