import { Maybe } from '../../../types.ts'
import { InputProps, InternalInput } from './_internal.tsx'

// Make this pretty with an icon and/or flag + area code helper
export function PhoneNumberInput(
  props: Omit<InputProps, 'type' | 'min' | 'max'> & {
    value?: Maybe<string>
  },
) {
  return (
    <InternalInput
      type='tel'
      placeholder=''
      {...props}
    />
  )
}
