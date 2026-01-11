import { Maybe, PHARMACY_TYPES, PharmacyType } from '../../../types.ts'
import { Select } from './select.tsx'

export function PharmacyTypeSelect({ value }: { value?: Maybe<PharmacyType> }) {
  return (
    <Select name='pharmacies_types' label='Specialty' required>
      {PHARMACY_TYPES.map((type) => <option key={type} value={type} label={type} selected={value === type} />)}
    </Select>
  )
}
