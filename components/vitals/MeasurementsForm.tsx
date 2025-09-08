import {
  MostRecentVitalMeasurement,
  VitalMeasurementFormInputDefition,
} from '../../types.ts'
import VitalsMeasurementsInput from './VitalsMeasurementsInput.tsx'

export function VitalsMeasurementsForm(
  { vital_measurements_for_this_encounter, most_recent_patient_vitals }: {
    vital_measurements_for_this_encounter: VitalMeasurementFormInputDefition[]
    most_recent_patient_vitals: MostRecentVitalMeasurement[]
  },
) {
  return (
    <div className='flex flex-col gap-4'>
      <div className='mb-4'>
        <h2 className='text-lg font-semibold text-gray-900'>
          Record Vital Signs
        </h2>
        <p className='text-sm text-gray-600 mt-1'>
          Enter measured values. Clinical evaluation and notes can be added in
          the next step.
        </p>
      </div>
      {vital_measurements_for_this_encounter.map((vital) => (
        <VitalsMeasurementsInput
          key={vital.finding_id}
          vital={vital}
          most_recent_patient_finding={most_recent_patient_vitals.find(
            (patient_vital) =>
              patient_vital.snomed_concept_id === vital.snomed_concept_id,
          )}
        />
      ))}
    </div>
  )
}
