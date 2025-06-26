import Layout from './Layout.tsx'
import { Button } from './Button.tsx'
import { TextArea, TextInput } from '../../islands/form/Inputs.tsx'
import FormRow from './FormRow.tsx'
import Form from './Form.tsx'
import SideBySide from './SideBySide.tsx'
import { ComponentChild } from 'preact/src/index.d.ts'
import { HiddenInput } from './HiddenInput.tsx'
import { url } from 'node:inspector'
import last from '../../util/last.ts'

type ContactPageProps = {
  url: URL
  title: string
  message: ComponentChild
}

export default function ContactPage(
  props: ContactPageProps,
) {
  const entrypoint = last(url.toString().split('/'))!

  return (
    <Layout
      title={`${props.title} | Virtual Hospitals Africa`}
      url={props.url}
      variant='just logo'
    >
      <SideBySide
        h1={props.title}
        image='https://live.staticflickr.com/8877/29095571713_eb20065354_b.jpg'
      >
        {props.message}
        <Form
          method='POST'
          action='/interest'
          className='w-full mt-4'
        >
          <HiddenInput name='entrypoint' value={entrypoint} />

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
              Submit
            </Button>
          </FormRow>
        </Form>
      </SideBySide>
    </Layout>
  )
}
