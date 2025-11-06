import { SelectHTMLAttributes } from 'preact'
import { Signal, useSignalEffect } from '@preact/signals'
import { SelectWithOptions } from './form/inputs/select_with_options.tsx'
import { AppUser, DOCTOR_SPECIALTIES, NURSE_SPECIALTIES } from '../types.ts'

export function SpecialtySelectWithKnownOptions(
  { options, specialty, onChange }: {
    options: string[]
    specialty: string | null
    onChange?: SelectHTMLAttributes<HTMLSelectElement>['onChange']
  },
) {
  if (!options.length) {
    return null
  }
  const prettierSpecialtyName = (specialty_name: string): string => {
    const name = specialty_name.replaceAll('_', ' ')
    return name.charAt(0).toUpperCase() + name.slice(1)
  }

  return (
    <SelectWithOptions
      name='specialty'
      label='Specialty'
      required
      value={specialty ?? undefined}
      onChange={onChange}
      options={options.map((s) => ({
        label: prettierSpecialtyName(s),
        value: s,
      }))}
    />
  )
}

export function specialtyOptions(profession: AppUser): string[] {
  switch (profession) {
    case 'nurse':
      return NURSE_SPECIALTIES
    case 'doctor':
      return DOCTOR_SPECIALTIES
    default:
      return []
  }
}

export function SpecialtySelect({ profession, specialty }: {
  profession: AppUser
  specialty: Signal<string | null>
}) {
  const specialty_options = specialtyOptions(profession)

  useSignalEffect(() => {
    if (!specialty_options.includes(specialty.value as string)) {
      specialty.value = specialty_options[0] || null
    }
  })

  return (
    <SpecialtySelectWithKnownOptions
      specialty={specialty.value}
      options={specialty_options}
      onChange={(event) => specialty.value = event.currentTarget.value}
    />
  )
}
