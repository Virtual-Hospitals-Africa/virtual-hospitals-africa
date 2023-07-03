import { Button } from '../Button.tsx'

export default function FormButtons() {
  return (
    <div className='container grid gap-x-2 grid-cols-2'>
      <Button
        type='button'
        variant='outline'
        color='white'
        onClick={() => window.history.back()}
      >
        Cancel
      </Button>
      <Button type='submit'>Submit</Button>
    </div>
  )
}
