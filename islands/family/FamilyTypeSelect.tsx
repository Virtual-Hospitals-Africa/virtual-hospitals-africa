import { FAMILY_TYPES } from '../../shared/family.ts'
import SelectWithOther from '../SelectWithOther.tsx'

export default function FamilyTypeSelect({ name }: { name: string }) {
  return (
    <SelectWithOther
      name={name}
      required
    >
      {FAMILY_TYPES.map((type) => (
        <option value={type}>
          {type}
        </option>
      ))}
    </SelectWithOther>
  )
}
