import { computed, effect, Signal, useSignal } from '@preact/signals'
import { Maybe } from '../types.ts'
import Search, { SearchProps } from './Search.tsx'

type SelectWithOtherProps<T extends string> =
  & Omit<
    SearchProps<{
      id?: unknown
      name: string
    }>,
    'options' | 'onSelect' | 'value' | 'onQuery' | 'signal'
  >
  & {
    options: T[]
    value?: T
    signal?: Signal<Maybe<T>>
    onSelect?: (value: T | undefined) => void
  }

export default function SelectWithOther<T extends string>(
  { name, value, signal, options, onSelect, ...props }: SelectWithOtherProps<T>,
) {
  const search = useSignal<string>(value ?? '')
  const matching_options = computed(() =>
    options.filter((option) =>
      option.toLowerCase().includes(search.value.toLowerCase())
    ).map((option) => ({
      id: option,
      name: option,
    }))
  )

  // Create a derived signal that converts between T and { id: T, name: T }
  const derived_signal = useSignal<Maybe<{ id: T; name: T }>>(
    value ? { id: value, name: value } : undefined,
  )

  // Sync derived signal to caller's signal
  if (signal) {
    effect(() => {
      const selected = derived_signal.value
      signal.value = selected?.id as T
    })

    // Sync caller's signal to derived signal
    effect(() => {
      const caller_value = signal.value
      if (caller_value) {
        derived_signal.value = { id: caller_value, name: caller_value }
      } else {
        derived_signal.value = undefined
      }
    })
  }

  return (
    <Search
      {...props}
      name={name ?? undefined}
      just_name
      addable={{
        formatDisplay: (query) => query,
      }}
      options={matching_options.value}
      onQuery={(query) => {
        search.value = query
        if (signal) {
          signal.value = null
        }
      }}
      onSelect={(value) => onSelect?.(value?.id as T)}
      signal={derived_signal}
      value={value &&
        matching_options.value.find((option) => option.id === value)}
    />
  )
}
