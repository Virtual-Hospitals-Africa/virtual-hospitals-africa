import { Button } from '../../components/library/Button.tsx'
import { SendToRequestRadioButtons } from './RequestRadioButtons.tsx'

//export function SendToForm({ form }: { form: 'intake' | 'encounter' }) {
export function SendToForm(
  { form, textarea, requestTypeOptions }: {
    form: 'intake' | 'encounter'
    textarea?: string
    requestTypeOptions?: string[]
  },
) {
  return (
    <div className='flex flex-col'>
      {textarea === 'additional_details' && requestTypeOptions && (
        <SendToRequestRadioButtons
          form={form}
          options={requestTypeOptions}
        />
      )}
      <div className='mt-6 px-4'>
        <h2 className='text-sm font-sans font-medium text-gray-900'>
          {textarea === 'additional_details'
            ? 'Additional Details'
            : 'Reason for Escalation'}
        </h2>
        <textarea
          form={form}
          name={textarea === 'additional_details'
            ? 'send_to.additional_details'
            : 'send_to.reason_for_escalation'}
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
