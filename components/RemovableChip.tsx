import { XMarkIcon } from './library/icons/heroicons/outline.tsx'

type RemovableChipProps = {
  display: string
  remove: () => void
}

export default function RemovableChip(
  { display, remove }: RemovableChipProps,
) {
  return (
    <>
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
