import { useSignal } from '@preact/signals'
import { PatientIntake, Sendable } from '../../types.ts'
import { Button } from '../../components/library/Button.tsx'
import { SendToSidebar } from './Sidebar.tsx'

export function SendToButton(
  { patient, sendables }: { patient: PatientIntake; sendables: Sendable[] },
) {
  const open = useSignal(false)

  return (
    <>
      <Button
        type='button'
        variant='outline'
        color='blue'
        className='flex-1 max-w-xl'
        onClick={() => open.value = true}
      >
        Send to
      </Button>
      <SendToSidebar
        patient={patient}
        sendables={sendables}
        open={open.value}
        close={() => open.value = false}
      />
    </>
  )
}
