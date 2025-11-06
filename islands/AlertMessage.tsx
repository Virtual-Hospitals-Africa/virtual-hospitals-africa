import cls from '../util/cls.ts'
import { JSX } from 'preact'
import {
  CheckIcon,
  ExclamationTriangleIcon,
} from '../components/library/icons/heroicons/solid.tsx'
import { Signal } from '@preact/signals'
import { XMarkIcon } from '../components/library/icons/heroicons/outline.tsx'
import { ActionButton } from '../components/library/ActionButton.tsx'

export type Alert = {
  message: string
  level: 'error' | 'warning' | 'success'
  actions?: {
    name: string
    href: string
    method?: 'GET' | 'POST'
  }[]
}

export interface AlertMessageProps {
  className?: string
  alert: Signal<null | Alert>
}

export default function AlertMessage(
  { className, alert }: AlertMessageProps,
): null | JSX.Element {
  if (!alert.value) return null

  const { level, message, actions } = alert.value

  const styles = {
    error: {
      bg: 'bg-red-50',
      iconColor: 'text-red-400',
      textColor: 'text-red-800',
      hoverColor: 'hover:text-red-600',
      Icon: ExclamationTriangleIcon,
    },
    warning: {
      bg: 'bg-yellow-50',
      iconColor: 'text-yellow-400',
      textColor: 'text-yellow-800',
      hoverColor: 'hover:text-yellow-600',
      Icon: ExclamationTriangleIcon,
    },
    success: {
      bg: 'bg-green-50',
      iconColor: 'text-green-400',
      textColor: 'text-green-800',
      hoverColor: 'hover:text-green-600',
      Icon: CheckIcon,
    },
  }

  const style = styles[level]
  const Icon = style.Icon

  return (
    <div className={cls('rounded-md p-4', style.bg, className)}>
      <div className='flex justify-between'>
        <div className='flex'>
          <div className='flex-shrink-0'>
            <Icon
              className={cls('h-5 w-5', style.iconColor)}
              aria-hidden='true'
            />
          </div>
          <div className='ml-3'>
            <h3 className={cls('text-sm font-medium', style.textColor)}>
              {message}
            </h3>
          </div>
        </div>
        {actions?.map((action) => (
          <ActionButton
            action={action}
          />
        ))}
        <button
          className='ml-auto'
          type='button'
          onClick={() => alert.value = null}
        >
          <XMarkIcon
            type='button'
            className={cls('h-5 w-5', style.iconColor, style.hoverColor)}
          />
        </button>
      </div>
    </div>
  )
}
