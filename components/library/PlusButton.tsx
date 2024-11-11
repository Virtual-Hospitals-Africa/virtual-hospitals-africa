import cls from '../../util/cls.ts'
import { PlusIcon } from './icons/heroicons/outline.tsx'
import { Button } from './Button.tsx'
import type { ComponentChildren } from 'preact'

type PlusButtonProps = {
  className?: string
  href?: string
  onClick?: () => void
  children?: ComponentChildren
}

export function PlusButton(
  { className, href, onClick, children }: PlusButtonProps,
) {
  return (
    <Button
      href={href}
      onClick={onClick}
      className={cls('flex items-center', className)}
    >
      <PlusIcon
        className='-ml-0.5 mr-1.5 h-5 w-5 white'
        aria-hidden='true'
      />
      {children}
    </Button>
  )
}
