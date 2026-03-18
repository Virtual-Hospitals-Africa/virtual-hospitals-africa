import { Dialog, Transition } from '@headlessui/react'
import { useSignal } from '@preact/signals'
import { Fragment } from 'preact'
import { Button } from '../../components/library/Button.tsx'
import { MagnifyingGlassIcon, PaperAirplaneIcon, XMarkIcon } from '../../components/library/icons/heroicons/mini.tsx'
import cls from '../../util/cls.ts'
import { FindingDetails, SelectedWarningSign } from '../WarningSigns/shared.ts'

export type FindingAttributeGroup = {
  label: string
  options: string[]
  /** Whether multiple options can be selected. Default: true */
  multi?: boolean
  /** Whether the card spans the full width. Default: true */
  full_width?: boolean
}

type FindingModalProps = {
  finding: SelectedWarningSign | null
  concept_options?: string[]
  attribute_groups?: FindingAttributeGroup[]
  onSave: (finding: SelectedWarningSign, details: FindingDetails) => void
  onClose: () => void
}

export function FindingModal(
  { finding, concept_options = [], attribute_groups = [], onSave, onClose }: FindingModalProps,
) {
  return (
    <Transition.Root show={finding !== null} as={Fragment}>
      <Dialog className='relative z-50' onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-gray-500/75 transition-opacity' />
        </Transition.Child>

        <div className='fixed inset-0 z-10 overflow-y-auto'>
          <div className='flex min-h-full items-center justify-center p-4'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
              enterTo='opacity-100 translate-y-0 sm:scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 translate-y-0 sm:scale-100'
              leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
            >
              <Dialog.Panel className='relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all'>
                {finding && (
                  <ModalContents
                    finding={finding}
                    concept_options={concept_options}
                    attribute_groups={attribute_groups}
                    onSave={onSave}
                    onClose={onClose}
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

function ModalContents(
  { finding, concept_options, attribute_groups, onSave, onClose }: {
    finding: SelectedWarningSign
    concept_options: string[]
    attribute_groups: FindingAttributeGroup[]
    onSave: (finding: SelectedWarningSign, details: FindingDetails) => void
    onClose: () => void
  },
) {
  const refined_concept = useSignal<string | undefined>(concept_options[0])
  const selected_attributes = useSignal<Record<string, string[]>>({})
  const qualifier = useSignal(finding.details?.qualifier ?? '')

  function toggleAttribute(group_label: string, option: string, multi: boolean) {
    const current = selected_attributes.value[group_label] ?? []
    if (multi) {
      selected_attributes.value = {
        ...selected_attributes.value,
        [group_label]: current.includes(option) ? current.filter((o) => o !== option) : [...current, option],
      }
    } else {
      selected_attributes.value = {
        ...selected_attributes.value,
        [group_label]: current[0] === option ? [] : [option],
      }
    }
  }

  function handleSave() {
    const details: FindingDetails = {}
    if (refined_concept.value) details.refined_concept = refined_concept.value
    const attr_entries = Object.entries(selected_attributes.value).filter(([, v]) => v.length > 0)
    if (attr_entries.length > 0) details.attributes = Object.fromEntries(attr_entries)
    if (qualifier.value) details.qualifier = qualifier.value
    onSave(finding, details)
    onClose()
  }

  return (
    <div className='flex flex-col max-h-[90vh]'>
      {/* Header */}
      <div className='relative px-6 pt-8 pb-4 text-center'>
        <button
          type='button'
          className='absolute right-4 top-4 rounded-md p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500'
          onClick={onClose}
        >
          <XMarkIcon className='h-5 w-5' />
        </button>
        <Dialog.Title className='text-xl font-bold text-gray-900'>
          {finding.name}
        </Dialog.Title>
        <p className='mt-1 text-sm text-gray-500'>
          Clinical information related to the {finding.name.toLowerCase()}
        </p>
      </div>

      {/* Scrollable body */}
      <div className='overflow-y-auto flex-1 px-6 pb-4 flex flex-col gap-5'>
        {/* Refine Concept */}
        {concept_options.length > 0 && (
          <div className='flex flex-col gap-2'>
            <h3 className='text-sm font-semibold text-gray-900'>Refine Concept</h3>
            <div className='flex flex-wrap gap-2'>
              {concept_options.map((concept) => {
                const is_selected = refined_concept.value === concept
                return (
                  <button
                    key={concept}
                    type='button'
                    onClick={() => refined_concept.value = is_selected ? undefined : concept}
                    className={cls(
                      'px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors',
                      is_selected ? 'bg-indigo-100 border-indigo-600 text-indigo-700' : 'bg-white border-gray-300 text-gray-600 hover:border-indigo-300',
                    )}
                  >
                    {concept}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Quick Attributes */}
        {attribute_groups.length > 0 && (
          <div className='flex flex-col gap-2'>
            <h3 className='text-sm font-semibold text-gray-900'>Quick Attributes</h3>
            <div className='grid grid-cols-2 gap-3'>
              {attribute_groups.map((group) => {
                const current = selected_attributes.value[group.label] ?? []
                const multi = group.multi !== false
                return (
                  <div
                    key={group.label}
                    className={cls(
                      'rounded-xl border border-gray-200 p-4 flex flex-col gap-3',
                      group.full_width !== false && 'col-span-2',
                    )}
                  >
                    <span className='text-sm font-semibold text-gray-700'>{group.label}</span>
                    <div className='flex flex-wrap gap-2'>
                      {group.options.map((option) => {
                        const is_selected = current.includes(option)
                        return (
                          <button
                            key={option}
                            type='button'
                            onClick={() => toggleAttribute(group.label, option, multi)}
                            className={cls(
                              'px-3 py-1.5 rounded-lg border text-sm transition-colors',
                              is_selected
                                ? 'border-indigo-600 text-indigo-700 font-semibold bg-white'
                                : 'border-gray-200 text-gray-600 bg-white hover:border-indigo-300',
                            )}
                          >
                            {option}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Qualifiers */}
        <div className='flex flex-col gap-2'>
          <h3 className='text-sm font-semibold text-gray-900'>Qualifiers</h3>
          <div className='relative'>
            <div className='pointer-events-none absolute inset-y-0 left-3 flex items-center'>
              <MagnifyingGlassIcon className='h-4 w-4 text-gray-400' />
            </div>
            <input
              type='text'
              placeholder='Search for a qualifier...'
              value={qualifier.value}
              onInput={(e) => qualifier.value = e.currentTarget.value}
              className='w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500'
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className='flex gap-3 border-t border-gray-100 px-6 py-4'>
        <Button variant='tertiary' className='flex-1' type='button' onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant='primary'
          className='flex-1'
          type='button'
          onClick={handleSave}
          left_icon={<PaperAirplaneIcon className='h-4 w-4' />}
        >
          Save to Record
        </Button>
      </div>
    </div>
  )
}
