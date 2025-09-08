import {
  Maybe,
  MostRecentVitalMeasurement,
  VitalMeasurementFormInputDefition,
} from '../../types.ts'
import capitalize from '../../util/capitalize.ts'
import { HiddenInput } from '../../components/library/HiddenInput.tsx'
import { Label } from '../../components/library/Label.tsx'
import { LocalTime } from '../../islands/LocalTime.tsx'
import { TextInput } from '../../islands/form/Inputs.tsx'

export default function VitalsMeasurementsInput(
  { vital, most_recent_patient_finding }: {
    vital: VitalMeasurementFormInputDefition
    most_recent_patient_finding: Maybe<MostRecentVitalMeasurement>
  },
) {
  const name = `findings.${vital.finding_id}`

  return (
    <div className='flex justify-between w-full'>
      <div className='flex flex-col'>
        <Label label={capitalize(vital.label)} />
        {most_recent_patient_finding && (
          <div className='flex text-gray-500'>
            <a href='#' className='text-blue-500'>
              {most_recent_patient_finding.value_display}
            </a>
            &nbsp;
            <LocalTime timestamp={most_recent_patient_finding.created_at} />
          </div>
        )}
      </div>
      <div className='min-w-30 max-w-30 flex items-center'>
        <TextInput
          inputmode='numeric'
          required={vital.required}
          name={`${name}.value`}
          label={null}
          value={null}
          className='justify-end'
          min={0}
          suffix={vital.units}
        />
        <HiddenInput
          name={`${name}.snomed_concept_id`}
          value={vital.snomed_concept_id}
        />
        <HiddenInput
          name={`${name}.units`}
          value={vital.units}
        />
      </div>
    </div>
  )
}
