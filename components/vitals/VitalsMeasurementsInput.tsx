import {
  Maybe,
  RenderedFindingRelativeToHealthWorker,
  VitalMeasurementFormInputDefition,
} from '../../types.ts'
import { HiddenInput } from '../../components/library/HiddenInput.tsx'
import { TextInput } from '../../islands/form/inputs/text.tsx'
import VitalsInputRow from './InputRow.tsx'

export default function VitalMeasurementsInput(
  { vital, most_recent_patient_finding, organization_id }: {
    vital: VitalMeasurementFormInputDefition
    most_recent_patient_finding: Maybe<RenderedFindingRelativeToHealthWorker>
    organization_id: string
  },
) {
  const name = `measurements.${vital.vital}`

  return (
    <VitalsInputRow
      name={name}
      required={vital.required}
      most_recent_patient_finding={most_recent_patient_finding}
      label={vital.vital}
      organization_id={organization_id}
      input_width='w-32'
      input={
        <>
          <TextInput
            inputmode='numeric'
            required={vital.required}
            id={name}
            name={`${name}.value`}
            label={null}
            value={null}
            className='justify-end'
            min={0}
            suffix={vital.units}
          />
          <HiddenInput
            name={`${name}.units`}
            value={vital.units}
          />
        </>
      }
    />
  )
}
