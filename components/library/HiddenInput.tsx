import type { JSX } from 'preact'

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
  if (typeof value === 'string' || typeof value === 'number') {
    return (
      <input
        type='hidden'
        value={value}
        form={form}
        name={name}
      />
    )
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
