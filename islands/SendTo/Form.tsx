import { Button } from '../../components/library/Button.tsx'
import { SendToRequestRadioButtons } from './RequestRadioButtons.tsx'

export function SendToForm({ form }: { form: 'intake' | 'encounter' }) {
  return (
    <div className='flex flex-col'>
      <div className='mt-6 px-4'>
        {/* Hardcoding to intake options. These are the options when the providers are at your facility */}
        {/* When at another facility, this will include request_review */}
        <SendToRequestRadioButtons
          form={form}
          options={[
            'request_visit',
            'make_appointment',
            'declare_emergency',
          ]}
        />
      </div>
      <div className='mt-6 px-4'>
        <h2 className='text-sm font-sans font-medium text-gray-900'>
          Additional Details
        </h2>
        <textarea
          form={form}
          name='send_to.additional_details'
          className='w-full border border-gray-300 rounded-md p-2 mt-2'
        >
        </textarea>
      </div>
      <div className='mt-6 px-4 flex justify-end'>
        <Button form={form} type='submit' variant='solid' color='primary'>
          Send
        </Button>
      </div>
    </div>
  )
}
