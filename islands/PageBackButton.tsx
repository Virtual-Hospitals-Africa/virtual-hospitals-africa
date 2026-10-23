import { ArrowLeftIcon } from '../components/library/icons/heroicons/outline.tsx'

export function PageBackButton({ id }: { id: string }) {
  return (
    <button
      id={id}
      type='button'
      aria-label='Back'
      onClick={() => history.back()}
      className='inline-flex items-center gap-1 text-sm font-medium text-indigo-700'
    >
      <ArrowLeftIcon className='size-5' />
      Back
    </button>
  )
}
