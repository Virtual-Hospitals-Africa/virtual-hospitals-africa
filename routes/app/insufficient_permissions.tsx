import Layout from '../../components/library/Layout.tsx'
import { PageProps } from '$fresh/server.ts'
import {
  EmployedHealthWorker,
  LoggedInHealthWorkerHandler,
} from '../../types.ts'
import { Button } from '../../components/library/Button.tsx'
import PageHeader from '../../components/library/typography/PageHeader.tsx'

type RetryLoginPageProps = {
  healthWorker: EmployedHealthWorker
}

export const handler: LoggedInHealthWorkerHandler<RetryLoginPageProps> = {
  GET(_, ctx) {
    ctx.state.session.destroy()
    return ctx.render({ healthWorker: ctx.state.healthWorker })
  },
}

export default function RetryLoginPage(
  props: PageProps<RetryLoginPageProps>,
) {
  return (
    <Layout
      title='Virtual Hospitals Africa'
      route={props.route}
      url={props.url}
      variant='just-logo'
    >
      <main class='grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8'>
        <div class='text-center'>
          <PageHeader className='h1'>Insufficient Permissions</PageHeader>
          <p class='mt-6 text-xl leading-8 text-gray-600'>
            Virtual Hospitals Africa has not been granted calendar
            permissions.<br />
            Please sign in again and allow calendar access.
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
