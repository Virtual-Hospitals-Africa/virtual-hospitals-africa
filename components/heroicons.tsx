import { ComponentChildren } from 'preact'
import cls from '../util/cls.ts'

function HeroIcon(
  { className, children }: { className?: string; children: ComponentChildren },
) {
  return (
    <svg
      className={cls('w-6 h-6', className)}
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
    >
      {children}
    </svg>
  )
}

export function CalendarIcon({ className }: { className?: string }) {
  return (
    <HeroIcon className={className}>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5'
      />
    </HeroIcon>
  )
}

export function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <HeroIcon className={className}>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M15.75 19.5L8.25 12l7.5-7.5'
      />
    </HeroIcon>
  )
}
export function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <HeroIcon className={className}>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M8.25 4.5l7.5 7.5-7.5 7.5'
      />
    </HeroIcon>
  )
}

export function EllipsisHorizontalIcon({ className }: { className?: string }) {
  return (
    <HeroIcon className={className}>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z'
      />
    </HeroIcon>
  )
}

export function MapPinIcon({ className }: { className?: string }) {
  return (
    <HeroIcon className={className}>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M15 10.5a3 3 0 11-6 0 3 3 0 016 0z'
      />
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z'
      />
    </HeroIcon>
  )
}

export function PlusIcon({ className }: { className?: string }) {
  return (
    <HeroIcon className={className}>
      <path
        d='M12 6V12M12 12V18M12 12H18M12 12H6'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </HeroIcon>
  )
}

export function PaperClipIcon({ className }: { className?: string }) {
  return (
    <HeroIcon className={className}>
      <path
        stroke-linecap='round'
        stroke-linejoin='round'
        d='M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13'
      />
    </HeroIcon>
  )
}
