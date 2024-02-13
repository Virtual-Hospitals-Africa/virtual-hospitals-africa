import { JSX } from 'preact'
import { TextInput } from '../components/library/form/Inputs.tsx'
import { Maybe } from '../types.ts'
import { Signal } from '@preact/signals'

export default function NationalIdInput({ value, no_national_id }: { value?: Maybe<string>, no_national_id: Signal<boolean> }) {
  const handleIdInput = (e: JSX.TargetedEvent<HTMLInputElement>) => {
    if (e.target && 'value' in e.target && typeof e.target.value === 'string') {
      const inputElement = e.target as HTMLInputElement
      const previousValue = inputElement.getAttribute('data-prev-value') || ''
      const isRemoving = previousValue.length > e.target.value.length

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
  }

  return (
    <TextInput
      name='national_id_number'
      label='National ID Number'
      value={value}
      pattern='^\d{2}-\d{6,7}\s[a-zA-Z]\s\d{2}$'
      placeholder='00-000000 D 00'
      onInput={handleIdInput}
      required={!no_national_id?.value}
    />
  )
}
