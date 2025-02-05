import { Disclosure } from '@headlessui/react'
import {
  ChevronUpIcon,
} from '../../components/library/icons/heroicons/solid.tsx'
// import { H2 } from '../../components/library/typography/H2.tsx'
import { CareTeamSection } from './CareTeamSection.tsx'
import VerticalProgressBar from '../../components/library/VerticalProgressBar.tsx'

import capitalize from '../../util/capitalize.ts'

type ProgressSteps = {
  name: string
  description: string
  href: string
  status: 'complete' | 'current' | 'upcoming'
}

const progressSteps: ProgressSteps[] = [
  {
    name: 'Chief Complaint',
    description: 'Persistent Groin Iritation.',
    href: '#',
    status: 'complete',
  },
  {
    name: 'Symptoms',
    description: 'Severe rash in groin area for 2 weeks.',
    href: '#',
    status: 'complete',
  },
  {
    name: 'Physical Examination',
    description: 'Enlarged Lymph Nodes.',
    href: '#',
    status: 'complete',
  },
  {
    name: 'Atypical Vitals',
    description: 'Blood Pressure 145/90.',
    href: '#',
    status: 'complete',
  },
  {
    name: 'Diagnostic Test',
    description: 'Positive HIV Test.',
    href: '#',
    status: 'complete',
  },
  {
    name: 'HIV Positive Diagnosis',
    description: 'High confidence.',
    href: '#',
    status: 'complete',
  },
]

export function PatientDrawerAccordion({ encounter_reason, care_team }: {
  encounter_reason: string
  // deno-lint-ignore no-explicit-any
  care_team: any[]
}) {
  return (
    <div className='w-full px-0 pt-2'>
      <div className='mx-auto w-full rounded-2xl bg-white'>
        <Disclosure>
          {({ open }) => (
            <>
              <Disclosure.Button className='flex w-full justify-between rounded-lg text-left text-med font-medium text-purple-700 py-2'>
                <span>{capitalize(encounter_reason)}</span>
                <ChevronUpIcon
                  className={`${
                    open ? 'rotate-180 transform' : ''
                  } h-5 w-5 text-purple-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className='px-4 pb-2 pt-2 text-sm text-gray-500'>
                {progressSteps.length > 0
                  ? <VerticalProgressBar steps={progressSteps} />
                  : "See a list of the patient's treatment steps here."}
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
        <Disclosure as='div' className='mt-2'>
          {({ open }) => (
            <>
              <Disclosure.Button className='flex w-full justify-between rounded-lg text-left text-med font-medium text-purple-700 py-2'>
                <span>Conditions and Medications</span>
                <ChevronUpIcon
                  className={`${
                    open ? 'rotate-180 transform' : ''
                  } h-5 w-5 text-purple-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className='px-4 pb-2 pt-2 text-sm text-gray-500'>
                <div>
                  See a list of the patient's medication here.
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
        <Disclosure as='div' className='mt-2'>
          {({ open }) => (
            <>
              <Disclosure.Button className='flex w-full justify-between rounded-lg text-left text-med font-medium text-purple-700 py-2'>
                <span>History</span>
                <ChevronUpIcon
                  className={`${
                    open ? 'rotate-180 transform' : ''
                  } h-5 w-5 text-purple-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className='px-4 pb-2 pt-2 text-sm text-gray-500'>
                <div>
                  See a list of the patient's medical history here.
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
        <Disclosure as='div' className='mt-2'>
          {({ open }) => (
            <>
              <Disclosure.Button className='flex w-full justify-between rounded-lg text-left text-med font-medium text-purple-700 py-2'>
                <span>Contacts</span>
                <ChevronUpIcon
                  className={`${
                    open ? 'rotate-180 transform' : ''
                  } h-5 w-5 text-purple-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className='px-4 pb-2 pt-2 text-sm text-gray-500'>
                <div>
                  See a list of the patient's contacts here.
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
        <Disclosure as='div' className='mt-2'>
          {({ open }) => (
            <>
              <Disclosure.Button className='flex w-full justify-between rounded-lg text-left text-med font-medium text-purple-700 py-2'>
                <span>Care Team</span>
                <ChevronUpIcon
                  className={`${
                    open ? 'rotate-180 transform' : ''
                  } h-5 w-5 text-purple-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className='px-4 pb-2 pt-2 text-sm text-gray-500'>
                <CareTeamSection care_team={care_team} />
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      </div>
    </div>
  )
}
