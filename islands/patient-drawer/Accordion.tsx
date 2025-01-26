import { Disclosure } from '@headlessui/react'
import {
  ChevronUpIcon,
} from '../../components/library/icons/heroicons/solid.tsx'
// import { H2 } from '../../components/library/typography/H2.tsx'
import { CareTeamSection } from './CareTeamSection.tsx'

export function PatientDrawerAccordion({ encounter_reason, care_team }: {
  encounter_reason: string
  // deno-lint-ignore no-explicit-any
  care_team: any[]
}) {
  return (
    <div className='w-full px-4 pt-16'>
      <div className='mx-auto w-full max-w-md rounded-2xl bg-white p-2'>
        <Disclosure>
          {({ open }) => (
            <>
              <Disclosure.Button className='flex w-full justify-between rounded-lg bg-purple-100 px-4 py-2 text-left text-sm font-medium text-purple-900 hover:bg-purple-200 focus:outline-none focus-visible:ring focus-visible:ring-purple-500/75'>
                <span>{encounter_reason}</span>
                <ChevronUpIcon
                  className={`${
                    open ? 'rotate-180 transform' : ''
                  } h-5 w-5 text-purple-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className='px-4 pb-2 pt-4 text-sm text-gray-500'>
                If you're unhappy with your purchase for any reason, email us
                within 90 days and we'll refund you in full, no questions asked.
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
        <Disclosure as='div' className='mt-2'>
          {({ open }) => (
            <>
              <Disclosure.Button className='flex w-full justify-between rounded-lg bg-purple-100 px-4 py-2 text-left text-sm font-medium text-purple-900 hover:bg-purple-200 focus:outline-none focus-visible:ring focus-visible:ring-purple-500/75'>
                <span>Care Team</span>
                <ChevronUpIcon
                  className={`${
                    open ? 'rotate-180 transform' : ''
                  } h-5 w-5 text-purple-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className='px-4 pb-2 pt-4 text-sm text-gray-500'>
                <CareTeamSection care_team={care_team} />
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      </div>
    </div>
  )
}
