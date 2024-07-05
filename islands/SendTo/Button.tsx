import { useSignal } from '@preact/signals'
import { Sendable } from '../../types.ts'
import { Button } from '../../components/library/Button.tsx'
import { SendToSidebar } from './Sidebar.tsx'

export function SendToButton({ sendables }: { sendables: Sendable[] }) {
  const open = useSignal(false)

  return (
    <div className='flex-1 max-w-xl'>
      <Button
        type='button'
        variant='outline'
        color='blue'
        className='flex-1 max-w-xl'
        onClick={() => open.value = true}
      >
        Send to
      </Button>
      <SendToSidebar open={open} sendables={sendables} />
    </div>
  )
}
