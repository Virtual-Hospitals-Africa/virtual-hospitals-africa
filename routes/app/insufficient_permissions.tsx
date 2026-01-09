import { Context } from 'fresh'
import JustLogoLayout from '../../components/library/JustLogoLayout.tsx'
import { Button } from '../../components/library/Button.tsx'
import PageHeader from '../../components/library/typography/PageHeader.tsx'

// deno-lint-ignore require-await
export default async function InsufficientPermissionsPage(
  ctx: Context<unknown>,
) {
  return (
    <JustLogoLayout url={ctx.url} title='Virtual Hospitals Africa'>
      <main class='grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8'>
        <div class='text-center'>
          <PageHeader className='h1'>
            Insufficient Permissions Granted
          </PageHeader>
          <p class='mt-6 text-xl leading-8 text-gray-600'>
            Virtual Hospitals Africa has not been granted calendar
            permissions.<br />
            Please sign in again and allow calendar access.
          </p>
          <div class='mt-10 flex items-center justify-center gap-x-6'>
            <Button href='/login' variant='secondary'>
              Sign&#160;In
            </Button>
          </div>
        </div>
      </main>
    </JustLogoLayout>
  )
}
