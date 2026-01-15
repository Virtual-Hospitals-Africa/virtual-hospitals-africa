import { Maybe } from '../../../types.ts'
import { InternalInput, WrapperInputProps } from './_internal.tsx'

type DateInputProps = Partial<WrapperInputProps<HTMLInputElement, string>> & {
  value?: Maybe<string>
  min?: Maybe<string>
  max?: Maybe<string>
}

const YYYY_MM_DD_REGEX = /^\d{4}-\d{2}-\d{2}$/

export function DateInput({
  name = 'date',
  ...props
}: DateInputProps) {
  return (
    <InternalInput
      {...props}
      name={name}
      type='date'
      onPaste={(event) => {
        const pasted_text = event.clipboardData?.getData('text')?.trim()
        if (!pasted_text) return
        if (!YYYY_MM_DD_REGEX.test(pasted_text)) return
        event.preventDefault()
        const input = event.currentTarget as HTMLInputElement
        input.value = pasted_text
        input.dispatchEvent(new Event('input', { bubbles: true }))
      }}
    />
  )
}
