import { JSX } from 'preact'
import cls from '../../util/cls.ts'
import { PlusIcon } from './icons/heroicons/outline.tsx'
import { Button } from './Button.tsx'

type EmptyStateProps = {
  className?: string
  header: string
  explanation: string
  icon: JSX.Element
  button?: {
    text: string
    href?: string
    onClick?: () => void
  }
}

export default function EmptyState(
  { className, header, explanation, icon, button }: EmptyStateProps,
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
      {button && (
        <div className='mt-6'>
          <Button href={button.href} onClick={button.onClick}>
            <PlusIcon
              className='-ml-0.5 mr-1.5 h-5 w-5 white'
              aria-hidden='true'
            />
            {button.text}
          </Button>
        </div>
      )}
    </div>
  )
}
