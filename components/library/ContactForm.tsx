import { Button } from './Button.tsx'
import FormRow from './FormRow.tsx'
import Form from './Form.tsx'
import { SelectWithOptions } from '../../islands/form/inputs/select_with_options.tsx'
import { TextInput } from '../../islands/form/inputs/text.tsx'
import { TextArea } from '../../islands/form/inputs/textarea.tsx'

export const CONTACT_REASON_OPTIONS = [
  { value: 'mailing_list_signup' as const, label: 'Sign up for mailing list' },
  { value: 'general_inquiry' as const, label: 'General Inquiry' },
  { value: 'book_a_demo' as const, label: 'Book a demo' },
  { value: 'book_an_intro_call' as const, label: 'Book an intro call' },
  { value: 'request_investor_deck' as const, label: 'Request investor deck' },
]

export type ContactReason = (typeof CONTACT_REASON_OPTIONS)[number]['value']

export default function ContactForm({ reason }: { reason: ContactReason }) {
  return (
    <Form method='POST' action='/interest' className='w-full'>
      <FormRow className='w-full'>
        <SelectWithOptions
          name='reason'
          required
          value={reason}
          options={CONTACT_REASON_OPTIONS}
        />
      </FormRow>
      <FormRow className='w-full'>
        <TextInput name='name' required />
      </FormRow>
      <FormRow className='w-full'>
        <TextInput name='email' type='email' required />
      </FormRow>
      <FormRow className='w-full'>
        <TextArea name='message' rows={3} />
      </FormRow>
      <FormRow className='container w-full mt-2'>
        <Button type='submit' className='w-full'>
          Submit
        </Button>
      </FormRow>
    </Form>
  )
}
