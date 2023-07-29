import cls from '../../../util/cls.ts'
import { Button } from '../Button.tsx'

type FormButtonsProps = {
  className?: string
  submitText?: string
  cancelText?: string
  cancelHref?: string
}

export default function FormButtons(
  {
    className,
    submitText = 'Submit',
    cancelText = 'Cancel',
    cancelHref = '/app',
  }: FormButtonsProps = {},
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
      <Button type='submit'>{submitText}</Button>
    </div>
  )
}
