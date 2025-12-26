import {
  Maybe,
  RenderedVitalMeasurement,
  VitalMeasurementFormInputDefition,
} from '../../types.ts'
import capitalize from '../../util/capitalize.ts'
import { HiddenInput } from '../../components/library/HiddenInput.tsx'
import { Label } from '../../components/library/Label.tsx'
import { TextInput } from '../../islands/form/inputs/text.tsx'
import { LabelSpan } from '../../islands/form/inputs/labelled.tsx'
import { MostRecentFinding } from '../library/MostRecentFinding.tsx'

export default function VitalsMeasurementsInput(
  { vital, most_recent_patient_finding, organization_id }: {
    vital: VitalMeasurementFormInputDefition
    most_recent_patient_finding: Maybe<RenderedVitalMeasurement>
    organization_id: string
  },
) {
  const name = `measurements.${vital.vital}`

  return (
    <div className='flex justify-between w-full'>
      <div className='flex flex-col'>
        <Label htmlFor={name}>
          <LabelSpan
            required={vital.required}
            label={capitalize(vital.vital)}
          />
        </Label>
        <MostRecentFinding
          finding={most_recent_patient_finding}
          organization_id={organization_id}
        />
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
