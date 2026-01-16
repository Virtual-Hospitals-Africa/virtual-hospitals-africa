import { Button } from './Button.tsx'
import { PhoneIcon } from './icons/heroicons/outline.tsx'

export function EmergencyCallButton({ organization_id }: {
  organization_id: string
}) {
  return (
    <Button
      type='submit'
      variant='destructive'
      className='w-full'
      method='POST'
      action={`/app/organizations/${organization_id}/patients/start-emergency-escalation`}
      left_icon={<PhoneIcon />}
    >
      Emergency
    </Button>
  )
}
