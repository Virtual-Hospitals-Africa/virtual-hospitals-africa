import { CommonSymptom, FindingRelatedModifiers } from '../types.ts'
import { normalForm } from './s_expression.ts'
import common_symptoms_modifiers from './common_symptoms_modifiers.ts'
import { assert } from 'std/assert/assert.ts'

// TODO: make this age dependent
export const COMMON_SYMPTOMS_DEFS: Omit<CommonSymptom, keyof FindingRelatedModifiers>[] = [
  {
    'key': 'Nasal discharge' as const,
    'clinical_finding_s_expression': normalForm(`(clinical_finding (snomed_concept "Nasal discharge" "finding"))`),
    'name': 'Nasal discharge',
    'description': null,
    'category': 'Common Symptoms' as const,
  },
  {
    'key': 'Fever' as const,
    'clinical_finding_s_expression': normalForm(`(clinical_finding (snomed_concept "Fever" "finding"))`),
    'name': 'Fever',
    'description': null,
    'category': 'Common Symptoms' as const,
  },
  {
    'key': 'Cough' as const,
    'clinical_finding_s_expression': normalForm(`(clinical_finding (snomed_concept "Cough" "finding"))`),
    'name': 'Cough',
    'description': null,
    'category': 'Common Symptoms' as const,
  },
  {
    'key': 'Sore throat' as const,
    'clinical_finding_s_expression': normalForm(`(clinical_finding (snomed_concept "Sore throat" "finding"))`),
    'name': 'Sore throat',
    'description': null,
    'category': 'Common Symptoms' as const,
  },
  {
    'key': 'Headache' as const,
    'clinical_finding_s_expression': normalForm(`(clinical_finding (snomed_concept "Headache" "finding"))`),
    'name': 'Headache',
    'description': null,
    'category': 'Common Symptoms' as const,
  },
  {
    'key': 'Fatigue' as const,
    'clinical_finding_s_expression': normalForm(`(clinical_finding (snomed_concept "Fatigue" "finding"))`),
    'name': 'Fatigue',
    'description': null,
    'category': 'Common Symptoms' as const,
  },
  {
    'key': 'Dyspnea' as const,
    'clinical_finding_s_expression': normalForm(`(clinical_finding (snomed_concept "Dyspnea" "finding"))`),
    'name': 'Shortness of breath',
    'description': null,
    'category': 'Common Symptoms' as const,
  },
  {
    'key': 'Nausea' as const,
    'clinical_finding_s_expression': normalForm(`(clinical_finding (snomed_concept "Nausea" "finding"))`),
    'name': 'Nausea',
    'description': null,
    'category': 'Common Symptoms' as const,
  },
  {
    'key': 'Vomiting' as const,
    'clinical_finding_s_expression': normalForm(`(clinical_finding (snomed_concept "Finding of vomiting" "finding"))`),
    'name': 'Vomiting',
    'description': null,
    'category': 'Common Symptoms' as const,
  },
  {
    'key': 'Diarrhea' as const,
    'clinical_finding_s_expression': normalForm(`(clinical_finding (snomed_concept "Diarrhea" "finding"))`),
    'name': 'Diarrhea',
    'description': null,
    'category': 'Common Symptoms' as const,
  },
  {
    'key': 'Dizziness' as const,
    'clinical_finding_s_expression': normalForm(`(clinical_finding (snomed_concept "Dizziness" "finding"))`),
    'name': 'Dizziness',
    'description': null,
    'category': 'Common Symptoms' as const,
  },
  {
    'key': 'Muscle pain' as const,
    'clinical_finding_s_expression': normalForm(`(clinical_finding (snomed_concept "Muscle pain" "finding"))`),
    'name': 'Muscle pain',
    'description': null,
    'category': 'Common Symptoms' as const,
  },
  // {
  //   'key': 'Pain of joint' as const,
  //   'clinical_finding_s_expression': normalForm(`(clinical_finding (snomed_concept "Pain of joint" "finding"))`),
  //   'name': 'Pain of joint',
  //   'description': null,
  //   'category': 'Common Symptoms' as const,
  // },
  {
    'key': 'Insect bite' as const,
    'clinical_finding_s_expression': normalForm(`(clinical_finding (snomed_concept "Insect bite - wound" "disorder"))`),
    'name': 'Insect bite',
    'description': null,
    'category': 'Common Symptoms' as const,
  },
  {
    'key': 'Backache' as const,
    'clinical_finding_s_expression': normalForm(`(clinical_finding (snomed_concept "Backache" "finding"))`),
    'name': 'Back pain',
    'description': null,
    'category': 'Common Symptoms' as const,
  },
  {
    'key': 'Constipation' as const,
    'clinical_finding_s_expression': normalForm(`(clinical_finding (snomed_concept "Constipation" "finding"))`),
    'name': 'Constipation',
    'description': null,
    'category': 'Common Symptoms' as const,
  },
  // {
  //   'key': 'COVID-19' as const,
  //   'clinical_finding_s_expression': normalForm(
  //     `(clinical_finding (snomed_concept "Disease caused by severe acute respiratory syndrome coronavirus 2" "disorder"))`,
  //   ),
  //   'name': 'COVID-19',
  //   'description': null,
  //   'category': 'Common Symptoms' as const,
  // },
]

export const COMMON_SYMPTOMS = COMMON_SYMPTOMS_DEFS.map((symptom) => {
  const modifiers: FindingRelatedModifiers = common_symptoms_modifiers[symptom.key]
  assert(modifiers, 'No match found, run scripts/data-munging/common-symptoms-modifiers.ts')

  return {
    ...symptom,
    ...modifiers,
  }
})
