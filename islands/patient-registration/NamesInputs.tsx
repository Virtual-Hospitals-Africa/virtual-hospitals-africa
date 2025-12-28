import FormRow from '../../components/library/FormRow.tsx'
import { Names } from '../../types.ts'
import { useSignal, useSignalEffect } from '@preact/signals'
import { TextInput } from '../form/inputs/text.tsx'

function useNamesSignals(names: Partial<Names>) {
  const preferred_name_dirty = useSignal<boolean>(!!names?.preferred_name)
  const preferred_name = useSignal(names?.preferred_name || '')
  const first_names = useSignal(names?.first_names || '')

  useSignalEffect(() => {
    if (!preferred_name_dirty.value) {
      preferred_name.value = first_names.value.trim().split(' ')[0]
    }
  })

  return { preferred_name_dirty, preferred_name, first_names }
}

/** Name inputs without wrapper - use inside FormGrid */
export function NamesInputs(
  { names }: { names: Partial<Names> },
) {
  const { preferred_name_dirty, preferred_name, first_names } = useNamesSignals(
    names,
  )

  return (
    <>
      <TextInput
        name='first_names'
        label='First Name(s)'
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
        label='Preferred Name'
        signal={preferred_name}
        required
        onInput={() => {
          preferred_name_dirty.value = true
        }}
        placeholder='Preferred name'
      />
    </>
  )
}

/** Name inputs wrapped in FormRow - legacy compatibility */
export function NamesFormRow(
  { names }: { names: Partial<Names> },
) {
  const { preferred_name_dirty, preferred_name, first_names } = useNamesSignals(
    names,
  )

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
