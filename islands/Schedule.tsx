import ScheduleForm from './schedule-form.tsx'
import Appointments from '../components/calendar/Appointments.tsx'
import { HealthWorkerAppointmentSlot } from '../types.ts'
import { useCallback, useState } from 'preact/hooks'
import { assert } from 'std/assert/assert.ts'
import { JSX } from 'preact'

export default function Schedule(
  props: { slots?: HealthWorkerAppointmentSlot[]; url: URL },
) {
  const [slots, setSlots] = useState<HealthWorkerAppointmentSlot[]>(
    props.slots || [],
  )

  const onSubmit = useCallback(
    (event: JSX.TargetedEvent<HTMLFormElement, Event>) => {
      event.preventDefault()
      const form = event.target
      assert(form instanceof HTMLFormElement)
      const formData = new FormData(form)

      const url = new URL(props.url)
      url.search = new URLSearchParams(formData as any).toString()

      fetch(url, {
        headers: { accept: 'application/json' },
      }).then(async (response) => {
        const nextSlots = await response.json()
        assert(Array.isArray(nextSlots))
        assert(
          nextSlots.every((slot) =>
            slot && typeof slot === 'object' && slot.type === 'slot'
          ),
        )
        setSlots(nextSlots)
      })
    },
    [setSlots],
  )

  return (
    <>
      <ScheduleForm
        onSubmit={onSubmit}
      />

      {!!slots.length && (
        <Appointments
          headerText='Slots available'
          appointments={slots}
          url={props.url}
        />
      )}
    </>
  )
}
