import { SelectWithOptions } from '../../components/library/form/Inputs.tsx'
import { PATIENT_COHABITATIONS } from '../../shared/family.ts'
import Select from '../SelectWithOther.tsx'

export default function PatientCohabitationSelect(
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
      options={PATIENT_COHABITATIONS.map((p) => (
        { value: p }
      ))}
    />
  )
}
