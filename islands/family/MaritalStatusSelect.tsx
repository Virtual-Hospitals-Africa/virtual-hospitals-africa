import { MARITAL_STATUS } from '../../shared/family.ts'
import { SelectWithOptions } from '../form/inputs/select_with_options.tsx'

export default function MaritalStatusSelect(
  { name, required, label, value }: {
    name: string
    label: string
    required?: boolean
    value?: string
  },
) {
  return (
    <SelectWithOptions
      label={label}
      name={name}
      required={required}
      blank_option
      value={value}
      options={MARITAL_STATUS.map((status) => (
        { value: status }
      ))}
    />
  )
}
