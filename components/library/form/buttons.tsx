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

export default function FormButtons(
  {
    className,
    submitText = 'Submit',
    cancel,
  }: FormButtonsProps = {},
) {
  return (
    <div className={cls('container grid gap-x-2 grid-cols-2', className)}>
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
    </div>
  )
}
