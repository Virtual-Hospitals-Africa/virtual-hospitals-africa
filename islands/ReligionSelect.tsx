import SelectWithOther from './SelectWithOther.tsx'
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
    <SelectWithOther
      label={label}
      name={name}
      required={required}
      options={RELIGIONS}
      value={value}
    />
  )
}
