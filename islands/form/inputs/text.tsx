import { Maybe } from '../../../types.ts'
import { InputProps, InternalInput } from './_internal.tsx'

export function TextInput(
  props: InputProps & {
    type?: 'text' | 'email' | 'tel'
    value?: Maybe<string>
  },
) {
  return <InternalInput {...props} />
}
