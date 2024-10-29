import { MakeAppointments } from '../../components/library/icons/MakeAppointments.tsx'
import { DeclareEmergency } from '../../components/library/icons/DeclareEmergency.tsx'
import { RequestReview } from '../../components/library/icons/RequestReview.tsx'
import { PickedMakeAppointments } from '../../components/library/icons/PickedMakeAppointments.tsx'
import { PickedDeclareEmergency } from '../../components/library/icons/PickedDeclareEmergency.tsx'
import { PickedRequestReview } from '../../components/library/icons/PickedRequestReview.tsx'
import cls from '../../util/cls.ts'
import { useSignal } from '@preact/signals'
import type { JSX } from 'preact'

const REQUEST_TYPES: { [key: string]: string } = {
  request_review: 'Request Review',
  make_appointment: 'Make Appointment',
  declare_emergency: 'Declare Emergency',
}

type RequestType = keyof typeof REQUEST_TYPES

const DefaultIconComponents: { [key: string]: JSX.Element } = {
  request_review: <RequestReview />,
  make_appointment: <MakeAppointments />,
  declare_emergency: <DeclareEmergency />,
}

const PickedIconComponents: { [key: string]: JSX.Element } = {
  request_review: <PickedRequestReview />,
  make_appointment: <PickedMakeAppointments />,
  declare_emergency: <PickedDeclareEmergency />,
}

export function SendToRequestRadioButtons({
  form,
  options,
}: {
  form: string
  options: string[]
}) {
  const selected_option = useSignal<string | null>(null)

  return (
    <fieldset className='flex flex-col gap-4'>
      <div className='flex flex-col gap-2'>
        {options.map((option) => {
          const is_selected = selected_option.value === option

          return (
            <label key={option} className='flex items-center gap-2'>
              <input
                form={form}
                type='radio'
                name='send_to.request_type'
                value={option}
                checked={is_selected}
                onChange={() => selected_option.value = option}
                className='hidden'
              />
              <div
                className={cls(
                  'flex items-center gap-5 p-2 cursor-pointer rounded-md',
                  is_selected && 'bg-white',
                )}
                onClick={() => selected_option.value = option}
              >
                <div className='icon-container'>
                  {is_selected
                    ? PickedIconComponents[option]
                    : DefaultIconComponents[option]}
                </div>
                <span
                  className={cls(
                    'text-lg font-medium',
                    is_selected && 'border-b-2 border-current pb-0.5',
                  )}
                  style={{
                    lineHeight: '1.1',
                  }}
                >
                  {REQUEST_TYPES[option]}
                </span>
              </div>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
