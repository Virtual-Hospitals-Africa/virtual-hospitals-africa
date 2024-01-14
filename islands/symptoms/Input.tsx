import {
  DateInput,
  SelectWithOptions,
  TextArea,
  TextInput,
} from '../../components/library/form/Inputs.tsx'
import FormRow from '../../components/library/form/Row.tsx'
import { EditingSymptom } from './Section.tsx'
import { useSignal } from '@preact/signals'
import { RemoveRow } from '../AddRemove.tsx'
import range from '../../util/range.ts'

export default function SymptomInput({
  name,
  value,
}: {
  name: string
  value: EditingSymptom
}) {
  const is_removed = useSignal(false)
  if (is_removed.value) return null

  return (
    <RemoveRow onClick={() => is_removed.value = true} labelled>
      <div className='w-full justify-normal'>
        <FormRow className='w-full justify-normal'>
          <TextInput
            name={`${name}.symptom`}
            required
            readonly
            value={value.symptom}
          />
          <SelectWithOptions
            name={`${name}.severity`}
            required
            options={range(1, 10)}
            value={value.severity}
          />
          <DateInput
            name={`${name}.start_date`}
            value={value.start_date}
            required
          />
          <DateInput
            name={`${name}.end_date`}
            value={value.end_date}
          />
        </FormRow>
        <FormRow>
          <TextArea
            name={`${name}.notes`}
            className='w-full'
            label='Notes'
            value={value.notes}
            rows={2}
          />
        </FormRow>
      </div>
    </RemoveRow>
  )
}
