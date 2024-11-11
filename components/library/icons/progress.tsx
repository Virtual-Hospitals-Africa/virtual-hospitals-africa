import type { SqlBool } from 'kysely'
import cls from '../../../util/cls.ts'
import { CheckCircleIcon, ForwardIcon } from './heroicons/outline.tsx'

// TODO: use active?
export function Check({ className }: { active: boolean; className?: string }) {
  return (
    <span
      className={cls(
        'relative flex flex-shrink-0 items-center justify-center',
        className as string,
      )}
    >
      <CheckCircleIcon
        className='text-indigo-600 group-hover:text-indigo-800'
        aria-hidden='true'
      />
    </span>
  )
}

export function Dot({ active }: { active: boolean }) {
  if (active) {
    return (
      <span
        className='relative flex h-5 w-5 flex-shrink-0 items-center justify-center'
        aria-hidden='true'
      >
        <span className='absolute h-4 w-4 rounded-full bg-indigo-200' />
        <span className='relative block h-2 w-2 rounded-full bg-indigo-600' />
      </span>
    )
  }
  return (
    <div
      className='relative flex h-5 w-5 flex-shrink-0 items-center justify-center'
      aria-hidden='true'
    >
      <div className='h-2 w-2 rounded-full bg-gray-300 group-hover:bg-gray-400' />
    </div>
  )
}

export function Progress({ active, completed, skipped }: {
  active: boolean
  completed: SqlBool | null
  skipped: SqlBool | null
}) {
  console.log('Progress', arguments[0])
  return (completed
    ? <Check active={active} className='w-5 h-5' />
    : skipped && !active
    ? <ForwardIcon className='w-5 h-5' />
    : <Dot active={active} />)
}
