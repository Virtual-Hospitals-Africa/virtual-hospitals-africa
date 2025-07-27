import { Button } from '../components/library/Button.tsx'
import PageHeader from '../components/library/typography/PageHeader.tsx'
import Form from '../components/library/Form.tsx'
import { useSignal } from '@preact/signals'
import { OrganizationLike, PossiblyEmployedHealthWorker } from '../types.ts'
import FormRow from '../components/library/FormRow.tsx'
import {
  DoctorSpecialtySelect,
  NurseSpecialtySelect,
  SelectWithOptions,
  TextInput,
} from './form/Inputs.tsx'
import { Person } from '../components/library/Person.tsx'
import { cls } from '../util/cls.ts'
import OrganizationsSelect from './OrganizationsSelect.tsx'
import CountrySelect from './CountrySelect.tsx'

type OnboardingProgress =
  | { type: 'welcome' }
  | { type: 'enter profession' }
  | { type: 'select organization' }
  | { type: 'select department'; organization: OrganizationLike }

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
      <div className='mt-10 flex'>
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
  const name = useSignal(health_worker.name)
  const profession = useSignal('nurse')
  const specialty = useSignal<string>('Primary care')

  const doctor_prefix = profession.value === 'doctor' ? 'Dr. ' : ''
  const nurse_suffix = profession.value === 'nurse' ? ' Nurse' : ''

  const description = (() => {
    if (profession.value === 'doctor') {
      return specialty.value
    }
    if (profession.value === 'nurse') {
      return specialty.value + ' Nurse'
    }
    return 'Regulator'
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
      <div className='mt-2 rounded-lg border-gray-200 border-2 p-3'>
        <Person
          person={{
            name: doctor_prefix + name.value,
            avatar_url: health_worker.avatar_url,
            description,
          }}
          size='lg'
        />
      </div>

      <div className='mt-10 flex'>
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
  { show, organizations, onOrganization }: {
    show: boolean
    organizations: OrganizationLike[]
    onOrganization(organization: OrganizationLike): void
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
      <div className='mt-10 flex'>
        <Button
          type='button'
          onClick={() => onOrganization(organziation.value)}
        >
          Continue<span aria-hidden='true'>
            &nbsp;&nbsp;&rarr;
          </span>
        </Button>
      </div>
    </div>
  )
}

function SelectDepartment(
  { organization }: {
    organization: OrganizationLike
  },
) {
  return (
    <div
      className={cls(
        'lg:col-end-1 lg:w-full lg:max-w-lg lg:pb-8',
        // !show && 'hidden',
      )}
    >
      <PageHeader className='h1'>Select your department</PageHeader>
      <FormRow className='mt-2'>
        <SelectWithOptions
          name='department_id'
          options={organization.departments.map((dept) => ({
            value: dept.id,
            label: dept.name,
          }))}
        />
      </FormRow>
      <div className='mt-10 flex'>
        <Button type='submit'>
          Let's go<span aria-hidden='true'>
            &nbsp;&nbsp;&rarr;
          </span>
        </Button>
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
  const onOrganization = (organization: OrganizationLike) =>
    progress.value = { type: 'select department', organization }

  return (
    <Form method='POST'>
      <div className='overflow-hidden bg-white py-32'>
        <div className='mx-auto max-w-7xl px-6 lg:flex lg:px-8'>
          <div className='mx-auto grid max-w-2xl grid-cols-1 gap-x-12 gap-y-16 lg:mx-0 lg:min-w-full lg:max-w-none lg:flex-none lg:gap-y-8'>
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
              onOrganization={onOrganization}
            />
            {progress.value.type === 'select department' && (
              <SelectDepartment
                organization={progress.value.organization}
              />
            )}
            <div className='flex flex-wrap items-start justify-end gap-6 sm:gap-8 lg:contents'>
              <div className='w-0 flex-auto lg:ml-auto lg:w-auto lg:flex-none lg:self-end'>
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
