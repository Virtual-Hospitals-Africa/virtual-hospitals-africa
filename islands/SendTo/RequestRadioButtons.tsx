import { useState } from 'react'
import { MakeAppointments } from '../../components/library/icons/MakeAppointments.tsx'
import { DeclareEmergency } from '../../components/library/icons/DeclareEmergency.tsx'
import { RequestReview } from '../../components/library/icons/RequestReview.tsx'
import { PickedMakeAppointments } from '../../components/library/icons/PickedMakeAppointments.tsx'
import { PickedDeclareEmergency } from '../../components/library/icons/PickedDeclareEmergency.tsx'
import { PickedRequestReview } from '../../components/library/icons/PickedRequestReview.tsx'

const REQUEST_TYPES = {
  request_review: 'Request Review',
  make_appointment: 'Make Appointment',
  declare_emergency: 'Declare Emergency',
}

type RequestType = keyof typeof REQUEST_TYPES

const DefaultIconComponents = {
  request_review: <RequestReview />,
  make_appointment: <MakeAppointments />,
  declare_emergency: <DeclareEmergency />,
}

const PickedIconComponents = {
  request_review: <PickedRequestReview />,
  make_appointment: <PickedMakeAppointments />,
  declare_emergency: <PickedDeclareEmergency />,
}

export function SendToRequestRadioButtons({
  form,
  options,
}: {
  form: string
  options: RequestType[]
}) {
  const [selectedOption, setSelectedOption] = useState<RequestType | null>(null)

  const handleChange = (option: RequestType) => {
    setSelectedOption(option)
  }

  return (
    <fieldset className='flex flex-col gap-4'>
      <div className='flex flex-col gap-2'>
        {options.map((option) => (
          <label key={option} className='flex items-center gap-2'>
            <input
              form={form}
              type='radio'
              name='send_to.request_type'
              value={option}
              checked={selectedOption === option}
              onChange={() =>
                handleChange(option)}
              className='hidden'
            />
            <div
              className={`flex items-center gap-5 p-2 cursor-pointer rounded-md ${
                selectedOption === option ? 'bg-white' : ''
              }`}
              onClick={() =>
                handleChange(option)}
            >
              <div className='icon-container'>
                {selectedOption === option
                  ? PickedIconComponents[option]
                  : DefaultIconComponents[option]}
              </div>
              <span
                className={`text-lg font-medium ${
                  selectedOption === option ? 'border-b-2 border-current' : ''
                }`}
                style={{
                  lineHeight: '1.1',
                  paddingBottom: selectedOption === option ? '2px' : '0',
                }}
              >
                {REQUEST_TYPES[option]}
              </span>
            </div>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
