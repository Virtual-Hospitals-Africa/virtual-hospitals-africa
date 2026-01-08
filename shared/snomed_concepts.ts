import { SnomedCategory } from '../db.d.ts'

type Def = {
  id: string
  name: string
  category: SnomedCategory
}

function concept(def: Def): Def & { lang: string } {
  return { ...def, lang: `(snomed_concept "${def.name}" "${def.category}")` }
}

export const YES_QUALIFIER = concept({
  id: '373066001',
  name: 'Yes',
  category: 'qualifier value' as const,
})
export const NO_QUALIFIER = concept({
  id: '373067005',
  name: 'No',
  category: 'qualifier value' as const,
})
export const UNKNOWN_QUALIFIER = concept({
  id: '261665006',
  name: 'Unknown',
  category: 'qualifier value' as const,
})
export const NO_KNOWN_QUALIFIER = concept({
  id: '1381510001',
  name: 'No known',
  category: 'qualifier value' as const,
})
export const ACTIVE_QUALIFIER = concept({
  id: '55561003',
  name: 'Active',
  category: 'qualifier value' as const,
})
export const STATUS_ATTRIBUTE = concept({
  id: '263490005',
  name: 'Status',
  category: 'attribute' as const,
})
export const SELF_REPORTED_QUALIFIER = concept({
  id: '1156040003',
  name: 'Self reported',
  category: 'qualifier value' as const,
})
export const CLINICAL_FINDING = concept({
  id: '404684003',
  name: 'Clinical finding',
  category: 'finding' as const,
})
export const ATTRIBUTE = concept({
  id: '246061005',
  name: 'Attribute',
  category: 'attribute' as const,
})
export const CHIEF_COMPLAINT = concept({
  id: '1269489004',
  name: 'Chief complaint',
  category: 'observable entity' as const,
})
export const QUALIFIER_VALUE = concept({
  id: '362981000',
  name: 'Qualifier value',
  category: 'qualifier value' as const,
})
export const RELATIONSHIP = concept({
  id: '263498003',
  name: 'Relationship',
  category: 'attribute' as const,
})
export const EVALUATION_ACTION = concept({
  id: '129265001',
  name: 'Evaluation - action',
  category: 'qualifier value' as const,
})
export const EVENT = concept({
  id: '272379006',
  name: 'Event',
  category: 'event' as const,
})
export const PROCEDURE = concept({
  id: '71388002',
  name: 'Procedure',
  category: 'procedure' as const,
})
export const ACTION_STATUS = concept({
  id: '385641008',
  name: 'Action status',
  category: 'attribute' as const,
})
export const TO_BE_DONE = concept({
  id: '385643006',
  name: 'To be done',
  category: 'qualifier value' as const,
})
export const DUE_TO = concept({
  id: '42752001',
  name: 'Due to',
  category: 'attribute' as const,
})
export const DIAGNOSIS = concept({
  id: '439401001',
  name: 'Diagnosis',
  category: 'observable entity' as const,
})
export const TRANSFER_OF_CARE_PROCEDURE = concept({
  id: '308292007',
  name: 'Transfer of care',
  category: 'procedure' as const,
})
export const PATIENT_TRANSFER_PROCEDURE = concept({
  id: '107724000',
  name: 'Patient transfer',
  category: 'procedure' as const,
})
export const ALTERED = concept({
  id: '18307000',
  name: 'Altered',
  category: 'qualifier value' as const,
})
export const ENTERED_IN_ERROR = concept({
  id: '723510000',
  name: 'Entered in error',
  category: 'qualifier value' as const,
})
export const TRIAGE_PROCEDURE = concept({
  id: '225390008',
  name: 'Triage',
  category: 'procedure' as const,
})
export const TAKING_PATIENT_VITAL_SIGNS = concept({
  id: '61746007',
  name: 'Taking patient vital signs',
  category: 'procedure' as const,
})
export const SEVERITY_SCORE = concept({
  id: '278305009',
  name: 'Severity score',
  category: 'qualifier value' as const,
})
export const EVALUATION_FOR_SIGNS_AND_SYMPTOMS_OF_PHYSICAL_HEALTH_PROBLEMS =
  concept({
    id: '409060008',
    name: 'Evaluation for signs and symptoms of physical health problems',
    category: 'procedure' as const,
  })
export const AUDIO_RECORDING_OF_SUBJECT_INTERVIEW = concept({
  id: '431315003',
  name: 'Audio recording of subject interview',
  category: 'procedure' as const,
})
export const PRIORITY = concept({
  id: '260870009',
  name: 'Priority',
  category: 'attribute' as const,
})
export const PATIENT_FAMILY_HISTORY_TAKING = concept({
  id: '410551005',
  name: 'Family history taking',
  category: 'procedure' as const,
})
export const FAMILY_HISTORY_WITH_EXPLICIT_CONTEXT = concept({
  id: '57177007',
  name: 'Family history with explicit context',
  category: 'situation' as const,
})
export const MEASUREMENT_FINDING = concept({
  id: '118245000',
  name: 'Measurement finding',
  category: 'finding' as const,
})
export const NATIONAL_EARLY_WARNING_SCORE = concept({
  id: '1287358002',
  name: 'National Early Warning Score',
  category: 'assessment scale' as const,
})
export const SOUTH_AFRICA = concept({
  id: '223549008',
  name: 'South Africa',
  category: 'geographic location' as const,
})
