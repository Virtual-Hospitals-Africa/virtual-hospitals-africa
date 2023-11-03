import { PageProps } from '$fresh/server.ts'
import Layout from '../components/library/Layout.tsx'
import { Button } from '../components/library/Button.tsx'
import PageHeader from '../components/library/typography/PageHeader.tsx'
import {
  Select,
  TextArea,
  TextInput,
} from '../components/library/form/Inputs.tsx'
import FormRow from '../components/library/form/Row.tsx'
import Form from '../components/library/form/Form.tsx'
import SideBySide from '../components/library/SideBySide.tsx'
import SelectWithOther from '../islands/SelectWithOther.tsx'

export default function PartnerPage(
  props: PageProps,
) {
  const entrypoint = props.url.searchParams.get('entrypoint') || 'general'

  const alreadyKnowRole = entrypoint === 'health-workers' ||
    entrypoint === 'research'

  return (
    <Layout
      title='Schedule a demo | Virtual Hospitals Africa'
      route={props.route}
      url={props.url}
      variant='just-logo'
    >
      <SideBySide
        image='https://live.staticflickr.com/8877/29095571713_eb20065354_b.jpg'
        h1='Schedule a demo'
      >
        <p class='text-xl leading-8 text-gray-600'>
          <i>
            Thanks for you interest in Virtual Hospitals Africa! Please fill out
            the form below and we'll be in touch to show you what we've been
            work.
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
          {!alreadyKnowRole && (
            <FormRow>
              <SelectWithOther
                name='interest'
                label='What are you interested in learning more about?'
              >
                <option>Funding Opportunity</option>
                <option>Technical/Research Partnership</option>
                <option>Local Health Facility Partnership</option>
                <option>Medical Support</option>
                <option>Medical Equipment</option>
                <option>Software Development</option>
                <option>Networking</option>
                <option>Media/Journalism</option>
                <option>Showcases/Events</option>
                <option>General Interest</option>
              </SelectWithOther>
            </FormRow>
          )}
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
