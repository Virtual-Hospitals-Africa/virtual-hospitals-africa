import type { JSX } from 'preact'
import isObjectLike from '../../util/isObjectLike.ts'

type JsonSerializable =
  | string
  | number
  | boolean
  | null
  | undefined
  | JsonSerializable[]
  | { [key: string]: JsonSerializable }

export function HiddenInput(
  { value, form, name }: {
    value?: JsonSerializable
    form?: string
    name?: string
  },
): JSX.Element | null {
  if (!value) {
    return null
  }
  if (Array.isArray(value)) {
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
        {Object.keys(value).map((key) => (
          <HiddenInput
            value={value[key]}
            form={form}
            name={name ? `${name}.${key}` : key}
          />
        ))}
      </>
    )
  }
  return (
    <input
      type='hidden'
      value={value === true ? 'true' : value}
      form={form}
      name={name}
    />
  )
}
