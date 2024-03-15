import { SelectWithOptions } from '../form/Inputs.tsx'
import { FAMILY_TYPES } from '../../shared/family.ts'

export default function FamilyTypeSelect(
  { name, required, label, value, onSelect }: {
    name: string
    label: string
    required?: boolean
    value?: string
    onSelect?(type: string): void
  },
) {
  return (
    <SelectWithOptions
      label={label}
      name={name}
      required={required}
      blank_option
      value={value}
      onChange={(e) => {
        onSelect && onSelect(e.target.value)
      }}
      options={FAMILY_TYPES.map((type) => (
        { value: type }
      ))}
    />
  )
}
