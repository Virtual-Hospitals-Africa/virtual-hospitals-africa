import { EmployedHealthWorker, LoggedInHealthWorkerHandler } from '../types.ts'
import { assert } from 'std/assert/assert.ts'
import { PageProps } from '$fresh/server.ts'
import Layout from '../components/library/Layout.tsx'
import { FacilityAdmin, getFacilityAdmin } from '../db/models/employment.ts'
import { Button } from '../components/library/Button.tsx'
import PageHeader from '../components/library/typography/PageHeader.tsx'
import { json } from '../util/responses.ts'
import { TextInput } from '../components/library/form/Inputs.tsx'
import FormRow from '../components/library/form/Row.tsx'
import FormButtons from '../components/library/form/buttons.tsx'

type PendingApprovalPageProps = {
  healthWorker: EmployedHealthWorker
  facilityAdmin: FacilityAdmin
}

export const handler: LoggedInHealthWorkerHandler<PendingApprovalPageProps> = {
  POST(_req, ctx) {
    // TODO
    return json({ message: 'ok' })
  },
}

export default function LearnMorePage(
  props: PageProps<PendingApprovalPageProps>,
) {
  return (
    <Layout
      title='Learn More | Virtual Hospitals Africa'
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
                  Stay in the loop with updates, new features, and highlights
                  right to your inbox
                </i>
              </p>
              <form
                method='POST'
                className='w-full mt-4'
                encType='multipart/form-data'
              >
                <FormRow>
                  <TextInput name='name' />
                </FormRow>
                <FormRow>
                  <TextInput name='email' type='email' />
                </FormRow>
                <FormRow>
                  <Button type='submit'>
                    Sign up
                  </Button>
                </FormRow>
              </form>
            </div>
            <div class='flex flex-wrap items-start justify-end gap-6 sm:gap-8 lg:contents'>
              <div class='w-0 flex-auto lg:ml-auto lg:w-auto lg:flex-none lg:self-end'>
                <img
                  src='https://images.unsplash.com/photo-1670272502246-768d249768ca?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1152&q=80'
                  alt='Pending Approval'
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
