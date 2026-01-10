import { SnomedCategory } from '../db.d.ts'

type Def = {
  id: string
  name: string
  category: SnomedCategory
}

export function asConceptSExpression(def: Def) {
  return `(snomed_concept "${def.name}" "${def.category}")`
}

export function asConcept(def: Def): Def & { s_expression: string } {
  return {
    ...def,
    s_expression: asConceptSExpression(def),
  }
}

export const YES_QUALIFIER = asConcept({
  id: '373066001',
  name: 'Yes',
  category: 'qualifier value' as const,
})
export const NO_QUALIFIER = asConcept({
  id: '373067005',
  name: 'No',
  category: 'qualifier value' as const,
})
export const UNKNOWN_QUALIFIER = asConcept({
  id: '261665006',
  name: 'Unknown',
  category: 'qualifier value' as const,
})
export const NO_KNOWN_QUALIFIER = asConcept({
  id: '1381510001',
  name: 'No known',
  category: 'qualifier value' as const,
})
export const ACTIVE_QUALIFIER = asConcept({
  id: '55561003',
  name: 'Active',
  category: 'qualifier value' as const,
})
export const STATUS_ATTRIBUTE = asConcept({
  id: '263490005',
  name: 'Status',
  category: 'attribute' as const,
})
export const SELF_REPORTED_QUALIFIER = asConcept({
  id: '1156040003',
  name: 'Self reported',
  category: 'qualifier value' as const,
})
export const CLINICAL_FINDING = asConcept({
  id: '404684003',
  name: 'Clinical finding',
  category: 'finding' as const,
})
export const ATTRIBUTE = asConcept({
  id: '246061005',
  name: 'Attribute',
  category: 'attribute' as const,
})
export const CHIEF_COMPLAINT = asConcept({
  id: '1269489004',
  name: 'Chief complaint',
  category: 'observable entity' as const,
})
export const QUALIFIER_VALUE = asConcept({
  id: '362981000',
  name: 'Qualifier value',
  category: 'qualifier value' as const,
})
export const RELATIONSHIP = asConcept({
  id: '263498003',
  name: 'Relationship',
  category: 'attribute' as const,
})
export const EVALUATION_ACTION = asConcept({
  id: '129265001',
  name: 'Evaluation - action',
  category: 'qualifier value' as const,
})
export const EVENT = asConcept({
  id: '272379006',
  name: 'Event',
  category: 'event' as const,
})
export const PROCEDURE = asConcept({
  id: '71388002',
  name: 'Procedure',
  category: 'procedure' as const,
})
export const ACTION_STATUS = asConcept({
  id: '385641008',
  name: 'Action status',
  category: 'attribute' as const,
})
export const TO_BE_DONE = asConcept({
  id: '385643006',
  name: 'To be done',
  category: 'qualifier value' as const,
})
export const DUE_TO = asConcept({
  id: '42752001',
  name: 'Due to',
  category: 'attribute' as const,
})
export const DIAGNOSIS = asConcept({
  id: '439401001',
  name: 'Diagnosis',
  category: 'observable entity' as const,
})
export const TRANSFER_OF_CARE_PROCEDURE = asConcept({
  id: '308292007',
  name: 'Transfer of care',
  category: 'procedure' as const,
})
export const PATIENT_TRANSFER_PROCEDURE = asConcept({
  id: '107724000',
  name: 'Patient transfer',
  category: 'procedure' as const,
})
export const ALTERED = asConcept({
  id: '18307000',
  name: 'Altered',
  category: 'qualifier value' as const,
})
export const ENTERED_IN_ERROR = asConcept({
  id: '723510000',
  name: 'Entered in error',
  category: 'qualifier value' as const,
})
export const TRIAGE_PROCEDURE = asConcept({
  id: '225390008',
  name: 'Triage',
  category: 'procedure' as const,
})
export const TAKING_PATIENT_VITAL_SIGNS = asConcept({
  id: '61746007',
  name: 'Taking patient vital signs',
  category: 'procedure' as const,
})
export const SEVERITY_SCORE = asConcept({
  id: '278305009',
  name: 'Severity score',
  category: 'qualifier value' as const,
})
export const EVALUATION_FOR_SIGNS_AND_SYMPTOMS_OF_PHYSICAL_HEALTH_PROBLEMS =
  asConcept({
    id: '409060008',
    name: 'Evaluation for signs and symptoms of physical health problems',
    category: 'procedure' as const,
  })
export const AUDIO_RECORDING_OF_SUBJECT_INTERVIEW = asConcept({
  id: '431315003',
  name: 'Audio recording of subject interview',
  category: 'procedure' as const,
})
export const PRIORITY = asConcept({
  id: '260870009',
  name: 'Priority',
  category: 'attribute' as const,
})
export const PATIENT_FAMILY_HISTORY_TAKING = asConcept({
  id: '410551005',
  name: 'Family history taking',
  category: 'procedure' as const,
})
export const FAMILY_HISTORY_WITH_EXPLICIT_CONTEXT = asConcept({
  id: '57177007',
  name: 'Family history with explicit context',
  category: 'situation' as const,
})
export const MEASUREMENT_FINDING = asConcept({
  id: '118245000',
  name: 'Measurement finding',
  category: 'finding' as const,
})
export const NATIONAL_EARLY_WARNING_SCORE = asConcept({
  id: '1287358002',
  name: 'National Early Warning Score',
  category: 'assessment scale' as const,
})
export const SOUTH_AFRICA = asConcept({
  id: '223549008',
  name: 'South Africa',
  category: 'geographic location' as const,
})
