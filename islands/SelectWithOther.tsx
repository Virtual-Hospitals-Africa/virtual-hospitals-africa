import { computed, useSignal } from '@preact/signals'
import Search, {
  OptionLike,
  SearchPropsCommon,
  SearchPropsSingular,
} from './Search.tsx'

type SelectWithOtherProps<T extends string> =
  & Omit<
    & SearchPropsSingular<OptionLike>
    & SearchPropsCommon<OptionLike>,
    'options' | 'onSelect' | 'value' | 'onQuery' | 'signal'
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
      just_name
      addable={{
        formatDisplay: (query) => query,
      }}
      options={matching_options.value}
      onQuery={(query) => {
        search.value = query
      }}
      onSelect={(value) => onSelect?.(value?.id as T)}
      value={value &&
        matching_options.value.find((option) => option.id === value)}
    />
  )
}
