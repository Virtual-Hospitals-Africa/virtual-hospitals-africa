import { ComponentChildren, type JSX } from 'preact'
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
  onSubmit?: (e: JSX.TargetedEvent<HTMLButtonElement>) => void
  onClick?: (e: JSX.TargetedEvent<HTMLButtonElement>) => void
}

export function ButtonsContainer(
  { className, children }: { className?: string; children: ComponentChildren },
) {
  return (
    <div
      className={cls('flex gap-x-2 w-full justify-center', className)}
    >
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
    onSubmit,
    onClick,
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
          className='flex-1 max-w-xl'
        >
          {cancel.text || 'Cancel'}
        </Button>
      )}
      <Button
        type={onClick ? 'button' : 'submit'}
        name={name}
        value={value}
        className='flex-1 max-w-xl'
        onSubmit={onSubmit}
        onClick={onClick}
      >
        {submitText}
      </Button>
    </ButtonsContainer>
  )
}
