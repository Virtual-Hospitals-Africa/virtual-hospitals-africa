import JustLogoLayout from '../../components/library/JustLogoLayout.tsx'
import { PageProps } from 'fresh'
import { Button } from '../../components/library/Button.tsx'
import PageHeader from '../../components/library/typography/PageHeader.tsx'

export default function UnauthorizedPage(_props: PageProps) {
  return (
    <JustLogoLayout title='Virtual Hospitals Africa'>
      <main class='grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8'>
        <div class='text-center'>
          <PageHeader className='h1'>Unauthorized</PageHeader>
          <p class='mt-6 text-xl leading-8 text-gray-600'>
            Sorry, we can't find an account with that email address. Please
            contact your administrator. Perhaps another account is registered,
            in which case you can try again
          </p>
          <div class='mt-10 flex items-center justify-center gap-x-6'>
            <Button href='/login'>
              Sign&#160;In
            </Button>
          </div>
        </div>
      </main>
    </JustLogoLayout>
  )
}
