import { Button } from '../components/library/Button.tsx'
import { PhoneIcon } from '../components/library/icons/heroicons/mini.tsx'
import { PhoneIcon as PhoneIconSolid } from '../components/library/icons/heroicons/solid.tsx'
import cls from '../util/cls.ts'
import { useSidebarCollapsed } from './sidebar/useSidebarCollapsed.tsx'

type EmergencyCallButtonProps = {
  type: 'submit'
  method: 'POST'
  action: string
} | {
  href: string
} | {
  // Submit an existing form by id. Used when this button sits inside another form.
  form: string
}

export function EmergencyCallButton(props: EmergencyCallButtonProps) {
  const collapsed_sidebar = useSidebarCollapsed()
  const collapsed = 'form' in props ? false : collapsed_sidebar.value

  if ('form' in props) {
    return (
      <Button
        variant='destructive'
        type='submit'
        form={props.form}
        size='xl'
        className='w-auto shrink-0'
      >
        <span className='flex items-center gap-2'>
          <PhoneIconSolid />
          Emergency
        </span>
      </Button>
    )
  }

  const text_style = {
    width: collapsed ? '0' : 'auto',
    color: collapsed ? 'transparent' : '',
  }
  return (
    <Button
      variant='destructive'
      className={cls('w-full transition-all gap-0', collapsed && 'p-0!')}
      {...props}
    >
      <span className={cls('transition-all', collapsed ? 'ml-0.5' : '-ml-1')}>
        <PhoneIcon />
      </span>
      <span className='transition-all duration-200 ease-in-out' style={text_style}>Emergency</span>
    </Button>
  )
}
