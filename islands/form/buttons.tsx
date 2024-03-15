import { ComponentChildren } from 'preact'
import cls from '../../util/cls.ts'
import { Button } from '../../components/library/Button.tsx'

type FormButtonsProps = {
  className?: string
  submitText?: string
  cancel?: {
    text?: string
    href: string
  }
  name?: string
  value?: string
}

export function ButtonsContainer(
  { className, children }: { className?: string; children: ComponentChildren },
) {
  return (
    <div className={cls('container grid gap-x-2 grid-cols-2', className)}>
      {children}
    </div>
  )
}

export default function FormButtons(
  {
    className,
    submitText = 'Submit',
    cancel,
    name,
    value,
  }: FormButtonsProps = {},
) {
  return (
    <ButtonsContainer className={className}>
      {cancel && (
        <Button
          type='button'
          variant='outline'
          color='blue'
          href={cancel.href}
        >
          {cancel.text || 'Cancel'}
        </Button>
      )}
      <Button type='submit' name={name} value={value}>{submitText}</Button>
    </ButtonsContainer>
  )
}
