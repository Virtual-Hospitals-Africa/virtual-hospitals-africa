import { SelectWithOptions } from '../../components/library/form/Inputs.tsx'
import { FAMILY_TYPES } from '../../shared/family.ts'

export default function FamilyTypeSelect(
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
      options={FAMILY_TYPES.map((type) => (
        { value: type }
      ))}
    />
  )
}
