import { PageProps } from '$fresh/server.ts'
import Layout from '../components/library/Layout.tsx'
import { Container } from '../components/library/Container.tsx'

import {
  CalendarDaysIcon,
  CreditCardIcon,
  UserCircleIcon,
} from '../components/library/icons/heroicons/solid.tsx'
import { Button } from '../components/library/Button.tsx'

function Example() {
  return (
    <div className='lg:col-start-3 lg:row-end-1'>
      <h2 className='sr-only'>Summary</h2>
      <div className='rounded-lg bg-gray-50 shadow-sm ring-1 ring-gray-900/5'>
        <dl className='flex flex-wrap'>
          <div className='flex-auto pl-6 pt-6'>
            <dt className='text-lg font-semibold leading-6 text-gray-900'>
              Senior Software Engineer
            </dt>
            <dd className='mt-1 text-base font-semibold leading-6 text-gray-900'>
              Remote
            </dd>
          </div>
          <div className='flex-none self-end px-6 pt-4'>
            <dt className='sr-only'>Status</dt>
            <dd className='inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20'>
              Volunteer
            </dd>
          </div>
          <div className='mt-6 flex w-full flex-none gap-x-4 border-t border-gray-900/5 px-6 pt-6'>
            <dt className='flex-none'>
              <span className='sr-only'>Client</span>
              <UserCircleIcon
                className='h-6 w-5 text-gray-400'
                aria-hidden='true'
              />
            </dt>
            <dd className='text-sm font-medium leading-6 text-gray-900'>
              Alex Curren
            </dd>
          </div>
          <div className='mt-4 flex w-full flex-none gap-x-4 px-6'>
            <dt className='flex-none'>
              <span className='sr-only'>Due date</span>
              <CalendarDaysIcon
                className='h-6 w-5 text-gray-400'
                aria-hidden='true'
              />
            </dt>
            <dd className='text-sm leading-6 text-gray-500'>
              <time dateTime='2023-01-31'>January 31, 2023</time>
            </dd>
          </div>
          <div className='mt-4 flex w-full flex-none gap-x-4 px-6'>
            <dt className='flex-none'>
              <span className='sr-only'>Status</span>
              <CreditCardIcon
                className='h-6 w-5 text-gray-400'
                aria-hidden='true'
              />
            </dt>
            <dd className='text-sm leading-6 text-gray-500'>
              Paid with MasterCard
            </dd>
          </div>
        </dl>
        <div className='mt-6 border-t border-gray-900/5 px-6 py-6'>
          <Button href='/apply'>Apply</Button>
        </div>
      </div>
    </div>
  )
}

export default function VolunteerPage(
  props: PageProps,
) {
  return (
    <Layout
      title='Learn More | Virtual Hospitals Africa'
      route={props.route}
      url={props.url}
      variant='just-logo'
    >
      <Container>
        <div className='border-b border-gray-200 pb-5'>
          <h2 className='text-xl font-semibold leading-6 text-gray-900'>
            Volunteer Opportunities
          </h2>
          <p className='mt-2 max-w-4xl text-sm text-gray-500'>
            Virtual Hospitals Africa is exicted to off
          </p>
        </div>
        <Example />
      </Container>
    </Layout>
  )
}
