import {
  RenderedFindingRelativeToHealthWorker,
  VitalAssessmentFormInputDefition,
  VitalMeasurementFormInputDefition,
} from '../../types.ts'
import VitalsMeasurementsInput from './VitalsMeasurementsInput.tsx'
import DatabaseDrivenCategoricalInput from './DatabaseDrivenCategoricalInput.tsx'
import { isAssessmentFor } from '../../shared/vitals.ts'
import { assert } from 'std/assert/assert.ts'

export function VitalsMeasurementsForm({
  vital_measurements_for_this_encounter,
  triage_assessments,
  most_recent_patient_vitals,
  organization_id,
}: {
  vital_measurements_for_this_encounter: VitalMeasurementFormInputDefition[]
  triage_assessments: VitalAssessmentFormInputDefition[]
  most_recent_patient_vitals: RenderedFindingRelativeToHealthWorker[]
  organization_id: string
}) {
  assert(triage_assessments.length)
  assert(vital_measurements_for_this_encounter.length)

  return (
    <div className='grid grid-cols-1 xl:grid-cols-2 gap-8'>
      <div className='flex flex-col gap-4'>
        <h2 className='text-lg font-semibold text-gray-900'>
          Assessments
        </h2>
        {triage_assessments.map((assessment) => (
          <DatabaseDrivenCategoricalInput
            key={assessment.evaluation_snomed_concept_id}
            assessment={assessment}
            most_recent_patient_finding={most_recent_patient_vitals.find(
              (patient_vital) =>
                isAssessmentFor(
                  patient_vital,
                  assessment.evaluation_snomed_concept_id,
                ),
            )}
            organization_id={organization_id}
          />
        ))}
      </div>

      <div className='flex flex-col gap-4'>
        <h2 className='text-lg font-semibold text-gray-900'>
          Measurements
        </h2>
        {vital_measurements_for_this_encounter.map((vital) => (
          <VitalsMeasurementsInput
            key={vital.vital}
            vital={vital}
            most_recent_patient_finding={most_recent_patient_vitals.find(
              (patient_vital) =>
                patient_vital.specific_snomed_concept.snomed_concept_id ===
                  vital.snomed_concept_id,
            )}
            organization_id={organization_id}
          />
        ))}
      </div>
    </div>
  )
}
