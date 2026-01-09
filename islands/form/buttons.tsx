import { ComponentChildren, type JSX } from 'preact'
import cls from '../../util/cls.ts'
import { Button } from '../../components/library/Button.tsx'
import { ArrowRightIcon } from '../../components/library/icons/heroicons/mini.tsx'

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
      className={cls(
        'bg-white flex gap-6 w-full justify-end px-6 border-t border-gray-200',
        className,
      )}
    >
      {children}
    </div>
  )
}

export default function FormButtons(
  {
    className,
    submitText = 'Next',
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
          variant='secondary'
          href={cancel.href}
        >
          {cancel.text || 'Cancel'}
        </Button>
      )}
      <Button
        type={onClick ? 'button' : 'submit'}
        name={name}
        value={value}
        onSubmit={onSubmit}
        onClick={onClick}
        right_icon={<ArrowRightIcon className='size-5' />}
      >
        {submitText}
      </Button>
    </ButtonsContainer>
  )
}
