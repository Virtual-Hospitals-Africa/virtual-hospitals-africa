import { SnomedCategory } from '../db.d.ts'
import { SnomedConcept } from '../types.ts'

type Def = {
  id: string
  name: string
  category: SnomedCategory
}

export function asConceptSExpression(def: Def) {
  return `(snomed_concept "${def.name}" "${def.category}")`
}

export function asConcept(def: Def): SnomedConcept {
  return {
    ...def,
    snomed_concept_id: def.id,
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
export const EVALUATION_FOR_SIGNS_AND_SYMPTOMS_OF_PHYSICAL_HEALTH_PROBLEMS = asConcept({
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
export const REFERENCE_DOCUMENTATION = asConcept({
  id: '308910008',
  name: 'Reference documentation',
  category: 'qualifier value' as const,
})
export const MEASUREMENT_PROCEDURE = asConcept({
  id: '122869004',
  name: 'Measurement procedure',
  category: 'procedure' as const,
})
export const BODY_HEIGHT = asConcept({
  id: '1153637007',
  name: 'Body height',
  category: 'observable entity' as const,
})
export const BODY_WEIGHT = asConcept({
  id: '27113001',
  name: 'Body weight',
  category: 'observable entity' as const,
})
export const BODY_TEMPERATURE = asConcept({
  id: '386725007',
  name: 'Body temperature',
  category: 'observable entity' as const,
})
export const SYSTOLIC_BLOOD_PRESSURE = asConcept({
  id: '271649006',
  name: 'Systolic blood pressure',
  category: 'observable entity' as const,
})
export const DIASTOLIC_BLOOD_PRESSURE = asConcept({
  id: '271650006',
  name: 'Diastolic blood pressure',
  category: 'observable entity' as const,
})
export const HEMOGLOBIN_SATURATION_WITH_OXYGEN = asConcept({
  id: '103228002',
  name: 'Hemoglobin saturation with oxygen',
  category: 'observable entity' as const,
})
export const BLOOD_GLUCOSE_STATUS = asConcept({
  id: '405176005',
  name: 'Blood glucose status',
  category: 'observable entity' as const,
})
export const PULSE_FUNCTION = asConcept({
  id: '8499008',
  name: 'Pulse, function',
  category: 'observable entity' as const,
})
export const RESPIRATORY_RATE = asConcept({
  id: '86290005',
  name: 'Respiratory rate',
  category: 'observable entity' as const,
})
export const MID_UPPER_ARM_CIRCUMFERENCE = asConcept({
  id: '284473002',
  name: 'Mid upper arm circumference',
  category: 'observable entity' as const,
})
export const TRICEPS_SKIN_FOLD_THICKNESS = asConcept({
  id: '301851003',
  name: 'Triceps skin fold thickness',
  category: 'observable entity' as const,
})
export const HEAD_CIRCUMFERENCE = asConcept({
  id: '363812007',
  name: 'Head circumference',
  category: 'observable entity' as const,
})
export const ASSESSMENT_OF_MOBILITY = asConcept({
  id: '430481008',
  name: 'Assessment of mobility',
  category: 'procedure' as const,
})
export const ALERT_CONFUSION_VOICE_PAIN_UNRESPONSIVE_SCALE_SCORE = asConcept({
  id: '1104441000000107',
  name: 'Alert Confusion Voice Pain Unresponsive scale score',
  category: 'observable entity' as const,
})
export const TRAUMA_SCORE = asConcept({
  id: '273884004',
  name: 'Trauma score',
  category: 'assessment scale' as const,
})
export const MEASUREMENT_OF_BODY_MASS_INDEX = asConcept({
  id: '698094009',
  name: 'Measurement of body mass index',
  category: 'procedure' as const,
})
export const MEAN_BLOOD_PRESSURE = asConcept({
  id: '6797001',
  name: 'Mean blood pressure',
  category: 'observable entity' as const,
})
export const BLOOD_PRESSURE = asConcept({
  id: '75367002',
  name: 'Blood pressure',
  category: 'observable entity' as const,
})
export const NO_TRAUMATIC_INJURY = asConcept({
  id: '1149217004',
  name: 'No traumatic injury',
  category: 'situation' as const,
})
export const MENTALLY_ALERT = asConcept({
  id: '248234008',
  name: 'Mentally alert',
  category: 'finding' as const,
})
export const ABLE_TO_WALK = asConcept({
  id: '282144007',
  name: 'Able to walk',
  category: 'finding' as const,
})
export const UNABLE_TO_WALK = asConcept({
  id: '282145008',
  name: 'Unable to walk',
  category: 'finding' as const,
})
export const CLOUDED_CONSCIOUSNESS = asConcept({
  id: '40917007',
  name: 'Clouded consciousness',
  category: 'finding' as const,
})
export const TRAUMATIC_INJURY = asConcept({
  id: '417746004',
  name: 'Traumatic injury',
  category: 'disorder' as const,
})
export const UNRESPONSIVE = asConcept({
  id: '422768004',
  name: 'Unresponsive',
  category: 'finding' as const,
})
export const RESPONDS_TO_PAIN = asConcept({
  id: '450847001',
  name: 'Responds to pain',
  category: 'finding' as const,
})
export const DIFFICULTY_WALKING = asConcept({
  id: '719232003',
  name: 'Difficulty walking',
  category: 'finding' as const,
})
export const IMPAIRMENT_OF_MENTAL_ALERTNESS = asConcept({
  id: '704426000',
  name: 'Impairment of mental alertness',
  category: 'finding' as const,
})
export const PREGNANCY = asConcept({
  id: '77386006',
  name: 'Pregnancy',
  category: 'finding' as const,
})
export const DIABETES_MELLITUS = asConcept({
  id: '73211009',
  name: 'Diabetes mellitus',
  category: 'disorder' as const,
})
export const TUBERCULOSIS = asConcept({
  id: '56717001',
  name: 'Tuberculosis',
  category: 'disorder' as const,
})
export const HUMAN_IMMUNODEFICIENCY_VIRUS_INFECTION = asConcept({
  id: '86406008',
  name: 'Human immunodeficiency virus infection',
  category: 'disorder' as const,
})
export const ASTHMA = asConcept({
  id: '195967001',
  name: 'Asthma',
  category: 'disorder' as const,
})
export const CHRONIC_OBSTRUCTIVE_PULMONARY_DISEASE = asConcept({
  id: '13645005',
  name: 'Chronic obstructive pulmonary disease',
  category: 'disorder' as const,
})
export const DISEASE_CAUSED_BY_SEVERE_ACUTE_RESPIRATORY_SYNDROME_CORONAVIRUS_2 = asConcept({
  id: '840539006',
  name: 'Disease caused by severe acute respiratory syndrome coronavirus 2',
  category: 'disorder' as const,
})
export const HEART_DISEASE = asConcept({
  id: '56265001',
  name: 'Heart disease',
  category: 'disorder' as const,
})
export const MENTAL_DISORDER = asConcept({
  id: '74732009',
  name: 'Mental disorder',
  category: 'disorder' as const,
})
export const EPILEPSY = asConcept({
  id: '84757009',
  name: 'Epilepsy',
  category: 'disorder' as const,
})
export const ARTHRITIS = asConcept({
  id: '3723001',
  name: 'Arthritis',
  category: 'disorder' as const,
})
export const MALIGNANT_NEOPLASTIC_DISEASE = asConcept({
  id: '363346000',
  name: 'Malignant neoplastic disease',
  category: 'disorder' as const,
})
export const PATIENT_REGISTRATION = asConcept({
  id: '184047000',
  name: 'Patient registration',
  category: 'procedure' as const,
})
export const TRIAGE = asConcept({
  id: '225390008',
  name: 'Triage',
  category: 'procedure' as const,
})
export const REFERRAL_TO_ACCIDENT_AND_EMERGENCY_SERVICE = asConcept({
  id: '306104004',
  name: 'Referral to accident and emergency service',
  category: 'procedure' as const,
})
export const STABILIZATION = asConcept({
  id: '115979005',
  name: 'Stabilization',
  category: 'procedure' as const,
})
export const ENCOUNTER_FOR_PROBLEM = asConcept({
  id: '185347001',
  name: 'Encounter for problem',
  category: 'procedure' as const,
})
export const PRENATAL_EXAMINATION_AND_CARE_OF_MOTHER = asConcept({
  id: '18114009',
  name: 'Prenatal examination and care of mother',
  category: 'procedure' as const,
})
export const DISPENSING_MEDICATION = asConcept({
  id: '373784005',
  name: 'Dispensing medication',
  category: 'procedure' as const,
})
export const EVALUATION_OF_CARE_PLAN = asConcept({
  id: '712744002',
  name: 'Evaluation of care plan',
  category: 'procedure' as const,
})
export const EMERGENCY_EXAMINATION_FOR_TRIAGE = asConcept({
  id: '245581009',
  name: 'Emergency examination for triage',
  category: 'procedure' as const,
})
export const HISTORY_TAKING_LIMITED = asConcept({
  id: '203421005',
  name: 'History taking, limited',
  category: 'procedure' as const,
})
export const BODY_MEASUREMENT = asConcept({
  id: '54709006',
  name: 'Body measurement',
  category: 'procedure' as const,
})
export const TAKING_PATIENT_VITAL_SIGNS_ASSESSMENT = asConcept({
  id: '410188000',
  name: 'Taking patient vital signs assessment',
  category: 'procedure' as const,
})
export const EVALUATION_PROCEDURE = asConcept({
  id: '386053000',
  name: 'Evaluation procedure',
  category: 'procedure' as const,
})
export const OXYGEN_THERAPY = asConcept({
  id: '57485005',
  name: 'Oxygen therapy',
  category: 'procedure' as const,
})
export const TELEMEDICINE_CONSULTATION_WITH_PATIENT = asConcept({
  id: '448337001',
  name: 'Telemedicine consultation with patient',
  category: 'procedure' as const,
})
export const DEFINITE = asConcept({
  id: '255545003',
  name: 'Definite',
  category: 'qualifier value' as const,
})
export const PROBABLE_DIAGNOSIS_CONTEXTUAL_QUALIFIER = asConcept({
  id: '2931005',
  name: 'Probable diagnosis (contextual qualifier)',
  category: 'qualifier value' as const,
})
export const EQUIVOCAL = asConcept({
  id: '42425007',
  name: 'Equivocal',
  category: 'qualifier value' as const,
})
export const POSSIBLE_DIAGNOSIS_CONTEXTUAL_QUALIFIER = asConcept({
  id: '60022001',
  name: 'Possible diagnosis (contextual qualifier)',
  category: 'qualifier value' as const,
})
