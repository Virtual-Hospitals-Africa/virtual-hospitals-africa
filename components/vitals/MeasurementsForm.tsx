import {
  MostRecentVitalMeasurement,
  VitalMeasurementFormInputDefition,
} from '../../types.ts'
import VitalsMeasurementsInput from './VitalsMeasurementsInput.tsx'
import DatabaseDrivenCategoricalInput from './DatabaseDrivenCategoricalInput.tsx'
import { AssessmentForForm } from '../../db/models/patient_categorical_findings.ts'

export function VitalsMeasurementsForm({
  vital_measurements_for_this_encounter,
  triage_assessments,
  most_recent_patient_vitals,
}: {
  vital_measurements_for_this_encounter: VitalMeasurementFormInputDefition[]
  triage_assessments: AssessmentForForm[]
  most_recent_patient_vitals: MostRecentVitalMeasurement[]
}) {
  const regular_vitals = vital_measurements_for_this_encounter

  return (
    <div className='flex flex-col gap-4'>
      <div className='mb-4'>
        <h2 className='text-lg font-semibold text-gray-900'>
          Triage Assessment
        </h2>
      </div>

      {triage_assessments.length && (
        <>
          <div className='mb-2'>
            <h3 className='text-base font-semibold text-gray-900'>
              Triage Assessment (Required for TEWS Score)
            </h3>
          </div>
          {triage_assessments.map((assessment) => (
            <DatabaseDrivenCategoricalInput
              key={assessment.assessment_snomed_id}
              assessment={assessment}
              most_recent_patient_finding={most_recent_patient_vitals.find(
                (patient_vital) =>
                  patient_vital.snomed_concept_id ===
                    assessment.assessment_snomed_id,
              )}
            />
          ))}
        </>
      )}

      {regular_vitals.length && (
        <>
          <div className='mt-6 mb-2 border-t pt-4'>
            <h3 className='text-base font-semibold text-gray-900'>
              Vital Signs
            </h3>
          </div>
          {regular_vitals.map((vital) => (
            <VitalsMeasurementsInput
              key={vital.finding_id}
              vital={vital}
              most_recent_patient_finding={most_recent_patient_vitals.find(
                (patient_vital) =>
                  patient_vital.snomed_concept_id === vital.snomed_concept_id,
              )}
            />
          ))}
        </>
      )}
    </div>
  )
}
