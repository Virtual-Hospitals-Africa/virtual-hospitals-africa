import { FAMILY_TYPES } from '../../shared/family.ts'
import { SelectWithOptions } from '../form/inputs/select_with_options.tsx'

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
      onChange={(e) => onSelect?.(e.currentTarget.value)}
      options={FAMILY_TYPES.map((type) => (
        { value: type }
      ))}
    />
  )
}
