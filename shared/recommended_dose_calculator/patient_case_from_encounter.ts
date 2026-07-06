import type { ParsedPatientCase } from '../recommended_doses.ts'
import { PatientCaseSchema } from '../recommended_doses.ts'
import type { RenderedEvaluationRelativeToHealthWorker, RenderedPatient, RenderedSidebarWorkflow, Sex } from '../../types.ts'
import { VITAL_MEASUREMENTS_SNOMED_CONCEPTS } from '../vitals.ts'

const MEASUREMENT_SNOMED_CONCEPT_IDS = new Set([
  VITAL_MEASUREMENTS_SNOMED_CONCEPTS.height.id,
  VITAL_MEASUREMENTS_SNOMED_CONCEPTS.weight.id,
])

export type EncounterMeasurements = {
  height_cm: string | null
  weight_kg: string | null
}

export type BuildPatientCaseFromEncounterResult =
  | { ok: true; patient_case: ParsedPatientCase }
  | { ok: false; missing: Array<'dob' | 'sex' | 'height_cm' | 'weight_kg'> }

export function snomedConceptIdsFromEncounter({
  this_visit_diagnoses,
  this_visit_findings,
}: {
  this_visit_diagnoses: RenderedEvaluationRelativeToHealthWorker[]
  this_visit_findings: RenderedSidebarWorkflow[]
}): string[] {
  const snomed_concept_ids: string[] = []

  function add(snomed_concept_id: string) {
    if (MEASUREMENT_SNOMED_CONCEPT_IDS.has(snomed_concept_id)) return
    if (!snomed_concept_ids.includes(snomed_concept_id)) {
      snomed_concept_ids.push(snomed_concept_id)
    }
  }

  for (const diagnosis of this_visit_diagnoses) {
    add(diagnosis.specific_snomed_concept_id)
  }

  for (const workflow of this_visit_findings) {
    for (const step of workflow.steps) {
      for (const record of step.records) {
        if (record.type === 'finding' || record.type === 'evaluation') {
          add(record.specific_snomed_concept_id)
        }
      }
    }
  }

  return snomed_concept_ids
}

function patientSexForDoseCalculator(sex: Sex | null): ParsedPatientCase['sex'] | null {
  return sex === 'male' || sex === 'female' ? sex : null
}

export function buildPatientCaseFromEncounter({
  patient,
  measurements,
  snomed_concept_ids,
}: {
  patient: Pick<RenderedPatient, 'date_of_birth' | 'sex'>
  measurements: EncounterMeasurements
  snomed_concept_ids: string[]
}): BuildPatientCaseFromEncounterResult {
  const missing: Array<'dob' | 'sex' | 'height_cm' | 'weight_kg'> = []
  const sex = patientSexForDoseCalculator(patient.sex)
  if (!patient.date_of_birth) missing.push('dob')
  if (!sex) missing.push('sex')
  if (!measurements.height_cm) missing.push('height_cm')
  if (!measurements.weight_kg) missing.push('weight_kg')
  if (missing.length) return { ok: false, missing }

  return {
    ok: true,
    patient_case: PatientCaseSchema.parse({
      dob: patient.date_of_birth,
      sex,
      height_cm: measurements.height_cm,
      weight_kg: measurements.weight_kg,
      conditions: [],
      snomed_concept_ids,
    }),
  }
}
