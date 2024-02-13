import { JSX } from 'preact'
import { CheckboxInput, TextInput } from '../components/library/form/Inputs.tsx'
import { Signal } from '@preact/signals'
import { assert } from 'std/assert/assert.ts'

export default function NationalIdInputCheckbox(
  { no_national_id }: {
    no_national_id: Signal<boolean>
  },
) {
  const handleIdInput = (e: JSX.TargetedEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement
    console.log(`Checked ${target.checked}`)
    assert(target)
    no_national_id.value = target.checked
  }

  return (
    <CheckboxInput
      name='no_national_id'
      label='Patient has no national id'
      checked={no_national_id.value}
      onInput={handleIdInput}
    />
  )
}
