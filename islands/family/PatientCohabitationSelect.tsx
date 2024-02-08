import { SelectWithOptions } from '../../components/library/form/Inputs.tsx'
import { PATIENT_COHABITATIONS } from '../../shared/family.ts'

export default function PatientCohabitationSelect(
  { name, required, label, value, type }: {
    name: string
    label: string
    required?: boolean
    value?: string
    type?: string
  },
) {
  const filteredOptions = PATIENT_COHABITATIONS.filter((val) => {
    switch (type) {
      case '2 married parents':
      case 'Same-sex marriage':
      case 'Grandparent-led':
      case 'Orphan':
        return false
      case 'Divorced':
      case 'Extended':
      case 'Blended':
        return true
      case 'Child-headed':
        return ['Sibling', 'Uncle or Aunt', 'Other Relative'].includes(val!)
      case 'Polygamous/Compound':
      case 'Single Parent':
        return val !== 'Orphanage'
      default:
        return true
    }
  })
  return (
    <>
      {filteredOptions.length > 0 &&
        (
          <SelectWithOptions
            label={label}
            name={name}
            required={required}
            blank_option
            value={value}
            options={filteredOptions.map((p) => (
              { value: p }
            ))}
          />
        )}
    </>
  )
}
