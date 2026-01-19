import { Maybe, VitalMeasurementFormInputDefition } from '../../types.ts'
import { HiddenInput } from '../../components/library/HiddenInput.tsx'
import { TextInput } from '../../islands/form/inputs/text.tsx'

type MeasurementInputProps = Omit<VitalMeasurementFormInputDefition, 'vital' | 'snomed_concept_id'> & {
  name: string
  s_expression?: string
  label?: Maybe<string>
}

export default function MeasurementInput(
  { name, label, units, s_expression, required }: MeasurementInputProps,
) {
  return (
    <>
      <TextInput
        inputmode='numeric'
        required={required}
        id={name}
        name={`${name}.value`}
        label={label}
        value={null}
        className='justify-end'
        min={0}
        suffix={units}
      />
      <HiddenInput
        name={`${name}.units`}
        value={units}
      />
      <HiddenInput
        name={`${name}.s_expression`}
        value={s_expression}
      />
    </>
  )
}
