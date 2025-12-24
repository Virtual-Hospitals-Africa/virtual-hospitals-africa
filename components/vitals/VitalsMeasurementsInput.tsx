import {
  Maybe,
  MostRecentVitalMeasurement,
  VitalMeasurementFormInputDefition,
} from '../../types.ts'
import capitalize from '../../util/capitalize.ts'
import { HiddenInput } from '../../components/library/HiddenInput.tsx'
import { Label } from '../../components/library/Label.tsx'
import { LocalTime } from '../../islands/LocalTime.tsx'
import { TextInput } from '../../islands/form/inputs/text.tsx'

export default function VitalsMeasurementsInput(
  { vital, most_recent_patient_finding }: {
    vital: VitalMeasurementFormInputDefition
    most_recent_patient_finding: Maybe<MostRecentVitalMeasurement>
  },
) {
  const name = `measurements.${vital.vital}`

  return (
    <div className='flex justify-between w-full'>
      <div className='flex flex-col'>
        <Label label={capitalize(vital.vital)} htmlFor={name} />
        {most_recent_patient_finding && (
          <div className='flex text-gray-500'>
            <a href='#' className='text-blue-500'>
              {most_recent_patient_finding.value_display}
            </a>
            &nbsp;
            <LocalTime
              timestamp={most_recent_patient_finding.created_at}
              expected_time_range='past'
            />
          </div>
        )}
      </div>
      <div className='flex items-center w-32'>
        <TextInput
          inputmode='numeric'
          required={vital.required}
          id={name}
          name={`${name}.value`}
          label={null}
          value={null}
          className='justify-end !min-w-0'
          min={0}
          suffix={vital.units}
        />
        <HiddenInput
          name={`${name}.units`}
          value={vital.units}
        />
      </div>
    </div>
  )
}
