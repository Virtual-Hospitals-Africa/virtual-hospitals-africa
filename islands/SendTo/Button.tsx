import { useSignal } from '@preact/signals'
import { SelectedPatient, Sendable } from '../../types.ts'
import { Button } from '../../components/library/Button.tsx'
import { SendToSidebar } from './Sidebar.tsx'

export function SendToButton(
  { form, patient, sendables }: {
    form: 'intake' | 'encounter'
    patient: SelectedPatient
    sendables: Sendable[]
  },
) {
  const open = useSignal(false)

  const handleClick = () => {
    const formElement = document.getElementById(form) as HTMLFormElement;
    if (formElement) {
      if (formElement.checkValidity()) {
        open.value = true;
      } else {
        formElement.reportValidity();
      }
    }
  }

  return (
    <>
      <Button
        type='button'
        variant='outline'
        color='blue'
        className='flex-1 max-w-xl'
        onClick={handleClick}
      >
        Send to
      </Button>
      <SendToSidebar
        form={form}
        patient={patient}
        sendables={sendables}
        open={open.value}
        close={() => open.value = false}
      />
    </>
  )
}
