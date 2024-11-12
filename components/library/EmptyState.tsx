import { JSX } from 'preact'
import cls from '../../util/cls.ts'
import { PlusIcon } from './icons/heroicons/outline.tsx'
import { Plussable } from './icons/Plussable.tsx'
import { assert } from 'std/assert/assert.ts'
import { PlusButton } from './PlusButton.tsx'

type EmptyStateProps = {
  className?: string
  header: string
  explanation: string | string[]
  icon?: JSX.Element
  Icon?: typeof PlusIcon
  button?: {
    children: string
    href?: string
    onClick?: () => void
  }
}

export function EmptyState(
  { className, header, explanation, icon, Icon, button }: EmptyStateProps,
) {
  const explanations = Array.isArray(explanation) ? explanation : [explanation]
  return (
    <div
      className={cls('text-center p-2 flex flex-col items-center', className)}
    >
      {icon || (assert(Icon), <Plussable Icon={Icon} />)}
      <h3 className='mt-2 text-sm font-semibold text-gray-900'>
        {header}
      </h3>
      {explanations.map((e, i) => (
        <p key={i} className='mt-1 text-sm text-gray-500'>{e}</p>
      ))}
      {button && <PlusButton {...button} className='mt-6' />}
    </div>
  )
}
