import { assertEquals } from 'std/assert/assert_equals.ts'
import { describe, it } from 'std/testing/bdd.ts'
import { KEYED_WARNING_SIGNS } from '../../shared/warning_signs.ts'
import { parseExpression } from '../../shared/s_expression.ts'

describe('shared/warning_signs.ts', () => {
  describe('parsing signs', () => {
    it('works', () => {
      const warning_signs = KEYED_WARNING_SIGNS.map((
        { clinical_finding_s_expression, prompt_when_s_expression, ...sign },
      ) => ({
        ...sign,
        clinical_finding: parseExpression(clinical_finding_s_expression),
        prompt_when: prompt_when_s_expression
          ? parseExpression(prompt_when_s_expression)
          : null,
      }))

      assertEquals(warning_signs, [
  {
    "key": "Obstructed airway",
    "sats_primary_name": "Obstructed airway",
    "sats_secondary_text": "Not breathing",
    "sats_priority": "Emergency",
    "clinical_finding": {
      "atom": "finding",
      "snomed_concept_id": "404684003",
      "value_snomed_concept_id": null,
      "qualifiers": [
        {
          "atom": "qualifier",
          "snomed_concept_id": "79688008",
          "value_snomed_concept_id": null,
          "qualifiers": []
        }
      ]
    },
    "prompt_when": null
  },
  {
    "key": "Seizure",
    "sats_primary_name": "Seizure",
    "sats_secondary_text": "Current",
    "sats_priority": "Emergency",
    "clinical_finding": {
      "atom": "finding",
      "snomed_concept_id": "404684003",
      "value_snomed_concept_id": null,
      "qualifiers": [
        {
          "atom": "qualifier",
          "snomed_concept_id": "91175000",
          "value_snomed_concept_id": null,
          "qualifiers": [
            {
              "atom": "qualifier",
              "snomed_concept_id": "15240007",
              "value_snomed_concept_id": null,
              "qualifiers": []
            }
          ]
        }
      ]
    },
    "prompt_when": null
  },
  {
    "key": "Burn Facial",
    "sats_primary_name": "Burn",
    "sats_secondary_text": "Facial",
    "sats_priority": "Emergency",
    "clinical_finding": {
      "atom": "finding",
      "snomed_concept_id": "404684003",
      "value_snomed_concept_id": null,
      "qualifiers": [
        {
          "atom": "qualifier",
          "snomed_concept_id": "262582004",
          "value_snomed_concept_id": null,
          "qualifiers": []
        }
      ]
    },
    "prompt_when": null
  },
  {
    "key": "Burn Inhalation",
    "sats_primary_name": "Burn",
    "sats_secondary_text": "Inhalation",
    "sats_priority": "Emergency",
    "clinical_finding": {
      "atom": "finding",
      "snomed_concept_id": "404684003",
      "value_snomed_concept_id": null,
      "qualifiers": [
        {
          "atom": "qualifier",
          "snomed_concept_id": "425082000",
          "value_snomed_concept_id": null,
          "qualifiers": []
        }
      ]
    },
    "prompt_when": null
  },
  {
    "key": "Cardiac arrest",
    "sats_primary_name": "Cardiac arrest",
    "sats_secondary_text": null,
    "sats_priority": "Emergency",
    "clinical_finding": {
      "atom": "finding",
      "snomed_concept_id": "404684003",
      "value_snomed_concept_id": null,
      "qualifiers": [
        {
          "atom": "qualifier",
          "snomed_concept_id": "410429000",
          "value_snomed_concept_id": null,
          "qualifiers": []
        }
      ]
    },
    "prompt_when": null
  },
  {
    "key": "High energy transfer",
    "sats_primary_name": "High energy transfer",
    "sats_secondary_text": "Severe mechanism of injury",
    "sats_priority": "Very urgent",
    "clinical_finding": {
      "atom": "finding",
      "snomed_concept_id": "404684003",
      "value_snomed_concept_id": null,
      "qualifiers": [
        {
          "atom": "qualifier",
          "snomed_concept_id": "400209005",
          "value_snomed_concept_id": null,
          "qualifiers": []
        }
      ]
    },
    "prompt_when": null
  },
  {
    "key": "Focal neurology — acute",
    "sats_primary_name": "Focal neurology — acute",
    "sats_secondary_text": "Stroke",
    "sats_priority": "Very urgent",
    "clinical_finding": {
      "atom": "finding",
      "snomed_concept_id": "404684003",
      "value_snomed_concept_id": null,
      "qualifiers": [
        {
          "atom": "qualifier",
          "snomed_concept_id": "230690007",
          "value_snomed_concept_id": null,
          "qualifiers": []
        }
      ]
    },
    "prompt_when": null
  },
  {
    "key": "Burn Circumferential",
    "sats_primary_name": "Burn",
    "sats_secondary_text": "Circumferential",
    "sats_priority": "Very urgent",
    "clinical_finding": {
      "atom": "finding",
      "snomed_concept_id": "404684003",
      "value_snomed_concept_id": null,
      "qualifiers": [
        {
          "atom": "qualifier",
          "snomed_concept_id": "125666000",
          "value_snomed_concept_id": null,
          "qualifiers": [
            {
              "atom": "qualifier",
              "snomed_concept_id": "255593009",
              "value_snomed_concept_id": null,
              "qualifiers": []
            }
          ]
        }
      ]
    },
    "prompt_when": null
  },
  {
    "key": "Shortness of breath - acute",
    "sats_primary_name": "Shortness of breath - acute",
    "sats_secondary_text": null,
    "sats_priority": "Very urgent",
    "clinical_finding": {
      "atom": "finding",
      "snomed_concept_id": "404684003",
      "value_snomed_concept_id": null,
      "qualifiers": [
        {
          "atom": "qualifier",
          "snomed_concept_id": "267036007",
          "value_snomed_concept_id": null,
          "qualifiers": [
            {
              "atom": "qualifier",
              "snomed_concept_id": "24484000",
              "value_snomed_concept_id": null,
              "qualifiers": []
            }
          ]
        }
      ]
    },
    "prompt_when": null
  },
  {
    "key": "Aggression",
    "sats_primary_name": "Aggression",
    "sats_secondary_text": null,
    "sats_priority": "Very urgent",
    "clinical_finding": {
      "atom": "finding",
      "snomed_concept_id": "404684003",
      "value_snomed_concept_id": null,
      "qualifiers": [
        {
          "atom": "qualifier",
          "snomed_concept_id": "61372001",
          "value_snomed_concept_id": null,
          "qualifiers": []
        }
      ]
    },
    "prompt_when": null
  },
  {
    "key": "Burn Chemical",
    "sats_primary_name": "Burn",
    "sats_secondary_text": "Chemical",
    "sats_priority": "Very urgent",
    "clinical_finding": {
      "atom": "finding",
      "snomed_concept_id": "404684003",
      "value_snomed_concept_id": null,
      "qualifiers": [
        {
          "atom": "qualifier",
          "snomed_concept_id": "426284001",
          "value_snomed_concept_id": null,
          "qualifiers": []
        }
      ]
    },
    "prompt_when": null
  },
  {
    "key": "Threatened limb",
    "sats_primary_name": "Threatened limb",
    "sats_secondary_text": null,
    "sats_priority": "Very urgent",
    "clinical_finding": {
      "atom": "finding",
      "snomed_concept_id": "404684003",
      "value_snomed_concept_id": null,
      "qualifiers": [
        {
          "atom": "qualifier",
          "snomed_concept_id": "21631000119105",
          "value_snomed_concept_id": null,
          "qualifiers": []
        }
      ]
    },
    "prompt_when": null
  },
  {
    "key": "Poisoning",
    "sats_primary_name": "Poisoning",
    "sats_secondary_text": null,
    "sats_priority": "Very urgent",
    "clinical_finding": {
      "atom": "finding",
      "snomed_concept_id": "404684003",
      "value_snomed_concept_id": null,
      "qualifiers": [
        {
          "atom": "qualifier",
          "snomed_concept_id": "75478009",
          "value_snomed_concept_id": null,
          "qualifiers": []
        },
        {
          "atom": "not_qualifier",
          "snomed_concept_id": "1149222004",
          "value_snomed_concept_id": null
        }
      ]
    },
    "prompt_when": null
  },
  {
    "key": "Overdose",
    "sats_primary_name": "Overdose",
    "sats_secondary_text": null,
    "sats_priority": "Very urgent",
    "clinical_finding": {
      "atom": "finding",
      "snomed_concept_id": "404684003",
      "value_snomed_concept_id": null,
      "qualifiers": [
        {
          "atom": "qualifier",
          "snomed_concept_id": "1149222004",
          "value_snomed_concept_id": null,
          "qualifiers": []
        }
      ]
    },
    "prompt_when": null
  },
  {
    "key": "Coughing blood",
    "sats_primary_name": "Coughing blood",
    "sats_secondary_text": null,
    "sats_priority": "Very urgent",
    "clinical_finding": {
      "atom": "finding",
      "snomed_concept_id": "404684003",
      "value_snomed_concept_id": null,
      "qualifiers": [
        {
          "atom": "qualifier",
          "snomed_concept_id": "66857006",
          "value_snomed_concept_id": null,
          "qualifiers": []
        }
      ]
    },
    "prompt_when": null
  },
  {
    "key": "Eye injury",
    "sats_primary_name": "Eye injury",
    "sats_secondary_text": null,
    "sats_priority": "Very urgent",
    "clinical_finding": {
      "atom": "finding",
      "snomed_concept_id": "404684003",
      "value_snomed_concept_id": null,
      "qualifiers": [
        {
          "atom": "qualifier",
          "snomed_concept_id": "231794000",
          "value_snomed_concept_id": null,
          "qualifiers": []
        }
      ]
    },
    "prompt_when": null
  },
  {
    "key": "Chest pain",
    "sats_primary_name": "Chest pain",
    "sats_secondary_text": null,
    "sats_priority": "Very urgent",
    "clinical_finding": {
      "atom": "finding",
      "snomed_concept_id": "404684003",
      "value_snomed_concept_id": null,
      "qualifiers": [
        {
          "atom": "qualifier",
          "snomed_concept_id": "29857009",
          "value_snomed_concept_id": null,
          "qualifiers": []
        }
      ]
    },
    "prompt_when": null
  },
  {
    "key": "Dislocation of larger joint",
    "sats_primary_name": "Dislocation of larger joint",
    "sats_secondary_text": "not finger or toe",
    "sats_priority": "Very urgent",
    "clinical_finding": {
      "atom": "finding",
      "snomed_concept_id": "404684003",
      "value_snomed_concept_id": null,
      "qualifiers": [
        {
          "atom": "qualifier",
          "snomed_concept_id": "87642003",
          "value_snomed_concept_id": null,
          "qualifiers": []
        },
        {
          "atom": "not_qualifier",
          "snomed_concept_id": "363698007",
          "value_snomed_concept_id": "7569003"
        },
        {
          "atom": "not_qualifier",
          "snomed_concept_id": "363698007",
          "value_snomed_concept_id": "29707007"
        }
      ]
    },
    "prompt_when": null
  },
  {
    "key": "Vomiting fresh blood",
    "sats_primary_name": "Vomiting fresh blood",
    "sats_secondary_text": null,
    "sats_priority": "Very urgent",
    "clinical_finding": {
      "atom": "finding",
      "snomed_concept_id": "404684003",
      "value_snomed_concept_id": null,
      "qualifiers": [
        {
          "atom": "qualifier",
          "snomed_concept_id": "267051003",
          "value_snomed_concept_id": null,
          "qualifiers": []
        }
      ]
    },
    "prompt_when": null
  },
  {
    "key": "Stabbed neck",
    "sats_primary_name": "Stabbed neck",
    "sats_secondary_text": null,
    "sats_priority": "Very urgent",
    "clinical_finding": {
      "atom": "finding",
      "snomed_concept_id": "404684003",
      "value_snomed_concept_id": null,
      "qualifiers": [
        {
          "atom": "qualifier",
          "snomed_concept_id": "283457003",
          "value_snomed_concept_id": null,
          "qualifiers": []
        }
      ]
    },
    "prompt_when": null
  },
  {
    "key": "Fractured - compound",
    "sats_primary_name": "Fractured - compound",
    "sats_secondary_text": "with a break in skin",
    "sats_priority": "Very urgent",
    "clinical_finding": {
      "atom": "finding",
      "snomed_concept_id": "404684003",
      "value_snomed_concept_id": null,
      "qualifiers": [
        {
          "atom": "qualifier",
          "snomed_concept_id": "52329006",
          "value_snomed_concept_id": null,
          "qualifiers": []
        }
      ]
    },
    "prompt_when": null
  },
  {
    "key": "Pregnancy and abdominal trauma",
    "sats_primary_name": "Pregnancy and abdominal trauma",
    "sats_secondary_text": null,
    "sats_priority": "Very urgent",
    "clinical_finding": {
      "atom": "finding",
      "snomed_concept_id": "404684003",
      "value_snomed_concept_id": null,
      "qualifiers": [
        {
          "atom": "qualifier",
          "snomed_concept_id": "417746004",
          "value_snomed_concept_id": null,
          "qualifiers": []
        }
      ]
    },
    "prompt_when": {
      "atom": "active_condition",
      "snomed_concept_id": "77386006"
    }
  },
  {
    "key": "Pregnancy and abdominal pain",
    "sats_primary_name": "Pregnancy and abdominal pain",
    "sats_secondary_text": null,
    "sats_priority": "Very urgent",
    "clinical_finding": {
      "atom": "finding",
      "snomed_concept_id": "404684003",
      "value_snomed_concept_id": null,
      "qualifiers": [
        {
          "atom": "qualifier",
          "snomed_concept_id": "21522001",
          "value_snomed_concept_id": null,
          "qualifiers": []
        }
      ]
    },
    "prompt_when": {
      "atom": "active_condition",
      "snomed_concept_id": "77386006"
    }
  },
  {
    "key": "Hemorrhage Uncontrolled",
    "sats_primary_name": "Hemorrhage Uncontrolled",
    "sats_secondary_text": "arterial bleed",
    "sats_priority": "Very urgent",
    "clinical_finding": {
      "atom": "finding",
      "snomed_concept_id": "404684003",
      "value_snomed_concept_id": null,
      "qualifiers": [
        {
          "atom": "qualifier",
          "snomed_concept_id": "131148009",
          "value_snomed_concept_id": null,
          "qualifiers": [
            {
              "atom": "qualifier",
              "snomed_concept_id": "19032002",
              "value_snomed_concept_id": null,
              "qualifiers": []
            }
          ]
        }
      ]
    },
    "prompt_when": null
  },
  {
    "key": "Seizure - post ictal",
    "sats_primary_name": "Seizure - post ictal",
    "sats_secondary_text": null,
    "sats_priority": "Very urgent",
    "clinical_finding": {
      "atom": "finding",
      "snomed_concept_id": "404684003",
      "value_snomed_concept_id": null,
      "qualifiers": [
        {
          "atom": "qualifier",
          "snomed_concept_id": "31758001",
          "value_snomed_concept_id": null,
          "qualifiers": []
        }
      ]
    },
    "prompt_when": null
  },
  {
    "key": "Severe pain",
    "sats_primary_name": "Severe pain",
    "sats_secondary_text": null,
    "sats_priority": "Very urgent",
    "clinical_finding": {
      "atom": "finding",
      "snomed_concept_id": "404684003",
      "value_snomed_concept_id": null,
      "qualifiers": [
        {
          "atom": "qualifier",
          "snomed_concept_id": "76948002",
          "value_snomed_concept_id": null,
          "qualifiers": []
        }
      ]
    },
    "prompt_when": null
  },
  {
    "key": "Burn Moderate severity",
    "sats_primary_name": "Burn",
    "sats_secondary_text": "Moderate severity",
    "sats_priority": "Very urgent",
    "clinical_finding": {
      "atom": "finding",
      "snomed_concept_id": "404684003",
      "value_snomed_concept_id": null,
      "qualifiers": [
        {
          "atom": "qualifier",
          "snomed_concept_id": "284549007",
          "value_snomed_concept_id": null,
          "qualifiers": [
            {
              "atom": "qualifier",
              "snomed_concept_id": "6736007",
              "value_snomed_concept_id": null,
              "qualifiers": []
            }
          ]
        }
      ]
    },
    "prompt_when": null
  },
  {
    "key": "Haemorrhage Controlled",
    "sats_primary_name": "Haemorrhage",
    "sats_secondary_text": "Controlled",
    "sats_priority": "Urgent",
    "clinical_finding": {
      "atom": "finding",
      "snomed_concept_id": "404684003",
      "value_snomed_concept_id": null,
      "qualifiers": [
        {
          "atom": "qualifier",
          "snomed_concept_id": "131148009",
          "value_snomed_concept_id": null,
          "qualifiers": [
            {
              "atom": "qualifier",
              "snomed_concept_id": "31509003",
              "value_snomed_concept_id": null,
              "qualifiers": []
            }
          ]
        }
      ]
    },
    "prompt_when": null
  },
  {
    "key": "Dislocation of finger",
    "sats_primary_name": "Dislocation of finger",
    "sats_secondary_text": null,
    "sats_priority": "Urgent",
    "clinical_finding": {
      "atom": "finding",
      "snomed_concept_id": "404684003",
      "value_snomed_concept_id": null,
      "qualifiers": [
        {
          "atom": "qualifier",
          "snomed_concept_id": "827108008",
          "value_snomed_concept_id": null,
          "qualifiers": []
        }
      ]
    },
    "prompt_when": null
  },
  {
    "key": "Dislocation of toe joint",
    "sats_primary_name": "Dislocation of toe joint",
    "sats_secondary_text": null,
    "sats_priority": "Urgent",
    "clinical_finding": {
      "atom": "finding",
      "snomed_concept_id": "404684003",
      "value_snomed_concept_id": null,
      "qualifiers": [
        {
          "atom": "qualifier",
          "snomed_concept_id": "263030002",
          "value_snomed_concept_id": null,
          "qualifiers": []
        }
      ]
    },
    "prompt_when": null
  },
  {
    "key": "Fracture",
    "sats_primary_name": "Fracture",
    "sats_secondary_text": "Closed (no break in the skin)",
    "sats_priority": "Urgent",
    "clinical_finding": {
      "atom": "finding",
      "snomed_concept_id": "404684003",
      "value_snomed_concept_id": null,
      "qualifiers": [
        {
          "atom": "qualifier",
          "snomed_concept_id": "423125000",
          "value_snomed_concept_id": null,
          "qualifiers": []
        }
      ]
    },
    "prompt_when": null
  },
  {
    "key": "Burn Other",
    "sats_primary_name": "Burn",
    "sats_secondary_text": "Other",
    "sats_priority": "Urgent",
    "clinical_finding": {
      "atom": "finding",
      "snomed_concept_id": "404684003",
      "value_snomed_concept_id": null,
      "qualifiers": [
        {
          "atom": "qualifier",
          "snomed_concept_id": "125666000",
          "value_snomed_concept_id": null,
          "qualifiers": [
            {
              "atom": "not_qualifier",
              "snomed_concept_id": "255593009",
              "value_snomed_concept_id": null
            }
          ]
        },
        {
          "atom": "not_qualifier",
          "snomed_concept_id": "425082000",
          "value_snomed_concept_id": null
        },
        {
          "atom": "not_qualifier",
          "snomed_concept_id": "426284001",
          "value_snomed_concept_id": null
        },
        {
          "atom": "not_qualifier",
          "snomed_concept_id": "262582004",
          "value_snomed_concept_id": null
        }
      ]
    },
    "prompt_when": null
  },
  {
    "key": "Abdominal pain",
    "sats_primary_name": "Abdominal pain",
    "sats_secondary_text": null,
    "sats_priority": "Urgent",
    "clinical_finding": {
      "atom": "finding",
      "snomed_concept_id": "404684003",
      "value_snomed_concept_id": null,
      "qualifiers": [
        {
          "atom": "qualifier",
          "snomed_concept_id": "21522001",
          "value_snomed_concept_id": null,
          "qualifiers": []
        }
      ]
    },
    "prompt_when": {
      "atom": "not",
      "expression": {
        "atom": "active_condition",
        "snomed_concept_id": "77386006"
      }
    }
  },
  {
    "key": "Persistent vomiting",
    "sats_primary_name": "Persistent vomiting",
    "sats_secondary_text": null,
    "sats_priority": "Urgent",
    "clinical_finding": {
      "atom": "finding",
      "snomed_concept_id": "404684003",
      "value_snomed_concept_id": null,
      "qualifiers": [
        {
          "atom": "qualifier",
          "snomed_concept_id": "196746003",
          "value_snomed_concept_id": null,
          "qualifiers": []
        }
      ]
    },
    "prompt_when": null
  },
  {
    "key": "Moderate pain",
    "sats_primary_name": "Moderate pain",
    "sats_secondary_text": null,
    "sats_priority": "Urgent",
    "clinical_finding": {
      "atom": "finding",
      "snomed_concept_id": "404684003",
      "value_snomed_concept_id": null,
      "qualifiers": [
        {
          "atom": "qualifier",
          "snomed_concept_id": "50415004",
          "value_snomed_concept_id": null,
          "qualifiers": []
        }
      ]
    },
    "prompt_when": null
  }
])
    })
  })
})
