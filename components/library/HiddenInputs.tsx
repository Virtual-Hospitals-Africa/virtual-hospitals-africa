import type { JSX } from 'preact'

export function HiddenInputs(
  { inputs, form, prefix = '' }: {
    inputs: Record<string, string>
    form?: string
    prefix?: string
  },
): JSX.Element {
  return (
    <>
      {Object.entries(inputs).map(([name, value]) => (
        <input
          key={name}
          type='hidden'
          name={prefix + name}
          value={value}
          form={form}
        />
      ))}
    </>
  )
}
