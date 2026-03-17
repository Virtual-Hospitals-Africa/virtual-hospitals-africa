import { Button } from '../components/library/Button.tsx'
import { PhoneIcon } from '../components/library/icons/heroicons/mini.tsx'
import cls from '../util/cls.ts'
import { useSidebarCollapsed } from './SidebarToggleButton.tsx'

type EmergencyCallButtonProps = {
  type: 'submit'
  method: 'POST'
  action: string
} | {
  href: string
}

export function EmergencyCallButton(props: EmergencyCallButtonProps) {
  const collapsed = useSidebarCollapsed()

  const text_style = {
    width: collapsed.value ? '0' : 'auto',
    color: collapsed.value ? 'transparent' : '',
  }
  return (
    <Button
      variant='destructive'
      className={cls('w-full transition-all gap-0', collapsed.value && 'p-0!')}
      {...props}
    >
      <span className={cls('transition-all', collapsed.value ? 'ml-0.5' : '-ml-1')}>
        <PhoneIcon />
      </span>
      <span className='transition-all duration-200 ease-in-out' style={text_style}>Emergency</span>
    </Button>
  )
}
