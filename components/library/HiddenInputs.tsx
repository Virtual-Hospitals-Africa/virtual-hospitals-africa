import { JSX } from 'preact'

export function HiddenInputs(
  { inputs, form }: { inputs: Record<string, string>; form?: string },
): JSX.Element {
  return (
    <>
      {Object.entries(inputs).map(([name, value]) => (
        <input key={name} type='hidden' name={name} value={value} form={form} />
      ))}
    </>
  )
}
