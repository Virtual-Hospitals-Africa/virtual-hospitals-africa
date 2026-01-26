import { JSX } from 'preact'
import { Signal } from '@preact/signals'
import cls from '../../util/cls.ts'
import { CheckIcon, ExclamationTriangleIcon } from '../../components/library/icons/heroicons/solid.tsx'
import { XMarkIcon } from '../../components/library/icons/heroicons/outline.tsx'
import { ActionButton } from '../../components/library/ActionButton.tsx'
import { Alert } from '../../types.ts'

type AlertMessageProps = {
  alert: Signal<null | Alert>
}

export default function AlertMessage(
  { alert }: AlertMessageProps,
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

  console.log('mmm', actions)

  return (
    <div className={cls('rounded-md p-4', style.bg)}>
      <div className='grid grid-cols-[auto_1fr_auto] gap-x-3 gap-y-2'>
        <div className='grid place-items-center'>
          <Icon
            className={cls('h-5 w-5', style.iconColor)}
            aria-hidden='true'
          />
        </div>
        <h3 className={cls('text-md font-medium', style.textColor)}>
          {message}
        </h3>
        <button
          type='button'
          onClick={() => alert.value = null}
        >
          <XMarkIcon
            className={cls('h-5 w-5', style.iconColor, style.hoverColor)}
          />
        </button>
        {!!actions?.length && (
          <div className='col-start-2 col-span-2 flex gap-3'>
            {actions.map((action) => (
              <ActionButton
                action={action}
                variant='secondary'
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
