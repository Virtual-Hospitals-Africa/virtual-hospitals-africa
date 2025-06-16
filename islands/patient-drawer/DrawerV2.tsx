import {
  type Maybe,
  Measurement,
  Measurements,
  RenderedPatientExaminationFinding,
} from '../../types.ts'
// import { SendToSelectedPatient } from '../SendTo/SelectedPatient.tsx'
// import { HEADER_HEIGHT_PX } from '../../components/library/HeaderHeight.ts'
import { PatientDrawerAccordion } from './Accordion.tsx'
// import Badge from '../../components/library/Badge.tsx'
import { Gender } from '../../types.ts'
import { Disclosure } from '@headlessui/react'
import { ChevronUpIcon } from '../../components/library/icons/heroicons/solid.tsx'
// import { ConstructorDeclaration } from 'https://deno.land/x/ts_morph@21.0.1/ts_morph.d.ts'
// import { format } from 'node:path'
// import { log } from 'node:console'
// import { patient } from '../../chatbot/defs.ts'

/* TODO
  - PatientHeader - Done for now
    - PatientCard
    - In Treatment Status Badge (<Badge />)
  - General Accordion
    - using location hash to save which accordions are open
  - CurrentVisitSection ( Seeking Treatment)
  - Conditions & Medications Section
  - History Section
  - Care Team Section
    - Primary Doctor
    - Those recently seen

    - We need the following form the medcal team
      - Avatar URL
      - Name
      - Clinic they saw the patient as a member of
      - Their role in the patient care
    */

export function calculateAge(dateOfBirth: string): number {
  if (!dateOfBirth) {
    return 0
  }

  // Turn into javaScript DATE method
  const birthDate = new Date(dateOfBirth)

  if (isNaN(birthDate.getTime())) {
    console.log('Invalid birth date:', dateOfBirth)
    return 0
  }

  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (
    monthDiff < 0 || monthDiff === 0 && today.getDay() - birthDate.getMonth()
  ) {
    age--
  }
  return age
}

// // for tests：
// console.log(calculateAge('1990-01-01'))  // 35
// console.log(calculateAge('2000-12-25'))  // 24
// console.log(calculateAge('invalid'))     // 0
// console.log(calculateAge(''))            // 0

export function formatDate(date: string | Date): string {
  const Dates = new Date(date)

  if (isNaN(Dates.getTime())) {
    console.log('Invalid Date', date)
    return ''
  }

  return Dates.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}

// console.log(formatDate('2024-01-15'))
// console.log(formatDate('2023-07-25'))

export function PatientDrawerV2({
  patient,
  encounter,
  // findings,
  // measurements,
  // flaggedVitals = new Map(),
  care_team,
}: {
  form?: 'intake' | 'encounter'
  patient: {
    id: string
    name: string
    description: string | null
    avatar_url?: Maybe<string>
    date_of_birth: string
    gender?: Maybe<Gender>
    age?: number
    age_year?: number
    age_display?: string
    allergies: string
    actions: {
      view: string
    }
  }
  encounter: {
    reason: string
    notes: string | null
    created_at?: string
    admit_reasons?: string[]
  }
  // deno-lint-ignore no-explicit-any
  care_team: any[]
  findings: RenderedPatientExaminationFinding[]
  measurements: Measurement<keyof Measurements>[]
  flaggedVitals?: Map<string, Measurement<keyof Measurements>>
}) {
  let ageDisplay: string = ''
  let age: number | null = null

  if (patient.age_year != null && patient.age_year > 0) {
    age = patient.age_year
    ageDisplay = age + ' years old'
  } else if (patient.age_display) {
    ageDisplay = patient.age_display
  } else if (patient.age != null && patient.age > 0) {
    age = patient.age
    ageDisplay = age + ' years old'
  } else if (patient.date_of_birth) {
    age = calculateAge(patient.date_of_birth)
    if (age > 0) {
      ageDisplay = age + ' years old'
    }
  }

  return (
    <div className='flex h-full flex-col overflow-y-scroll bg-white shadow-xl sticky right-0 min-w-[300px]'>
      <div className='bg-[hsla(245,75%,94%,1)] border-2 border-solid border-[hsla(242,75%,87%,1)] rounded-lg p-4 m-4 shadow-sm'>
        <div className='flex justify-between items-start mb-2 leading-snug'>
          <div className='flex-1 pl-3'>
            <h1 className='text-lg font-semibold text-[hsla(216,20%,20%,1)] mb-1'>
              {patient.name}
            </h1>
            <p className='text-sm text-gray-600 mb-1 leading-snug'>
              {patient.gender
                ? patient.gender.charAt(0).toUpperCase() +
                  patient.gender.slice(1).toLowerCase()
                : 'Unknown'}
              {ageDisplay && `, ${ageDisplay}`}
            </p>
            <p className='text-sm text-[hsla(216,20%,20%,1)]'>
              <span className='font-semibold'>Allergies:</span>{' '}
              {patient.allergies || 'N/A'}
            </p>
          </div>
          <div className='bg-[hsla(174,100%,84%,1)] px-2 py-0.5 rounded-lg'>
            <span className='text-[hsla(175,100%,22%,1)] text-xs font-medium'>
              In treatment
            </span>
          </div>
        </div>
      </div>

      <div className='bg-white rounded-xl p-5 mb-4 mx-7'>
        <Disclosure defaultOpen>
          {({ open }) => (
            <>
              <Disclosure.Button className='flex w-full justify-between rounded-lg text-left text-med font-medium text-indigo-600 py-2 items-center'>
                <span>Patient Admit Information</span>
                <ChevronUpIcon
                  className={`${
                    open ? 'rotate-180 transform' : ''
                  } h-5 w-5 text-gray-700`}
                  strokeWidth={1}
                />
              </Disclosure.Button>
              <Disclosure.Panel className='mt-7 space-y-5 px-2 pb-2 pt-2 text-sm text-gray-700'>
                <div>
                  <h4 className='text-sm font-semibold text-[hsla(216,20%,20%,1)]'>
                    Visit Information:
                  </h4>
                  <p className='text-sm text-gray-800'>
                    Visit ID: {patient.id}
                  </p>
                  <p className='text-sm text-gray-800'>
                    Admission: {encounter.created_at
                      ? (() => {
                        const date = new Date(encounter.created_at)
                        const day = date.toLocaleDateString('en-GB', {
                          day: '2-digit',
                        })
                        const month = date.toLocaleDateString('en-GB', {
                          month: 'long',
                        })
                        const year = date.toLocaleDateString('en-GB', {
                          year: 'numeric',
                        })
                        const time = date.toLocaleTimeString('en-GB', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })
                        return `${day} ${month}, ${year} at ${time}`
                      })()
                      : ''}
                  </p>
                </div>
                <div>
                  <h4 className='text-sm font-semibold text-[hsla(216,20%,20%,1)]'>
                    Admit Reason:
                  </h4>
                  <div className='flex flex-wrap gap-2 mt-2'>
                    {encounter.admit_reasons &&
                        encounter.admit_reasons.length > 0
                      ? (
                        encounter.admit_reasons.map((reason, index) => (
                          <span
                            key={index}
                            className='bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full text-xs font-medium'
                          >
                            {reason}
                          </span>
                        ))
                      )
                      : <span className='text-gray-400'>None</span>}
                  </div>
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      </div>

      <div className='border-b-2 px-4'>
        <PatientDrawerAccordion
          encounter_reason={encounter.reason}
          care_team={care_team}
        />
      </div>
    </div>
  )
}
{
  /* <div className='w-full py-2'>
          <SectionHeader>Reason for visit</SectionHeader>
          <p>{encounter.notes || encounter.reason}</p>
        </div>
        <div className='w-full py-2'>
          <SectionHeader>Basic Information</SectionHeader>
          TODO
        </div>
        <div className='w-full py-2'>
          <SectionHeader>Findings</SectionHeader>
          <FindingsList findings={findings} />
        </div>
        <div className='w-full py-2'>
          <SectionHeader>Vitals</SectionHeader>
          <VitalsList
            measurements={measurements}
            vitals={flaggedVitals}
          />
        </div> */
}
