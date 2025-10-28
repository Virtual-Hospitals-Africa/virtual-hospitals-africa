import { forwardRef } from 'preact/compat'
import { JSX, Ref } from 'preact'
import isObjectLike from '../../../util/isObjectLike.ts'
import { Select, SelectProps } from './select.tsx'

type FlexibleOption<
  V extends JSX.OptionHTMLAttributes<HTMLOptionElement>['value'],
> = V | { value: V; label?: string } | { id: V; name: string }

export const SelectWithOptions = forwardRef(function SelectWithOptions<
  V extends JSX.OptionHTMLAttributes<HTMLOptionElement>['value'],
>(
  {
    options,
    groups,
    blank_option,
    value,
    ...rest
  }:
    & Omit<SelectProps, 'children'>
    & {
      blank_option?: string | true
      value?: V
    }
    & (
      | { options: FlexibleOption<V>[]; groups?: never }
      | {
        options?: never
        groups: {
          label: string
          options: { value: V; label: string }[]
        }[]
      }
    ),
  ref: Ref<HTMLSelectElement>,
) {
  return (
    <Select {...rest} ref={ref}>
      {blank_option && (
        <option value=''>
          {typeof blank_option === 'string' ? blank_option : 'Select'}
        </option>
      )}
      {options?.map((option) =>
        isObjectLike(option) && 'value' in option
          ? (
            <option
              value={option.value}
              label={'label' in option ? option.label : String(option.value)}
              selected={value === option.value}
            />
          )
          : isObjectLike(option) && 'id' in option
          ? (
            <option
              value={option.id}
              label={option.name}
              selected={value === option.id}
            />
          )
          : (
            <option
              value={option}
              label={String(option)}
              selected={value === option}
            />
          )
      )}
      {groups?.map((group) => (
        <optgroup label={group.label}>
          {group.options.map((option) => (
            <option
              value={option.value}
              label={option.label}
              selected={value === option.value}
            />
          ))}
        </optgroup>
      ))}
    </Select>
  )
})
