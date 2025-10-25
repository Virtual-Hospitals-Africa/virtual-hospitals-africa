import { Maybe, NURSE_SPECIALTIES } from '../../../types.ts'
import { Select, SelectProps } from './select.tsx'

export function NurseSpecialtySelect({
  value,
  onChange,
}: {
  value?: Maybe<string>
  onChange?: SelectProps['onChange']
}) {
  const prettierSpecialtyName = (specialtyName: string): string => {
    const name = specialtyName.replaceAll('_', ' ')
    return name.charAt(0).toUpperCase() + name.slice(1)
  }

  return (
    <Select name='specialty' label='Specialty' required onChange={onChange}>
      {NURSE_SPECIALTIES.map((specialty) => (
        <option
          value={specialty}
          label={prettierSpecialtyName(specialty)}
          selected={value === specialty}
          className='capitalize'
        />
      ))}
    </Select>
  )
}
