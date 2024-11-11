import { Fragment, JSX } from 'preact'
import { useSignal } from '@preact/signals'
import { Dialog, Transition } from '@headlessui/react'
import { TextArea } from '../../islands/form/Inputs.tsx'
import FormRow from '../../components/library/FormRow.tsx'
import FormButtons from '../form/buttons.tsx'
import { FormClassName } from '../../components/library/Form.tsx'
import cls from '../../util/cls.ts'
import { CloseButton } from '../CloseButton.tsx'
import { BodySiteSelect } from './BodySiteSelect.tsx'
import type { ExaminationChecklistDefinition } from '../../types.ts'

type FindingDialogFormValues = {
  body_sites: {
    snomed_concept_id: number
    snomed_english_term: string
  }[]
  additional_notes: string | null
}

type FindingProps = {
  action: 'Add' | 'Edit'
  open: boolean
  checklist_item: ExaminationChecklistDefinition
  found?: FindingDialogFormValues
  save(form_values: FindingDialogFormValues): void
  close(): void
}

type FindingDialogContentsProps =
  & Omit<FindingProps, 'open' | 'close' | 'found'>
  & {
    found: FindingDialogFormValues
  }

function ExaminationFindingDialogContents(
  { action, checklist_item, found, save }: FindingDialogContentsProps,
) {
  const form_values = useSignal(found)

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
      }}
    >
      <div className='bg-white shadow sm:rounded-lg'>
        <div className='px-4 py-5 sm:p-6'>
          <h3 className='text-base text-center font-semibold text-gray-900'>
            {action} {checklist_item.snomed_english_term} as a finding
          </h3>
          <div
            className={cls(FormClassName, 'mt-5')}
          >
            <FormRow>
              <BodySiteSelect
                checklist_item={checklist_item}
                value={found.body_sites.length > 0
                  ? {
                    id: String(found.body_sites[0].snomed_concept_id),
                    snomed_concept_id: found.body_sites[0].snomed_concept_id,
                    snomed_english_term:
                      found.body_sites[0].snomed_english_term,
                    name: found.body_sites[0].snomed_english_term,
                  }
                  : null}
                onSelect={(value) => {
                  form_values.value = {
                    ...form_values.value!,
                    body_sites: value
                      ? [{
                        snomed_concept_id: value.snomed_concept_id,
                        snomed_english_term: value.snomed_english_term,
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
    </form>
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
