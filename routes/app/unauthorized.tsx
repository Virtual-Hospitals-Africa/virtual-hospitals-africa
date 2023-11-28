import Layout from '../../components/library/Layout.tsx'
import { PageProps } from '$fresh/server.ts'
import { Button } from '../../components/library/Button.tsx'
import PageHeader from '../../components/library/typography/PageHeader.tsx'
import { LoggedInHealthWorkerHandler } from '../../types.ts'

export const handler: LoggedInHealthWorkerHandler = {
  GET(_, ctx) {
    ctx.state.session.destroy()
    return ctx.render()
  },
}

export default function UnauthorizedPage(props: PageProps) {
  return (
    <Layout
      title='Virtual Hospitals Africa'
      route={props.route}
      url={props.url}
      variant='just-logo'
    >
      <main class='grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8'>
        <div class='text-center'>
          <PageHeader className='h1'>Unauthorized</PageHeader>
          <p class='mt-6 text-xl leading-8 text-gray-600'>
            Sorry, we can't find an account with that email address. Please
            contact your administrator. Perhaps another account is registered,
            in which case you can try again
          </p>
          <div class='mt-10 flex items-center justify-center gap-x-6'>
            <Button href='/login' color='blue'>
              Sign&#160;In
            </Button>
          </div>
        </div>
      </main>
    </Layout>
  )
}
