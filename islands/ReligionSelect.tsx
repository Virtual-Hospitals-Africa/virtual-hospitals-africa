import { RELIGIONS } from '../shared/family.ts'
import SelectWithOther from './SelectWithOther.tsx'

export default function ReligionSelect({ name }: { name: string }) {
  return (
    <SelectWithOther
      name={name}
      required
    >
      {RELIGIONS.map((religion) => (
        <option value={religion}>
          {religion}
        </option>
      ))}
    </SelectWithOther>
  )
}
