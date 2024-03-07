import cls from '../util/cls.ts'
import { JSX } from 'preact'
import { ExclamationTriangleIcon } from '../components/library/icons/heroicons/solid.tsx'
import { Signal } from '@preact/signals'
import { XMarkIcon } from '../components/library/icons/heroicons/outline.tsx'

interface ErrorMessageProps {
  className?: string
  error: Signal<string | null>
}

export default function ErrorMessage(
  { className, error }: ErrorMessageProps,
): null | JSX.Element {
  return error.value
    ? (
      <div className={cls('rounded-md bg-red-50 p-4', className)}>
        <div className='flex justify-between'>
          <div className='flex'>
            <div className='flex-shrink-0'>
              <ExclamationTriangleIcon
                className='h-5 w-5 text-red-400'
                aria-hidden='true'
              />
            </div>
            <div className='ml-3'>
              <h3 className='text-sm font-medium text-red-800'>
                {error.value}
              </h3>
            </div>
          </div>
          <button
            className='ml-auto'
            type='button'
            onClick={() => error.value = null}
          >
            <XMarkIcon
              type='button'
              className='text-red-400 hover:text-red-600'
            />
          </button>
        </div>
      </div>
    )
    : null
}
