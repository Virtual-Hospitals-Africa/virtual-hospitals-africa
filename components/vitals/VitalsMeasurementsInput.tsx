import { Maybe, RenderedFindingRelativeToHealthWorker, VitalMeasurementFormInputDefition } from '../../types.ts'
import VitalsInputRow from './InputRow.tsx'
import MeasurementInput from './MeasurementInput.tsx'

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
      input={<MeasurementInput name={name} {...vital} />}
    />
  )
}
