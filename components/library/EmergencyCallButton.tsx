import { Button } from './Button.tsx'
import { PhoneIcon } from './icons/heroicons/outline.tsx'

export function EmergencyCallButton({ organization_id }: {
  organization_id: string
}) {
  return (
    <Button
      variant='destructive'
      className='w-full'
      href={`/app/organizations/${organization_id}/emergency_call`}
      left_icon={<PhoneIcon />}
    >
      Emergency
    </Button>
  )
}
