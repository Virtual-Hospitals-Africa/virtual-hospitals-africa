import { MARITAL_STATUS } from '../../shared/family.ts'
import SelectWithOther from '../SelectWithOther.tsx'

export default function MaritalStatusSelect({ name }: { name: string }) {
  return (
    <SelectWithOther
      name={name}
      required
    >
      {MARITAL_STATUS.map((status) => (
        <option value={status}>
          {status}
        </option>
      ))}
    </SelectWithOther>
  )
}
