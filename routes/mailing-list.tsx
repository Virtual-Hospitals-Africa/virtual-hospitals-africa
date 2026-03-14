import { Context } from 'fresh'
import JustLogoLayout from '../components/library/JustLogoLayout.tsx'
import { Button } from '../components/library/Button.tsx'
import FormRow from '../components/library/FormRow.tsx'
import Form from '../components/library/Form.tsx'
import SideBySide from '../components/library/SideBySide.tsx'
import SelectWithOther from '../islands/SelectWithOther.tsx'
import { TextInput } from '../islands/form/inputs/text.tsx'
import { TextArea } from '../islands/form/inputs/textarea.tsx'
import { HiddenInput } from '../components/library/HiddenInput.tsx'

// deno-lint-ignore require-await
export default async function MailingListPage(ctx: Context<unknown>) {
  return (
    <JustLogoLayout
      url={ctx.url}
      title='Mailing List | Virtual Hospitals Africa'
    >
      <SideBySide
        image='https://live.staticflickr.com/8877/29095571713_eb20065354_b.jpg'
        h1='Sign up for our mailing list'
      >
        <div class='text-xl leading-8 text-gray-600'>
          Receive updates with
          <ul class='text-lg list-disc list-inside'>
            <li>progress in South Africa and beyond</li>
            <li>a refreshing perspective on the African digital health landscape</li>
            <li>clinical success stories & technical deep dives</li>
          </ul>
        </div>
        <Form
          method='POST'
          action='/interest'
          className='w-full mt-4'
        >
          <FormRow>
            <TextInput name='name' required />
          </FormRow>
          <FormRow>
            <TextInput name='email' type='email' required />
          </FormRow>
          <FormRow>
            <SelectWithOther
              name='support'
              label='Any particular interest?'
              options={[
                'Technical/Research Partnership',
                'Local Health Organization Partnership',
                'Medical Support',
                'Medical Equipment',
                'Software Development',
                'Networking',
                'Media/Journalism',
                'Showcases/Events',
                'Funding',
              ]}
            >
            </SelectWithOther>
          </FormRow>
          <FormRow>
            <TextArea name='message' rows={3} />
          </FormRow>
          <HiddenInput name='entrypoint' value='mailing_list_signup' />
          <FormRow className='container mt-2'>
            <Button type='submit'>
              Submit
            </Button>
          </FormRow>
        </Form>
      </SideBySide>
    </JustLogoLayout>
  )
}
