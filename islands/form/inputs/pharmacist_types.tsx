import { Maybe, PHARMACIST_TYPES, PharmacistType } from '../../../types.ts'
import { Select } from './select.tsx'

export function PharmacistTypeSelect({
  value,
}: {
  value?: Maybe<PharmacistType>
}) {
  return (
    <Select name='pharmacist_type' label='Specialty' required>
      {PHARMACIST_TYPES.map((type) => <option key={type} value={type} label={type} selected={value === type} />)}
    </Select>
  )
}
