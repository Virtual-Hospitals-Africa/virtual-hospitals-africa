import { SelectWithOptions } from './form/Inputs.tsx'
import { RELIGIONS } from '../shared/family.ts'

export default function ReligionSelect(
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
      options={RELIGIONS.map((r) => (
        { value: r }
      ))}
    />
  )
}
