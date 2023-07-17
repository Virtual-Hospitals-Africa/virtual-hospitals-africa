import { CheckIcon } from '../../../../../components/library/CheckIcon.tsx'

export default function successPage() {
  return (
    <div className='rounded-md bg-green-50 p-4'>
      <div className='flex'>
        <div className='flex-shrink-0'>
          <CheckIcon className='h-5 w-5 text-green-400' aria-hidden='true' />
        </div>
        <div className='ml-3'>
          <h1 className='text-sm font-medium text-green-800'>
            Successfully sent
          </h1>
        </div>
      </div>
    </div>
  )
}
