import { CheckboxInput } from './form/Inputs.tsx'
import { Signal } from '@preact/signals'

export default function NationalIdInputCheckbox(
  { no_national_id }: {
    no_national_id: Signal<boolean>
  },
) {
  return (
    <CheckboxInput
      name='no_national_id'
      label='Patient has no national id'
      checked={no_national_id.value}
      onInput={({ currentTarget }) =>
        no_national_id.value = currentTarget.checked}
    />
  )
}
