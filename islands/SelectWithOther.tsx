import { computed, useSignal } from '@preact/signals'
import Search, { SearchProps } from './Search.tsx'

type SelectWithOtherProps<T extends string> =
  & Omit<
    SearchProps<{
      id?: unknown
      name: string
    }>,
    'options' | 'onSelect' | 'value' | 'onQuery'
  >
  & {
    options: T[]
    value?: T
    onSelect?: (value: T | undefined) => void
  }

export default function SelectWithOther<T extends string>(
  { name, value, options, onSelect, ...props }: SelectWithOtherProps<T>,
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

  return (
    <Search
      {...props}
      name={name ?? undefined}
      addable={{
        formatDisplay: (query) => query,
      }}
      options={matching_options.value}
      onQuery={(query) => search.value = query}
      onSelect={(value) => onSelect?.(value?.id as T)}
    />
  )
}
