import { RenderedTaskToBeDone } from '../../../types.ts'
import { HiddenInput } from '../../library/HiddenInput.tsx'
import VitalsInputRow from '../../vitals/InputRow.tsx'
import MeasurementInput from '../../vitals/MeasurementInput.tsx'
import { uniqueIdentifier } from './uniqueIdentifier.ts'

export function MeasurementTask({ organization_id, task }: { organization_id: string; task: RenderedTaskToBeDone & { atom: 'measurement' } }) {
  const name = `measurements.${uniqueIdentifier(task)}`
  return (
    <>
      <VitalsInputRow
        required
        name={name}
        most_recent_patient_finding={task.existing_record}
        label={task.snomed_concept.name}
        organization_id={organization_id}
        input_width='w-32'
        input={
          <MeasurementInput
            required
            units={task.units}
            name={name}
            value={task.existing_record?.value.value}
            label=''
          />
        }
      />
      <HiddenInput
        name={`${name}.s_expression`}
        value={task.s_expression}
      />
      {/* Names the task so that submitting the measurement marks it done */}
      <HiddenInput
        name={`${name}.task_description`}
        value={task.description}
      />
      <HiddenInput
        name={`${name}.existing_record.id`}
        value={task.existing_record?.id}
      />
      <HiddenInput
        name={`${name}.existing_record.value`}
        value={task.existing_record?.value.value}
      />
    </>
  )
}
