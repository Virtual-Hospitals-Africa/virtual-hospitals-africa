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
    >
      {RELIGIONS.map((r) => (
        <option
          value={value}
          selected={r === value}
        >
          {r}
        </option>
      ))}
    </SelectWithOther>
  )
}
