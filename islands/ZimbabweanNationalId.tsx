import { JSX } from 'preact'

import { Maybe } from '../types.ts'
import { useSignal } from '@preact/signals'
import { CheckboxInput } from './form/inputs/checkbox.tsx'
import { TextInput } from './form/inputs/text.tsx'

export function ZimbabweanNationalIdFormGroup({ national_id_number }: {
  national_id_number: Maybe<string>
}) {
  const no_national_id = useSignal(false)
  return (
    <>
      <ZimbabweanNationalIdInput
        value={national_id_number}
        no_national_id_checked={no_national_id.value}
      />
      <CheckboxInput
        name='no_national_id'
        label='Patient has no national id'
        checked={no_national_id.value}
        onInput={({ currentTarget }) => no_national_id.value = currentTarget.checked}
      />
    </>
  )
}
export function ZimbabweanNationalIdInput(
  { value, no_national_id_checked }: {
    value?: Maybe<string>
    no_national_id_checked?: boolean
  },
) {
  const handleIdInput = (e: JSX.TargetedEvent<HTMLInputElement>) => {
    const input_element = e.currentTarget
    const previous_value = input_element.getAttribute('data-prev-value') || ''
    const is_removing = previous_value.length > e.currentTarget.value.length

    let formatted = input_element.value
    // format to match 00-000000 D 00
    if (formatted.length === 2 && !is_removing) {
      formatted += '-'
    }
    if (formatted.length === 9 && !is_removing) {
      formatted += ' '
    }
    if (formatted.length === 11 && !is_removing) {
      formatted += ' '
    }

    formatted = formatted.replace('  ', ' ')
    formatted = formatted.replace('--', '-')

    if (formatted.length > 14) {
      formatted = formatted.slice(0, 14)
    }
    input_element.value = formatted
    input_element.setAttribute('data-prev-value', formatted)
  }

  return (
    <TextInput
      name='national_id_number'
      label='National ID Number'
      value={value}
      pattern='^\d{2}-\d{6,7}\s[a-zA-Z]\s\d{2}$'
      placeholder='00-000000 D 00'
      onInput={handleIdInput}
      required={!no_national_id_checked}
      disabled={no_national_id_checked}
    />
  )
}
