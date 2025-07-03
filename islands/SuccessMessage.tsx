import { useState } from 'preact/hooks'
import cls from '../util/cls.ts'
import { JSX } from 'preact'
import { XMarkIcon } from '../components/library/icons/heroicons/outline.tsx'
import { CheckIcon } from '../components/library/icons/heroicons/solid.tsx'

interface SuccessMessageProps {
  className?: string
  message: string | null
  notDismissable?: boolean
}

export default function SuccessMessage({
  className,
  message,
  notDismissable,
}: SuccessMessageProps): JSX.Element | null {
  const [isVisible, setIsVisible] = useState(!!message)
  return isVisible
    ? (
      <div className={cls('rounded-md bg-green-50 p-4', className)}>
        <div className='flex justify-between'>
          <div className='flex'>
            <div className='flex-shrink-0'>
              <CheckIcon
                className='h-5 w-5 text-green-400'
                aria-hidden='true'
              />
            </div>
            <div className='ml-3'>
              <h3 className='text-sm font-medium text-green-800'>{message}</h3>
            </div>
          </div>
          {!notDismissable && (
            <button
              className='ml-auto'
              type='button'
              onClick={() => setIsVisible(false)}
            >
              <XMarkIcon
                type='button'
                className='text-green-400 hover:text-green-600 h-5 w-5'
              />
            </button>
          )}
        </div>
      </div>
    )
    : null
}
