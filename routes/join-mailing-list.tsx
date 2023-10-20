import { MailingListRecipient } from '../types.ts'
import { Handlers, PageProps } from '$fresh/server.ts'
import Layout from '../components/library/Layout.tsx'
import { Button } from '../components/library/Button.tsx'
import PageHeader from '../components/library/typography/PageHeader.tsx'
import { TextInput } from '../components/library/form/Inputs.tsx'
import FormRow from '../components/library/form/Row.tsx'
import Form from '../components/library/form/Form.tsx'
import { parseRequest } from '../util/parseForm.ts'
import * as slack from '../external-clients/slack.ts'
import * as mailing_list from '../db/models/mailing_list.ts'
import db from '../db/db.ts'
import redirect from '../util/redirect.ts'

function isMailingListRecipient(
  formValues: unknown,
): formValues is MailingListRecipient {
  return typeof formValues == 'object' &&
    formValues != null &&
    'name' in formValues && typeof formValues['name'] == 'string' &&
    'email' in formValues && typeof formValues['email'] == 'string' &&
    formValues['email'].includes('@') &&
    'entrypoint' in formValues && typeof formValues['entrypoint'] == 'string'
}

export const handler: Handlers = {
  async POST(req, ctx) {
    const recipient = await parseRequest(
      db,
      req,
      isMailingListRecipient,
    )
    await mailing_list.add(db, recipient)
    await slack.send(`New mailing list signup: ${recipient.email}`)

    return redirect(`/?success=${
      encodeURIComponent(
        `Thanks for signing up ${recipient.name}! We'll keep you in the loop about our progress 🚀`,
      )
    }`)
  },
}

export default function JoinMailingListPage(
  props: PageProps,
) {
  const entrypoint = props.url.searchParams.get('entrypoint') || 'general'
  return (
    <Layout
      title='Join Mailing List | Virtual Hospitals Africa'
      route={props.route}
      url={props.url}
      variant='just-logo'
    >
      <div class='overflow-hidden bg-white py-32'>
        <div class='mx-auto max-w-7xl px-6 lg:flex lg:px-8'>
          <div class='mx-auto grid max-w-2xl grid-cols-1 gap-x-12 gap-y-16 lg:mx-0 lg:min-w-full lg:max-w-none lg:flex-none lg:gap-y-8'>
            <div class='lg:col-end-1 lg:w-full lg:max-w-lg lg:pb-8'>
              <PageHeader className='h1'>Join Mailing List</PageHeader>
              <p class='mt-6 text-xl leading-8 text-gray-600'>
                <i>
                  Get news about features, availability, and highlights right to
                  your inbox
                </i>
              </p>
              <Form
                method='POST'
                className='w-full mt-4'
              >
                <FormRow>
                  <TextInput name='name' required />
                </FormRow>
                <FormRow>
                  <TextInput name='email' type='email' required />
                </FormRow>
                <input
                  type='hidden'
                  name='entrypoint'
                  value={entrypoint}
                />
                <FormRow className='container mt-2'>
                  <Button type='submit'>
                    Sign up
                  </Button>
                </FormRow>
              </Form>
            </div>
            <div class='flex flex-wrap items-start justify-end gap-6 sm:gap-8 lg:contents'>
              <div class='w-0 flex-auto lg:ml-auto lg:w-auto lg:flex-none lg:self-end'>
                <img
                  src='https://images.unsplash.com/photo-1670272502246-768d249768ca?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1152&q=80'
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
