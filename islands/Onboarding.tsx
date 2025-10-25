import { Button } from '../components/library/Button.tsx'
import PageHeader from '../components/library/typography/PageHeader.tsx'
import Form from '../components/library/Form.tsx'
import { useSignal } from '@preact/signals'
import { OrganizationLike, PossiblyEmployedHealthWorker } from '../types.ts'
import FormRow from '../components/library/FormRow.tsx'

import { Person } from '../components/library/Person.tsx'
import { cls } from '../util/cls.ts'
import OrganizationsSelect from './OrganizationsSelect.tsx'
import CountrySelect from './CountrySelect.tsx'
import capitalize from '../util/capitalize.ts'
import { DoctorSpecialtySelect } from './form/inputs/doctor_specialty.tsx'
import { NurseSpecialtySelect } from './form/inputs/nurse_specialty.tsx'
import { SelectWithOptions } from './form/inputs/select_with_options.tsx'
import { TextInput } from './form/inputs/text.tsx'

type OnboardingProgress =
  | { type: 'welcome' }
  | { type: 'enter profession' }
  | { type: 'select organization' }

function Welcome({ show, getStarted }: { show: boolean; getStarted(): void }) {
  return (
    <div
      className={cls(
        'lg:col-end-1 lg:w-full lg:max-w-lg lg:pb-8',
        !show && 'hidden',
      )}
    >
      <PageHeader className='h1'>Welcome!</PageHeader>
      <p className='mt-6 text-xl leading-8 text-gray-600'>
        This is a demonstration of the Virtual Hospital Africa platform. All
        information presented and shared is for testing purposes only.
      </p>
      <div className='flex mt-10'>
        <Button type='button' onClick={getStarted}>
          Let's get started<span aria-hidden='true'>
            &nbsp;&nbsp;&rarr;
          </span>
        </Button>
      </div>
    </div>
  )
}

function EnterProfession(
  { show, health_worker, onProfession }: {
    show: boolean

    health_worker: PossiblyEmployedHealthWorker
    onProfession(opts: {
      profession: string
      specialty: string
    }): void
  },
) {
  const profession = useSignal('nurse')
  const name = useSignal(health_worker.name)

  const specialty = useSignal<string>('Primary care')

  const doctor_prefix = profession.value === 'doctor' ? 'Dr. ' : ''

  const description = (() => {
    if (profession.value === 'doctor') {
      return specialty.value
    }
    if (profession.value === 'nurse') {
      return specialty.value + ' Nurse'
    }
    return capitalize(profession.value)
  })()

  return (
    <div
      className={cls(
        'lg:col-end-1 lg:w-full lg:max-w-lg lg:pb-8',
        !show && 'hidden',
      )}
    >
      <PageHeader className='h1'>Create Your Profile</PageHeader>
      {
        /* <p className='mt-6 text-xl leading-8 text-gray-600'>
         licensed health workers to
      </p> */
      }
      <FormRow>
        <TextInput
          name='name'
          value={name.value}
          onInput={(event) => name.value = event.currentTarget.value}
        />
      </FormRow>
      <FormRow>
        <SelectWithOptions
          name='profession'
          value={profession.value}
          options={[
            { value: 'nurse', label: 'Nurse' },
            { value: 'doctor', label: 'Doctor' },
            { value: 'receptionist', label: 'Receptionist' },
            { value: 'regulator', label: 'Regulator' },
          ]}
          onChange={(event) => profession.value = event.currentTarget.value}
          className='capitalize'
        />
      </FormRow>
      {profession.value === 'nurse' && (
        <FormRow>
          <NurseSpecialtySelect
            value={specialty.value}
            onChange={(event) => specialty.value = event.currentTarget.value}
          />
        </FormRow>
      )}
      {profession.value === 'doctor' && (
        <FormRow>
          <DoctorSpecialtySelect
            value={specialty.value}
            onChange={(event) => specialty.value = event.currentTarget.value}
          />
        </FormRow>
      )}

      {profession.value === 'regulator' && (
        <FormRow>
          <CountrySelect name='country' value='ZW' />
        </FormRow>
      )}

      <p className='mt-4'>
        <i>How you'll appear in the platform</i>
      </p>
      <div className='p-3 mt-2 border-2 border-gray-200 rounded-lg'>
        <Person
          person={{
            name: doctor_prefix + name.value,
            avatar_url: health_worker.avatar_url,
            description,
          }}
          size='lg'
        />
      </div>

      <div className='flex mt-10'>
        <Button
          type={profession.value === 'regulator' ? 'submit' : 'button'}
          onClick={profession.value === 'regulator'
            ? undefined
            : () =>
              onProfession({
                profession: profession.value,
                specialty: specialty.value,
              })}
        >
          Continue<span aria-hidden='true'>
            &nbsp;&nbsp;&rarr;
          </span>
        </Button>
      </div>
    </div>
  )
}

function SelectOrganization(
  { show, organizations }: {
    show: boolean
    organizations: OrganizationLike[]
  },
) {
  const organziation = useSignal(organizations[0])

  return (
    <div
      className={cls(
        'lg:col-end-1 lg:w-full lg:max-w-lg lg:pb-8',
        !show && 'hidden',
      )}
    >
      <PageHeader className='h1'>Select your organization</PageHeader>
      <FormRow className='mt-2'>
        <OrganizationsSelect
          organizations={organizations}
          onSelect={(org) => {
            organziation.value = org
          }}
        />
      </FormRow>
      <div className='flex mt-10'>
        <div className='flex mt-10'>
          <Button type='submit'>
            Let's go<span aria-hidden='true'>
              &nbsp;&nbsp;&rarr;
            </span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export function Onboarding(
  { health_worker, organizations }: {
    health_worker: PossiblyEmployedHealthWorker
    organizations: OrganizationLike[]
  },
) {
  const progress = useSignal<OnboardingProgress>({ type: 'welcome' })
  const getStarted = () => progress.value = { type: 'enter profession' }
  const onProfession = () => progress.value = { type: 'select organization' }

  return (
    <Form method='POST'>
      <div className='py-32 overflow-hidden bg-white'>
        <div className='px-6 mx-auto max-w-7xl lg:flex lg:px-8'>
          <div className='grid max-w-2xl grid-cols-1 mx-auto gap-x-12 gap-y-16 lg:mx-0 lg:min-w-full lg:max-w-none lg:flex-none lg:gap-y-8'>
            <Welcome
              show={progress.value.type === 'welcome'}
              getStarted={getStarted}
            />
            <EnterProfession
              show={progress.value.type === 'enter profession'}
              health_worker={health_worker}
              onProfession={onProfession}
            />
            <SelectOrganization
              show={progress.value.type === 'select organization'}
              organizations={organizations}
            />
            <div className='flex flex-wrap items-start justify-end gap-6 sm:gap-8 lg:contents'>
              <div className='flex-auto w-0 lg:ml-auto lg:w-auto lg:flex-none lg:self-end'>
                <img
                  src='/doctor-holding-phone.png'
                  alt='Welcome'
                  className='aspect-[7/5] w-[37rem] max-w-none rounded-2xl bg-gray-50 object-cover'
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Form>
  )
}
