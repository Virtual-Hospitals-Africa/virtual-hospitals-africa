import Layout from './Layout.tsx'
import { Button } from './Button.tsx'
import { TextArea, TextInput } from '../../islands/form/Inputs.tsx'
import FormRow from './FormRow.tsx'
import Form from './Form.tsx'
import { ComponentChild } from 'preact/src/index.d.ts'
import { HiddenInput } from './HiddenInput.tsx'
import { url } from 'node:inspector'
import last from '../../util/last.ts'
import PageHeader from './typography/PageHeader.tsx'

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
      <div class='overflow-hidden bg-white py-32'>
        <div class='mx-auto max-w-7xl px-6 lg:flex lg:px-8'>
          <div class='flex gap-6'>
            <div>
              <PageHeader className='h1'>{props.title}</PageHeader>
              <div class='lg:col-end-1 lg:w-full lg:max-w-lg lg:pb-8'>
                {props.message}
                <Form
                  method='POST'
                  action='/interest'
                  className='w-full mt-4 min-w-[450px]'
                >
                  <HiddenInput name='entrypoint' value={entrypoint} />

                  <FormRow className='w-full'>
                    <TextInput name='name' required />
                  </FormRow>
                  <FormRow className='w-full'>
                    <TextInput name='email' type='email' required />
                  </FormRow>
                  <FormRow className='w-full'>
                    <TextArea name='message' rows={3} />
                  </FormRow>
                  <FormRow className='w-full container mt-2'>
                    <Button type='submit'>
                      Submit
                    </Button>
                  </FormRow>
                </Form>
              </div>
            </div>
            <div class='flex flex-wrap items-start justify-end gap-6 sm:gap-8 lg:contents'>
              <div class='w-0 flex-auto lg:ml-auto lg:w-auto lg:flex-none lg:self-start'>
                <img
                  src='https://live.staticflickr.com/8877/29095571713_eb20065354_b.jpg'
                  alt=''
                  className='aspect-[7/5] w-[37rem] max-w-none rounded-2xl bg-gray-50 object-cover'
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
