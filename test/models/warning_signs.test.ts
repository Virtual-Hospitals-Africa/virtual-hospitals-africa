import { assertEquals } from 'std/assert/assert_equals.ts'
import { afterAll, describe, it } from 'std/testing/bdd.ts'
import db from '../../db/db.ts'
import { WARNING_SIGNS } from '../../shared/warning_signs.ts'
import { parseFindingExpression } from '../../db/models/simple_record_language.ts'

describe('db/models/warning_signs.ts', () => {
  afterAll(() => db.destroy())

  describe('parsing signs', () => {
    it('works', () => {
      const warning_signs = WARNING_SIGNS.map((sign) => {
        const expression = parseFindingExpression(sign.finding_s_expression)
        return {
          ...sign,
          expression,
        }
      })
      assertEquals(warning_signs, [
        {
          'key': 'Obstructed airway',
          'finding_s_expression': '(finding 79688008)',
          'sats_primary_name': 'Obstructed airway',
          'sats_secondary_text': 'Not breathing',
          'sats_priority_snomed_concept_id': '25876001',
          'expression': {
            'type': 'finding',
            'snomed_concept_id': '79688008',
            'qualifiers': [],
          },
        },
        {
          'key': 'Seizure',
          'finding_s_expression': '(finding 91175000 (qualifier 15240007))',
          'sats_primary_name': 'Seizure',
          'sats_secondary_text': 'Current',
          'sats_priority_snomed_concept_id': '25876001',
          'expression': {
            'type': 'finding',
            'snomed_concept_id': '91175000',
            'qualifiers': [
              {
                'type': 'qualifier',
                'snomed_concept_id': '15240007',
                'qualifiers': [],
              },
            ],
          },
        },
        {
          'key': 'Burn Facial',
          'finding_s_expression': '(finding 262582004)',
          'sats_primary_name': 'Burn',
          'sats_secondary_text': 'Facial',
          'sats_priority_snomed_concept_id': '25876001',
          'expression': {
            'type': 'finding',
            'snomed_concept_id': '262582004',
            'qualifiers': [],
          },
        },
        {
          'key': 'Burn Inhalation',
          'finding_s_expression': '(finding 425082000)',
          'sats_primary_name': 'Burn',
          'sats_secondary_text': 'Inhalation',
          'sats_priority_snomed_concept_id': '25876001',
          'expression': {
            'type': 'finding',
            'snomed_concept_id': '425082000',
            'qualifiers': [],
          },
        },
        {
          'key': 'Cardiac arrest',
          'finding_s_expression': '(finding 410429000)',
          'sats_primary_name': 'Cardiac arrest',
          'sats_secondary_text': null,
          'sats_priority_snomed_concept_id': '25876001',
          'expression': {
            'type': 'finding',
            'snomed_concept_id': '410429000',
            'qualifiers': [],
          },
        },
        {
          'key': 'High energy transfer',
          'finding_s_expression': '(finding 400209005)',
          'sats_primary_name': 'High energy transfer',
          'sats_secondary_text': 'Severe mechanism of injury',
          'sats_priority_snomed_concept_id': '1356878002',
          'expression': {
            'type': 'finding',
            'snomed_concept_id': '400209005',
            'qualifiers': [],
          },
        },
        {
          'key': 'Focal neurology — acute',
          'finding_s_expression': '(finding 230690007)',
          'sats_primary_name': 'Focal neurology — acute',
          'sats_secondary_text': 'Stroke',
          'sats_priority_snomed_concept_id': '1356878002',
          'expression': {
            'type': 'finding',
            'snomed_concept_id': '230690007',
            'qualifiers': [],
          },
        },
        {
          'key': 'Fracture',
          'finding_s_expression': '(finding 706886007)',
          'sats_primary_name': 'Fracture',
          'sats_secondary_text': 'Closed (no break in the skin)',
          'sats_priority_snomed_concept_id': '1356878002',
          'expression': {
            'type': 'finding',
            'snomed_concept_id': '706886007',
            'qualifiers': [],
          },
        },
        {
          'key': 'Burn Circumferential',
          'finding_s_expression': '(finding 125666000 (qualifier 255593009))',
          'sats_primary_name': 'Burn',
          'sats_secondary_text': 'Circumferential',
          'sats_priority_snomed_concept_id': '1356878002',
          'expression': {
            'type': 'finding',
            'snomed_concept_id': '125666000',
            'qualifiers': [
              {
                'type': 'qualifier',
                'snomed_concept_id': '255593009',
                'qualifiers': [],
              },
            ],
          },
        },
        {
          'key': 'Shortness of breath - acute',
          'finding_s_expression': '(finding 267036007 (qualifier 24484000))',
          'sats_primary_name': 'Shortness of breath - acute',
          'sats_secondary_text': null,
          'sats_priority_snomed_concept_id': '1356878002',
          'expression': {
            'type': 'finding',
            'snomed_concept_id': '267036007',
            'qualifiers': [
              {
                'type': 'qualifier',
                'snomed_concept_id': '24484000',
                'qualifiers': [],
              },
            ],
          },
        },
        {
          'key': 'Aggression',
          'finding_s_expression': '(finding 61372001)',
          'sats_primary_name': 'Aggression',
          'sats_secondary_text': null,
          'sats_priority_snomed_concept_id': '1356878002',
          'expression': {
            'type': 'finding',
            'snomed_concept_id': '61372001',
            'qualifiers': [],
          },
        },
        {
          'key': 'Burn Chemical',
          'finding_s_expression': '(finding 426284001)',
          'sats_primary_name': 'Burn',
          'sats_secondary_text': 'Chemical',
          'sats_priority_snomed_concept_id': '1356878002',
          'expression': {
            'type': 'finding',
            'snomed_concept_id': '426284001',
            'qualifiers': [],
          },
        },
        {
          'key': 'Threatened limb',
          'finding_s_expression': '(finding 21631000119105)',
          'sats_primary_name': 'Threatened limb',
          'sats_secondary_text': null,
          'sats_priority_snomed_concept_id': '1356878002',
          'expression': {
            'type': 'finding',
            'snomed_concept_id': '21631000119105',
            'qualifiers': [],
          },
        },
        {
          'key': 'Poisoning',
          'finding_s_expression': '(finding 75478009)',
          'sats_primary_name': 'Poisoning',
          'sats_secondary_text': null,
          'sats_priority_snomed_concept_id': '1356878002',
          'expression': {
            'type': 'finding',
            'snomed_concept_id': '75478009',
            'qualifiers': [],
          },
        },
        {
          'key': 'Overdose',
          'finding_s_expression': '(finding 1149222004)',
          'sats_primary_name': 'Overdose',
          'sats_secondary_text': null,
          'sats_priority_snomed_concept_id': '1356878002',
          'expression': {
            'type': 'finding',
            'snomed_concept_id': '1149222004',
            'qualifiers': [],
          },
        },
        {
          'key': 'Coughing blood',
          'finding_s_expression': '(finding 66857006)',
          'sats_primary_name': 'Coughing blood',
          'sats_secondary_text': null,
          'sats_priority_snomed_concept_id': '1356878002',
          'expression': {
            'type': 'finding',
            'snomed_concept_id': '66857006',
            'qualifiers': [],
          },
        },
        {
          'key': 'Eye injury',
          'finding_s_expression': '(finding 231794000)',
          'sats_primary_name': 'Eye injury',
          'sats_secondary_text': null,
          'sats_priority_snomed_concept_id': '1356878002',
          'expression': {
            'type': 'finding',
            'snomed_concept_id': '231794000',
            'qualifiers': [],
          },
        },
        {
          'key': 'Chest pain',
          'finding_s_expression': '(finding 29857009)',
          'sats_primary_name': 'Chest pain',
          'sats_secondary_text': null,
          'sats_priority_snomed_concept_id': '1356878002',
          'expression': {
            'type': 'finding',
            'snomed_concept_id': '29857009',
            'qualifiers': [],
          },
        },
        {
          'key': 'Dislocation of larger joint',
          'finding_s_expression':
            '(finding 87642003 (not (qualifier 363698007 7569003)) (not (qualifier 363698007 29707007)))',
          'sats_primary_name': 'Dislocation of larger joint',
          'sats_secondary_text': 'not finger or toe',
          'sats_priority_snomed_concept_id': '1356878002',
          'expression': {
            'type': 'finding',
            'snomed_concept_id': '87642003',
            'qualifiers': [
              {
                'type': 'not',
                'qualifier': {
                  'type': 'qualifier',
                  'snomed_concept_id': '363698007',
                  'snomed_concept_id_value': '7569003',
                  'qualifiers': [],
                },
              },
              {
                'type': 'not',
                'qualifier': {
                  'type': 'qualifier',
                  'snomed_concept_id': '363698007',
                  'snomed_concept_id_value': '29707007',
                  'qualifiers': [],
                },
              },
            ],
          },
        },
        {
          'key': 'Vomiting fresh blood',
          'finding_s_expression': '(finding 267051003)',
          'sats_primary_name': 'Vomiting fresh blood',
          'sats_secondary_text': null,
          'sats_priority_snomed_concept_id': '1356878002',
          'expression': {
            'type': 'finding',
            'snomed_concept_id': '267051003',
            'qualifiers': [],
          },
        },
        {
          'key': 'Stabbed neck',
          'finding_s_expression': '(finding 283457003)',
          'sats_primary_name': 'Stabbed neck',
          'sats_secondary_text': null,
          'sats_priority_snomed_concept_id': '1356878002',
          'expression': {
            'type': 'finding',
            'snomed_concept_id': '283457003',
            'qualifiers': [],
          },
        },
        {
          'key': 'Fractured - compound',
          'finding_s_expression': '(finding 52329006)',
          'sats_primary_name': 'Fractured - compound',
          'sats_secondary_text': 'with a break in skin',
          'sats_priority_snomed_concept_id': '1356878002',
          'expression': {
            'type': 'finding',
            'snomed_concept_id': '52329006',
            'qualifiers': [],
          },
        },
        {
          'key': 'Pregnancy and abdominal trauma',
          'finding_s_expression':
            '(finding 417746004 (qualifier 363698007 818983003))',
          'sats_primary_name': 'Pregnancy and abdominal trauma',
          'sats_secondary_text': null,
          'sats_priority_snomed_concept_id': '1356878002',
          'prompt_when_s_expression': '(finding 77386006)',
          'expression': {
            'type': 'finding',
            'snomed_concept_id': '417746004',
            'qualifiers': [
              {
                'type': 'qualifier',
                'snomed_concept_id': '363698007',
                'snomed_concept_id_value': '818983003',
                'qualifiers': [],
              },
            ],
          },
        },
        {
          'key': 'Pregnancy and abdominal pain',
          'finding_s_expression': '(finding 21522001)',
          'sats_primary_name': 'Pregnancy and abdominal pain',
          'sats_secondary_text': null,
          'sats_priority_snomed_concept_id': '1356878002',
          'prompt_when_s_expression': '(finding 77386006)',
          'expression': {
            'type': 'finding',
            'snomed_concept_id': '21522001',
            'qualifiers': [],
          },
        },
        {
          'key': 'Hemorrhage Uncontrolled',
          'finding_s_expression': '(finding 131148009 (qualifier 19032002))',
          'sats_primary_name': 'Hemorrhage Uncontrolled',
          'sats_secondary_text': 'arterial bleed',
          'sats_priority_snomed_concept_id': '1356878002',
          'expression': {
            'type': 'finding',
            'snomed_concept_id': '131148009',
            'qualifiers': [
              {
                'type': 'qualifier',
                'snomed_concept_id': '19032002',
                'qualifiers': [],
              },
            ],
          },
        },
        {
          'key': 'Seizure - post ictal',
          'finding_s_expression': '(finding 31758001)',
          'sats_primary_name': 'Seizure - post ictal',
          'sats_secondary_text': null,
          'sats_priority_snomed_concept_id': '1356878002',
          'expression': {
            'type': 'finding',
            'snomed_concept_id': '31758001',
            'qualifiers': [],
          },
        },
        {
          'key': 'Severe pain',
          'finding_s_expression': '(finding 76948002)',
          'sats_primary_name': 'Severe pain',
          'sats_secondary_text': null,
          'sats_priority_snomed_concept_id': '1356878002',
          'expression': {
            'type': 'finding',
            'snomed_concept_id': '76948002',
            'qualifiers': [],
          },
        },
        {
          'key': 'Burn Moderate severity',
          'finding_s_expression': '(finding 284549007 (qualifier 6736007))',
          'sats_primary_name': 'Burn',
          'sats_secondary_text': 'Moderate severity',
          'sats_priority_snomed_concept_id': '1356878002',
          'expression': {
            'type': 'finding',
            'snomed_concept_id': '284549007',
            'qualifiers': [
              {
                'type': 'qualifier',
                'snomed_concept_id': '6736007',
                'qualifiers': [],
              },
            ],
          },
        },
        {
          'key': 'Haemorrhage Controlled',
          'finding_s_expression': '(finding 131148009 (qualifier 31509003))',
          'sats_primary_name': 'Haemorrhage',
          'sats_secondary_text': 'Controlled',
          'sats_priority_snomed_concept_id': '103391001',
          'expression': {
            'type': 'finding',
            'snomed_concept_id': '131148009',
            'qualifiers': [
              {
                'type': 'qualifier',
                'snomed_concept_id': '31509003',
                'qualifiers': [],
              },
            ],
          },
        },
        {
          'key': 'Dislocation of finge',
          'finding_s_expression': '(finding 827108008)',
          'sats_primary_name': 'Dislocation of finge',
          'sats_secondary_text': null,
          'sats_priority_snomed_concept_id': '103391001',
          'expression': {
            'type': 'finding',
            'snomed_concept_id': '827108008',
            'qualifiers': [],
          },
        },
        {
          'key': 'Dislocation of toe joint',
          'finding_s_expression': '(finding 263030002)',
          'sats_primary_name': 'Dislocation of toe joint',
          'sats_secondary_text': null,
          'sats_priority_snomed_concept_id': '103391001',
          'expression': {
            'type': 'finding',
            'snomed_concept_id': '263030002',
            'qualifiers': [],
          },
        },
        {
          'key': 'Fracture',
          'finding_s_expression': '(finding 423125000)',
          'sats_primary_name': 'Fracture',
          'sats_secondary_text': 'Closed (no break in the skin)',
          'sats_priority_snomed_concept_id': '103391001',
          'expression': {
            'type': 'finding',
            'snomed_concept_id': '423125000',
            'qualifiers': [],
          },
        },
        {
          'key': 'Burn Other',
          'finding_s_expression': '(finding 125666000)',
          'sats_primary_name': 'Burn',
          'sats_secondary_text': 'Other',
          'sats_priority_snomed_concept_id': '103391001',
          'expression': {
            'type': 'finding',
            'snomed_concept_id': '125666000',
            'qualifiers': [],
          },
        },
        {
          'key': 'Abdominal pain',
          'finding_s_expression': '(finding 21522001)',
          'sats_primary_name': 'Abdominal pain',
          'sats_secondary_text': null,
          'sats_priority_snomed_concept_id': '103391001',
          'prompt_when_s_expression': '(not (finding 77386006))',
          'expression': {
            'type': 'finding',
            'snomed_concept_id': '21522001',
            'qualifiers': [],
          },
        },
        {
          'key': 'Persistent vomiting',
          'finding_s_expression': '(finding 196746003)',
          'sats_primary_name': 'Persistent vomiting',
          'sats_secondary_text': null,
          'sats_priority_snomed_concept_id': '103391001',
          'expression': {
            'type': 'finding',
            'snomed_concept_id': '196746003',
            'qualifiers': [],
          },
        },
        {
          'key': 'Moderate pain',
          'finding_s_expression': '(finding 50415004)',
          'sats_primary_name': 'Moderate pain',
          'sats_secondary_text': null,
          'sats_priority_snomed_concept_id': '103391001',
          'expression': {
            'type': 'finding',
            'snomed_concept_id': '50415004',
            'qualifiers': [],
          },
        },
      ])
    })
  })
})
