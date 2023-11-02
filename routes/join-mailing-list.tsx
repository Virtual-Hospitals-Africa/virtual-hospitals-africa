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
import SideBySide from '../components/library/SideBySide.tsx'

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
      <SideBySide image='https://images.unsplash.com/photo-1670272502246-768d249768ca?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1152&q=80'>
        <PageHeader className='h1'>Join Mailing List</PageHeader>
        <p class='mt-6 text-xl leading-8 text-gray-600'>
          <i>
            Get news about features, availability, and highlights right to your
            inbox
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
      </SideBySide>
    </Layout>
  )
}
