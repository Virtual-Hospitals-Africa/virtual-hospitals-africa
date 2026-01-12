import { useSignal } from '@preact/signals'
import { Maybe } from '../types.ts'
import { TextInput } from './form/inputs/text.tsx'

export function SouthAfricanNationalIdFormGroup(
  { national_id_number, previously_completed_step }: {
    national_id_number: Maybe<string>
    previously_completed_step: boolean
  },
) {
  const no_national_id = useSignal(
    !national_id_number && previously_completed_step,
  )
  return (
    <div className='flex flex-col gap-2'>
      <SouthAfricanNationalIdInput
        value={national_id_number}
        no_national_id_checked={no_national_id.value}
      />
      <label className='flex items-center gap-2'>
        <input
          type='checkbox'
          name='no_national_id'
          className='h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600'
          checked={no_national_id.value}
          onInput={({ currentTarget }) => no_national_id.value = currentTarget.checked}
        />
        <span className='text-sm font-medium text-gray-600'>
          Patient has no National ID
        </span>
      </label>
    </div>
  )
}
export function SouthAfricanNationalIdInput(
  { value, no_national_id_checked }: {
    value?: Maybe<string>
    no_national_id_checked?: boolean
  },
) {
  return (
    <TextInput
      name='national_id_number'
      label='National ID Number'
      value={value}
      pattern='^\d{2}[0-1][0-9][0-3]\d\d{4}[0-1]\d{2}$'
      placeholder='5804180116089'
      required={!no_national_id_checked}
      disabled={no_national_id_checked}
    />
  )
}
