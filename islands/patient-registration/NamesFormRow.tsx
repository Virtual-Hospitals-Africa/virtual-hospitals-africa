import FormRow from '../../components/library/FormRow.tsx'
import { Names } from '../../types.ts'
import { useSignal, useSignalEffect } from '@preact/signals'
import { TextInput } from '../form/inputs/text.tsx'

export function NamesFormRow(
  { names }: { names: Partial<Names> },
) {
  const preferred_name_dirty = useSignal<boolean>(!!names?.preferred_name)
  const preferred_name = useSignal(names?.preferred_name || '')
  const first_names = useSignal(names?.first_names || '')

  useSignalEffect(() => {
    if (!preferred_name_dirty.value) {
      preferred_name.value = first_names.value.trim().split(' ')[0]
    }
  })

  return (
    <FormRow>
      <TextInput
        name='first_names'
        signal={first_names}
        required
        placeholder='Given names'
      />
      <TextInput
        name='surname'
        value={names?.surname}
        required
        placeholder='Family name'
      />
      <TextInput
        name='preferred_name'
        signal={preferred_name}
        required
        onInput={() => {
          preferred_name_dirty.value = true
        }}
        placeholder='Preferred name'
      />
    </FormRow>
  )
}
