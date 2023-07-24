import cls from '../../../util/cls.ts'
import { Button } from '../Button.tsx'

type StepButtonProps = {
  nextActionType: 'step'
  nextActionHref: string
}

type SubmitButtonProps = {
  nextActionType?: 'submit'
  nextActionHref?: never
}

type FormButtonsProps = {
  className?: string
  submitText?: string
  cancelText?: string
  cancelHref: string
} & (StepButtonProps | SubmitButtonProps)

export default function FormButtons(
  { className, submitText = 'Submit', cancelText = 'Cancel', nextActionType = 'submit', nextActionHref, cancelHref }:
    FormButtonsProps,
) {
  return (
    <div className={cls('container grid gap-x-2 grid-cols-2', className)}>
      <Button
        type='button'
        variant='outline'
        color='white'
        href={cancelHref}
      >
        {cancelText}
      </Button>
      <Button
        href={nextActionHref}
        type={nextActionType === 'step' ? 'button' : 'submit'}
      >{submitText}</Button>
    </div>
  )
}
