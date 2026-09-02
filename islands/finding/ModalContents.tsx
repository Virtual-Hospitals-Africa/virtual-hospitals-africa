import { DialogTitle } from '@headlessui/react'
import { useSignal } from '@preact/signals'
import { Button } from '../../components/library/Button.tsx'
import { PaperAirplaneIcon, XMarkIcon } from '../../components/library/icons/heroicons/outline.tsx'

import { ConfiguredFinding } from '../../types.ts'
import { FindingModalInnerContents } from './ModalInnerContents.tsx'

export function FindingModalContents(
  { finding, onSave, onClose }: {
    finding: ConfiguredFinding
    onSave: (finding: ConfiguredFinding) => void
    onClose: () => void
  },
) {
  const configured = useSignal<ConfiguredFinding>(finding)

  function handleSave() {
    onSave(configured.value)
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
          {finding.display}
        </DialogTitle>
      </div>
      <FindingModalInnerContents
        finding={configured.value}
        onChange={(value) => configured.value = value}
      />

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
