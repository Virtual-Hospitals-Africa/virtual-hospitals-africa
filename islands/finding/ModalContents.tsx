import { DialogTitle } from '@headlessui/react'
import { useSignal } from '@preact/signals'
import { useEffect } from 'preact/hooks'
import { Button } from '../../components/library/Button.tsx'
import { PaperAirplaneIcon, XMarkIcon } from '../../components/library/icons/heroicons/outline.tsx'
import { SelectedWarningSign } from '../WarningSigns/shared.ts'
import { AugmentedSign, BySExpressionResult, Maybe } from '../../types.ts'
import { FindingModalInnerContents } from './ModalInnerContents.tsx'

export function FindingModalContents(
  { finding, onSave, onClose }: {
    finding: SelectedWarningSign
    onSave: (finding: SelectedWarningSign, augmented_sign: Maybe<AugmentedSign>) => void
    onClose: () => void
  },
) {
  const original_node = useSignal<BySExpressionResult | null>(null)
  const augmented_node = useSignal<BySExpressionResult | null>(null)
  const augmented = useSignal<Maybe<AugmentedSign>>(finding.augmented)
  const loading_count = useSignal(1 + (finding.augmented ? 1 : 0))

  useEffect(() => {
    original_node.value = null
    augmented_node.value = null
    console.log('refetching...')
    fetch(
      `/app/snomed/by-s-expression?s_expression=${encodeURIComponent(finding.clinical_finding_s_expression)}`,
      { headers: { accept: 'application/json' } },
    )
      .then((r) => r.json())
      .then((data) => {
        original_node.value = data
        loading_count.value--
      })

    if (finding.augmented) {
      fetch(
        `/app/snomed/by-s-expression?s_expression=${encodeURIComponent(finding.augmented.s_expression)}`,
        { headers: { accept: 'application/json' } },
      )
        .then((r) => r.json())
        .then((data) => {
          augmented_node.value = data
          loading_count.value--
        })
    }
  }, [finding.clinical_finding_s_expression])

  function handleSave() {
    console.log('handleSave', finding, augmented.value)
    onSave(finding, augmented.value)
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
        <DialogTitle className='text-xl font-bold text-gray-900'>
          {finding.name}
        </DialogTitle>
        <p className='mt-1 text-sm text-gray-500'>
          Clinical information related to the {finding.name.toLowerCase()}
        </p>
      </div>
      {original_node.value && !loading_count.value && (
        <FindingModalInnerContents
          original_node={original_node.value}
          augmented_node={augmented_node.value}
          onChange={(value) => augmented.value = value}
        />
      )}

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
