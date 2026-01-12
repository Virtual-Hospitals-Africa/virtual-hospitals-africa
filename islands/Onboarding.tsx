import { Button } from '../components/library/Button.tsx'
import PageHeader from '../components/library/typography/PageHeader.tsx'
import Form from '../components/library/Form.tsx'
import { useSignal } from '@preact/signals'
import { AppUser, OrganizationLike, PossiblyEmployedHealthWorker } from '../types.ts'
import FormRow from '../components/library/FormRow.tsx'
import { Person } from '../components/library/Person.tsx'
import { cls } from '../util/cls.ts'
import OrganizationsSelect from './OrganizationsSelect.tsx'
import CountrySelect from './CountrySelect.tsx'
import { SelectWithOptions } from './form/inputs/select_with_options.tsx'
import { TextInput } from './form/inputs/text.tsx'
import { appUserDisplay } from '../util/healthWorkerDisplay.ts'
import { specialtyOptions, SpecialtySelect } from './SpecialtySelect.tsx'

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
        This is a demonstration of the Virtual Hospital Africa platform. All information presented and shared is for testing purposes only.
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
      specialty: string | null
    }): void
  },
) {
  const name = useSignal(health_worker.name)
  const profession = useSignal<AppUser>('nurse')
  const specialty = useSignal<string | null>('Primary care')

  return (
    <div
      className={cls(
        'lg:col-end-1 lg:w-full lg:max-w-lg lg:pb-8',
        !show && 'hidden',
      )}
    >
      <PageHeader className='h1'>Create Your Profile</PageHeader>
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
            { value: 'nurse' as const, label: 'Nurse' },
            { value: 'doctor' as const, label: 'Doctor' },
            { value: 'receptionist' as const, label: 'Receptionist' },
            { value: 'regulator' as const, label: 'Regulator' },
          ]}
          onChange={(event) => {
            profession.value = event.currentTarget.value as AppUser
            specialty.value = specialtyOptions(profession.value)[0] || null
          }}
          className='capitalize'
        />
      </FormRow>
      <SpecialtySelect profession={profession.value} specialty={specialty} />

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
            avatar_url: health_worker.avatar_url,
            ...appUserDisplay({
              health_worker_name: name.value,
              app_user: profession.value,
              specialty: specialty.value,
              avatar_url: health_worker.avatar_url,
            }),
          }}
          size='lg'
        />
      </div>

      <div className='flex mt-10'>
        <Button
          type={profession.value === 'regulator' ? 'submit' : 'button'}
          onClick={profession.value === 'regulator' ? undefined : () =>
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
  function getStarted() {
    progress.value = { type: 'enter profession' }
  }
  function onProfession() {
    progress.value = { type: 'select organization' }
  }

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
