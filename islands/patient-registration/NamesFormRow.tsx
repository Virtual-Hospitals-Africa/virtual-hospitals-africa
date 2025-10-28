import FormRow from '../../components/library/FormRow.tsx'
import { RenderedPatient } from '../../types.ts'
import { useSignal, useSignalEffect } from '@preact/signals'
import { TextInput } from '../form/inputs/text.tsx'

export function NamesFormRow(
  { names }: { names: Partial<RenderedPatient['names']> },
) {
  const preferred_name_dirty = useSignal<boolean>(!!names?.preferred)
  const preferred_name = useSignal(names?.preferred || '')
  const first_names = useSignal(names?.first || '')

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
