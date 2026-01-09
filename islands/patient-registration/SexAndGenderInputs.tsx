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
  const gender_set_directly = useSignal(false)

  useSignalEffect(() => {
    if (!sex.value) return
    if (gender.value) return
    if (gender_dirty.value) return
    gender_options.value = genderOptions(sex.value)
    gender.value = gender_options.value[0]
    gender_set_directly.value = true
  })

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
        key={gender_set_directly.value}
        required
        placeholder='Gender'
        label='Gender'
        name='gender'
        value={gender.value ?? undefined}
        onSelect={(value) => {
          gender.value = value ?? null
          gender_dirty.value = true
        }}
        options={gender_options.value}
      />
    </>
  )
}
