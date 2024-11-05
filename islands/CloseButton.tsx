import { Button } from '../components/library/Button.tsx'
import { XMarkIcon } from '../components/library/icons/heroicons/outline.tsx'

export function CloseButton(
  { size, close }: { size: 'md' | 'lg'; close(): void },
) {
  return (
    <Button
      variant='ghost'
      type='button'
      className='absolute top-2 right-2'
      onClick={close}
    >
      <XMarkIcon className={size === 'md' ? 'w-4 h-4' : 'w-6 h-6'} />
    </Button>
  )
}
