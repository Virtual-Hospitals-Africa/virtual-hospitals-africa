import {
  RenderedFindingRelativeToHealthWorker,
  VitalMeasurementFormInputDefition,
} from '../../types.ts'
import VitalsMeasurementsInput from './VitalsMeasurementsInput.tsx'
import DatabaseDrivenCategoricalInput from './DatabaseDrivenCategoricalInput.tsx'
import { AssessmentForForm } from '../../db/models/patient_categorical_findings.ts'

export function VitalsMeasurementsForm({
  vital_measurements_for_this_encounter,
  triage_assessments,
  most_recent_patient_vitals,
  organization_id,
}: {
  vital_measurements_for_this_encounter: VitalMeasurementFormInputDefition[]
  triage_assessments: AssessmentForForm[]
  most_recent_patient_vitals: RenderedFindingRelativeToHealthWorker[]
  organization_id: string
}) {
  const regular_vitals = vital_measurements_for_this_encounter

  console.log({ most_recent_patient_vitals })

  return (
    <div className='flex flex-col gap-4'>
      {!!triage_assessments.length && (
        <div className='border-b'>
          <div className='mb-4'>
            <h2 className='text-lg font-semibold text-gray-900'>
              Assessments
            </h2>
          </div>
          <div className='mb-2'>
            <h3 className='text-base font-semibold text-gray-900'>
              Triage Assessment (Required for TEWS Score)
            </h3>
          </div>
          {triage_assessments.map((assessment) => (
            <DatabaseDrivenCategoricalInput
              key={assessment.assessment_snomed_concept_id}
              assessment={assessment}
              most_recent_patient_finding={most_recent_patient_vitals.find(
                (patient_vital) =>
                  patient_vital.finding_snomed_concept_id ===
                    assessment.assessment_snomed_concept_id,
              )}
              organization_id={organization_id}
            />
          ))}
        </div>
      )}

      {regular_vitals.length && (
        <>
          <div className='mt-6 mb-2 pt-4'>
            <h3 className='text-base font-semibold text-gray-900'>
              Measurements
            </h3>
          </div>
          {regular_vitals.map((vital) => (
            <VitalsMeasurementsInput
              key={vital.vital}
              vital={vital}
              most_recent_patient_finding={most_recent_patient_vitals.find(
                (patient_vital) =>
                  patient_vital.finding_snomed_concept_id ===
                    vital.snomed_concept_id,
              )}
              organization_id={organization_id}
            />
          ))}
        </>
      )}
    </div>
  )
}
