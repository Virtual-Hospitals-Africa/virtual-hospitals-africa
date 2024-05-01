import { PageProps } from '$fresh/server.ts'
import Layout from '../components/library/Layout.tsx'
import { Button } from '../components/library/Button.tsx'
import { TextArea, TextInput } from '../islands/form/Inputs.tsx'
import FormRow from '../islands/form/Row.tsx'
import Form from '../components/library/Form.tsx'
import SideBySide from '../components/library/SideBySide.tsx'
import SelectWithOther from '../islands/SelectWithOther.tsx'

export default function PartnerPage(
  props: PageProps,
) {
  return (
    <Layout
      title='Partner With Us | Virtual Hospitals Africa'
      url={props.url}
      variant='just logo'
    >
      <SideBySide
        image='https://live.staticflickr.com/8877/29095571713_eb20065354_b.jpg'
        h1='Partner With Us'
      >
        <p class='text-xl leading-8 text-gray-600'>
          <i>
            With your help, we can improve healthcare in Africa
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
            <SelectWithOther
              name='support'
              label='What kind of support might you be interested in offering?'
            >
              <option>Funding</option>
              <option>Technical/Research Partnership</option>
              <option>Local Health Organization Partnership</option>
              <option>Medical Support</option>
              <option>Medical Equipment</option>
              <option>Software Development</option>
              <option>Networking</option>
              <option>Media/Journalism</option>
              <option>Showcases/Events</option>
            </SelectWithOther>
          </FormRow>
          <FormRow>
            <TextArea name='message' rows={3} />
          </FormRow>
          <FormRow className='container mt-2'>
            <Button type='submit'>
              Submit
            </Button>
          </FormRow>
        </Form>
      </SideBySide>
    </Layout>
  )
}
