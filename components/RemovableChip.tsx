import { HiddenInput } from './library/HiddenInput.tsx'
import { XMarkIcon } from './library/icons/heroicons/outline.tsx'

type RemovableChipProps = {
  name: string
  display: string
  remove: () => void
}

export default function RemovableChip(
  { name, display, remove }: RemovableChipProps,
) {
  return (
    <>
      <HiddenInput
        name={name}
        value='true'
      />
      <button
        type='button'
        onClick={() => remove()}
        className='inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
      >
        {display}
        <XMarkIcon className='w-4 h-4' />
      </button>
    </>
  )
}
