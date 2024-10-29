import { PageProps } from '$fresh/server.ts'
import Layout from '../components/library/Layout.tsx'
import { Button } from '../components/library/Button.tsx'
import { TextArea, TextInput } from '../islands/form/Inputs.tsx'
import FormRow from '../components/library/FormRow.tsx'
import Form from '../components/library/Form.tsx'
import SideBySide from '../components/library/SideBySide.tsx'

export default function WaitlistPage(
  props: PageProps,
) {
  return (
    <Layout
      title='Join Waitlist | Virtual Hospitals Africa'
      url={props.url}
      variant='just logo'
    >
      <SideBySide
        h1='Join Waitlist'
        image='https://live.staticflickr.com/8877/29095571713_eb20065354_b.jpg'
      >
        <p class='text-xl leading-8 text-gray-600'>
          <i>
            Stay in the loop about Virtual Hospitals Africa's progress. We'll
            let you know when it's time to sign up!
          </i>
        </p>
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
            <TextArea name='message' rows={3} />
          </FormRow>
          <FormRow className='container mt-2'>
            <Button type='submit'>
              Keep me posted
            </Button>
          </FormRow>
        </Form>
      </SideBySide>
    </Layout>
  )
}
