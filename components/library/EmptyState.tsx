import { JSX } from 'preact'
import cls from '../../util/cls.ts'
import { PlusIcon } from './icons/heroicons/outline.tsx'
import { Button } from './Button.tsx'

type EmptyStateProps = {
  className?: string
  header: string
  explanation: string
  buttonText: string
  icon: JSX.Element
  href?: string
  onClick?: () => void
}

export default function EmptyState(
  { className, header, explanation, buttonText, icon, href, onClick }:
    EmptyStateProps,
) {
  return (
    <div className={cls('text-center p-2', className)}>
      {icon}
      <h3 className='mt-2 text-sm font-semibold text-gray-900'>
        {header}
      </h3>
      <p className='mt-1 text-sm text-gray-500'>
        {explanation}
      </p>
      <div className='mt-6'>
        <Button href={href} onClick={onClick}>
          <PlusIcon
            className='-ml-0.5 mr-1.5 h-5 w-5 white'
            aria-hidden='true'
          />
          {buttonText}
        </Button>
      </div>
    </div>
  )
}
