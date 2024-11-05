import { Fragment, JSX } from 'preact'
import { useSignal } from '@preact/signals'
import { Dialog, Transition } from '@headlessui/react'
import { TextArea } from '../../islands/form/Inputs.tsx'
import AsyncSearch from '../../islands/AsyncSearch.tsx'
import FormRow from '../../components/library/FormRow.tsx'
import type { ChecklistItem } from './ChecklistItem.tsx'
import FormButtons from '../form/buttons.tsx'
import { FormClassName } from '../../components/library/Form.tsx'
import cls from '../../util/cls.ts'
import { assertHasNonEmptyString } from '../../util/isString.ts'
import { CloseButton } from '../CloseButton.tsx'

type FindingDialogFormValues = {
  body_sites: {
    snomed_code: string
    snomed_english_term: string
  }[]
  additional_notes: string | null
}

type FindingProps = {
  action: 'Add' | 'Edit'
  open: boolean
  checklist_item: ChecklistItem
  found?: FindingDialogFormValues
  save(form_values: FindingDialogFormValues): void
  close(): void
}

function BodySiteSelect({ checklist_item, value, onSelect }: {
  checklist_item: ChecklistItem
  value: { id: string; name: string } | null
  onSelect(value: { id: string; name: string }): void
}) {
  return (
    <AsyncSearch
      label='Body site'
      required
      search_route={`/app/snomed/body_structures?parent_codes=${
        checklist_item.body_sites.map((s) => s.code).join(
          ',',
        )
      }`}
      value={value}
      onSelect={(value) => {
        assertHasNonEmptyString(value, 'id')
        assertHasNonEmptyString(value, 'name')
        onSelect(value)
      }}
    />
  )
}

type FindingDialogContentsProps = Omit<FindingProps, 'open' | 'found'> & {
  found: FindingDialogFormValues
}

function ExaminationFindingDialogContents(
  { action, checklist_item, found, save, close }: FindingDialogContentsProps,
) {
  const form_values = useSignal(found)

  return (
    <div className='bg-white shadow sm:rounded-lg'>
      <div className='px-4 py-5 sm:p-6'>
        <h3 className='text-base text-center font-semibold text-gray-900'>
          {action} {checklist_item.english_term} as a finding
        </h3>
        <div
          className={cls(FormClassName, 'mt-5')}
        >
          <FormRow>
            <BodySiteSelect
              checklist_item={checklist_item}
              value={found.body_sites.length > 0
                ? {
                  id: found.body_sites[0].snomed_code,
                  name: found.body_sites[0].snomed_english_term,
                }
                : null}
              onSelect={(value) => {
                form_values.value = {
                  ...form_values.value!,
                  body_sites: value
                    ? [{
                      snomed_code: value.id,
                      snomed_english_term: value.name,
                    }]
                    : [],
                }
              }}
            />
          </FormRow>
          <FormRow>
            <TextArea
              label='Additional notes'
              name='additional_notes'
              rows={2}
              value={found.additional_notes ?? ''}
              onInput={(event) => {
                form_values.value = {
                  ...form_values.value!,
                  additional_notes: event.currentTarget.value,
                }
              }}
            />
          </FormRow>
          <FormRow>
            <FormButtons
              submitText='Save'
              onClick={() => save(form_values.value)}
            />
          </FormRow>
        </div>
      </div>
    </div>
  )
}

export function ExaminationFindingDialog(
  { action, open, checklist_item, found, save, close }: FindingProps,
): JSX.Element {
  return (
    <Transition.Root show={open} as={Fragment}>
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
                <CloseButton size='md' close={close} />
                {found && (
                  <ExaminationFindingDialogContents
                    action={action}
                    checklist_item={checklist_item}
                    found={found}
                    save={save}
                    close={close}
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
