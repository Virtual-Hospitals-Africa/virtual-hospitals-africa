import { ComponentChildren } from 'preact'
import JustLogoLayout from './library/JustLogoLayout.tsx'
import { Button } from './library/Button.tsx'
import FormRow from './library/FormRow.tsx'
import Form from './library/Form.tsx'
import SideBySide from './library/SideBySide.tsx'
import SelectWithOther from '../islands/SelectWithOther.tsx'
import { TextInput } from '../islands/form/inputs/text.tsx'
import { TextArea } from '../islands/form/inputs/textarea.tsx'
import { HiddenInput } from './library/HiddenInput.tsx'

interface SignupTemplateProps {
  url: URL
  title: string
  h1: string
  entrypoint: string
  rationale: ComponentChildren
}

export default function SignupTemplate({ url, title, h1, entrypoint, rationale }: SignupTemplateProps) {
  return (
    <JustLogoLayout
      url={url}
      title={title}
    >
      <SideBySide
        image='https://live.staticflickr.com/8877/29095571713_eb20065354_b.jpg'
        h1={h1}
      >
        <div class='text-xl leading-8 text-gray-600'>
          {rationale}
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
            <TextInput name='company_name' label='Company Name' />
          </FormRow>
          <FormRow>
            <TextInput name='job_title' label='Job Title' />
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
          <HiddenInput name='entrypoint' value={entrypoint} />
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
