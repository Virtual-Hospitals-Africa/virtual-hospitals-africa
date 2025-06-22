import { FlagIcon } from '../../components/library/icons/heroicons/solid.tsx'
import { HeroIconButton } from '../../components/library/HeroIconButton.tsx'
import cls from '../../util/cls.ts'

export default function FindingFlagToggle({
  on,
  description,
  toggle,
}: {
  on: boolean
  description: string
  toggle(): void
}) {
  const action = on ? 'Unflag' : 'Flag'
  return (
    <button
      type='button'
      onClick={toggle}
      title={`${action} ${description} as a finding`}
      className={cls(
        'p-1 rounded',
        'transition hover:bg-gray-100',
        on ? 'text-indigo-700' : 'text-gray-300',
      )}
    >
      <FlagIcon className='h-5 w-5' />
    </button>
  )
}
