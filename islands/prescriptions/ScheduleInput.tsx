import { DrugSearchResultMedication, MedicationSchedule } from '../../types.ts'
import FormRow from '../../components/library/FormRow.tsx'
import { dosageDisplay, Dosages, RegistrationFrequencies } from '../../shared/medication.ts'
import { useSignal } from '@preact/signals'
import { NoLabelButSpaceAsPlaceholder } from '../form/inputs/labelled.tsx'
import { NumberInput } from '../form/inputs/number.tsx'
import { Select } from '../form/inputs/select.tsx'
import { SelectWithOptions } from '../form/inputs/select_with_options.tsx'

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
  strength_numerator: string | undefined
}) {
  const dosage = useSignal(value.dosage ?? 1)
  const frequency = useSignal(value.frequency)
  const duration = useSignal(value.duration ?? 1)
  const duration_unit = useSignal(value.duration_unit ?? 'days')

  return (
    <FormRow className='w-full pb-2 justify-normal'>
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
          Object.entries(RegistrationFrequencies).map(([code, label]) => (
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
