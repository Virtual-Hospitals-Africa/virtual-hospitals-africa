import { Maybe } from '../../../types.ts'
import { InternalInput, WrapperInputProps } from './_internal.tsx'

type DateInputProps = Partial<WrapperInputProps<HTMLInputElement, string>> & {
  value?: Maybe<string>
  min?: Maybe<string>
  max?: Maybe<string>
}

export function DateInput({
  name = 'date',
  // className,
  ...props
}: DateInputProps) {
  return (
    <InternalInput
      name={name}
      type='date'
      {...props}
    />
  )
}
