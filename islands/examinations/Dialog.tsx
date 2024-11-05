import { Fragment } from 'preact'
import { Signal } from '@preact/signals'
import { Dialog, Transition } from '@headlessui/react'
import { JSX } from 'preact'
import { TextArea } from '../../islands/form/Inputs.tsx'
import AsyncSearch from '../../islands/AsyncSearch.tsx'
// import { removeFinding } from '../findings/Drawer.tsx'
import FormRow from '../../components/library/FormRow.tsx'
import type { ChecklistItem } from './ChecklistItem.tsx'
import { Button } from '../../components/library/Button.tsx'
import { addFinding } from '../findings/Drawer.tsx'

type FindingProps = {
  open: boolean
  checklist_item: ChecklistItem
  edit_href: string
  found: Signal<
    undefined | {
      body_sites: {
        snomed_code: string
        snomed_english_term: string
      }[]
      additional_notes: string | null
    }
  >
  close(): void
  cancel(): void
}

// TODO: fix cancelling if you come from the findings menu
export function ExaminationFindingDialog(
  { open, checklist_item, edit_href, found, close, cancel }: FindingProps,
): JSX.Element {
  const input_prefix = `findings.snomed_${checklist_item.code}`

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        className='relative z-10'
        onClose={cancel}
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
          <div className='flex min-h-full justify-center p-4 text-center items-center sm:p-0'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
              enterTo='opacity-100 translate-y-0 sm:scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 translate-y-0 sm:scale-100'
              leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
            >
              <Dialog.Panel className='relative transform rounded-lg shadow-xl transition-all max-h-screen max-w-screen'>
                {found.value && (
                  <>
                    <input
                      type='hidden'
                      name={`${input_prefix}.code`}
                      value={checklist_item.code}
                    />
                    <FormRow>
                      {checklist_item.english_term}
                    </FormRow>
                    {checklist_item.body_sites.length > 0 && (
                      <FormRow className=''>
                        <AsyncSearch
                          label='Body site'
                          required
                          name={`${input_prefix}.body_site`}
                          search_route={`/app/snomed/body_structures?parent_codes=${
                            checklist_item.body_sites.map((s) => s.code).join(
                              ',',
                            )
                          }`}
                          value={found.value.body_sites.length > 0
                            ? {
                              id: found.value.body_sites[0].snomed_code,
                              name:
                                found.value.body_sites[0].snomed_english_term,
                            }
                            : null}
                          onSelect={(value) => {
                            found.value = {
                              ...found.value!,
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
                    )}

                    <FormRow className=''>
                      <TextArea
                        name={`${input_prefix}.additional_notes`}
                        label='Additional notes'
                        rows={1}
                        value={found.value?.additional_notes || ''}
                        onInput={(event) => {
                          found.value = {
                            ...found.value!,
                            additional_notes: event.currentTarget.value,
                          }
                        }}
                      />
                    </FormRow>
                    <Button
                      type='button'
                      onClick={() => {
                        addFinding({
                          snomed_code: checklist_item.code,
                          text: checklist_item.english_term,
                          edit_href,
                          additional_notes: found.value?.additional_notes ??
                            null,
                        })
                        close()
                      }}
                    >
                      Save
                    </Button>
                  </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
