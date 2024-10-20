import {
  NoLabelButSpaceAsPlaceholder,
  NumberInput,
  Select,
  SelectWithOptions,
} from '../form/Inputs.tsx'
import { DrugSearchResultMedication, MedicationSchedule } from '../../types.ts'
import FormRow from '../../components/library/FormRow.tsx'
import {
  dosageDisplay,
  Dosages,
  IntakeFrequencies,
} from '../../shared/medication.ts'
import { useSignal } from '@preact/signals'

export function ScheduleInput({
  labelled,
  name,
  value,
  medication,
  strength_numerator,
}: {
  labelled?: boolean
  name: string
  value: Partial<MedicationSchedule>
  medication: DrugSearchResultMedication | undefined
  strength_numerator: number | undefined
}) {
  const dosage = useSignal(value.dosage ?? 1)
  const frequency = useSignal(value.frequency)
  const duration = useSignal(value.duration ?? 1)
  const duration_unit = useSignal(value.duration_unit ?? 'days')

  return (
    <FormRow className='w-full justify-normal pb-2'>
      <Select
        name={`${name}.dosage`}
        label={labelled ? 'Dosage' : null}
        disabled={!(strength_numerator && medication)}
      >
        <option value=''>Select Dosage</option>
        {strength_numerator && medication &&
          Dosages.map(([dosage_text, dosage_value]) => (
            <option
              value={dosage_value}
              selected={dosage.value === dosage_value}
            >
              {dosageDisplay({
                dosage_text,
                dosage: dosage_value,
                strength_numerator,
                ...medication,
              })}
            </option>
          ))}
      </Select>
      <Select
        name={`${name}.frequency`}
        required
        label={labelled ? 'Frequency' : null}
        disabled={!(strength_numerator && medication)}
      >
        <option value=''>Select Frequency</option>
        {strength_numerator && medication &&
          Object.entries(IntakeFrequencies).map(([code, label]) => (
            <option
              value={code}
              selected={frequency.value === code}
            >
              {label}
            </option>
          ))}
      </Select>
      <NumberInput
        name={`${name}.duration`}
        label={labelled ? 'Duration' : null}
        value={duration.value}
        required
      />
      <SelectWithOptions
        name={`${name}.duration_unit`}
        label={labelled ? NoLabelButSpaceAsPlaceholder : null}
        required
        value={duration_unit.value}
        options={[
          { value: 'days', label: 'Days' },
          { value: 'weeks', label: 'Weeks' },
          { value: 'months', label: 'Months' },
          { value: 'years', label: 'Years' },
          // TODO support indefinitely in the backend
          // { value: 'indefinitely', label: 'Indefinitely' },
        ]}
      />
    </FormRow>
  )
}
