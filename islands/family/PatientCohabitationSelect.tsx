import { PATIENT_COHABITATIONS } from '../../shared/family.ts'
import SelectWithOther from '../SelectWithOther.tsx'

export default function PatientCohabitationSelect({ name }: { name: string }) {
  return (
    <SelectWithOther
      name={name}
      required
    >
      {PATIENT_COHABITATIONS.map((c) => (
        <option value={c}>
          {c}
        </option>
      ))}
    </SelectWithOther>
  )
}
