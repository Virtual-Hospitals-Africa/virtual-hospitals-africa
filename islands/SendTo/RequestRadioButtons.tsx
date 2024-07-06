const REQUEST_TYPES = {
  request_visit: 'Request Visit',
  request_review: 'Request Review',
  make_appointment: 'Make Appointment',
  declare_emergency: 'Declare Emergency',
}

type RequestType = keyof typeof REQUEST_TYPES

export function SendToRequestRadioButtons({
  options,
}: {
  options: RequestType[]
}) {
  return (
    <fieldset className='flex flex-col gap-2'>
      <div className='flex flex-col gap-1'>
        {options.map((option) => (
          <label key={option} className='flex items-center gap-2'>
            <input
              type='radio'
              name='send_to.request_type'
              value={option}
            />
            <span>{REQUEST_TYPES[option]}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
