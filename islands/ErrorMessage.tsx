import CrossIcon from '../components/library/icons/cross.tsx'
import { useState } from 'preact/hooks'
import cls from '../util/cls.ts'
import { JSX } from 'preact'
import { ExclamationTriangleIcon } from '../components/library/icons/heroicons/solid.tsx'

interface ErrorMessageProps {
  className?: string
  message: string | null
}

export default function ErrorMessage(
  { className, message }: ErrorMessageProps,
): JSX.Element | null {
  const [isVisible, setIsVisible] = useState(!!message)
  return isVisible
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
                {message}
              </h3>
            </div>
          </div>
          <button
            className='ml-auto'
            type='button'
            onClick={() => setIsVisible(false)}
          >
            <CrossIcon
              type='button'
              className='text-red-400 hover:text-red-600'
            >
            </CrossIcon>
          </button>
        </div>
      </div>
    )
    : null
}
