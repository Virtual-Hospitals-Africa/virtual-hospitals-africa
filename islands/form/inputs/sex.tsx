import { Sex } from '../../../db.d.ts'
import { Maybe } from '../../../types.ts'
import { SelectWithOptions } from './select_with_options.tsx'

export function SexSelect({ value }: { value?: Maybe<Sex> }) {
  return (
    <SelectWithOptions
      required
      name='sex'
      label='Sex'
      value={value ?? undefined}
      blank_option
      options={[
        'male',
        'female',
        'other',
        'prefer not to say',
      ]}
    />
  )
}
