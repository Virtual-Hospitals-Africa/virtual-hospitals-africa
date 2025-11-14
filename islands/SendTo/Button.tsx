import { useSignal } from '@preact/signals'
import { SelectedPatient, Sendable } from '../../types.ts'
import { Button } from '../../components/library/Button.tsx'
import { SendToSidebar } from './Sidebar.tsx'

export function SendToButton(
  { form, patient, sendables }: {
    form: 'registration' | 'encounter'
    patient: SelectedPatient
    sendables: Sendable[]
  },
) {
  const open = useSignal(false)

  const handleClick = () => {
    const form_element = document.getElementById(form) as HTMLFormElement
    if (form_element) {
      if (form_element.checkValidity()) {
        open.value = true
      } else {
        form_element.reportValidity()
      }
    }
  }

  return (
    <>
      <Button
        type='button'
        variant='secondary'
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
