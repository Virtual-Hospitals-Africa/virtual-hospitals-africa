import { WarningSignKey } from './warning_signs.ts'
import { FindingRelatedModifiers } from '../types.ts'

export default {
  'Obstructed airway': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Associated morphology',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Obstruction',
          'category': 'morphologic abnormality',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Finding site',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Respiratory tract structure',
          'category': 'body structure',
        },
      },
    ],
    'relevant_qualifiers': [],
  },
  'Cardiac arrest': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Finding site',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Cardiac conducting system structure',
          'category': 'body structure',
        },
      },
    ],
    'relevant_qualifiers': [],
  },
  'Seizure': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Finding site',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Brain structure',
          'category': 'body structure',
        },
      },
    ],
    'relevant_qualifiers': [],
  },
  'Burn Facial': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Associated morphology',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Burn injury',
          'category': 'morphologic abnormality',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Due to',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Traumatic event',
          'category': 'event',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Finding site',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Face structure',
          'category': 'body structure',
        },
      },
    ],
    'relevant_qualifiers': [
      {
        'atom': 'qualifier',
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Circumferential',
          'category': 'qualifier value',
        },
        'qualifiers': [],
      },
      {
        'atom': 'qualifier',
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Recent',
          'category': 'qualifier value',
        },
        'qualifiers': [],
      },
    ],
  },
  'Burn Inhalation': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Associated morphology',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Burn injury',
          'category': 'morphologic abnormality',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Due to',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Inhalation of substance',
          'category': 'event',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Finding site',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Respiratory tract structure',
          'category': 'body structure',
        },
      },
    ],
    'relevant_qualifiers': [],
  },
  'Acute shortness of breath': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Finding site',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Structure of respiratory system',
          'category': 'body structure',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Interprets',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Ease of respiration',
          'category': 'observable entity',
        },
      },
    ],
    'relevant_qualifiers': [
      {
        'atom': 'qualifier',
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Sudden',
          'category': 'qualifier value',
        },
        'qualifiers': [],
      },
    ],
  },
  'Chest pain': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Finding site',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Thoracic structure',
          'category': 'body structure',
        },
      },
    ],
    'relevant_qualifiers': [
      {
        'atom': 'qualifier',
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'At rest',
          'category': 'qualifier value',
        },
        'qualifiers': [],
      },
      {
        'atom': 'qualifier',
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Unilateral',
          'category': 'qualifier value',
        },
        'qualifiers': [],
      },
    ],
  },
  'Seizure - post ictal': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'After',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Seizure',
          'category': 'finding',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Finding site',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Structure of nervous system',
          'category': 'body structure',
        },
      },
    ],
    'relevant_qualifiers': [],
  },
  'Focal neurology': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Associated morphology',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Damage',
          'category': 'morphologic abnormality',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Finding site',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Cerebrovascular system structure',
          'category': 'body structure',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Finding site',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Brain structure',
          'category': 'body structure',
        },
      },
    ],
    'relevant_qualifiers': [],
  },
  'Burn Chemical': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Associated morphology',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Chemical burn',
          'category': 'morphologic abnormality',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Due to',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Burning caused by caustic and corrosive substance',
          'category': 'event',
        },
      },
    ],
    'relevant_qualifiers': [
      {
        'atom': 'qualifier',
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Circumferential',
          'category': 'qualifier value',
        },
        'qualifiers': [],
      },
      {
        'atom': 'qualifier',
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Recent',
          'category': 'qualifier value',
        },
        'qualifiers': [],
      },
    ],
  },
  'Poisoning': {
    'predefined_attributes': [],
    'relevant_qualifiers': [],
  },
  'Aggression': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Interprets',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Behavior observable',
          'category': 'observable entity',
        },
      },
    ],
    'relevant_qualifiers': [],
  },
  'Dislocation of larger joint': {
    'predefined_attributes': [],
    'relevant_qualifiers': [],
  },
  'Severe limb ischemia': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Finding site',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Structure of artery of limb',
          'category': 'body structure',
        },
      },
    ],
    'relevant_qualifiers': [
      {
        'atom': 'qualifier',
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Known present',
          'category': 'qualifier value',
        },
        'qualifiers': [],
      },
    ],
  },
  'Burn Circumferential': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Associated morphology',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Burn injury',
          'category': 'morphologic abnormality',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Due to',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Traumatic event',
          'category': 'event',
        },
      },
    ],
    'relevant_qualifiers': [
      {
        'atom': 'qualifier',
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Circumferential',
          'category': 'qualifier value',
        },
        'qualifiers': [],
      },
      {
        'atom': 'qualifier',
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Recent',
          'category': 'qualifier value',
        },
        'qualifiers': [],
      },
    ],
  },
  'Vomiting fresh blood': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Associated morphology',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Hemorrhage',
          'category': 'morphologic abnormality',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Finding site',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Upper gastrointestinal tract structure',
          'category': 'body structure',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Interprets',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Digestive system function',
          'category': 'observable entity',
        },
      },
    ],
    'relevant_qualifiers': [
      {
        'atom': 'qualifier',
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Excessive',
          'category': 'qualifier value',
        },
        'qualifiers': [],
      },
      {
        'atom': 'qualifier',
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Pulsatile',
          'category': 'qualifier value',
        },
        'qualifiers': [],
      },
    ],
  },
  'Coughing blood': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Associated morphology',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Hemorrhage',
          'category': 'morphologic abnormality',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Finding site',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Respiratory tract structure',
          'category': 'body structure',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Interprets',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Respiratory function',
          'category': 'observable entity',
        },
      },
    ],
    'relevant_qualifiers': [
      {
        'atom': 'qualifier',
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Excessive',
          'category': 'qualifier value',
        },
        'qualifiers': [],
      },
      {
        'atom': 'qualifier',
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Pulsatile',
          'category': 'qualifier value',
        },
        'qualifiers': [],
      },
    ],
  },
  'Stabbed neck': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Associated morphology',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Stab wound',
          'category': 'morphologic abnormality',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Due to',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Traumatic event',
          'category': 'event',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Finding site',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Neck structure',
          'category': 'body structure',
        },
      },
    ],
    'relevant_qualifiers': [
      {
        'atom': 'qualifier',
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Recent',
          'category': 'qualifier value',
        },
        'qualifiers': [],
      },
    ],
  },
  'Eye injury': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Finding site',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Structure of eye proper',
          'category': 'body structure',
        },
      },
    ],
    'relevant_qualifiers': [],
  },
  'Burn Over 20%': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Associated morphology',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Burn injury',
          'category': 'morphologic abnormality',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Due to',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Traumatic event',
          'category': 'event',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Finding site',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Percent of body surface',
          'category': 'body structure',
        },
      },
    ],
    'relevant_qualifiers': [
      {
        'atom': 'qualifier',
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Circumferential',
          'category': 'qualifier value',
        },
        'qualifiers': [],
      },
      {
        'atom': 'qualifier',
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Recent',
          'category': 'qualifier value',
        },
        'qualifiers': [],
      },
    ],
  },
  'High energy transfer': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Causative agent',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Physical force',
          'category': 'physical force',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Due to',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Traumatic event',
          'category': 'event',
        },
      },
    ],
    'relevant_qualifiers': [
      {
        'atom': 'qualifier',
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Recent',
          'category': 'qualifier value',
        },
        'qualifiers': [],
      },
    ],
  },
  'Haemorrhage Uncontrolled': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Associated morphology',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Hemorrhage',
          'category': 'morphologic abnormality',
        },
      },
    ],
    'relevant_qualifiers': [
      {
        'atom': 'qualifier',
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Excessive',
          'category': 'qualifier value',
        },
        'qualifiers': [],
      },
      {
        'atom': 'qualifier',
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Pulsatile',
          'category': 'qualifier value',
        },
        'qualifiers': [],
      },
    ],
  },
  'Compound Fracture': {
    'predefined_attributes': [],
    'relevant_qualifiers': [],
  },
  'Burn Moderate severity': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Associated morphology',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Burn injury',
          'category': 'morphologic abnormality',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Due to',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Traumatic event',
          'category': 'event',
        },
      },
    ],
    'relevant_qualifiers': [
      {
        'atom': 'qualifier',
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Circumferential',
          'category': 'qualifier value',
        },
        'qualifiers': [],
      },
      {
        'atom': 'qualifier',
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Recent',
          'category': 'qualifier value',
        },
        'qualifiers': [],
      },
    ],
  },
  'Pregnancy and abdominal trauma': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Due to',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Traumatic event',
          'category': 'event',
        },
      },
    ],
    'relevant_qualifiers': [
      {
        'atom': 'qualifier',
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Recent',
          'category': 'qualifier value',
        },
        'qualifiers': [],
      },
    ],
  },
  'Pregnancy and abdominal pain': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Finding site',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Structure of abdominopelvic cavity and/or content of abdominopelvic cavity and/or anterior abdominal wall',
          'category': 'body structure',
        },
      },
    ],
    'relevant_qualifiers': [],
  },
  'Persistent vomiting': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Finding site',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Upper gastrointestinal tract structure',
          'category': 'body structure',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Interprets',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Digestive system function',
          'category': 'observable entity',
        },
      },
    ],
    'relevant_qualifiers': [],
  },
  'Dislocation of finger': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Associated morphology',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Dislocation',
          'category': 'morphologic abnormality',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Finding site',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Structure of joint of digit of hand',
          'category': 'body structure',
        },
      },
    ],
    'relevant_qualifiers': [],
  },
  'Dislocation of toe joint': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Associated morphology',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Dislocation',
          'category': 'morphologic abnormality',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Finding site',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Structure of joint of toe',
          'category': 'body structure',
        },
      },
    ],
    'relevant_qualifiers': [],
  },
  'Burn Other': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Associated morphology',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Burn injury',
          'category': 'morphologic abnormality',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Due to',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Traumatic event',
          'category': 'event',
        },
      },
    ],
    'relevant_qualifiers': [
      {
        'atom': 'qualifier',
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Circumferential',
          'category': 'qualifier value',
        },
        'qualifiers': [],
      },
      {
        'atom': 'qualifier',
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Recent',
          'category': 'qualifier value',
        },
        'qualifiers': [],
      },
    ],
  },
  'Haemorrhage Controlled': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Associated morphology',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Hemorrhage',
          'category': 'morphologic abnormality',
        },
      },
    ],
    'relevant_qualifiers': [
      {
        'atom': 'qualifier',
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Excessive',
          'category': 'qualifier value',
        },
        'qualifiers': [],
      },
      {
        'atom': 'qualifier',
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Pulsatile',
          'category': 'qualifier value',
        },
        'qualifiers': [],
      },
    ],
  },
  'Closed fracture': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Associated morphology',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Fracture, closed',
          'category': 'morphologic abnormality',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Finding site',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Bone structure',
          'category': 'body structure',
        },
      },
    ],
    'relevant_qualifiers': [],
  },
  'Abdominal pain': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Finding site',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Structure of abdominopelvic cavity and/or content of abdominopelvic cavity and/or anterior abdominal wall',
          'category': 'body structure',
        },
      },
    ],
    'relevant_qualifiers': [],
  },
  'Not breathing or Reported apnoea': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Finding site',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Structure of respiratory system',
          'category': 'body structure',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Has interpretation',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Absent',
          'category': 'qualifier value',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Interprets',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Respiration observable',
          'category': 'observable entity',
        },
      },
    ],
    'relevant_qualifiers': [],
  },
  'Obstructed breathing': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Associated morphology',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Obstruction',
          'category': 'morphologic abnormality',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Finding site',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Respiratory tract structure',
          'category': 'body structure',
        },
      },
    ],
    'relevant_qualifiers': [],
  },
  'Central cyanosis (SPO2 less than 92%)': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Due to',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Blood oxygen concentration below reference range',
          'category': 'finding',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Finding site',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Structure of skin and/or mucous membrane',
          'category': 'body structure',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Has interpretation',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Blue color',
          'category': 'qualifier value',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Has interpretation',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Abnormal',
          'category': 'qualifier value',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Interprets',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Color of skin or mucosa',
          'category': 'observable entity',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Interprets',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Color of skin or mucosa',
          'category': 'observable entity',
        },
      },
    ],
    'relevant_qualifiers': [],
  },
  'Respiratory distress (Severe)': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Clinical course',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Sudden onset AND/OR short duration',
          'category': 'qualifier value',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Finding site',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Structure of respiratory system',
          'category': 'body structure',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Interprets',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Ease of respiration',
          'category': 'observable entity',
        },
      },
    ],
    'relevant_qualifiers': [],
  },
  'Cold Hands': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Finding site',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Hand structure',
          'category': 'body structure',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Interprets',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Body temperature',
          'category': 'observable entity',
        },
      },
    ],
    'relevant_qualifiers': [],
  },
  'Pulse weak & fast': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Finding site',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Structure of cardiovascular system',
          'category': 'body structure',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Has interpretation',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Weak',
          'category': 'qualifier value',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Interprets',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Pulse volume',
          'category': 'observable entity',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Interprets',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Pulse, function',
          'category': 'observable entity',
        },
      },
    ],
    'relevant_qualifiers': [],
  },
  'Capillary refill time (3 sec or more)': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Finding site',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Structure of capillary blood vessel',
          'category': 'body structure',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Finding site',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Peripheral blood vessel structure',
          'category': 'body structure',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Has interpretation',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Abnormal',
          'category': 'qualifier value',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Interprets',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Capillary filling, function',
          'category': 'observable entity',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Interprets',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Peripheral blood flow',
          'category': 'observable entity',
        },
      },
    ],
    'relevant_qualifiers': [],
  },
  'Lethargic': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Interprets',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Energy observable',
          'category': 'observable entity',
        },
      },
    ],
    'relevant_qualifiers': [],
  },
  'Uncontrolled bleeding (not nose bleed)': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Associated morphology',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Hemorrhage',
          'category': 'morphologic abnormality',
        },
      },
    ],
    'relevant_qualifiers': [
      {
        'atom': 'qualifier',
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Excessive',
          'category': 'qualifier value',
        },
        'qualifiers': [],
      },
      {
        'atom': 'qualifier',
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Pulsatile',
          'category': 'qualifier value',
        },
        'qualifiers': [],
      },
    ],
  },
  'Convulsing or Immediately Post-Ictal not alert': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Finding site',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Brain structure',
          'category': 'body structure',
        },
      },
    ],
    'relevant_qualifiers': [],
  },
  'AVPU: responds only To Pain (P)': {
    'predefined_attributes': [],
    'relevant_qualifiers': [],
  },
  'AVPU: Unresponsive (U)': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Interprets',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'State of consciousness and awareness',
          'category': 'observable entity',
        },
      },
    ],
    'relevant_qualifiers': [],
  },
  'Confusion': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Clinical course',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Sudden onset AND/OR short duration',
          'category': 'qualifier value',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Interprets',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Level of consciousness',
          'category': 'observable entity',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Interprets',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Mental alertness',
          'category': 'observable entity',
        },
      },
    ],
    'relevant_qualifiers': [],
  },
  'Diarrhoea or Vomiting': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Finding site',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Intestinal structure',
          'category': 'body structure',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Finding site',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Upper gastrointestinal tract structure',
          'category': 'body structure',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Has interpretation',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Altered',
          'category': 'qualifier value',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Interprets',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Bowel action',
          'category': 'observable entity',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Interprets',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Digestive system function',
          'category': 'observable entity',
        },
      },
    ],
    'relevant_qualifiers': [
      {
        'atom': 'qualifier',
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Watery',
          'category': 'qualifier value',
        },
        'qualifiers': [],
      },
    ],
  },
  'Lethargy/ floppy infant': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Finding site',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Skeletal muscle structure',
          'category': 'body structure',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Has interpretation',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Abnormally low',
          'category': 'qualifier value',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Interprets',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Muscle tone',
          'category': 'observable entity',
        },
      },
    ],
    'relevant_qualifiers': [],
  },
  'Very sunken eyes': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Finding site',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Structure of eye proper',
          'category': 'body structure',
        },
      },
    ],
    'relevant_qualifiers': [],
  },
  'Skin pinch very slow (2 secs or more)': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Finding site',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Skin structure',
          'category': 'body structure',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Has interpretation',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Decreased',
          'category': 'qualifier value',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Interprets',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Skin turgor',
          'category': 'observable entity',
        },
      },
    ],
    'relevant_qualifiers': [],
  },
  'Facial /Inhalation burn': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Associated morphology',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Burn injury',
          'category': 'morphologic abnormality',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Due to',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Traumatic event',
          'category': 'event',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Finding site',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Face structure',
          'category': 'body structure',
        },
      },
    ],
    'relevant_qualifiers': [
      {
        'atom': 'qualifier',
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Circumferential',
          'category': 'qualifier value',
        },
        'qualifiers': [],
      },
      {
        'atom': 'qualifier',
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Recent',
          'category': 'qualifier value',
        },
        'qualifiers': [],
      },
    ],
  },
  'Hypoglycaemia recorded at any time': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Finding site',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Structure of endocrine system',
          'category': 'body structure',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Has interpretation',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Below reference range',
          'category': 'qualifier value',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Interprets',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Blood glucose concentration',
          'category': 'observable entity',
        },
      },
    ],
    'relevant_qualifiers': [],
  },
  'Glucose less than 3mmol/L': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Has interpretation',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Below reference range',
          'category': 'qualifier value',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Interprets',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Glucose measurement, blood',
          'category': 'procedure',
        },
      },
    ],
    'relevant_qualifiers': [],
  },
  'Purpuric rash': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Associated morphology',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Purpura',
          'category': 'morphologic abnormality',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Associated morphology',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Eruption',
          'category': 'morphologic abnormality',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Finding site',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Skin structure',
          'category': 'body structure',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Finding site',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Skin structure',
          'category': 'body structure',
        },
      },
    ],
    'relevant_qualifiers': [
      {
        'atom': 'qualifier',
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Excessive',
          'category': 'qualifier value',
        },
        'qualifiers': [],
      },
      {
        'atom': 'qualifier',
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Pulsatile',
          'category': 'qualifier value',
        },
        'qualifiers': [],
      },
    ],
  },
  'Tiny baby (Younger than 2 months)': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Interprets',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Eating feeding / drinking observable',
          'category': 'observable entity',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Occurrence',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Neonatal',
          'category': 'qualifier value',
        },
      },
    ],
    'relevant_qualifiers': [],
  },
  'Inconsolable crying (Severe pain)': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Has interpretation',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Long duration',
          'category': 'qualifier value',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Interprets',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Crying',
          'category': 'observable entity',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Occurrence',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Infancy',
          'category': 'qualifier value',
        },
      },
    ],
    'relevant_qualifiers': [],
  },
  'Presenting complaint more sleepy than normal': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Has interpretation',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Decreased',
          'category': 'qualifier value',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Interprets',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Level of consciousness',
          'category': 'observable entity',
        },
      },
    ],
    'relevant_qualifiers': [],
  },
  'Poisoning or overdose': {
    'predefined_attributes': [],
    'relevant_qualifiers': [],
  },
  'Focal neurology acute': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Associated morphology',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Damage',
          'category': 'morphologic abnormality',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Finding site',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Cerebrovascular system structure',
          'category': 'body structure',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Finding site',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Brain structure',
          'category': 'body structure',
        },
      },
    ],
    'relevant_qualifiers': [],
  },
  'Severe mechanism of injury': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Causative agent',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Physical force',
          'category': 'physical force',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Due to',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Traumatic event',
          'category': 'event',
        },
      },
    ],
    'relevant_qualifiers': [
      {
        'atom': 'qualifier',
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Recent',
          'category': 'qualifier value',
        },
        'qualifiers': [],
      },
    ],
  },
  'Burn 10% or more (Circumferential, electrical, chemical)': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Associated morphology',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Burn injury',
          'category': 'morphologic abnormality',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Due to',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Traumatic event',
          'category': 'event',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Finding site',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Percent of body surface',
          'category': 'body structure',
        },
      },
    ],
    'relevant_qualifiers': [
      {
        'atom': 'qualifier',
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Circumferential',
          'category': 'qualifier value',
        },
        'qualifiers': [],
      },
      {
        'atom': 'qualifier',
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Recent',
          'category': 'qualifier value',
        },
        'qualifiers': [],
      },
    ],
  },
  'Eye Injury': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Finding site',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Structure of eye proper',
          'category': 'body structure',
        },
      },
    ],
    'relevant_qualifiers': [],
  },
  'Fracture (Open or threatened limb)': {
    'predefined_attributes': [],
    'relevant_qualifiers': [],
  },
  'Dislocation of larger joint (not finger or toe)': {
    'predefined_attributes': [],
    'relevant_qualifiers': [],
  },
  'Some respiratory distress': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Finding site',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Structure of respiratory system',
          'category': 'body structure',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Interprets',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Ease of respiration',
          'category': 'observable entity',
        },
      },
    ],
    'relevant_qualifiers': [],
  },
  'Some Dehydration (Diarrhoea or Diarrhoea and vomiting)': {
    'predefined_attributes': [],
    'relevant_qualifiers': [],
  },
  'Sunken eyes': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Finding site',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Structure of eye proper',
          'category': 'body structure',
        },
      },
    ],
    'relevant_qualifiers': [],
  },
  'Restless/ irritable': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Interprets',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Behavior observable',
          'category': 'observable entity',
        },
      },
    ],
    'relevant_qualifiers': [],
  },
  'Thirsty/decreased urine output': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Finding site',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Urinary system structure',
          'category': 'body structure',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Has interpretation',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Below reference range',
          'category': 'qualifier value',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Interprets',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Measure of urine output',
          'category': 'observable entity',
        },
      },
    ],
    'relevant_qualifiers': [],
  },
  'Dry mouth': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Finding site',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Salivary gland structure',
          'category': 'body structure',
        },
      },
    ],
    'relevant_qualifiers': [],
  },
  'Crying without tears': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Interprets',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Crying',
          'category': 'observable entity',
        },
      },
    ],
    'relevant_qualifiers': [],
  },
  'Skin pinch slow (Less than 2 sec)': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Finding site',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Skin structure',
          'category': 'body structure',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Has interpretation',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Decreased',
          'category': 'qualifier value',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Interprets',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Skin turgor',
          'category': 'observable entity',
        },
      },
    ],
    'relevant_qualifiers': [],
  },
  'Unable to drink /feed or vomit everything': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Has interpretation',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Unable',
          'category': 'qualifier value',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Interprets',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Ability to drink',
          'category': 'observable entity',
        },
      },
    ],
    'relevant_qualifiers': [],
  },
  'Malnutrition (Visible severe wasting)': {
    'predefined_attributes': [],
    'relevant_qualifiers': [],
  },
  'Malnutrition Oedema (pitting Oedema of both feet)': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Associated morphology',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Edema',
          'category': 'morphologic abnormality',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Associated morphology',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Edema',
          'category': 'morphologic abnormality',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Finding site',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Structure of left foot',
          'category': 'body structure',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Finding site',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Structure of right foot',
          'category': 'body structure',
        },
      },
    ],
    'relevant_qualifiers': [],
  },
  'Unwell child with known diabetes': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Finding site',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Structure of endocrine system',
          'category': 'body structure',
        },
      },
    ],
    'relevant_qualifiers': [],
  },
  'Any other burn less than 10%': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Associated morphology',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Burn injury',
          'category': 'morphologic abnormality',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Due to',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Traumatic event',
          'category': 'event',
        },
      },
    ],
    'relevant_qualifiers': [
      {
        'atom': 'qualifier',
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Circumferential',
          'category': 'qualifier value',
        },
        'qualifiers': [],
      },
      {
        'atom': 'qualifier',
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Recent',
          'category': 'qualifier value',
        },
        'qualifiers': [],
      },
    ],
  },
  'Dislocation of finger or toe': {
    'predefined_attributes': [
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Associated morphology',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Dislocation',
          'category': 'morphologic abnormality',
        },
      },
      {
        'atom': 'attribute',
        'root_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Attribute',
          'category': 'attribute',
        },
        'specific_snomed_concept': {
          'atom': 'snomed_concept',
          'name': 'Finding site',
          'category': 'attribute',
        },
        'value': {
          'atom': 'snomed_concept',
          'name': 'Finger joint structure',
          'category': 'body structure',
        },
      },
    ],
    'relevant_qualifiers': [],
  },
} as Record<WarningSignKey, FindingRelatedModifiers>
