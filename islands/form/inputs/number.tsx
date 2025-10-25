import { InternalInput, WrapperInputProps } from './_internal.tsx'

export function NumberInput(
  props: WrapperInputProps<HTMLInputElement, number> & {
    min?: number
    max?: number
  },
) {
  return (
    <InternalInput
      type='text'
      inputmode='numeric'
      {...props}
    />
  )
}
