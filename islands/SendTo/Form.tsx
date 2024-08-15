import { Button } from '../../components/library/Button.tsx'
import words from '../../util/words.ts'
import { SendToRequestRadioButtons } from './RequestRadioButtons.tsx'

export function SendToForm(
  { form, textarea, requestTypeOptions }: {
    form: 'intake' | 'encounter'
    textarea?: string
    requestTypeOptions?: string[]
  },
) {
  return (
    <div className='flex flex-col'>
      {textarea && (
        <div className='mt-6 px-4'>
          <h2 className='text-sm font-sans font-medium text-gray-900'>
            {words(textarea).join(' ')}
          </h2>
          <textarea
            form={form}
            name={`send_to.${textarea}`}
            className='w-full border border-gray-300 rounded-md p-2 mt-2'
          />
        </div>
      )}
      <div className='mt-6 px-4 flex justify-end'>
        <Button form={form} type='submit' variant='solid' color='primary'>
          Send
        </Button>
      </div>
    </div>
  )
}
