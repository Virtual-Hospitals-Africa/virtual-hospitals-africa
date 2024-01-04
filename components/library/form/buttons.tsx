import { ComponentChildren } from 'https://esm.sh/v128/preact@10.19.2/src/index.js'
import cls from '../../../util/cls.ts'
import { Button } from '../Button.tsx'

type FormButtonsProps = {
  className?: string
  submitText?: string
  cancel?: {
    text?: string
    href: string
  }
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
      <Button type='submit'>{submitText}</Button>
    </ButtonsContainer>
  )
}
