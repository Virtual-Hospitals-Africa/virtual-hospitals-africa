import { Button } from '../Button.tsx'

type FormButtonsProps = {
  submitText?: string
  cancelText?: string
}

export default function FormButtons(
  { submitText = 'Submit', cancelText = 'Cancel' }: FormButtonsProps = {},
) {
  return (
    <div className='container grid gap-x-2 grid-cols-2'>
      <Button
        type='button'
        variant='outline'
        color='white'
        onClick={() => window.history.back()}
      >
        {cancelText}
      </Button>
      <Button type='submit'>{submitText}</Button>
    </div>
  )
}
