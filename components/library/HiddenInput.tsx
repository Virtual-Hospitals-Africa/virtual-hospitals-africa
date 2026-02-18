import type { JSX } from 'preact'
import isObjectLike from '../../util/isObjectLike.ts'
import { JsonSerializable } from '../../types.ts'

export function HiddenInput(
  { value, form, name }: {
    value?: JsonSerializable
    form?: string
    name?: string
  },
): JSX.Element | null {
  if (value === undefined || value === null) {
    return null
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return null
    }
    return (
      <input
        type='hidden'
        value={JSON.stringify(value)}
        form={form}
        name={name}
      />
    )
  }

  if (isObjectLike(value)) {
    return (
      <>
        {Object.keys(value).map((key) => {
          const x_key = name ? `${name}.${key}` : key
          return (
            <HiddenInput
              key={x_key}
              value={value[key]}
              form={form}
              name={x_key}
            />
          )
        })}
      </>
    )
  }
  return (
    <input
      type='hidden'
      value={typeof value === 'boolean' ? String(value) : value}
      form={form}
      name={name}
    />
  )
}
