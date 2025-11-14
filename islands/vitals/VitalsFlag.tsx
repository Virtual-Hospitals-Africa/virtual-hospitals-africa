import { FlagIcon } from '../../components/library/icons/heroicons/solid.tsx'
import { Button } from '../../components/library/Button.tsx'
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
    <Button
      variant='ghost'
      type='button'
      onClick={() => {
        toggle()
      }}
      title={`${action} ${description} as a finding`}
    >
      <FlagIcon className={cls('h-5 w-5', on ? 'fill-indigo-900' : '')} />
    </Button>
  )
}
