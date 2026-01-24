import { Button } from './Button.tsx'
import { PhoneIcon } from './icons/heroicons/outline.tsx'

type EmergencyCallButtonProps = {
  type: 'submit'
  method: 'POST'
  action: string
} | {
  href: string
}

export function EmergencyCallButton(props: EmergencyCallButtonProps) {
  return (
    <Button
      variant='destructive'
      className='w-full'
      left_icon={<PhoneIcon />}
      {...props}
    >
      Emergency
    </Button>
  )
}
