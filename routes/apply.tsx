import { Context } from 'fresh'
import JustLogoLayout from '../components/library/JustLogoLayout.tsx'
import { Button } from '../components/library/Button.tsx'
import PageHeader from '../components/library/typography/PageHeader.tsx'
import { json } from '../util/responses.ts'

import FormRow from '../components/library/FormRow.tsx'
import { TextInput } from '../islands/form/inputs/text.tsx'
import { postHandler } from '../backend/postHandler.ts'
import z from 'zod'

export const handler = postHandler(
  z.object({}),
  (_ctx) => {
    // TODO
    return json({ message: 'ok' })
  },
)

// deno-lint-ignore require-await
export default async function ApplyPage(ctx: Context<unknown>) {
  return (
    <JustLogoLayout url={ctx.url} title='Virtual Hospitals Africa'>
      <div class='overflow-hidden bg-white py-32'>
        <div class='mx-auto max-w-7xl px-6 lg:flex lg:px-8'>
          <div class='mx-auto grid max-w-2xl grid-cols-1 gap-x-12 gap-y-16 lg:mx-0 lg:min-w-full lg:max-w-none lg:flex-none lg:gap-y-8'>
            <div class='lg:col-end-1 lg:w-full lg:max-w-lg lg:pb-8'>
              <PageHeader className='h1'>Application under review</PageHeader>
              <form
                method='POST'
                className='w-full mt-4'
                encType='multipart/form-data'
              >
                <FormRow>
                  <TextInput name='Name' />
                </FormRow>
              </form>
              <p class='mt-6 text-xl leading-8 text-gray-600'>
                Your application from organization_name is currently under review by{' '}
                organization_admin_name. You will receive an email once your application has been approved.
              </p>
              <div class='mt-10 flex'>
                <Button href='/'>
                  Homepage<span aria-hidden='true'>&nbsp;&nbsp;&rarr;</span>
                </Button>
              </div>
            </div>
            <div class='flex flex-wrap items-start justify-end gap-6 sm:gap-8 lg:contents'>
              <div class='w-0 flex-auto lg:ml-auto lg:w-auto lg:flex-none lg:self-end'>
                <img
                  src='https://images.unsplash.com/photo-1670272502246-768d249768ca?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1152&q=80'
                  alt='Pending Approval'
                  className='aspect-7/5 w-148 max-w-none rounded-2xl bg-gray-50 object-cover'
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </JustLogoLayout>
  )
}
