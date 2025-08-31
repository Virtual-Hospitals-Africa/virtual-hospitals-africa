import {
  MostRecentVitalMeasurement,
  VitalMeasurementFormInputDefition,
} from '../../types.ts'
import VitalInputWithNote from '../../islands/vitals/VitalInputWithNote.tsx'

export function VitalsForm({
  vital_measurements_for_this_encounter,
  most_recent_patient_vitals,
}: {
  vital_measurements_for_this_encounter: VitalMeasurementFormInputDefition[]
  most_recent_patient_vitals: MostRecentVitalMeasurement[]
}) {
  return (
    <div className='flex flex-col gap-2'>
      {vital_measurements_for_this_encounter.map((vital) => (
        <VitalInputWithNote
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
