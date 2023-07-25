import cls from '../../../util/cls.ts'
import { Button } from '../Button.tsx'

type FormButtonsProps = {
  className?: string
  submitText?: string
  cancelText?: string
  cancelAction?: () => void
}

export default function FormButtons(
  {
    className,
    submitText = 'Submit',
    cancelText = 'Cancel',
    cancelAction = () => window.history.back(),
  }: FormButtonsProps = {},
) {
  return (
    <div className={cls('container grid gap-x-2 grid-cols-2', className)}>
      <Button
        type='button'
        variant='outline'
        color='white'
        onClick={cancelAction}
      >
        {cancelText}
      </Button>
      <Button type='submit'>{submitText}</Button>
    </div>
  )
}
