import { Fragment } from 'preact'
import { Dialog, Transition } from '@headlessui/react'
import { NearestOrganizationSearchResult } from '../../db/models/nearest_organizations.ts'
import ViewIconWithBackground from './ViewIconWithBackground.tsx'
import { H2 } from '../../components/library/typography/H2.tsx'
import { OrganizationCard } from './OrganizationCard.tsx'
import { Person } from '../../components/library/Person.tsx'
import { TextArea } from '../form/Inputs.tsx'
import { PatientCard } from '../../db/models/patients.ts'
import FormButtons from '../form/buttons.tsx'
import { HiddenInput } from '../../components/library/HiddenInput.tsx'

export function RequestingOrganizationDialog(
  { requesting_organization, concerning_patient }: {
    requesting_organization?: NearestOrganizationSearchResult
    concerning_patient: PatientCard
  },
) {
  return (
    <Transition.Root show={!!requesting_organization} as={Fragment}>
      <Dialog
        className='relative z-10'
        onClose={close}
      >
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity' />
        </Transition.Child>

        <div className='fixed inset-0 z-10 w-screen overflow-y-auto'>
          <div className='flex min-h-full justify-center p-4 items-center sm:p-0'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
              enterTo='opacity-100 translate-y-0 sm:scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 translate-y-0 sm:scale-100'
              leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
            >
              <Dialog.Panel className='transform rounded-lg shadow-xl transition-all max-h-screen max-w-screen min-w-[450px] relative'>
                {requesting_organization && (
                  <DialogContents
                    requesting_organization={requesting_organization}
                    concerning_patient={concerning_patient}
                  />
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

function DialogContents({
  concerning_patient,
  requesting_organization,
}: {
  concerning_patient: PatientCard
  requesting_organization: NearestOrganizationSearchResult
}) {
  return (
    <form
      method='POST'
      className='bg-white shadow sm:rounded-lgoverflow-hidden'
    >
      <HiddenInput
        value={{ 'review_request.organization_id': requesting_organization.id }}
      />
      <ViewIconWithBackground />
      <div className='p-12'>
        <H2>Requesting a patient review</H2>
        <div>
          <h3>Recipient</h3>
          <div>
            <OrganizationCard organization={requesting_organization} />
          </div>
        </div>
        <div>
          <h3>Concerning</h3>
          <div>
            <Person person={concerning_patient} />
          </div>
        </div>
        <div>
          <h3>Additional Notes</h3>
          <TextArea name='review_request.additional_notes' />
        </div>
        <FormButtons
          cancel={{
            href: '#',
          }}
        />
      </div>
    </form>
  )
}
