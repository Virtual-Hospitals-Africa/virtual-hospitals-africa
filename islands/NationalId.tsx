import { JSX } from 'preact'
import { CheckboxInput, TextInput } from './form/Inputs.tsx'
import { Maybe } from '../types.ts'
import { useSignal } from '@preact/signals'
// fix: ID check box layout
import FormRow from '../components/library/FormRow.tsx'

export function NationalIdFormGroup({ national_id_number }: {
  national_id_number: Maybe<string>
}) {
  const no_national_id = useSignal(false)
  return (
    <>
      <NationalIdInput
        value={national_id_number}
        no_national_id_checked={no_national_id.value}
      />
      {/* fix: ID check box layout and context*/}
      <FormRow>
        <CheckboxInput
          name='no_national_id'
          label='Patient has no National ID'
          checked={no_national_id.value}
          onInput={({ currentTarget }) =>
            no_national_id.value = currentTarget.checked}
        />
      </FormRow>
    </>
  )
}
export function NationalIdInput(
  { value, no_national_id_checked }: {
    value?: Maybe<string>
    no_national_id_checked?: boolean
  },
) {
  const handleIdInput = (e: JSX.TargetedEvent<HTMLInputElement>) => {
    const inputElement = e.currentTarget
    const previousValue = inputElement.getAttribute('data-prev-value') || ''
    const isRemoving = previousValue.length > e.currentTarget.value.length

    let formatted = inputElement.value
    // format to match 00-000000 D 00
    if (formatted.length === 2 && !isRemoving) {
      formatted += '-'
    }
    if (formatted.length === 9 && !isRemoving) {
      formatted += ' '
    }
    if (formatted.length === 11 && !isRemoving) {
      formatted += ' '
    }

    formatted = formatted.replace('  ', ' ')
    formatted = formatted.replace('--', '-')

    if (formatted.length > 14) {
      formatted = formatted.slice(0, 14)
    }
    inputElement.value = formatted
    inputElement.setAttribute('data-prev-value', formatted)
  }

  return (
    <TextInput
      name='national_id_number'
      //fix: Id input label
      label='National ID'
      value={value}
      pattern='^\d{2}-\d{6,7}\s[a-zA-Z]\s\d{2}$'
      placeholder='00-000000 D 00'
      onInput={handleIdInput}
      required={!no_national_id_checked}
      disabled={no_national_id_checked}
    />
  )
}
