import { Maybe, RenderedPatient, Sex } from '../../types.ts'
import { useSignal, useSignalEffect } from '@preact/signals'
import SelectWithOther from '../SelectWithOther.tsx'
import { SelectWithOptions } from '../form/inputs/select_with_options.tsx'

function genderOptions(sex: Maybe<Sex>) {
  switch (sex) {
    case 'female':
      return ['woman', 'trans man', 'prefer not to say']
    case 'male':
      return ['man', 'trans woman', 'prefer not to say']
    case 'other':
      return []
    case 'prefer not to say':
      return ['prefer not to say']
    default:
      return [
        'man',
        'woman',
        'non-binary',
      ]
  }
}

export function SexAndGenderInputs(
  initial_values: Pick<RenderedPatient, 'sex' | 'gender'>,
) {
  const sex = useSignal(initial_values.sex)
  const gender = useSignal(initial_values.gender)
  const gender_dirty = useSignal(!!initial_values.gender)
  const gender_options = useSignal(genderOptions(initial_values.sex))

  useSignalEffect(() => {
    console.log('useSignalEffect', sex.value, gender.value)
    if (!sex.value) return
    gender_options.value = genderOptions(sex.value)
    if (gender_dirty.value) return
    gender.value = gender_options.value[0]
  })

  console.log({ initial_values, x: gender.value })
  return (
    <>
      <SelectWithOptions
        required
        name='sex'
        label='Sex'
        onChange={(event) =>
          sex.value = (event.currentTarget.value ?? null) as Sex | null}
        blank_option
        value={sex.value ?? undefined}
        options={[
          'male',
          'female',
          'other',
          'prefer not to say',
        ]}
      />
      <SelectWithOther
        required
        placeholder='Gender'
        label='Gender'
        name='gender'
        value={initial_values.gender ?? undefined}
        onSelect={(value) => {
          gender.value = value ?? null
          gender_dirty.value = true
        }}
        options={gender_options.value}
      />
    </>
  )
}
